console.log("Login JS Loaded");

document.addEventListener("DOMContentLoaded", function() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function(e) {

        e.preventDefault();

        // ✅ FIXED HERE
        // const username = document.getElementById("username") ? .value.trim();
        // const password = document.getElementById("password") ? .value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorBox = document.getElementById("errorMessage");
        const loginBtn = document.getElementById("loginBtn");

        if (errorBox) errorBox.style.display = "none";

        if (!username || !password) {
            if (errorBox) {
                errorBox.innerText = "Please enter username and password";
                errorBox.style.display = "block";
            }
            return;
        }

        if (loginBtn) {
            loginBtn.innerHTML = "⏳ Logging in...";
            loginBtn.disabled = true;
        }

        fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            .then(response => {
                if (!response.ok) throw new Error("Server error");
                return response.json();
            })
            .then(data => {

                console.log("🔍 Login Response:", data);

                if (data.success || data.role) {

                    // 🔥 TOKEN SAVE
                    if (data.token) {
                        localStorage.setItem("token", data.token);
                    } else {
                        console.warn("⚠️ Token not received");
                    }

                    localStorage.setItem("username", data.username || username);
                    localStorage.setItem("role", data.role);

                    if (data.role === "ADMIN") {
                        window.location.href = "pages/admin/dashboard.html";
                    } else if (data.role === "EMPLOYEE") {
                        window.location.href = "pages/employee/dashboard.html";
                    } else {
                        window.location.href = "pages/intern/dashboard.html";
                    }

                } else {
                    if (errorBox) {
                        errorBox.innerText = data.message || "Invalid credentials";
                        errorBox.style.display = "block";
                    }
                }

                if (loginBtn) {
                    loginBtn.innerText = "Login";
                    loginBtn.disabled = false;
                }

            })
            .catch(error => {

                console.error("❌ Login error:", error);

                if (errorBox) {
                    errorBox.innerText = "Server error. Please try again.";
                    errorBox.style.display = "block";
                }

                if (loginBtn) {
                    loginBtn.innerText = "Login";
                    loginBtn.disabled = false;
                }

            });

    });

});