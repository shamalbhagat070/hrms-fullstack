const API = "http://localhost:8080/api/leaves";
const token = localStorage.getItem("token");

let allLeaves = [];

// ================= LOAD =================
document.addEventListener("DOMContentLoaded", () => {
    loadLeaves();
});

// ================= HEADERS =================
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

// ================= FETCH DATA =================
async function loadLeaves() {
    try {
        const res = await fetch(API, {
            headers: getHeaders()
        });

        const data = await res.json();

        console.log("LEAVES:", data);

        allLeaves = data;

        renderTable(data);
        renderAnalytics(data);

    } catch (err) {
        console.error("Error loading leaves", err);
    }
}

// ================= TABLE =================
function renderTable(data) {

    const table = document.getElementById("leaveTable");
    table.innerHTML = "";

    data.forEach((l, i) => {

                table.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${l.employeeName}</td>
                <td>${l.leaveType}</td>
                <td>${l.startDate}</td>
                <td>${l.endDate}</td>
                <td>${l.halfDayType || '-'}</td>
                <td>${l.reason}</td>
                <td class="${(l.status || '').toLowerCase()}">
                    ${l.status}
                </td>
                <td>
                    ${l.status === "PENDING"
                        ? `
                        <button onclick="approveLeave(${l.id})">✔</button>
                        <button onclick="rejectLeave(${l.id})">✖</button>
                        `
                        : "-"
                    }
                </td>
            </tr>
        `;
    });
}

// ================= ANALYTICS =================
function renderAnalytics(data) {

    document.getElementById("totalCount").innerText = data.length;

    document.getElementById("approvedCount").innerText =
        data.filter(l => l.status === "APPROVED").length;

    document.getElementById("pendingCount").innerText =
        data.filter(l => l.status === "PENDING").length;

    document.getElementById("rejectedCount").innerText =
        data.filter(l => l.status === "REJECTED").length;
}

// ================= APPROVE =================
async function approveLeave(id) {

    try {
        const res = await fetch(`${API}/approve/${id}`, {
            method: "PUT",
            headers: getHeaders()
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        alert("Leave Approved ✅");

        loadLeaves();

    } catch (err) {
        console.error("Approve error:", err);
        alert("Approve failed ❌");
    }
}

// ================= REJECT =================
async function rejectLeave(id) {

    try {
        const res = await fetch(`${API}/reject/${id}`, {
            method: "PUT",
            headers: getHeaders()
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        alert("Leave Rejected ❌");

        loadLeaves();

    } catch (err) {
        console.error("Reject error:", err);
        alert("Reject failed ❌");
    }
}

// ================= SEARCH =================
function searchLeave() {

    const value = document.getElementById("searchLeave").value.toLowerCase();

    const filtered = allLeaves.filter(l =>
        (l.employeeName || "").toLowerCase().includes(value)
    );

    renderTable(filtered);
}

// ================= FILTER STATUS =================
function filterLeave() {

    const status = document.getElementById("leaveFilter").value;

    const filtered = status
        ? allLeaves.filter(l => l.status === status)
        : allLeaves;

    renderTable(filtered);
}

// ================= DATE FILTER =================
function filterByDate() {

    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    if (!from || !to) {
        renderTable(allLeaves);
        return;
    }

    const filtered = allLeaves.filter(l =>
        l.startDate >= from && l.endDate <= to
    );

    renderTable(filtered);
}