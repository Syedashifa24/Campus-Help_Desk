document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // ADMIN DETAILS
    // =====================================

    const adminId = localStorage.getItem("user_id");
    const adminRole = localStorage.getItem("user_role");
    const adminName = localStorage.getItem("user_name");

    const API_URL = "http://127.0.0.1:5000";

    if (
        !adminId ||
        !adminRole ||
        adminRole.trim().toLowerCase() !== "admin"
    ) {
        alert("Please login as Admin.");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("welcomeMessage").textContent =
        `Welcome Back, ${adminName || "Admin"}!`;


    // =====================================
    // GLOBAL DATA
    // =====================================

    let allComplaints = [];


    // =====================================
    // SAFE TEXT
    // =====================================

    function safe(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }


    // =====================================
    // FORMAT DATE
    // =====================================

    function formatDate(value) {

        if (!value) return "N/A";

        const date = new Date(value);

        if (isNaN(date.getTime())) return "N/A";

        return date.toLocaleDateString("en-IN");
    }


    // =====================================
    // LOAD DASHBOARD STATISTICS
    // =====================================

    async function loadStatistics() {

        try {

            const response = await fetch(
                `${API_URL}/admin/dashboard/${adminId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load statistics.");
            }

            document.getElementById("totalComplaints").textContent =
                Number(data.total_complaints) || 0;

            document.getElementById("pendingComplaints").textContent =
                Number(data.pending_complaints) || 0;

            document.getElementById("inProgressComplaints").textContent =
                Number(data.in_progress_complaints) || 0;

            document.getElementById("resolvedComplaints").textContent =
                Number(data.resolved_complaints) || 0;

        } catch (error) {

            console.error("Statistics Error:", error);

        }
    }


    // =====================================
    // POPULATE FILTERS
    // =====================================

    function populateFilters() {

        const categoryFilter =
            document.getElementById("categoryFilter");

        const priorityFilter =
            document.getElementById("priorityFilter");

        const previousCategory = categoryFilter.value;
        const previousPriority = priorityFilter.value;

        const categories = [
            ...new Set(
                allComplaints
                    .map(c => String(c.category ?? "").trim())
                    .filter(Boolean)
            )
        ].sort();

        const priorities = [
            ...new Set(
                allComplaints
                    .map(c => String(c.priority ?? "").trim())
                    .filter(Boolean)
            )
        ].sort();

        categoryFilter.innerHTML =
            '<option value="">All Categories</option>';

        priorityFilter.innerHTML =
            '<option value="">All Priorities</option>';

        categories.forEach(category => {

            const option = document.createElement("option");

            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(option);

        });

        priorities.forEach(priority => {

            const option = document.createElement("option");

            option.value = priority;
            option.textContent = priority;

            priorityFilter.appendChild(option);

        });

        categoryFilter.value = categories.find(
            c => c.toLowerCase() === previousCategory.toLowerCase()
        ) || "";

        priorityFilter.value = priorities.find(
            p => p.toLowerCase() === previousPriority.toLowerCase()
        ) || "";

    }


    // =====================================
    // DISPLAY COMPLAINTS
    // =====================================

    function displayComplaints(complaints) {

        const tableBody =
            document.getElementById("complaintsTable");

        const resultCount =
            document.getElementById("resultCount");

        tableBody.innerHTML = "";

        resultCount.textContent =
            `Showing ${complaints.length} of ${allComplaints.length} complaints`;

        if (complaints.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        No matching complaints found.
                    </td>
                </tr>
            `;

            return;
        }

        complaints.forEach(complaint => {

            const id = Number(complaint.complaint_id);

            const status = String(
                complaint.status ?? ""
            ).trim().toLowerCase();

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>
                    #CHD${String(id).padStart(3, "0")}
                </td>

                <td>
                    ${safe(complaint.student_name)}
                </td>

                <td>
                    ${safe(complaint.title)}
                </td>

                <td>
                    ${safe(complaint.category)}
                </td>

                <td>
                    ${safe(complaint.priority)}
                </td>

                <td>
                    <select class="status-select" id="status-${id}">

                        <option value="Pending"
                            ${status === "pending" ? "selected" : ""}>
                            Pending
                        </option>

                        <option value="In Progress"
                            ${status === "in progress" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="Resolved"
                            ${status === "resolved" ? "selected" : ""}>
                            Resolved
                        </option>

                    </select>
                </td>

                <td>
                    ${formatDate(complaint.created_at)}
                </td>

                <td>
                    <button
                        class="update-btn"
                        onclick="updateStatus(${id})">
                        Update
                    </button>
                </td>

            `;

            tableBody.appendChild(row);

        });
    }


    // =====================================
    // APPLY SEARCH AND FILTERS
    // =====================================

    function applyFilters() {

        const searchValue = document
            .getElementById("searchComplaint")
            .value.trim().toLowerCase();

        const categoryValue = document
            .getElementById("categoryFilter")
            .value.trim().toLowerCase();

        const priorityValue = document
            .getElementById("priorityFilter")
            .value.trim().toLowerCase();

        const statusValue = document
            .getElementById("statusFilter")
            .value.trim().toLowerCase();

        const filtered = allComplaints.filter(complaint => {

            const id = String(
                complaint.complaint_id ?? ""
            ).toLowerCase();

            const formattedId = "chd" +
                String(complaint.complaint_id ?? "").padStart(3, "0");

            const name = String(
                complaint.student_name ?? ""
            ).toLowerCase();

            const category = String(
                complaint.category ?? ""
            ).trim().toLowerCase();

            const priority = String(
                complaint.priority ?? ""
            ).trim().toLowerCase();

            const status = String(
                complaint.status ?? ""
            ).trim().toLowerCase();

            const matchesSearch =
                !searchValue ||
                id.includes(searchValue) ||
                formattedId.includes(searchValue) ||
                name.includes(searchValue);

            const matchesCategory =
                !categoryValue || category === categoryValue;

            const matchesPriority =
                !priorityValue || priority === priorityValue;

            const matchesStatus =
                !statusValue || status === statusValue;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesPriority &&
                matchesStatus
            );

        });

        displayComplaints(filtered);
    }


    // =====================================
    // LOAD ALL COMPLAINTS
    // =====================================

    async function loadComplaints() {

        const tableBody =
            document.getElementById("complaintsTable");

        try {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">Loading complaints...</td>
                </tr>
            `;

            const response = await fetch(
                `${API_URL}/admin/complaints/${adminId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load complaints."
                );
            }

            if (!Array.isArray(data)) {
                throw new Error("Invalid complaints data received.");
            }

            allComplaints = data;

            populateFilters();

            applyFilters();

        } catch (error) {

            console.error("Complaints Error:", error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Error: ${safe(error.message)}
                    </td>
                </tr>
            `;

            document.getElementById("resultCount").textContent =
                "Unable to load complaints.";

        }
    }


    // =====================================
    // SEARCH EVENT
    // =====================================

    document
        .getElementById("searchComplaint")
        .addEventListener("input", applyFilters);


    // =====================================
    // CATEGORY EVENT
    // =====================================

    document
        .getElementById("categoryFilter")
        .addEventListener("change", applyFilters);


    // =====================================
    // PRIORITY EVENT
    // =====================================

    document
        .getElementById("priorityFilter")
        .addEventListener("change", applyFilters);


    // =====================================
    // STATUS EVENT
    // =====================================

    document
        .getElementById("statusFilter")
        .addEventListener("change", applyFilters);


    // =====================================
    // RESET FILTERS
    // =====================================

    document
        .getElementById("resetFilters")
        .addEventListener("click", function () {

            document.getElementById("searchComplaint").value = "";

            document.getElementById("categoryFilter").value = "";

            document.getElementById("priorityFilter").value = "";

            document.getElementById("statusFilter").value = "";

            applyFilters();

        });


    // =====================================
    // UPDATE COMPLAINT STATUS
    // =====================================

    window.updateStatus = async function (complaintId) {

        const statusElement = document.getElementById(
            `status-${complaintId}`
        );

        if (!statusElement) {
            alert("Status dropdown not found.");
            return;
        }

        const status = statusElement.value;

        const row = statusElement.closest("tr");
        const button = row.querySelector(".update-btn");

        try {

            button.disabled = true;
            button.textContent = "Updating...";

            const response = await fetch(
                `${API_URL}/admin/update-status/${adminId}/${complaintId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Status update failed."
                );
            }

            alert("Complaint status updated successfully!");

            // Refresh latest statistics and complaints
            await Promise.all([
                loadStatistics(),
                loadComplaints()
            ]);

        } catch (error) {

            console.error("Update Status Error:", error);

            alert(error.message);

        } finally {

            button.disabled = false;
            button.textContent = "Update";

        }
    };


    // =====================================
    // INITIAL DASHBOARD LOAD
    // =====================================

    loadStatistics();
    loadComplaints();

});