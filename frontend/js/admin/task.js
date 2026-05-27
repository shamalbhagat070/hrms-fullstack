const token = localStorage.getItem("token");

const API_TASK = "http://localhost:8080/api/admin/tasks";
const API_USERS = "http://localhost:8080/api/users";

// =========================
// LOAD INTERNS (DROPDOWN)
// =========================
async function loadInterns() {

    try {
        const res = await fetch(API_USERS, {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) throw new Error("Failed to load users");

        const users = await res.json();

        const select = document.getElementById("internSelect");
        select.innerHTML = "";

        users.forEach(u => {
            if (u.role === "INTERN") {
                select.innerHTML += `<option value="${u.username}">${u.username}</option>`;
            }
        });

    } catch (err) {
        console.error("Error loading interns:", err);
    }
}

// =========================
// CREATE TASK
// =========================
function createTask() {

    const title = document.getElementById("title").value;
    const deadline = document.getElementById("deadline").value;
    const username = document.getElementById("internSelect").value;

    if (!title || !deadline || !username) {
        alert("Fill all fields ❌");
        return;
    }

    fetch(API_TASK + "/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ title, deadline, username })
        })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            loadTasks();
        })
        .catch(err => console.error(err));
}

// =========================
// LOAD TASKS
// =========================
async function loadTasks() {

    try {
        const res = await fetch(API_TASK + "/all", {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) throw new Error("Failed to load tasks");

        const tasks = await res.json();

        console.log("TASKS:", tasks); // 🔥 DEBUG

        const table = document.getElementById("taskTable");
        table.innerHTML = "";

        if (!tasks || tasks.length === 0) {
            table.innerHTML = `<tr><td colspan="4">No tasks found</td></tr>`;
            return;
        }

        tasks.forEach(t => {
            table.innerHTML += `
            <tr>
                <td>${t.title}</td>
                <td>${t.intern ? t.intern.username : "N/A"}</td>
                <td><span class="status ${t.status.toLowerCase()}">${t.status}</span></td>
                <td>
                    <button onclick="deleteTask(${t.id})">Delete</button>
                    <button onclick="reviewTask(${t.id})">Review</button>
                </td>
            </tr>`;
        });

    } catch (err) {
        console.error("Error loading tasks:", err);
    }
}

// =========================
// DELETE TASK
// =========================
function deleteTask(id) {

    fetch(API_TASK + "/delete/" + id, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
        })
        .then(() => loadTasks());
}

// =========================
// REVIEW TASK
// =========================
function reviewTask(id) {

    fetch(API_TASK + "/review/" + id, {
            method: "PUT",
            headers: { Authorization: "Bearer " + token }
        })
        .then(() => loadTasks());
}

function deleteTask(id) {

    if (!confirm("Are you sure to delete?")) return;

    fetch(API_TASK + "/delete/" + id, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
        })
        .then(() => loadTasks());
}

// =========================
// LOGOUT
// =========================
function logout() {
    localStorage.clear();
    window.location.href = "../../login.html";
}

// INIT
loadInterns();
loadTasks();