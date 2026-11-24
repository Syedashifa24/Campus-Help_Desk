document.addEventListener("DOMContentLoaded", async function () {

    const userId = localStorage.getItem("user_id");

    const params = new URLSearchParams(window.location.search);
    const complaintId = params.get("id");

    const errorMessage = document.getElementById("errorMessage");

    if (!userId) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    if (!complaintId || !/^\d+$/.test(complaintId)) {
        errorMessage.textContent = "Invalid complaint ID.";
        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/complaint-details/${encodeURIComponent(complaintId)}/${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Complaint not found.");
        }

        document.getElementById("complaintTitle").textContent = data.title;
        document.getElementById("complaintId").textContent =
            "Complaint ID: #CHD" + String(data.complaint_id).padStart(3, "0");

        document.getElementById("category").textContent = data.category;
        document.getElementById("priority").textContent = data.priority;
        document.getElementById("location").textContent = data.location;
        document.getElementById("description").textContent = data.description;

        const date = new Date(data.created_at);

        document.getElementById("createdAt").textContent =
            isNaN(date.getTime()) ? "Not available" :
            date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });

        const statusElement = document.getElementById("complaintStatus");
        statusElement.textContent = data.status;

        statusElement.className = "status";

        const status = String(data.status || "").trim().toLowerCase();

        if (status === "pending") {
            statusElement.classList.add("pending");
        } else if (status === "in progress") {
            statusElement.classList.add("progress");
        } else if (status === "resolved") {
            statusElement.classList.add("resolved");
        }

    } catch (error) {

        console.error("Complaint Details Error:", error);
        errorMessage.textContent = error.message;

    }

});