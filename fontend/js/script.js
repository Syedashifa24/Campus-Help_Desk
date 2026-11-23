console.log("Campus Help Desk frontend loaded!");

// Student Registration Form
const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const fullname = document.getElementById("fullname").value;
        const usn = document.getElementById("usn").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const message = document.getElementById("registerMessage");

        if (password !== confirmPassword) {
            message.style.color = "red";
            message.textContent = "Passwords do not match!";
            return;
        }

        message.style.color = "blue";
        message.textContent = "Registering...";

        try {
            console.log("Sending registration data to Flask...");

            const response = await fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullname: fullname,
                    usn: usn,
                    email: email,
                    phone: phone,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {

                message.style.color = "green";
                message.textContent = result.message;

                registerForm.reset();

            } else {

                message.style.color = "red";
                message.textContent = result.message;

            }

        } catch (error) {

            message.style.color = "red";
            message.textContent = "Unable to connect to the server!";

            console.error(error);

        }

    });

}