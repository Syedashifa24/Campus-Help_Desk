// Sample complaint records
let complaints = [
    {
        id: "CHD001",
        title: "Wi-Fi not working",
        category: "Network",
        priority: "High",
        date: "20 Nov 2026",
        status: "Pending"
    },
    {
        id: "CHD002",
        title: "Projector issue",
        category: "Classroom",
        priority: "Medium",
        date: "19 Nov 2026",
        status: "In Progress"
    },
    {
        id: "CHD003",
        title: "Water leakage",
        category: "Maintenance",
        priority: "Low",
        date: "17 Nov 2026",
        status: "Resolved"
    }
];

// Display today's date
document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// Display complaint statistics
function updateStatistics() {
    document.getElementById("totalCount").textContent =
        complaints.length;

    document.getElementById("pendingCount").textContent =
        complaints.filter(c => c.status === "Pending").length;

    document.getElementById("progressCount").textContent =
        complaints.filter(c => c.status === "In Progress").length;

    document.getElementById("resolvedCount").textContent =
        complaints.filter(c => c.status === "Resolved").length;
}

// Display complaints in the table
function displayComplaints() {
    const tableBody = document.getElementById("complaintTableBody");

    const searchText =
        document.getElementById("searchInput").value.toLowerCase();

    const selectedStatus =
        document.getElementById("statusFilter").value;

    tableBody.innerHTML = "";

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch =
            complaint.id.toLowerCase().includes(searchText) ||
            complaint.title.toLowerCase().includes(searchText) ||
            complaint.category.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            complaint.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredComplaints.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No complaints found.
                </td>
            </tr>
        `;
        return;
    }

    filteredComplaints.forEach(complaint => {
        const row = document.createElement("tr");

        let statusClass = "status-pending";

        if (complaint.status === "In Progress") {
            statusClass = "status-progress";
        } else if (complaint.status === "Resolved") {
            statusClass = "status-resolved";
        }

        let priorityClass = "priority-low";

        if (complaint.priority === "High") {
            priorityClass = "priority-high";
        } else if (complaint.priority === "Medium") {
            priorityClass = "priority-medium";
        }

        row.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.title}</td>
            <td>${complaint.category}</td>
            <td><span class="${priorityClass}">${complaint.priority}</span></td>
            <td>${complaint.date}</td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${complaint.status}
                </span>
            </td>
            <td>
                <select class="status-select"
                    onchange="updateComplaintStatus('${complaint.id}', this.value)">
                    <option value="Pending"
                        ${complaint.status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="In Progress"
                        ${complaint.status === "In Progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="Resolved"
                        ${complaint.status === "Resolved" ? "selected" : ""}>
                        Resolved
                    </option>
                </select>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Update complaint status
function updateComplaintStatus(id, newStatus) {
    const complaint = complaints.find(c => c.id === id);

    if (complaint) {
        complaint.status = newStatus;

        updateStatistics();
        displayComplaints();

        alert("Complaint " + id + " status updated to " + newStatus);
    }
}

// Search complaints
document.getElementById("searchInput").addEventListener(
    "input",
    displayComplaints
);

// Filter complaints
document.getElementById("statusFilter").addEventListener(
    "change",
    displayComplaints
);

// Initial display
updateStatistics();
displayComplaints();

console.log("Admin Dashboard loaded successfully!");