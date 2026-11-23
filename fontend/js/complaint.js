document.addEventListener("DOMContentLoaded", function () {

    const complaintForm = document.getElementById("complaintForm");

    complaintForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Get form values
        const title = document.getElementById("title").value.trim();
        const category = document.getElementById("category").value;
        const priority = document.getElementById("priority").value;
        const location = document.getElementById("location").value.trim();
        const description = document.getElementById("description").value.trim();
        const attachment = document.getElementById("attachment").files[0];

        // Validate form
        if (!title || !category || !priority || !location || !description) {
            alert("Please fill in all required fields.");
            return;
        }

        // Check image type
        if (attachment && !attachment.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        // Show success message
        alert(
            "Complaint submitted successfully!\n\n" +
            "Title: " + title + "\n" +
            "Category: " + category + "\n" +
            "Priority: " + priority
        );

        // Clear form
        complaintForm.reset();

    });

});