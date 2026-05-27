console.log("Admin Dashboard JS Loaded");

// ============================
// BASE API URL
// ============================

const API_BASE = "http://10.185.18.32:8080/api/admin";


// ============================
// AUTH CHECK
// ============================

function checkAuth() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = "../../login.html";
    }

}

checkAuth();


// ============================
// LOAD DASHBOARD DATA
// ============================

async function loadDashboardData() {

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(API_BASE + "/dashboard", {

            method: "GET",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }

        });

        if (!response.ok) {
            throw new Error("Failed to load dashboard data");
        }

        const data = await response.json();

        updateDashboard(data);

    } catch (error) {

        console.error("Dashboard error:", error);
        alert("Unable to load dashboard data");

    }

}


// ============================
// UPDATE DASHBOARD UI
// ============================

function updateDashboard(data) {

    if (document.getElementById("empCount"))
        document.getElementById("empCount").innerText = data.totalEmployees;

    if (document.getElementById("presentCount"))
        document.getElementById("presentCount").innerText = data.presentToday;

    if (document.getElementById("leaveCount"))
        document.getElementById("leaveCount").innerText = data.pendingLeaves;

    if (document.getElementById("payrollTotal"))
        document.getElementById("payrollTotal").innerText = "$" + data.monthlyPayroll;

}


// ============================
// LOGOUT FUNCTION
// ============================

function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        window.location.href = "../../login.html";

    }

}


// ============================
// AUTO LOAD DASHBOARD
// ============================

document.addEventListener("DOMContentLoaded", function () {

    loadDashboardData();

});