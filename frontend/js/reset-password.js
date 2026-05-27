document.addEventListener("DOMContentLoaded", function () {

    console.log("JS Loaded ✅");

    const resetForm = document.getElementById("resetForm");
    const message = document.getElementById("message");

    // GET TOKEN
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    console.log("TOKEN:", token);

    if (!token) {
        alert("Invalid or expired reset link");
        window.location.href = "login.html";
        return;
    }

    // FORM SUBMIT
    resetForm.addEventListener("submit", function (e) {

        e.preventDefault(); // VERY IMPORTANT

        console.log("Form Submitted ✅");

        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        message.innerText = "";

        // VALIDATION
        if (!newPassword || !confirmPassword) {
            message.style.color = "red";
            message.innerText = "Please fill all fields";
            return;
        }

        if (newPassword.length < 6) {
            message.style.color = "red";
            message.innerText = "Password must be at least 6 characters";
            return;
        }

        if (newPassword !== confirmPassword) {
            message.style.color = "red";
            message.innerText = "Passwords do not match";
            return;
        }

        // API CALL
        fetch("http://localhost:8080/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: token,
                newPassword: newPassword
            })
        })
        .then(res => {
            console.log("STATUS:", res.status);
            return res.json();
        })
        .then(data => {
            console.log("Response:", data);

            if (data.success === true) {

                message.style.color = "green";
                message.innerText = "Password reset successful! Redirecting...";

                // REDIRECT
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);

            } else {
                message.style.color = "red";
                message.innerText = data.message || "Reset failed";
            }
        })
        .catch(err => {
            console.error(err);
            message.style.color = "red";
            message.innerText = "Server error. Try again.";
        });

    });

});