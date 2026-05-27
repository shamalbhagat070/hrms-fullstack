// =========================
// CONFIG
// =========================
const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

// ✅ FIXED (SAME API FOR ALL)
const BASE_URL = "http://localhost:8080/api/leaves";

let leaves = [];

// =========================
// APPLY LEAVE
// =========================
async function applyLeave() {

    if (isSubmitting) return;
    isSubmitting = true;

    const type = document.getElementById("leaveType").value;
    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;
    const reason = document.getElementById("reason").value.trim();
    const dayType = document.getElementById("dayType").value;

    if (!from || !to || !reason) {
        alert("Please fill all fields ❌");
        isSubmitting = false;
        return;
    }

    if (from > to) {
        alert("Invalid date range ❌");
        isSubmitting = false;
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (new Date(from) < new Date(today)) {
        alert("Cannot apply leave for past date ❌");
        isSubmitting = false;
        return;
    }

    try {
        const res = await fetch(BASE_URL + "/apply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                leaveType: type,
                startDate: from,
                endDate: to,
                reason,
                halfDayType: dayType
            })
        });

        const msg = await res.text();

        if (res.status === 401 || res.status === 403) {
            return handleSession();
        }

        if (!res.ok) {
            alert(msg);
            isSubmitting = false;
            return;
        }

        alert(msg || "Leave applied successfully ✅");

        await loadLeaves();
        await loadSummary();
        loadCalendar();

        resetForm();

    } catch (err) {
        console.error(err);
        alert("Server error ❌");
    }

    isSubmitting = false;
}
// =========================
// RESET FORM
// =========================
function resetForm() {
    document.getElementById("reason").value = "";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
}

// =========================
// LOAD LEAVES
// =========================
async function loadLeaves() {

    try {
        const res = await fetch(BASE_URL + "/my", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) return handleSession();

        leaves = await res.json();

        console.log("Leaves:", leaves); // 🔥 DEBUG

        const table = document.getElementById("leaveTable");
        table.innerHTML = "";

        if (!leaves.length) {
            table.innerHTML = `<tr><td colspan="5">No leave records</td></tr>`;
            return;
        }

        leaves.forEach(l => {
            table.innerHTML += `
            <tr>
                <td>${l.leaveType}</td>
                <td>${formatDate(l.startDate)}</td>
                <td>${formatDate(l.endDate)}</td>
                <td>${l.totalDays}</td>
                <td>
                    <span class="status ${l.status.toLowerCase()}">${l.status}</span>
                </td>
            </tr>`;
        });

    } catch (err) {
        console.error("Load error:", err);
    }
}

// =========================
// LOAD SUMMARY
// =========================
async function loadSummary() {

    try {
        const res = await fetch(BASE_URL + "/summary", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) return handleSession();

        const data = await res.json();

        console.log("Summary:", data); // 🔥 DEBUG

        setText("casualRemaining", data.casualRemaining);
        setText("casualUsed", data.casualUsed);

        setText("sickRemaining", data.sickRemaining);
        setText("sickUsed", data.sickUsed);

        // 🔥 Intern rule
        if (role === "INTERN") {
            setText("paidRemaining", 0);
            setText("paidUsed", 0);
        } else {
            setText("paidRemaining", data.paidRemaining);
            setText("paidUsed", data.paidUsed);
        }

    } catch (err) {
        console.error("Summary error:", err);
    }
}

// =========================
// CALENDAR
// =========================
function loadCalendar() {

    const calendar = document.getElementById("leaveCalendar");
    if (!calendar) return;

    calendar.innerHTML = "";

    if (!leaves.length) {
        calendar.innerHTML = "<p style='color:#888'>No leave records</p>";
        return;
    }

    leaves.forEach(l => {

        const div = document.createElement("div");

        let color = "#eee";
        if (l.status === "APPROVED") color = "#dcfce7";
        if (l.status === "PENDING") color = "#fef9c3";
        if (l.status === "REJECTED") color = "#fee2e2";

        div.style.background = color;
        div.style.padding = "12px";
        div.style.borderRadius = "10px";

        div.innerHTML = `
            <strong>${formatDate(l.startDate)}</strong><br>
            ${l.leaveType}<br>
            <small>${l.status}</small>
        `;

        calendar.appendChild(div);
    });
}

// =========================
// HELPERS
// =========================
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = (value !== null && value !== undefined) ? value : 0;
}

function handleSession() {
    alert("Session expired ❌");
    window.location.href = "../../login.html";
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async() => {

    if (!token) return handleSession();

    await loadLeaves();
    await loadSummary();
    loadCalendar();
});