// ================= LOAD DATA =================
let employees = JSON.parse(localStorage.getItem("employees")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];
let leaves = JSON.parse(localStorage.getItem("leaves")) || [];
let payroll = JSON.parse(localStorage.getItem("payroll")) || [];

// ================= DASHBOARD =================
window.onload = function () {

    if (document.getElementById("empCount")) {
        document.getElementById("empCount").innerText = employees.length;
        document.getElementById("attCount").innerText = attendance.length;

        let pending = leaves.filter(l => l.status === "Pending");
        document.getElementById("leaveCount").innerText = pending.length;

        document.getElementById("payCount").innerText = payroll.length;
    }

    displayEmployees();
    displayAttendance();
    displayLeaves();
    displayPayroll();
};

////////////////////////////////////////////////
// ================= EMPLOYEES =================
////////////////////////////////////////////////

function addEmployee(e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let role = document.getElementById("role").value;
    let email = document.getElementById("email").value;

    employees.push({ name, role, email });
    localStorage.setItem("employees", JSON.stringify(employees));

    displayEmployees();
    document.getElementById("empForm").reset();
}

function displayEmployees() {
    let table = document.getElementById("empTable");
    if (!table) return;

    table.innerHTML = "";

    employees.forEach((emp, i) => {
        table.innerHTML += `
        <tr>
            <td>${emp.name}</td>
            <td>${emp.role}</td>
            <td>${emp.email}</td>
            <td>
                <button class="delete" onclick="deleteEmployee(${i})">Delete</button>
            </td>
        </tr>`;
    });
}

function deleteEmployee(i) {
    if (confirm("Delete employee?")) {
        employees.splice(i, 1);
        localStorage.setItem("employees", JSON.stringify(employees));
        displayEmployees();
    }
}

////////////////////////////////////////////////
// ================= ATTENDANCE =================
////////////////////////////////////////////////

function addAttendance(e) {
    e.preventDefault();

    let name = document.getElementById("attName").value;
    let status = document.getElementById("status").value;

    attendance.push({
        name,
        status,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem("attendance", JSON.stringify(attendance));
    displayAttendance();
    document.getElementById("attForm").reset();
}

function displayAttendance() {
    let table = document.getElementById("attTable");
    if (!table) return;

    table.innerHTML = "";

    attendance.forEach(att => {
        table.innerHTML += `
        <tr>
            <td>${att.name}</td>
            <td>${att.status}</td>
            <td>${att.date}</td>
        </tr>`;
    });
}

////////////////////////////////////////////////
// ================= LEAVE =================
////////////////////////////////////////////////

function addLeave(e) {
    e.preventDefault();

    let name = document.getElementById("leaveName").value;
    let reason = document.getElementById("reason").value;

    leaves.push({ name, reason, status: "Pending" });
    localStorage.setItem("leaves", JSON.stringify(leaves));

    displayLeaves();
    document.getElementById("leaveForm").reset();
}

function displayLeaves() {
    let table = document.getElementById("leaveTable");
    if (!table) return;

    table.innerHTML = "";

    leaves.forEach((l, i) => {
        table.innerHTML += `
        <tr>
            <td>${l.name}</td>
            <td>${l.reason}</td>
            <td>${l.status}</td>
            <td>
                <button class="approve" onclick="approveLeave(${i})">Approve</button>
                <button class="reject" onclick="rejectLeave(${i})">Reject</button>
            </td>
        </tr>`;
    });
}

function approveLeave(i) {
    leaves[i].status = "Approved";
    localStorage.setItem("leaves", JSON.stringify(leaves));
    displayLeaves();
}

function rejectLeave(i) {
    leaves[i].status = "Rejected";
    localStorage.setItem("leaves", JSON.stringify(leaves));
    displayLeaves();
}

////////////////////////////////////////////////
// ================= PAYROLL =================
////////////////////////////////////////////////

function addPayroll(e) {
    e.preventDefault();

    let name = document.getElementById("payName").value;
    let salary = document.getElementById("salary").value;

    payroll.push({ name, salary });
    localStorage.setItem("payroll", JSON.stringify(payroll));

    displayPayroll();
    document.getElementById("payForm").reset();
}

function displayPayroll() {
    let table = document.getElementById("payTable");
    if (!table) return;

    table.innerHTML = "";

    payroll.forEach(p => {
        table.innerHTML += `
        <tr>
            <td>${p.name}</td>
            <td>${p.salary}</td>
        </tr>`;
    });
}