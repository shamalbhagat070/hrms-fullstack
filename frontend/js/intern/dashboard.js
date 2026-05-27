// =========================
// CONFIG
// =========================
const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

// =========================
// AUTH CHECK
// =========================
if (role !== "INTERN") {
    alert("Access denied ❌");
    window.location.href = "../../login.html";
}

// =========================
// LOAD DASHBOARD DATA
// =========================
async function loadDashboard() {

    try {
        const res = await fetch("http://localhost:8080/api/intern/tasks/my", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            handleSession();
            return;
        }

        const tasks = await res.json();

        let total = tasks.length;
        let completed = tasks.filter(t => t.status === "REVIEWED").length;
        let pending = total - completed;

        document.getElementById("assigned").innerText = total;
        document.getElementById("completed").innerText = completed;
        document.getElementById("pending").innerText = pending;

        let progress = total ? Math.round((completed / total) * 100) : 0;
        document.getElementById("progress").innerText = progress + "%";

    } catch (err) {
        console.error(err);
    }
}

// =========================
// LOGOUT
// =========================
function logout() {
    localStorage.clear();
    window.location.href = "../../login.html";
}

// =========================
// SESSION
// =========================
function handleSession() {
    alert("Session expired ❌");
    window.location.href = "../../login.html";
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", loadDashboard);