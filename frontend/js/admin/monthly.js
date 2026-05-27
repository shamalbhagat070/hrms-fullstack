const API_URL = "http://localhost:8080/api/attendance";

let currentData = [];
let monthlyChartInstance = null;

/* ===============================
   LOAD REPORT
================================ */
async function loadReport() {

    const month = document.getElementById("month").value;
    const year = document.getElementById("year").value;

    if (!month || !year) {
        alert("Enter month and year");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/monthly?month=${month}&year=${year}`);
        const data = await res.json();

        currentData = data;

        renderTable(data);
        updateSummary(data);
        loadMonthlyChart(data);

    } catch (err) {
        console.error("Error:", err);
    }
}

/* ===============================
   TABLE
================================ */
function renderTable(data) {

    const summary = generateSummary(data);

    const table = document.getElementById("reportTable");
    table.innerHTML = "";

    let index = 1;

    for (let name in summary) {

        const s = summary[name];

        table.innerHTML += `
            <tr>
                <td>${index++}</td>
                <td>${name}</td>
                <td>Present: ${s.present}</td>
                <td>Absent: ${s.absent}</td>
                <td>Leave: ${s.leave}</td>
            </tr>
        `;
    }
}

/* ===============================
   SUMMARY
================================ */
function updateSummary(data) {

    let p = 0,
        a = 0,
        l = 0;

    data.forEach(x => {
        if (x.status === "PRESENT") p++;
        else if (x.status === "ABSENT") a++;
        else l++;
    });

    document.getElementById("presentCount").innerText = p;
    document.getElementById("absentCount").innerText = a;
    document.getElementById("leaveCount").innerText = l;
}

/* ===============================
   BAR CHART
================================ */
function loadMonthlyChart(data) {

    let p = 0,
        a = 0,
        l = 0;

    data.forEach(x => {
        if (x.status === "PRESENT") p++;
        else if (x.status === "ABSENT") a++;
        else l++;
    });

    const ctx = document.getElementById("monthlyChart");

    if (monthlyChartInstance) monthlyChartInstance.destroy();

    monthlyChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Present", "Absent", "Leave"],
            datasets: [{
                label: "Attendance",
                data: [p, a, l]
            }]
        }
    });
}

/* ===============================
   DATE FILTER
================================ */
function filterByDate() {

    const date = document.getElementById("calendarDate").value;

    if (!date) return;

    const filtered = currentData.filter(x => x.date === date);

    renderTable(filtered);
}

/* ===============================
   EXPORT EXCEL
================================ */
function exportToExcel() {

    const worksheetData = [
        ["#", "Name", "Date", "Status", "Check In", "Check Out"]
    ];

    currentData.forEach((a, index) => {
        worksheetData.push([
            index + 1,
            a.firstName + " " + a.lastName,
            a.date,
            a.status,
            a.checkIn ? formatTime(a.checkIn) : "-",
            a.checkOut ? formatTime(a.checkOut) : "-"
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Optional column width
    ws["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    XLSX.writeFile(wb, "Monthly_Report.xlsx");
}

/* ===============================
   EXPORT PDF
================================ */
function exportToPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Monthly Attendance Report", 14, 15);

    const tableData = [];

    currentData.forEach((a, index) => {
        tableData.push([
            index + 1,
            a.firstName + " " + a.lastName,
            a.date,
            a.status,
            a.checkIn ? formatTime(a.checkIn) : "-",
            a.checkOut ? formatTime(a.checkOut) : "-"
        ]);
    });

    doc.autoTable({
        head: [
            ["#", "Name", "Date", "Status", "In", "Out"]
        ],
        body: tableData,
        startY: 20,
        styles: {
            fontSize: 10
        },
        headStyles: {
            fillColor: [79, 70, 229] // purple
        }
    });

    doc.save("Monthly_Report.pdf");
}

function generateSummary(data) {

    const summary = {};

    data.forEach(a => {

        const name = a.firstName + " " + a.lastName;

        if (!summary[name]) {
            summary[name] = { present: 0, absent: 0, leave: 0 };
        }

        if (a.status === "PRESENT") summary[name].present++;
        else if (a.status === "ABSENT") summary[name].absent++;
        else summary[name].leave++;
    });

    return summary;
}

/* ===============================
   TIME FORMAT
================================ */
function formatTime(dateTime) {
    return new Date(dateTime).toLocaleTimeString();
}