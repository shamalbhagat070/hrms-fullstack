document.addEventListener("DOMContentLoaded", loadPayroll);

/* ===============================
   LOAD PAYROLL TABLE
================================ */
async function loadPayroll() {

    try {
        const month = document.getElementById("filterMonth").value;
        const search = document.getElementById("searchPayroll").value.trim();
        const year = new Date().getFullYear();

        let url = `http://localhost:8080/api/salary?month=${month}&year=${year}&size=100`;

        if (search) {
            url += `&search=${search}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        const payroll = data.content;

        const table = document.getElementById("payrollTable");
        table.innerHTML = "";

        if (!payroll || payroll.length === 0) {
            table.innerHTML = `<tr><td colspan="9">No payroll data found</td></tr>`;
            return;
        }

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        payroll.forEach((p, index) => {

            table.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.userName || "N/A"}</td>
                    <td>${months[p.month - 1]}</td>
                    <td>₹${p.basic}</td>
                    <td>₹${p.allowances}</td>
                    <td>₹${p.deductions}</td>
                    <td>₹${p.netSalary}</td>
                    <td>${p.status}</td>
                   
                    <td>
    <button class="btn-download" onclick="downloadPayslip(${p.id})">
    Download
    </button>
</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Payroll Load Error:", err);
    }
}

/* ===============================
   GENERATE PAYROLL
================================ */
async function generatePayroll() {

    try {
        const month = document.getElementById("month").value;
        const year = new Date().getFullYear();
        const search = document.getElementById("searchEmployee").value.trim();

        let url = `http://localhost:8080/api/salary/generate?month=${month}&year=${year}`;

        if (search) {
            url += `&search=${search}`;
        }

        await fetch(url, { method: "POST" });

        alert("Payroll Generated ✅");

        closePayrollModal();
        loadPayroll();

    } catch (err) {
        console.error("Generate Payroll Error:", err);
    }
}

/* ===============================
   DOWNLOAD PAYSLIP
================================ */
function downloadPayslip(id) {
    window.open(`http://localhost:8080/api/salary/payslip/${id}`);
}

/* ===============================
   MODAL CONTROL
================================ */
function openPayrollModal() {
    document.getElementById("payrollModal").style.display = "block";
}

function closePayrollModal() {
    document.getElementById("payrollModal").style.display = "none";
}