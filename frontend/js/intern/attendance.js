// =========================
// CONFIG
// =========================
const BASE_URL = "http://localhost:8080/api/attendance";
const token = localStorage.getItem("token");

let data = [];

let selectedStart = null;
let selectedEnd = null;

// =========================
// LOAD ATTENDANCE (API)
// =========================
async function loadAttendanceByMonth(year, month) {

    try {
        const url = `${BASE_URL}/monthly?month=${month}&year=${year}`;

        const res = await fetch(url, {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) {
            alert("Session expired ❌");
            window.location.href = "../../login.html";
            return;
        }

        const apiData = await res.json();

        // generate full month (missing days = absent)
        data = generateFullMonthDataByMonth(apiData, year, month);

        loadTable();
        loadCalendar();

    } catch (err) {
        console.error("Load error:", err);
    }
}

function generateCurrentMonthData(apiData) {

    const result = [];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {

        const date = new Date(year, month, i);
        const formatted = formatDateLocal(date);

        const existing = apiData.find(d => d.date === formatted);

        if (existing) {
            result.push(existing);
        } else if (date <= today) {
            result.push({
                date: formatted,
                checkIn: null,
                checkOut: null
            });
        }
    }

    return result;
}

function formatDateLocal(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}
// =========================
// GENERATE FULL MONTH DATA
// =========================
function generateFullMonthDataByMonth(apiData, year, month) {

    const result = [];

    const daysInMonth = new Date(year, month, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {

        const date = formatDateLocal(new Date(year, month - 1, i));

        const existing = apiData.find(d => d.date === date);

        if (existing) {
            result.push(existing);
        } else {
            result.push({
                date: date,
                checkIn: null,
                checkOut: null
            });
        }
    }

    return result;
};


// =========================
// STATUS LOGIC
// =========================
function getStatus(d) {

    if (!d.checkIn) return "ABSENT";

    const inTime = new Date(d.checkIn);

    // 🔥 If no checkout → still present (working day)
    if (!d.checkOut) return "PRESENT";

    const outTime = new Date(d.checkOut);
    const hours = (outTime - inTime) / (1000 * 60 * 60);

    if (hours < 4.5) return "HALF DAY";

    return "PRESENT";
}

// =========================
// LOAD TABLE
// =========================
function loadTable(filtered = data) {

    const table = document.getElementById("attendanceTable");
    table.innerHTML = "";

    filtered.forEach(d => {

        const status = getStatus(d);

        const row = `
        <tr>
            <td>${d.date}</td>
            <td>${formatTime(d.checkIn)}</td>
            <td>${formatTime(d.checkOut)}</td>
            <td>${calculateHours(d.checkIn, d.checkOut)}</td>
            <td>
                <span class="status ${formatClass(status)}">${status}</span>
            </td>
        </tr>
        `;

        table.innerHTML += row;
    });

    updateStats(filtered);
}

function filterByDate(data, start, end) {

    return data.filter(d => {

        const dt = parseLocalDate(d.date);
        return dt >= start && dt <= end;
    });
}

function logout() {
    // ❌ Clear stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // ✅ Redirect to login page
    window.location.href = "../../index.html"; // adjust path if needed
}

// =========================
// FORMAT HELPERS
// =========================
function formatClass(status) {
    return status.toLowerCase().replace(" ", "-");
}

function formatTime(time) {
    if (!time) return "-";

    return new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function calculateHours(inTime, outTime) {

    if (!inTime || !outTime) return "-";

    const diff = (new Date(outTime) - new Date(inTime)) / (1000 * 60 * 60);

    return diff.toFixed(2);
}

// =========================
// UPDATE STATS
// =========================
function updateStats(data) {

    let present = 0,
        absent = 0,
        half = 0;

    data.forEach(d => {

        if (!d.checkIn) {
            absent++;
        } else {

            const status = getStatus(d);

            if (status === "PRESENT") present++;
            else if (status === "HALF DAY") half++;
        }
    });

    document.getElementById("presentCount").innerText = present;
    document.getElementById("absentCount").innerText = absent;
    document.getElementById("halfCount").innerText = half;
}

// =========================
// CHECK IN
// =========================
async function checkIn() {

    try {
        const res = await fetch(BASE_URL + "/check-in", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        alert(await res.text());
        loadAttendance();

    } catch (err) {
        console.error(err);
    }
}

// =========================
// CHECK OUT
// =========================
async function checkOut() {

    try {
        const res = await fetch(BASE_URL + "/check-out", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        alert(await res.text());
        loadAttendance();

    } catch (err) {
        console.error(err);
    }
}

// =========================
// SEARCH
// =========================
function searchData(value) {

    const filtered = data.filter(d => {

        const status = getStatus(d);

        return (
            d.date.includes(value) ||
            status.toLowerCase().includes(value.toLowerCase())
        );
    });

    loadTable(filtered);
}

// =========================
// DATE RANGE FILTER
// =========================
flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    onChange: function(dates) {

        if (dates.length === 2) {

            const start = formatDateLocal(dates[0]);
            const end = formatDateLocal(dates[1]);

            loadAttendance(start, end);
        }

        if (dates.length === 0) {
            loadAttendance();
        }
    }
});

function initMonthDropdown() {

    const dropdown = document.getElementById("monthSelect");
    const today = new Date();

    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    dropdown.innerHTML = "";

    for (let i = 0; i < 12; i++) {

        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

        const value =
            d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0");

        const label = months[d.getMonth()] + " " + d.getFullYear();

        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;

        dropdown.appendChild(option);
    }

    // ✅ FIXED DEFAULT
    dropdown.value =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0");
}

document.getElementById("monthSelect").addEventListener("change", function() {

    const value = this.value; // YYYY-MM

    const [year, month] = value.split("-");

    loadAttendanceByMonth(parseInt(year), parseInt(month));

    document.getElementById("dateRange").value = "";
});

function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split("-");
    return new Date(y, m - 1, d);
}
// =========================
// VIEW SWITCH
// =========================
const tableView = document.getElementById("tableView");
const calendarView = document.getElementById("calendarView");

const tableBtn = document.getElementById("tableBtn");
const calendarBtn = document.getElementById("calendarBtn");

tableBtn.addEventListener("click", () => {
    tableView.classList.remove("hidden");
    calendarView.classList.add("hidden");

    tableBtn.classList.add("active");
    calendarBtn.classList.remove("active");
});

calendarBtn.addEventListener("click", () => {
    tableView.classList.add("hidden");
    calendarView.classList.remove("hidden");

    calendarBtn.classList.add("active");
    tableBtn.classList.remove("active");

    loadCalendar();
});

// =========================
// CALENDAR VIEW
// =========================
function loadCalendar() {

    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    calendar.style.display = "grid";
    calendar.style.gridTemplateColumns = "repeat(7, 1fr)";
    calendar.style.gap = "10px";

    data.forEach(d => {

        const status = getStatus(d);

        const box = document.createElement("div");

        box.style.padding = "12px";
        box.style.borderRadius = "10px";
        box.style.textAlign = "center";

        if (status === "PRESENT") box.style.background = "#dcfce7";
        if (status === "ABSENT") box.style.background = "#fee2e2";
        if (status === "LATE") box.style.background = "#fde68a";
        if (status === "HALF DAY") box.style.background = "#e0e7ff";

        box.innerHTML = `
            <div><strong>${d.date.split("-")[2]}</strong></div>
            <small>${status}</small>
        `;

        calendar.appendChild(box);
    });
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {

    initMonthDropdown();

    const today = new Date();
    loadAttendanceByMonth(today.getFullYear(), today.getMonth() + 1);
});