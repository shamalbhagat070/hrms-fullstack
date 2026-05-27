const API_URL = "http://localhost:8080/api/users";

let employees = [];
let editId = null;

/* ===============================
   LOAD PAGE
================================ */
document.addEventListener("DOMContentLoaded", () => {
    fetchEmployees();
});

/* ===============================
   FETCH EMPLOYEES FROM API
================================ */
async function fetchEmployees() {
    try {
        const res = await fetch(API_URL);
        employees = await res.json();
        loadEmployees();
    } catch (err) {
        console.error("Error fetching employees:", err);
    }
}

/* ===============================
   DISPLAY EMPLOYEES (TABLE UI)
================================ */
function loadEmployees() {

    const table = document.getElementById("employeeTable");
    if (!table) return;

    table.innerHTML = "";

    employees.forEach((emp, index) => {

        table.innerHTML += `
            <tr>
                <td>${index + 1}</td>

                <td>
                    <strong>${emp.firstName} ${emp.lastName}</strong>
                </td>

                <td>${emp.email}</td>

                <td>${emp.department}</td>

                <td>
                    <span class="${emp.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}">
                        ${emp.status}
                    </span>
                </td>

                <td>
                    <button class="btn btn-edit" onclick="editEmployee(${emp.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteEmployee(${emp.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

/* ===============================
   OPEN MODAL
================================ */
function openModal() {
    document.getElementById("employeeModal").style.display = "flex";
}

/* ===============================
   CLOSE MODAL
================================ */
function closeModal() {
    document.getElementById("employeeModal").style.display = "none";
    clearForm();
}

/* ===============================
   CLEAR FORM
================================ */
function clearForm() {
    editId = null;

    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("department").value = "";
    document.getElementById("designation").value = "";
    document.getElementById("salary").value = "";
    document.getElementById("mobileNumber").value = "";
    document.getElementById("address").value = "";
    document.getElementById("role").value = "ADMIN";
    document.getElementById("status").value = "ACTIVE";
}

/* ===============================
   SAVE EMPLOYEE (CREATE + UPDATE)
================================ */
async function saveEmployee() {

    const employeeData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value.trim(),
        department: document.getElementById("department").value.trim(),
        designation: document.getElementById("designation").value.trim(),
        designation: document.getElementById("salary").value.trim(),
        mobileNumber: document.getElementById("mobileNumber").value.trim(),
        address: document.getElementById("address").value.trim(),
        role: document.getElementById("role").value,
        status: document.getElementById("status").value
    };

    // VALIDATION
    if (!employeeData.firstName || !employeeData.email || !employeeData.username) {
        alert("Please fill required fields");
        return;
    }

    try {

        /* CREATE */
        if (editId === null) {

            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employeeData)
            });

            if (!res.ok) {
                const text = await res.text();
                alert("Error: " + text);
                return;
            }

        } else {
            /* UPDATE */
            const res = await fetch(`${API_URL}/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employeeData)
            });

            if (!res.ok) {
                alert("Update failed");
                return;
            }
        }

        fetchEmployees();
        closeModal();

    } catch (err) {
        console.error(err);
        alert("Something went wrong");
    }
}

/* ===============================
   EDIT EMPLOYEE
================================ */
function editEmployee(id) {

    const emp = employees.find(e => e.id === id);

    if (!emp) return;

    editId = id;

    document.getElementById("firstName").value = emp.firstName;
    document.getElementById("lastName").value = emp.lastName;
    document.getElementById("email").value = emp.email;
    document.getElementById("username").value = emp.username;
    document.getElementById("password").value = ""; // don't show password
    document.getElementById("department").value = emp.department;
    document.getElementById("designation").value = emp.designation;
    document.getElementById("salary").value = emp.salary;
    document.getElementById("mobileNumber").value = emp.mobileNumber;
    document.getElementById("address").value = emp.address;
    document.getElementById("role").value = emp.role;
    document.getElementById("status").value = emp.status;

    document.getElementById("modalTitle").innerText = "Edit Employee";

    openModal();
}

/* ===============================
   DELETE EMPLOYEE
================================ */
async function deleteEmployee(id) {

    if (!id) {
        alert("Invalid user ID");
        return;
    }

    if (!confirm("Are you sure you want to delete?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const msg = await res.text();
            alert("Delete failed: " + msg);
            return;
        }

        fetchEmployees();

    } catch (err) {
        console.error("Delete error:", err);
        alert("Server error while deleting user");
    }
}

/* ===============================
   SEARCH EMPLOYEE
================================ */
function searchEmployee() {

    const value = document.getElementById("searchInput").value.toLowerCase();

    const rows = document.querySelectorAll("#employeeTable tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
    });
}

/* ===============================
   FILTER BY DEPARTMENT
================================ */
function filterEmployee() {

    const dept = document.getElementById("filterDept").value;

    const rows = document.querySelectorAll("#employeeTable tr");

    rows.forEach(row => {
        row.style.display = (!dept || row.innerText.includes(dept)) ? "" : "none";
    });
}