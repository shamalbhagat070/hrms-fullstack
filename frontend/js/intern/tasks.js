const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

if (role !== "INTERN") {
    window.location.href = "../../login.html";
}

const API = "http://localhost:8080/api/intern/tasks";

async function loadTasks() {
    const res = await fetch(API + "/my", {
        headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) return logout();

    const tasks = await res.json();
    const body = document.getElementById("taskTable");
    body.innerHTML = "";

    tasks.forEach((t, i) => {
        body.innerHTML += `
        <tr>
            <td>${t.title}</td>
            <td>${formatDate(t.deadline)}</td>
            <td class="${t.status.toLowerCase()}">${t.status}</td>
            <td>${uploadUI(t)}</td>
        </tr>`;
    });
}

function uploadUI(task) {
    if (task.status === "REVIEWED") return "✔ Done";

    return `<input type="file" onchange="uploadTask(event, ${task.id})">`;
}

async function uploadTask(e, id) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", id);

    const res = await fetch(API + "/submit", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData
    });

    alert(await res.text());
    loadTasks();
}

function formatDate(d) {
    return new Date(d).toLocaleDateString();
}

function logout() {
    localStorage.clear();
    location.href = "../../login.html";
}

loadTasks();