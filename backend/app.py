from flask import Flask,jsonify,request
from flask_cors import CORS

import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Syedashifa@24",
    database="campus_help_desk"
)

@app.route("/")
def home():
    return "Campus Help Desk Backend is Running!"

@app.route("/test-db")
def test_db():
    if db.is_connected():
        return jsonify({"message": "MySQL Database Connected Successfully!"})
    return jsonify({"message": "Database Connection Failed!"}), 500


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("fullname")
    usn = data.get("usn")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    hashed_password = generate_password_hash(password)

    cursor = db.cursor()

    try:
        sql = """
        INSERT INTO users (name, usn, email, phone, password)
        VALUES (%s, %s, %s, %s, %s)
        """

        values = (name, usn, email, phone, hashed_password)

        cursor.execute(sql, values)
        db.commit()

        return jsonify({"message": "Registration successful!"})

    except mysql.connector.Error as err:
        db.rollback()
        return jsonify({"message": str(err)}), 400

    finally:
        cursor.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    cursor = db.cursor(dictionary=True)

    try:
        sql = """
        SELECT * FROM users
        WHERE email = %s AND role = %s
        """

        cursor.execute(sql, (email, role))
        user = cursor.fetchone()

        if user and check_password_hash(user["password"], password):
            return jsonify({
                "message": "Login successful!",
                "role": user["role"],
                "name": user["name"]
            })

        return jsonify({
            "message": "Invalid email, password or role."
        }), 401

    finally:
        cursor.close()

if __name__ == "__main__":
    app.run(debug=True)