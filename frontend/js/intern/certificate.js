const PROFILE_API = "http://localhost:8080/api/users/profile";
const DOWNLOAD_API = "http://localhost:8080/api/users/certificate/download";

const token = localStorage.getItem("token");

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    if (!token) {
        alert("Please login first ❌");
        window.location.href = "../../login.html";
        return;
    }

    loadCertificate();
});

/* =========================
   SET TEXT
========================= */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "--";
}

/* =========================
   LOAD CERTIFICATE DATA
========================= */
async function loadCertificate() {

    try {
        const res = await fetch(PROFILE_API, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const user = await res.json();

        const fullName = (user.firstName || "") + " " + (user.lastName || "");

        setText("certName", fullName);
        setText("certRole", user.designation || "Intern");

        // 🔥 Use correct backend field
        setText("startDate", formatDate(
            user.joiningDate || user.startDate || user.createdAt
        ));
        setText(
            "endDate",
            user.endDate ? formatDate(user.endDate) : "Present"
        );

        setText("certId", "HRMS-" + user.id);
        setText("issueDate", new Date().toLocaleDateString());

        setText("topUserName", "Welcome, " + fullName);

        updateStatus("COMPLETED");

    } catch (err) {
        console.error("Certificate error:", err);
        alert("Backend connection failed ❌");
    }
}

/* =========================
   FORMAT DATE
========================= */
function formatDate(dateStr) {
    if (!dateStr) return "--";

    const d = new Date(dateStr);

    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

/* =========================
   STATUS
========================= */
function updateStatus(status) {

    const badge = document.getElementById("statusBadge");

    if (!badge) return;

    if (status === "COMPLETED") {
        badge.innerText = "Completed";
        badge.className = "certificate__status certificate__status--completed";
    } else {
        badge.innerText = "Pending";
        badge.className = "certificate__status certificate__status--pending";
    }
}

/* =========================
   DOWNLOAD PDF
========================= */
async function downloadCertificate() {
    try {
        const res = await fetch(DOWNLOAD_API, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        // 🔥 HANDLE BACKEND MESSAGE
        if (!res.ok) {
            const msg = await res.text();
            alert(msg); // show actual backend message
            return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "certificate.pdf";
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (err) {
        console.error(err);
        alert("Download failed ❌");
    }
}

/* =========================
   LOGOUT
========================= */
function logout() {
    localStorage.removeItem("token");
    window.location.href = "../../login.html";
}