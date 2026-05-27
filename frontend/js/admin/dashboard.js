const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

/* ===============================
   COMMON HEADERS
================================ */
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", async() => {
    console.log("Admin Dashboard Loaded ✅");

    await loadDashboardData();
    loadCharts();
});

/* ===============================
   GLOBAL VARIABLES
================================ */
let attendanceChartInstance = null;
let empChartInstance = null;
let trendChartInstance = null;
let payrollChartInstance = null;

/* ===============================
   SAFE TEXT SETTER
================================ */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

/* ===============================
   LOAD DASHBOARD DATA
================================ */
async function loadDashboardData() {
    try {

        /* 🔹 Employees */
        const empRes = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
        const employees = await empRes.json();
        setText("empCount", employees.length);

        /* 🔹 Attendance */
        const attRes = await fetch(`${API_BASE}/attendance/dashboard`, { headers: getHeaders() });
        const attendance = await attRes.json();

        console.log("ATTENDANCE:", attendance);

        setText("presentCount", attendance.present || 0);
        window.attendanceData = attendance;

        /* 🔹 Leaves */
        const leaveRes = await fetch(`${API_BASE}/leaves`, { headers: getHeaders() });
        const leaveData = await leaveRes.json();

        console.log("LEAVES API:", leaveData);

        const leaves = leaveData.content || leaveData;

        const pendingLeaves = leaves.filter(
            l => (l.status || "").toLowerCase().trim() === "pending"
        ).length;

        setText("leaveCount", pendingLeaves);

        /* 🔹 Payroll */
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const payrollRes = await fetch(
            `${API_BASE}/salary?month=${month}&year=${year}`, { headers: getHeaders() }
        );

        const salaryData = await payrollRes.json();

        console.log("SALARY API:", salaryData);

        const salaryList = salaryData.content || [];

        const totalPayroll = salaryList.reduce(
            (sum, s) => sum + (s.netSalary || 0),
            0
        );

        setText("payrollTotal", "₹" + totalPayroll);

    } catch (error) {
        console.error("Dashboard API error:", error);
    }
}

/* ===============================
   LOAD ALL CHARTS
================================ */
function loadCharts() {

    if (typeof Chart === "undefined") {
        console.error("Chart.js not loaded!");
        return;
    }

    // 🔥 GLOBAL TEXT FIX FOR DARK UI
    Chart.defaults.color = "#ffffff";
    Chart.defaults.borderColor = "rgba(255,255,255,0.2)";

    loadEmployeeChart();
    loadAttendanceChart();
    loadTrendChart();
    loadPayrollChart();
}

/* ===============================
   PAYROLL CHART
================================ */
async function loadPayrollChart() {

    const ctx = document.getElementById("payrollChart");
    if (!ctx) return;

    try {
        const year = new Date().getFullYear();

        const res = await fetch(
            `${API_BASE}/salary/monthly?year=${year}`, { headers: getHeaders() }
        );

        const data = await res.json();

        console.log("PAYROLL CHART DATA:", data);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const values = months.map(m => data[m] || 0);

        if (payrollChartInstance) payrollChartInstance.destroy();

        payrollChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: months,
                datasets: [{
                    label: "Monthly Payroll",
                    data: values,
                    backgroundColor: "#a78bfa"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: "#ffffff" } },
                    y: { ticks: { color: "#ffffff" } }
                },
                plugins: {
                    legend: { labels: { color: "#ffffff" } }
                }
            }
        });

    } catch (err) {
        console.error("Payroll chart error:", err);
    }
}

/* ===============================
   EMPLOYEE CHART
================================ */
function loadEmployeeChart() {

    const ctx = document.getElementById("empChart");
    if (!ctx) return;

    if (empChartInstance) empChartInstance.destroy();

    empChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{
                label: "Employees",
                data: [10, 25, 40, 60, 80, 120],
                borderColor: "#4ade80",
                backgroundColor: "rgba(74,222,128,0.2)",
                fill: true
            }]
        },
        options: {
            plugins: {
                legend: { labels: { color: "#ffffff" } }
            },
            scales: {
                x: { ticks: { color: "#ffffff" } },
                y: { ticks: { color: "#ffffff" } }
            }
        }
    });
}

/* ===============================
   ATTENDANCE CHART
================================ */
function loadAttendanceChart() {

    const ctx = document.getElementById("attendanceChart");
    if (!ctx) return;

    if (attendanceChartInstance) attendanceChartInstance.destroy();

    const data = window.attendanceData || {};

    attendanceChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Present", "Absent", "Leave"],
            datasets: [{
                data: [
                    data.present || 0,
                    data.absent || 0,
                    data.leave || 0
                ],
                backgroundColor: ["#22c55e", "#ef4444", "#facc15"]
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: { color: "#ffffff" }
                }
            }
        }
    });
}

/* ===============================
   TREND CHART
================================ */
async function loadTrendChart() {

    const ctx = document.getElementById("trendChart");
    if (!ctx) return;

    try {
        const res = await fetch(
            `${API_BASE}/attendance/trends`, { headers: getHeaders() }
        );

        const data = await res.json();

        console.log("TREND DATA:", data);

        const labels = Object.keys(data);
        const values = Object.values(data);

        if (trendChartInstance) trendChartInstance.destroy();

        trendChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Daily Present Employees",
                    data: values,
                    borderColor: "#38bdf8",
                    fill: false
                }]
            },
            options: {
                plugins: {
                    legend: { labels: { color: "#ffffff" } }
                },
                scales: {
                    x: { ticks: { color: "#ffffff" } },
                    y: { ticks: { color: "#ffffff" } }
                }
            }
        });

    } catch (err) {
        console.error("Trend chart error:", err);
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark");
}

/* ===============================
   LOGOUT
================================ */
function logout() {
    localStorage.clear();
    window.location.href = "../../index.html";
}