
import os
import mysql.connector
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env", override=True)

DB_PASSWORD = os.getenv("DB_PASSWORD")

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# CORS Configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://127.0.0.1:5500"]
    }
})


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def get_db_connection():
    if not DB_PASSWORD:
        raise ValueError("DB_PASSWORD not found in .env file")

    return mysql.connector.connect(
        host="localhost",
        user="campus_app",
        password=DB_PASSWORD,
        database="campus_help_desk"
    )

def close_db(cursor, connection):
    if cursor:
        try:
            cursor.close()
        except mysql.connector.Error:
            pass

    if connection:
        try:
            if connection.is_connected():
                connection.close()
        except mysql.connector.Error:
            pass


# --------------------------------------------------
# HOME ROUTE
# --------------------------------------------------

@app.route("/")
def home():
    return "Campus Help Desk Backend is Running!"


# --------------------------------------------------
# TEST DATABASE CONNECTION
# --------------------------------------------------

@app.route("/test-db", methods=["GET"])
def test_db():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT 1")

        return jsonify({
            "message": "MySQL Database Connected Successfully!"
        }), 200

    except mysql.connector.Error as err:
        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# STUDENT REGISTRATION
# --------------------------------------------------

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = data.get("fullname", "").strip()
    usn = data.get("usn", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")

    if not all([name, usn, email, phone, password]):
        return jsonify({
            "message": "Please fill in all required fields."
        }), 400

    if not isinstance(password, str) or len(password) < 6:
        return jsonify({
            "message": "Password must contain at least 6 characters."
        }), 400

    hashed_password = generate_password_hash(password)

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        sql = """
            INSERT INTO users
            (name, usn, email, phone, password)
            VALUES (%s, %s, %s, %s, %s)
        """

        values = (
            name,
            usn,
            email,
            phone,
            hashed_password
        )

        cursor.execute(sql, values)
        connection.commit()

        return jsonify({
            "message": "Registration successful!"
        }), 201

    except mysql.connector.Error as err:

        if connection:
            connection.rollback()

        return jsonify({
            "message": str(err)
        }), 400

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# USER LOGIN
# --------------------------------------------------

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    if not email or not password or not role:
        return jsonify({
            "message": "Please enter email, password and role."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        sql = """
            SELECT user_id, name, email, password, role
            FROM users
            WHERE LOWER(TRIM(email)) = %s
            AND LOWER(TRIM(role)) = %s
        """

        cursor.execute(sql, (email, role))
        user = cursor.fetchone()

        if user and check_password_hash(user["password"], password):

            return jsonify({
                "message": "Login successful!",
                "role": user["role"],
                "name": user["name"],
                "user_id": user["user_id"]
            }), 200

        return jsonify({
            "message": "Invalid email, password or role."
        }), 401

    except mysql.connector.Error as err:
        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# STUDENT SUBMIT COMPLAINT
# --------------------------------------------------

@app.route("/complaints", methods=["POST"])
def add_complaint():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    title = data.get("title", "").strip()
    category = data.get("category", "").strip()
    priority = data.get("priority", "").strip()
    location = data.get("location", "").strip()
    description = data.get("description", "").strip()

    if not all([
        user_id,
        title,
        category,
        priority,
        location,
        description
    ]):
        return jsonify({
            "message": "Please fill in all required fields."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        sql = """
            INSERT INTO complaints
            (user_id, title, category, priority,
             location, description, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            user_id,
            title,
            category,
            priority,
            location,
            description,
            "Pending"
        )

        cursor.execute(sql, values)

        complaint_id = cursor.lastrowid

        connection.commit()

        return jsonify({
            "message": "Complaint submitted successfully!",
            "complaint_id": complaint_id
        }), 201

    except mysql.connector.Error as err:

        if connection:
            connection.rollback()

        return jsonify({
            "message": str(err)
        }), 400

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# STUDENT VIEW MY COMPLAINTS
# --------------------------------------------------

@app.route("/my-complaints/<int:user_id>", methods=["GET"])
def get_my_complaints(user_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        sql = """
            SELECT
                complaint_id,
                title,
                category,
                priority,
                location,
                description,
                status,
                created_at
            FROM complaints
            WHERE user_id = %s
            ORDER BY created_at DESC
        """

        cursor.execute(sql, (user_id,))

        complaints = cursor.fetchall()

        return jsonify(complaints), 200

    except mysql.connector.Error as err:
        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# STUDENT VIEW COMPLAINT DETAILS
# --------------------------------------------------

@app.route(
    "/complaint-details/<int:complaint_id>/<int:user_id>",
    methods=["GET"]
)
def get_complaint_details(complaint_id, user_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        sql = """
            SELECT
                complaint_id,
                title,
                category,
                priority,
                location,
                description,
                status,
                created_at
            FROM complaints
            WHERE complaint_id = %s
            AND user_id = %s
        """

        cursor.execute(sql, (complaint_id, user_id))

        complaint = cursor.fetchone()

        if complaint:
            return jsonify(complaint), 200

        return jsonify({
            "message": "Complaint not found."
        }), 404

    except mysql.connector.Error as err:
        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# STUDENT DASHBOARD STATISTICS
# --------------------------------------------------

@app.route("/dashboard/<int:user_id>", methods=["GET"])
def get_dashboard(user_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        sql = """
            SELECT
                COUNT(*) AS total_complaints,

                COALESCE(SUM(
                    CASE
                        WHEN LOWER(TRIM(status)) = 'pending'
                        THEN 1 ELSE 0
                    END
                ), 0) AS pending_complaints,

                COALESCE(SUM(
                    CASE
                        WHEN LOWER(TRIM(status)) = 'in progress'
                        THEN 1 ELSE 0
                    END
                ), 0) AS in_progress_complaints,

                COALESCE(SUM(
                    CASE
                        WHEN LOWER(TRIM(status)) = 'resolved'
                        THEN 1 ELSE 0
                    END
                ), 0) AS resolved_complaints

            FROM complaints
            WHERE user_id = %s
        """

        cursor.execute(sql, (user_id,))

        result = cursor.fetchone()

        return jsonify(result), 200

    except mysql.connector.Error as err:
        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# STUDENT RECENT COMPLAINTS
# --------------------------------------------------

@app.route("/recent-complaints/<int:user_id>", methods=["GET"])
def get_recent_complaints(user_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        sql = """
            SELECT
                complaint_id,
                title,
                category,
                created_at,
                status
            FROM complaints
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 3
        """

        cursor.execute(sql, (user_id,))

        complaints = cursor.fetchall()

        return jsonify(complaints), 200

    except mysql.connector.Error as err:
        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# ==================================================
# ADMIN DASHBOARD
# ==================================================


# --------------------------------------------------
# ADMIN DASHBOARD STATISTICS
# --------------------------------------------------

@app.route("/admin/dashboard/<int:admin_id>", methods=["GET"])
def admin_dashboard(admin_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check admin role
        cursor.execute(
            """
            SELECT role
            FROM users
            WHERE user_id = %s
            """,
            (admin_id,)
        )

        admin = cursor.fetchone()

        if not admin or (admin["role"] or "").strip().lower() != "admin":
            return jsonify({
                "message": "Unauthorized access"
            }), 403

        sql = """
            SELECT
                COUNT(*) AS total_complaints,

                COALESCE(SUM(
                    CASE
                        WHEN LOWER(TRIM(status)) = 'pending'
                        THEN 1 ELSE 0
                    END
                ), 0) AS pending_complaints,

                COALESCE(SUM(
                    CASE
                        WHEN LOWER(TRIM(status)) = 'in progress'
                        THEN 1 ELSE 0
                    END
                ), 0) AS in_progress_complaints,

                COALESCE(SUM(
                    CASE
                        WHEN LOWER(TRIM(status)) = 'resolved'
                        THEN 1 ELSE 0
                    END
                ), 0) AS resolved_complaints

            FROM complaints
        """

        cursor.execute(sql)

        result = cursor.fetchone()

        return jsonify(result), 200

    except mysql.connector.Error as err:
        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# ADMIN VIEW ALL COMPLAINTS
# --------------------------------------------------

@app.route("/admin/complaints/<int:admin_id>", methods=["GET"])
def admin_get_all_complaints(admin_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check admin role
        cursor.execute(
            """
            SELECT role
            FROM users
            WHERE user_id = %s
            """,
            (admin_id,)
        )

        admin = cursor.fetchone()

        if not admin or (admin["role"] or "").strip().lower() != "admin":
            return jsonify({
                "message": "Unauthorized access"
            }), 403

        sql = """
            SELECT
                c.complaint_id,
                c.user_id,
                u.name AS student_name,
                c.title,
                c.category,
                c.priority,
                c.location,
                c.description,
                c.status,
                c.created_at

            FROM complaints c

            LEFT JOIN users u
            ON c.user_id = u.user_id

            ORDER BY c.created_at DESC
        """

        cursor.execute(sql)

        complaints = cursor.fetchall()

        return jsonify(complaints), 200

    except mysql.connector.Error as err:
        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# ADMIN UPDATE COMPLAINT STATUS
# --------------------------------------------------

@app.route(
    "/admin/update-status/<int:admin_id>/<int:complaint_id>",
    methods=["PUT"]
)
def update_complaint_status(admin_id, complaint_id):

    data = request.get_json(silent=True) or {}

    new_status = data.get("status", "")

    if not isinstance(new_status, str):
        return jsonify({
            "message": "Invalid complaint status."
        }), 400

    new_status = new_status.strip()

    allowed_statuses = [
        "Pending",
        "In Progress",
        "Resolved"
    ]

    if new_status not in allowed_statuses:
        return jsonify({
            "message": "Invalid complaint status."
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check admin role
        cursor.execute(
            """
            SELECT role
            FROM users
            WHERE user_id = %s
            """,
            (admin_id,)
        )

        admin = cursor.fetchone()

        if not admin or (admin["role"] or "").strip().lower() != "admin":
            return jsonify({
                "message": "Unauthorized access"
            }), 403

        # Check complaint existence
        cursor.execute(
            """
            SELECT complaint_id
            FROM complaints
            WHERE complaint_id = %s
            """,
            (complaint_id,)
        )

        complaint = cursor.fetchone()

        if not complaint:
            return jsonify({
                "message": "Complaint not found."
            }), 404

        # Update complaint status
        cursor.execute(
            """
            UPDATE complaints
            SET status = %s
            WHERE complaint_id = %s
            """,
            (new_status, complaint_id)
        )

        connection.commit()

        return jsonify({
            "message": "Complaint status updated successfully!",
            "status": new_status
        }), 200

    except mysql.connector.Error as err:

        if connection:
            connection.rollback()

        return jsonify({
            "message": str(err)
        }), 500

    finally:
        close_db(cursor, connection)


# --------------------------------------------------
# RUN FLASK SERVER
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )