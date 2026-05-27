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

        setValue("fullName", (user.firstName || "") + " " + (user.lastName || ""));
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

        setText("displayName", (user.firstName || "") + " " + (user.lastName || ""));
        setText("roleText", user.designation || "Employee");

        loadProfileImage(user.profileImage);

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

        profileImg.onerror = function() {
            profileImg.src = defaultProfile;
        };

        topImg.onerror = function() {
            topImg.src = defaultTop;
        };
    } else {
        profileImg.src = defaultProfile;
        topImg.src = defaultTop;
    }
}

/* =========================
   IMAGE UPLOAD + CROPPER
========================= */
function initImageUpload() {

    var imgInput = getEl("imgInput");
    var image = getEl("cropImage");
    var modal = getEl("imageModal");

    if (!imgInput || !image || !modal) return;

    imgInput.addEventListener("change", function() {

        var file = this.files[0];
        if (!file) return;

        if (!file.type || file.type.indexOf("image/") !== 0) {
            alert("Invalid image ❌");
            return;
        }

        selectedFile = file;

        if (currentObjectURL) {
            URL.revokeObjectURL(currentObjectURL);
        }

        currentObjectURL = URL.createObjectURL(file);

        // destroy old cropper
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        image.src = currentObjectURL;
        modal.classList.add("active");

        image.onload = function() {

            try {
                if (cropper) {
                    cropper.destroy();
                }

                cropper = new Cropper(image, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: "move",
                    autoCropArea: 1,
                    background: false,
                    guides: false
                });

            } catch (e) {
                console.error("Cropper error:", e);
            }
        };

        imgInput.value = "";
    });
}

function logout() {
    // ❌ Clear stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // ✅ Redirect to login page
    window.location.href = "../../index.html"; // adjust path if needed
}

/* =========================
   CROP IMAGE
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
   SAVE CROPPED IMAGE
========================= */
async function saveCroppedImage() {

    if (!selectedFile) {
        alert("Please crop image first ❌");
        return;
    }

    var formData = new FormData();
    formData.append("file", selectedFile, "profile.jpg");

    try {
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

    } catch (err) {
        console.error(err);
    }
    selectedFile = null;
}

/* =========================
   REMOVE IMAGE
========================= */
async function removeImage() {
    try {
        await fetch(BASE_URL + "/api/users/remove-image", {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        setSrc("profileImg", "https://i.pravatar.cc/120");
        setSrc("topImg", "https://i.pravatar.cc/40");

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   CLOSE MODAL
========================= */
function closeModal() {
    var modal = getEl("imageModal");
    if (modal) modal.classList.remove("active");

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

/* =========================
   UPDATE PROFILE
========================= */
async function updateProfile() {

    var data = {
        firstName: getValue("fullName").split(" ")[0] || "",
        lastName: getValue("fullName").split(" ").slice(1).join(" ") || "",
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

    try {
        const res = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Profile Updated ✅");

            // 🔥 reset edit mode only
            resetEditMode();
        } else {
            alert("Update failed ❌");
        }

    } catch (err) {
        console.error(err);
    }
}
/* =========================
   PASSWORD
========================= */
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
   STEP NAV
========================= */
function nextStep(step) {
    var steps = document.querySelectorAll(".form-step");

    for (var i = 0; i < steps.length; i++) {
        steps[i].classList.remove("active");
    }

    getEl("step" + step).classList.add("active");
}

function prevStep(step) {
    nextStep(step);
}

/* =========================
   UI
========================= */
function toggleDark() {
    document.body.classList.toggle("dark");
}

function enableEdit() {

    // ✅ ONLY target profile section
    var container = document.querySelector(".profile-details");

    var inputs = container.querySelectorAll("input, select");

    for (var i = 0; i < inputs.length; i++) {

        // ❌ skip password fields
        if (
            inputs[i].id === "currentPass" ||
            inputs[i].id === "newPass" ||
            inputs[i].id === "confirmPass"
        ) continue;

        inputs[i].disabled = false;
        inputs[i].classList.add("editing");
    }

    // change button
    var btn = document.querySelector(".edit-btn");
    if (btn) {
        btn.innerText = "💾 Save Profile";
        btn.onclick = updateProfile;
    }
}