const BASE_URL = "http://localhost:8080/api";
const token = localStorage.getItem("token");

let leaveBalanceData = {};
let chartInstance = null;

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    if (!token) {
        alert("Please login ❌");
        window.location.href = "../../login.html";
        return;
    }

    loadLeaveBalance();
    loadLeaveHistory();

    document.getElementById("fromDate").addEventListener("change", calculateDays);
    document.getElementById("toDate").addEventListener("change", calculateDays);
});


// ==========================
// CALCULATE DAYS
// ==========================
function calculateDays() {

    const from = new Date(document.getElementById("fromDate").value);
    const to = new Date(document.getElementById("toDate").value);

    if (!from || !to) return;

    let days = (to - from) / (1000 * 60 * 60 * 24) + 1;
    if (days < 0) days = 0;

    document.getElementById("totalDays").innerText = days;

    const dayType = document.getElementById("dayType");
    if (days > 1) {
        dayType.value = "FULL_DAY";
        dayType.disabled = true;
    } else {
        dayType.disabled = false;
    }
}

// ==========================
// TABLE DAYS CALC
// ==========================
function calculateLeaveDays(start, end, halfDayType) {

    let days = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;

    if (halfDayType === "FIRST_HALF" || halfDayType === "SECOND_HALF") {
        days -= 0.5;
    }

    return days;
}

// ==========================
// APPLY LEAVE
// ==========================
async function applyLeave() {

    const type = document.getElementById("leaveType").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const dayType = document.getElementById("dayType").value;
    const reason = document.getElementById("reason").value;

    const days = parseFloat(document.getElementById("totalDays").innerText) || 0;

    if (type === "CASUAL" && days > (leaveBalanceData.casualRemaining || 0)) {
        return alert("Not enough Casual Leave ❌");
    }

    if (type === "SICK" && days > (leaveBalanceData.sickRemaining || 0)) {
        return alert("Not enough Sick Leave ❌");
    }

    const res = await fetch(BASE_URL + "/leaves/apply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            leaveType: type,
            startDate: fromDate,
            endDate: toDate,
            halfDayType: dayType,
            reason
        })
    });

    if (res.ok) {
        alert("Leave Applied ✅");
        loadLeaveBalance();
        loadLeaveHistory();
    }
}


// ==========================
// LOAD BALANCE
// ==========================
async function loadLeaveBalance() {

    const res = await fetch(BASE_URL + "/leaves/balance", {
        headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    leaveBalanceData = data;

    document.getElementById("casualRemaining").innerText = data.casualRemaining || 0;
    document.getElementById("casualUsed").innerText = data.casualUsed || 0;

    document.getElementById("sickRemaining").innerText = data.sickRemaining || 0;
    document.getElementById("sickUsed").innerText = data.sickUsed || 0;

    document.getElementById("paidRemaining").innerText = data.paidRemaining || 0;
    document.getElementById("paidUsed").innerText = data.paidUsed || 0;

    document.getElementById("unpaidUsed").innerText = data.unpaidUsed || 0;
}


// ==========================
// LOAD HISTORY + FEATURES
// ==========================
async function loadLeaveHistory() {

    const res = await fetch(BASE_URL + "/leaves/my", {
        headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();

    const table = document.getElementById("leaveTable");
    table.innerHTML = "";

    // ✅ REMOVE DUPLICATES (IMPORTANT)
    const unique = new Map();

    data.forEach(l => {
        const key = l.startDate + "_" + l.endDate + "_" + l.leaveType;

        if (!unique.has(key)) {
            unique.set(key, l);
        }
    });

    const filtered = Array.from(unique.values());

    filtered.forEach(l => {

        const days = calculateLeaveDays(
            l.startDate,
            l.endDate,
            l.halfDayType
        );

        function formatHalfDay(type) {
            switch (type) {
                case "FIRST_HALF":
                    return "First Half";
                case "SECOND_HALF":
                    return "Second Half";
                case "FULL_DAY":
                    return "Full Day";
                default:
                    return "-";
            }
        }

        table.innerHTML += `
            <tr>
                <td>${l.leaveType}</td>
                <td>${l.startDate}</td>
                <td>${l.endDate}</td>
                <td>${days}</td>
                <td>${formatHalfDay(l.halfDayType)}</td>
                <td class="${(l.status || '').toLowerCase()}">${l.status}</td>
            </tr>
        `;
    });

}


function logout() {
    localStorage.clear();
    window.location.href = "../../index.html";
}