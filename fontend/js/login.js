const loginForm = document.getElementById("loginForm");

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const message = document.getElementById("loginMessage");

// Show and hide password
togglePassword.addEventListener("click", function () {
    if (password.type === "password") {
        password.type = "text";
        togglePassword.textContent = "Hide";
    } else {
        password.type = "password";
        togglePassword.textContent = "Show";
    }
});

// Login form authentication
loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const pass = password.value;

    if (!role || !email || !pass) {
        message.style.color = "red";
        message.textContent = "Please fill in all fields.";
        return;
    }

    message.style.color = "#2581bd";
    message.textContent = "Checking login details...";

    try {
        const response = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role: role,
                email: email,
                password: pass
            })
        });

        const data = await response.json();

        if (response.ok) {

            message.style.color = "green";
            message.textContent = "Login successful!";

            // Store logged-in user details
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("user_name", data.name);
            localStorage.setItem("user_role", data.role);

            // Redirect based on user role
            if (role === "student") {
                window.location.href = "dashboard.html";
            } 
            else {
                window.location.href = "admin-dashboard.html";
            }

        } else {
            message.style.color = "red";
            message.textContent = data.message || "Invalid login details.";
        }

    } catch (error) {
        message.style.color = "red";
        message.textContent = "Cannot connect to server. Please try again.";
    }

});

// Forgot password
document.getElementById("forgotPassword")
.addEventListener("click", function(event) {

    event.preventDefault();

    message.style.color = "#2581bd";
    message.textContent =
        "Password recovery will be available soon.";

});