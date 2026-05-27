const API_URL = "http://localhost:8080/api/users/profile";
const BASE_URL = "http://localhost:8080";
const token = localStorage.getItem("token");

/* =========================
   GLOBAL VARIABLES
========================= */
var cropper = null;
var selectedFile = null;
var currentObjectURL = null;

/* =========================
   STEP SYSTEM
========================= */
let currentStep = 1;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", function() {

    if (!token) {
        alert("Please login first ❌");
        window.location.href = "../../login.html";
        return;
    }

    loadProfile();
    initImageUpload();
    showStep(1);
});

/* =========================
   DOM HELPERS
========================= */
function getEl(id) {
    return document.getElementById(id);
}

function getValue(id) {
    var el = getEl(id);
    return el ? el.value : "";
}

function setValue(id, value) {
    var el = getEl(id);
    if (el) el.value = value || "";
}

function setText(id, value) {
    var el = getEl(id);
    if (el) el.innerText = value || "";
}

function setSrc(id, url) {
    var el = getEl(id);
    if (el) el.setAttribute("src", url);
}

/* =========================
   STEP NAVIGATION (NO FLICKER)
========================= */
function showStep(step) {

    var steps = document.querySelectorAll(".form-step");
    var navItems = document.querySelectorAll(".step-nav span");

    steps.forEach(s => s.classList.remove("active"));
    navItems.forEach(n => n.classList.remove("active"));

    var activeStep = document.getElementById("step" + step);
    if (activeStep) activeStep.classList.add("active");

    if (navItems[step - 1]) {
        navItems[step - 1].classList.add("active");
    }

    currentStep = step;
}

function nextStep(step) {
    showStep(step);
}

function prevStep(step) {
    showStep(step);
}

/* =========================
   LOAD PROFILE
========================= */
async function loadProfile() {
    try {
        var res = await fetch(API_URL, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            alert("Session expired ❌");
            window.location.href = "../../login.html";
            return;
        }

        var user = await res.json();

        var fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

        setValue("fullName", fullName);
        setValue("email", user.email);
        setValue("phone", user.mobileNumber);
        setValue("dob", user.dob);
        setValue("gender", user.gender || "Male");

        setValue("empId", user.id);
        setValue("department", user.department);
        setValue("designation", user.designation);
        setValue("joiningDate", user.joiningDate);
        setValue("employmentType", user.employmentType || "Full Time");

        setValue("address", user.address);
        setValue("city", user.city);
        setValue("state", user.state);
        setValue("country", user.country);
        setValue("pincode", user.pincode);

        setValue("bankName", user.bankName);
        setValue("accountNumber", user.accountNumber);
        setValue("ifsc", user.ifsc);

        setText("displayName", fullName || "Employee");
        setText("roleText", user.designation || "Employee");

        loadProfileImage(user.profileImage);

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   PROFILE IMAGE
========================= */
function loadProfileImage(profileImage) {

    var defaultProfile = "https://i.pravatar.cc/120";
    var defaultTop = "https://i.pravatar.cc/40";

    var profileImg = getEl("profileImg");
    var topImg = getEl("topImg");

    if (!profileImg || !topImg) return;

    if (profileImage) {
        var url = BASE_URL + "/uploads/" + profileImage;
        profileImg.src = url;
        topImg.src = url;
    } else {
        profileImg.src = defaultProfile;
        topImg.src = defaultTop;
    }
}

/* =========================
   IMAGE UPLOAD + CROPPER (FIXED + NO BLINK)
========================= */
function initImageUpload() {

    var imgInput = getEl("imgInput");
    var image = getEl("cropImage");
    var modal = getEl("imageModal");
    var preview = getEl("previewImg");

    if (!imgInput || !image || !modal) return;

    imgInput.addEventListener("change", function() {

        var file = this.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Invalid image ❌");
            return;
        }

        selectedFile = file;

        if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);

        currentObjectURL = URL.createObjectURL(file);

        // destroy previous cropper safely
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        image.src = currentObjectURL;

        modal.classList.add("active");
        document.body.classList.add("modal-open"); // FIX SCROLL JUMP

        image.onload = function() {

            cropper = new Cropper(image, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: "move",
                autoCropArea: 1,
                background: false,
                guides: false,

                /* =========================
                   REAL TIME PREVIEW FIX
                ========================= */
                crop: function() {

                    if (!preview) return;

                    var canvas = cropper.getCroppedCanvas({
                        width: 200,
                        height: 200
                    });

                    preview.src = canvas.toDataURL("image/jpeg");
                }
            });
        };

        imgInput.value = "";
    });
}

/* =========================
   CROPPING (FINAL SNAPSHOT)
========================= */
function cropImage() {

    if (!cropper) return;

    var canvas = cropper.getCroppedCanvas({
        width: 200,
        height: 200
    });

    var preview = getEl("previewImg");
    if (preview) {
        preview.src = canvas.toDataURL("image/jpeg");
    }

    canvas.toBlob(function(blob) {
        selectedFile = blob;
    }, "image/jpeg", 0.9);
}

/* =========================
   SAVE IMAGE
========================= */
async function saveCroppedImage() {

    if (!selectedFile) {
        alert("Please crop image first ❌");
        return;
    }

    var formData = new FormData();
    formData.append("file", selectedFile, "profile.jpg");

    var res = await fetch(BASE_URL + "/api/users/upload-image", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        body: formData
    });

    if (!res.ok) {
        alert("Upload failed ❌");
        return;
    }

    var fileName = await res.text();
    var url = BASE_URL + "/uploads/" + fileName;

    setSrc("profileImg", url);
    setSrc("topImg", url);

    closeModal();
    selectedFile = null;
}

/* =========================
   REMOVE IMAGE
========================= */
async function removeImage() {

    await fetch(BASE_URL + "/api/users/remove-image", {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    setSrc("profileImg", "https://i.pravatar.cc/120");
    setSrc("topImg", "https://i.pravatar.cc/40");
}

/* =========================
   CLOSE MODAL (FIX BLINK)
========================= */
function closeModal() {

    var modal = getEl("imageModal");

    if (modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open"); // FIX SCROLL
    }

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

/* =========================
   ENABLE EDIT
========================= */
function enableEdit() {

    var container = document.querySelector(".profile-details");
    var inputs = container.querySelectorAll("input, select");

    inputs.forEach(i => {
        if (["currentPass", "newPass", "confirmPass"].includes(i.id)) return;
        i.disabled = false;
    });

    var btn = document.querySelector(".edit-btn");
    if (btn) {
        btn.innerText = "💾 Save Profile";
        btn.onclick = updateProfile;
    }
}

async function updatePassword() {

    var currentPassword = getValue("currentPass");
    var newPassword = getValue("newPass");
    var confirmPassword = getValue("confirmPass");

    // ✅ validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("All fields are required ❌");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match ❌");
        return;
    }

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters ❌");
        return;
    }

    try {
        const res = await fetch(BASE_URL + "/api/users/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        const msg = await res.text();

        if (res.ok) {
            alert(msg || "Password updated ✅");

            // ✅ clear fields
            setValue("currentPass", "");
            setValue("newPass", "");
            setValue("confirmPass", "");
        } else {
            alert(msg || "Failed ❌");
        }

    } catch (err) {
        console.error(err);
        alert("Something went wrong ❌");
    }
}
/* =========================
   UPDATE PROFILE
========================= */
async function updateProfile() {

    var nameParts = getValue("fullName").trim().split(" ");

    var data = {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: getValue("email"),
        mobileNumber: getValue("phone"),
        dob: getValue("dob"),
        gender: getValue("gender"),
        employmentType: getValue("employmentType"),
        address: getValue("address"),
        city: getValue("city"),
        state: getValue("state"),
        country: getValue("country"),
        pincode: getValue("pincode"),
        bankName: getValue("bankName"),
        accountNumber: getValue("accountNumber"),
        ifsc: getValue("ifsc")
    };

    console.log("SENDING DATA 👉", data);

    try {
        const res = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(data)
        });

        const text = await res.text();
        console.log("RESPONSE 👉", res.status, text);

        if (res.ok) {
            alert("Profile Updated ✅");
            resetEditMode();
        } else {
            alert("FAILED ❌ " + text);
        }

    } catch (err) {
        console.error(err);
    }
}

function resetEditMode() {

    var inputs = document.querySelectorAll(".profile-details input, .profile-details select");

    for (var i = 0; i < inputs.length; i++) {

        if (
            inputs[i].id === "currentPass" ||
            inputs[i].id === "newPass" ||
            inputs[i].id === "confirmPass"
        ) continue;

        inputs[i].disabled = true;
        inputs[i].classList.remove("editing");
    }

    var btn = document.querySelector(".edit-btn");

    if (btn) {
        btn.innerText = "✏ Edit Profile";
        btn.onclick = enableEdit;
    }
}