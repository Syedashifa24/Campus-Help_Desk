document.addEventListener("DOMContentLoaded", async function () {

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const complaintTable = document.getElementById("complaintTable");
    const emptyMessage = document.getElementById("emptyMessage");

    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Please login to view your complaints.");
        window.location.href = "login.html";
        return;
    }

    let complaints = [];

    // Update the four summary statistics
    function updateStatistics() {

        const total = complaints.length;

        const pending = complaints.filter(function (complaint) {
            return String(complaint.status ?? "").trim().toLowerCase() === "pending";
        }).length;

        const inProgress = complaints.filter(function (complaint) {
            return String(complaint.status ?? "").trim().toLowerCase() === "in progress";
        }).length;

        const resolved = complaints.filter(function (complaint) {
            return String(complaint.status ?? "").trim().toLowerCase() === "resolved";
        }).length;

        document.getElementById("totalCount").textContent = total;
        document.getElementById("pendingCount").textContent = pending;
        document.getElementById("progressCount").textContent = inProgress;
        document.getElementById("resolvedCount").textContent = resolved;
    }

    // Fetch complaints from Flask backend
    async function loadComplaints() {
        try {
            const response = await fetch(
                `http://127.0.0.1:5000/my-complaints/${encodeURIComponent(userId)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load complaints.");
            }

            complaints = Array.isArray(data) ? data : [];

            updateStatistics();
            displayComplaints();

        } catch (error) {
            console.error("Error loading complaints:", error);
            alert("Unable to load complaints. Please check the backend.");
        }
    }

    // Display complaints in the table
    function displayComplaints() {

        const searchText = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value;

        complaintTable.innerHTML = "";

        const filteredComplaints = complaints.filter(function (complaint) {

            const rowText = (
                complaint.complaint_id + " " +
                complaint.title + " " +
                complaint.category + " " +
                complaint.status
            ).toLowerCase();

            const matchesSearch = rowText.includes(searchText);

            const matchesStatus =
                selectedStatus === "All" ||
                String(complaint.status ?? "").trim().toLowerCase() ===
                selectedStatus.toLowerCase();

            return matchesSearch && matchesStatus;
        });

        filteredComplaints.forEach(function (complaint) {

            const row = document.createElement("tr");

            const date = new Date(complaint.created_at).toLocaleDateString("en-IN");

            row.innerHTML = `
                <td>#${complaint.complaint_id}</td>
                <td>${escapeHTML(complaint.title)}</td>
                <td>${escapeHTML(complaint.category)}</td>
                <td>${date}</td>
                <td>${escapeHTML(complaint.priority)}</td>
                <td class="status">${escapeHTML(complaint.status)}</td>
                <td>
                    <button onclick="viewComplaint(${Number(complaint.complaint_id)})">
                        View
                    </button>
                </td>
            `;

            complaintTable.appendChild(row);
        });

        emptyMessage.hidden = filteredComplaints.length !== 0;
    }

    // Prevent HTML entered in complaint text from being interpreted as markup
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    // Search and status filter
    searchInput.addEventListener("input", displayComplaints);
    statusFilter.addEventListener("change", displayComplaints);

    // View complaint details
    window.viewComplaint = function (complaintId) {
        window.location.href =
            "complaint-details.html?id=" +
            encodeURIComponent(complaintId);
    };

    // Load complaints when page opens
    await loadComplaints();

});