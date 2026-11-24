// Raise New Complaint button
function raiseComplaint() {
    window.location.href = "complaint.html";
}

// Display dashboard data
document.addEventListener("DOMContentLoaded", async function () {

    console.log("Student Dashboard loaded successfully!");

    // Display student name
    const userName = localStorage.getItem("user_name");

    if (userName) {
        document.getElementById("welcomeMessage").textContent =
            `Welcome Back, ${userName}! 👋`;
    }

    // Get logged-in student ID
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    try {

        // Fetch dashboard statistics
        const response = await fetch(
            `http://127.0.0.1:5000/dashboard/${userId}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();

        document.getElementById("totalComplaints").textContent =
            data.total_complaints;

        document.getElementById("pendingComplaints").textContent =
            data.pending_complaints;

        document.getElementById("inProgressComplaints").textContent =
            data.in_progress_complaints;

        document.getElementById("resolvedComplaints").textContent =
            data.resolved_complaints;


        // Fetch recent complaints
        const recentResponse = await fetch(
            `http://127.0.0.1:5000/recent-complaints/${userId}`
        );

        if (!recentResponse.ok) {
            throw new Error("Failed to fetch recent complaints");
        }

        const complaints = await recentResponse.json();

        const tableBody = document.querySelector(".recent tbody");

        tableBody.innerHTML = "";

        if (complaints.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">No complaints submitted yet.</td>
                </tr>
            `;

        } else {

            complaints.forEach(complaint => {

                const row = document.createElement("tr");

                const date = new Date(complaint.created_at);

                const formattedDate = date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });

                let statusClass = "";

                if (complaint.status === "Pending") {
                    statusClass = "pending";
                } 
                else if (complaint.status === "In Progress") {
                    statusClass = "progress";
                } 
                else if (complaint.status === "Resolved") {
                    statusClass = "resolved";
                }

                row.innerHTML = `
                    <td>#CHD${String(complaint.complaint_id).padStart(3, "0")}</td>
                    <td>${complaint.title}</td>
                    <td>${complaint.category}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <span class="status ${statusClass}">
                            ${complaint.status}
                        </span>
                    </td>
                `;

                tableBody.appendChild(row);

            });

        }

    } 
    catch (error) {
        console.error("Dashboard Error:", error);
    }

});