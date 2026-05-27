const API_URL = "http://localhost:8080/api/attendance";
const token = localStorage.getItem("token");

let attendanceList = [];

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadTodayAttendance();
});

/* ===============================
   HEADERS
================================ */
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

/* ===============================
   DASHBOARD COUNTS
================================ */
async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/dashboard`, {
            headers: getHeaders()
        });

        const data = await res.json();

        document.getElementById("presentCount").innerText = data.present || 0;
        document.getElementById("absentCount").innerText = data.absent || 0;
        document.getElementById("leaveCount").innerText = data.leave || 0;

    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

/* ===============================
   LOAD TODAY ATTENDANCE
================================ */
async function loadTodayAttendance() {
    try {
        const res = await fetch(`${API_URL}/today-full`, {
            headers: getHeaders()
        });

        const data = await res.json();

        attendanceList = data;

        renderTable(attendanceList);
        updateCountsFromList(attendanceList);

    } catch (err) {
        console.error("Attendance error:", err);
    }
}

/* ===============================
   TABLE RENDER
================================ */
function renderTable(data) {

    const table = document.getElementById("attendanceTable");
    table.innerHTML = "";

    data.forEach((a, index) => {

                table.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${a.firstName} ${a.lastName}</td>
            <td>${a.date}</td>
            <td>
  <span class="${
    a.status === "PRESENT" ? "status-active" :
    a.status === "ABSENT" ? "status-inactive" :
    "status-leave"
  }">
    ${a.status}
  </span>
</td>
            <td>${a.checkIn ? formatTime(a.checkIn) : "-"}</td>
            <td>${a.checkOut ? formatTime(a.checkOut) : "-"}</td>
            <td>
                ${a.checkIn ? "✔" : `<button onclick="checkIn(${a.userId})">In</button>`}
                ${a.checkOut ? "✔" : `<button onclick="checkOut(${a.userId})">Out</button>`}
            </td>
        </tr>
        `;
    });
}

/* ===============================
   UPDATE COUNTS FROM TABLE
================================ */
function updateCountsFromList(data) {
    let present = 0, absent = 0, leave = 0;

    data.forEach(a => {
        if (a.status === "PRESENT") present++;
        else if (a.status === "ABSENT") absent++;
        else if (a.status === "LEAVE") leave++;
    });

    document.getElementById("presentCount").innerText = present;
    document.getElementById("absentCount").innerText = absent;
    document.getElementById("leaveCount").innerText = leave;
}

/* ===============================
   FORMAT TIME
================================ */
function formatTime(dateTime) {
    return new Date(dateTime).toLocaleTimeString();
}

/* ===============================
   CHECK-IN (ADMIN)
================================ */
async function checkIn(userId) {
    try {
        const res = await fetch(`${API_URL}/check-in/${userId}`, {
            method: "POST",
            headers: getHeaders()
        });

        alert(await res.text());

        loadTodayAttendance();
        loadDashboard();

    } catch (err) {
        console.error("Check-in error:", err);
    }
}

/* ===============================
   CHECK-OUT (ADMIN)
================================ */
async function checkOut(userId) {
    try {
        const res = await fetch(`${API_URL}/check-out/${userId}`, {
            method: "POST",
            headers: getHeaders()
        });

        alert(await res.text());

        loadTodayAttendance();
        loadDashboard();

    } catch (err) {
        console.error("Check-out error:", err);
    }
}

/* ===============================
   FILTER
================================ */
function filterByDate() {
    const date = document.getElementById("attendanceDate").value;

    if (!date) return renderTable(attendanceList);

    const filtered = attendanceList.filter(a => a.date === date);
    renderTable(filtered);
}

/* ===============================
   SEARCH
================================ */
function searchAttendance() {
    const value = document.getElementById("search").value.toLowerCase();

    const filtered = attendanceList.filter(a =>
        (a.firstName + " " + a.lastName).toLowerCase().includes(value)
    );

    renderTable(filtered);
}

/* ===============================
   NAVIGATION
================================ */
function openMonthly() {
    window.location.href = "monthly.html";
}