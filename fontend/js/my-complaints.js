document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const complaintTable = document.getElementById("complaintTable");
    const emptyMessage = document.getElementById("emptyMessage");

    // Search and filter complaints
    function filterComplaints() {

        const searchText = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value;

        const rows = complaintTable.querySelectorAll("tr");
        let visibleCount = 0;

        rows.forEach(function (row) {

            const rowText = row.textContent.toLowerCase();
            const status = row.querySelector(".status").textContent.trim();

            const matchesSearch = rowText.includes(searchText);
            const matchesStatus =
                selectedStatus === "All" || status === selectedStatus;

            if (matchesSearch && matchesStatus) {
                row.style.display = "";
                visibleCount++;
            } else {
                row.style.display = "none";
            }

        });

        emptyMessage.hidden = visibleCount !== 0;
    }

    searchInput.addEventListener("input", filterComplaints);
    statusFilter.addEventListener("change", filterComplaints);

    // View complaint details
    window.viewComplaint = function (complaintId) {
    window.location.href =
        "complaint-details.html?id=" + encodeURIComponent(complaintId);
};

        const rows = complaintTable.querySelectorAll("tr");

        rows.forEach(function (row) {

            if (row.cells[0].textContent.trim() === "#" + complaintId) {

                const title = row.cells[1].textContent;
                const category = row.cells[2].textContent;
                const date = row.cells[3].textContent;
                const priority = row.cells[4].textContent.trim();
                const status = row.cells[5].textContent.trim();

                alert(
                    "COMPLAINT DETAILS\n\n" +
                    "Complaint ID: #" + complaintId + "\n" +
                    "Title: " + title + "\n" +
                    "Category: " + category + "\n" +
                    "Date: " + date + "\n" +
                    "Priority: " + priority + "\n" +
                    "Status: " + status
                );

            }

        });

    

});