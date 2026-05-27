console.log("Register JS Loaded");

document.addEventListener("DOMContentLoaded", function() {

    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const mobileNumber = document.getElementById("mobileNumber").value.trim();
        const address = document.getElementById("address").value.trim();
        const department = document.getElementById("department").value.trim();
        const designation = document.getElementById("designation").value.trim();
        const salary = document.getElementById("salary").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();
        const role = document.getElementById("role").value;

        const registerBtn = document.getElementById("registerBtn");

        // VALIDATION
        if (!firstName || !lastName || !email || !mobileNumber || !username || !password || !address || !department || !designation || !salary) {
            alert("All fields required");
            return;
        }

        if (!role) {
            alert("Please select a role");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (mobileNumber.length !== 10) {
            alert("Enter valid mobile number");
            return;
        }

        // LOADING
        registerBtn.innerHTML = "⏳ Registering...";
        registerBtn.disabled = true;

        // API CALL
        fetch("http://localhost:8080/api/auth/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                firstName,
                lastName,
                email,
                mobileNumber,
                address,
                department,
                designation,
                salary,
                username,
                password,
                role
            })

        })

        .then(res => {
            if (!res.ok) throw new Error("Server error");
            return res.json();
        })

        .then(data => {

            if (data.success) {
                alert("Registration Successful");
                window.location.href = "login.html";
            } else {
                alert(data.message);
                registerBtn.innerText = "Register";
                registerBtn.disabled = false;
            }

        })

        .catch(() => {
            alert("Server error");
            registerBtn.innerText = "Register";
            registerBtn.disabled = false;
        });

    });

});