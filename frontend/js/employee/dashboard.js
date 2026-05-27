// =========================
// CONFIG
// =========================
const BASE_URL = "http://localhost:8080/api";
const token = localStorage.getItem("token");

let chartInstance = null;

// =========================
// LOAD DASHBOARD
// =========================
async function loadDashboard() {

    try {
        const res = await fetch(BASE_URL + "/employee/dashboard", {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) {
            alert("Session expired ❌");
            window.location.href = "../../login.html";
            return;
        }

        const data = await res.json();

        const emp = data.data || data;

        const nameElement = document.getElementById("employeeName");

        if (nameElement) {
            nameElement.innerText =
                `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "Employee";
        }
        // =========================
        // CARDS
        // =========================
        document.getElementById("todayStatus").innerText = data.todayStatus;

        document.getElementById("leavesTaken").innerText =
            Number(data.leavesTaken).toFixed(1);

        document.getElementById("remainingLeaves").innerText =
            Number(data.remainingLeaves).toFixed(1);

        // Salary status mapping
        // Salary status mapping (FIXED)
        let salaryText = data.salaryStatus || "Not Generated";

        document.getElementById("salaryStatus").innerText = salaryText;
        // =========================
        // SUMMARY
        // =========================
        document.getElementById("presentDays").innerText = data.presentDays;
        document.getElementById("absentDays").innerText = data.absentDays;

        // =========================
        // ATTENDANCE TABLE
        // =========================
        const attendanceTable = document.getElementById("attendanceTable");
        attendanceTable.innerHTML = "";

        if (!data.recentDates || data.recentDates.length === 0) {
            attendanceTable.innerHTML =
                `<tr><td colspan="2">No attendance records</td></tr>`;
        } else {
            data.recentDates.forEach((date, i) => {
                attendanceTable.innerHTML += `
                    <tr>
                        <td>${formatDate(date)}</td>
                        <td class="${data.recentStatus[i].toLowerCase()}">
                            ${capitalize(data.recentStatus[i])}
                        </td>
                    </tr>
                `;
            });
        }

        // =========================
        // LEAVE TABLE
        // =========================
        const leaveTable = document.getElementById("leaveTable");
        leaveTable.innerHTML = "";

        if (!data.leaveDates || data.leaveDates.length === 0) {
            leaveTable.innerHTML =
                `<tr><td colspan="2">No leave records</td></tr>`;
        } else {
            data.leaveDates.forEach((date, i) => {
                leaveTable.innerHTML += `
                    <tr>
                        <td>
                            ${capitalize(data.leaveTypes[i])}
                            (${date})
                        </td>
                        <td class="${data.leaveStatus[i].toLowerCase()}">
                            ${capitalize(data.leaveStatus[i])}
                        </td>
                    </tr>
                `;
            });
        }

        // =========================
        // CHART
        // =========================
        loadChart(data.chartLabels, data.chartValues);

    } catch (err) {
        console.error("Dashboard error:", err);
        alert("Failed to load dashboard ❌");
    }
}

// =========================
// CHART (DONUT)
// =========================
function loadChart(labels, values) {

    const ctx = document.getElementById("chart");

    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// =========================
// CHECK-IN
// =========================
async function checkIn() {

    try {
        const res = await fetch(BASE_URL + "/attendance/check-in", {
            method: "POST",
            headers: { Authorization: "Bearer " + token }
        });

        if (res.ok) {
            alert("Checked In ✅");
            loadDashboard();
        } else {
            alert("Already checked in ❌");
        }
    } catch (err) {
        console.error(err);
    }
}

// =========================
// CHECK-OUT
// =========================
async function checkOut() {

    try {
        const res = await fetch(BASE_URL + "/attendance/check-out", {
            method: "POST",
            headers: { Authorization: "Bearer " + token }
        });

        if (res.ok) {
            alert("Checked Out ✅");
            loadDashboard();
        } else {
            alert("Check-in required ❌");
        }
    } catch (err) {
        console.error(err);
    }
}

// =========================
// HELPERS
// =========================
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.getDate() + " " +
        d.toLocaleString("default", { month: "short" });
}

function capitalize(text) {
    return text.charAt(0) + text.slice(1).toLowerCase();
}


function logout() {
    // ❌ Clear stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // ✅ Redirect to login page
    window.location.href = "../../index.html"; // adjust path if needed
}
// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {

    if (!token) {
        alert("Please login ❌");
        window.location.href = "../../login.html";
        return;
    }

    // Attach buttons safely
    const checkInBtn = document.querySelector(".checkin-btn");
    const checkOutBtn = document.querySelector(".checkout-btn");

    if (checkInBtn) checkInBtn.addEventListener("click", checkIn);
    if (checkOutBtn) checkOutBtn.addEventListener("click", checkOut);

    loadDashboard();
});