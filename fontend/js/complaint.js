document.addEventListener("DOMContentLoaded", function () {

    const complaintForm = document.getElementById("complaintForm");

    complaintForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const title = document.getElementById("title").value.trim();
        const category = document.getElementById("category").value;
        const priority = document.getElementById("priority").value;
        const location = document.getElementById("location").value.trim();
        const description = document.getElementById("description").value.trim();
        const attachment = document.getElementById("attachment").files[0];

        if (!title || !category || !priority || !location || !description) {
            alert("Please fill in all required fields.");
            return;
        }

        if (attachment && !attachment.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        const user_id = localStorage.getItem("user_id");

        if (!user_id) {
            alert("Please login again before submitting a complaint.");
            window.location.href = "login.html";
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/complaints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user_id,
                    title: title,
                    category: category,
                    priority: priority,
                    location: location,
                    description: description
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                complaintForm.reset();
            } else {
                alert(data.message || "Unable to submit complaint.");
            }

        } catch (error) {
            alert("Cannot connect to the backend. Please check whether Flask is running.");
            console.error(error);
        }

    });

});