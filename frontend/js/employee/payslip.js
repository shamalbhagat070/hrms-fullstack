// =========================
// CONFIG
// =========================
const BASE_URL = "http://localhost:8080/api/salary";
const token = localStorage.getItem("token");

let currentSalary = null;

// =========================
// LOAD MONTHS FROM BACKEND
// =========================
async function loadMonthDropdown() {

    const select = document.getElementById("monthSelect");

    try {
        const res = await fetch(`${BASE_URL}/months`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        select.innerHTML = "";

        if (!data || data.length === 0) {
            select.innerHTML = `<option>No Payslips Available</option>`;
            return;
        }

        data.forEach(item => {

            const month = item.month;
            const year = item.year;

            const value = `${year}-${String(month).padStart(2, "0")}`;

            const date = new Date(year, month - 1);

            const label = date.toLocaleString("default", {
                month: "long",
                year: "numeric"
            });

            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;

            select.appendChild(option);
        });

    } catch (err) {
        console.error("Month load error:", err);
    }
}

// =========================
// LOAD PAYSLIP
// =========================
async function loadPayslip(month, year) {

    try {
        const res = await fetch(
            `${BASE_URL}/my?month=${month}&year=${year}`, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!res.ok) {
            alert("Failed to load payslip ❌");
            return;
        }

        const data = await res.json();

        if (!data || data.length === 0) {
            clearUI(); // ✅ clear UI if no data
            return;
        }

        const s = data[0];
        currentSalary = s;

        // =========================
        // SET VALUES
        // =========================
        document.getElementById("basic").innerText = "₹" + s.basic;
        document.getElementById("hra").innerText = "₹" + s.allowances;
        document.getElementById("bonus").innerText = "₹0";

        document.getElementById("pf").innerText = "₹" + s.pf;
        document.getElementById("tax").innerText = "₹" + s.tax;
        document.getElementById("leaveDeduction").innerText = "₹" + s.leaveDeduction;

        // =========================
        // SUMMARY
        // =========================
        const gross = s.basic + s.allowances;
        const deduction = s.deductions;
        const net = s.netSalary;

        document.getElementById("gross").innerText = "₹" + gross;
        document.getElementById("deduction").innerText = "₹" + deduction;
        document.getElementById("net").innerText = "₹" + net;
        document.getElementById("netPay").innerText = "₹" + net;

    } catch (err) {
        console.error(err);
        alert("Backend error ❌");
    }
}

function logout() {
    // ❌ Clear stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // ✅ Redirect to login page
    window.location.href = "../../index.html"; // adjust path if needed
}
// =========================
// CLEAR UI (NEW)
// =========================
function clearUI() {
    document.getElementById("basic").innerText = "₹0";
    document.getElementById("hra").innerText = "₹0";
    document.getElementById("bonus").innerText = "₹0";
    document.getElementById("pf").innerText = "₹0";
    document.getElementById("tax").innerText = "₹0";
    document.getElementById("leaveDeduction").innerText = "₹0";

    document.getElementById("gross").innerText = "₹0";
    document.getElementById("deduction").innerText = "₹0";
    document.getElementById("net").innerText = "₹0";
    document.getElementById("netPay").innerText = "₹0";
}

// =========================
// DOWNLOAD PAYSLIP
// =========================
async function downloadPayslip() {

    if (!currentSalary) {
        alert("No payslip available ❌");
        return;
    }

    try {
        const res = await fetch(
            `${BASE_URL}/payslip/${currentSalary.id}`, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "payslip.pdf";
        a.click();

    } catch (err) {
        console.error(err);
        alert("Download failed ❌");
    }
}

// =========================
// MONTH CHANGE
// =========================
document.getElementById("monthSelect").addEventListener("change", (e) => {

    const [year, month] = e.target.value.split("-");
    loadPayslip(parseInt(month), parseInt(year));
});

// =========================
// INIT (FIXED 🔥)
// =========================
document.addEventListener("DOMContentLoaded", async() => {

    if (!token) {
        alert("Please login ❌");
        window.location.href = "../../login.html";
        return;
    }

    await loadMonthDropdown(); // ✅ load from backend

    const firstValue = document.getElementById("monthSelect").value;

    if (firstValue) {
        const [year, month] = firstValue.split("-");
        loadPayslip(parseInt(month), parseInt(year));
    }
});