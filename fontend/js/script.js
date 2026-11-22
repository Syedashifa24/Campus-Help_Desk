console.log("Campus Help Desk frontend loaded!");

// Student Registration Form Validation

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const password = document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message = document.getElementById("registerMessage");

        if (password !== confirmPassword) {

            message.style.color = "red";
            message.textContent = "Passwords do not match!";

        } else {

            message.style.color = "green";
            message.textContent =
                "Registration form validated successfully!";

        }

    });
}    

































