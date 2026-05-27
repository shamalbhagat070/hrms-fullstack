// LOGIN
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  alert("Login successful (demo)");
}

// REGISTER
function register() {
  alert("Registration successful (demo)");
  window.location.href = "login.html";
}

// FORGOT PASSWORD (SEND OTP)
function sendOTP() {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Enter email");
    return;
  }

  const otp = "123456"; // demo
  localStorage.setItem("otp", otp);

  alert("OTP sent: " + otp);
  window.location.href = "reset-password.html";
}

// RESET PASSWORD
function resetPassword() {
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (!pass || !confirm) {
    alert("Fill all fields");
    return;
  }

  if (pass !== confirm) {
    alert("Passwords do not match");
    return;
  }

  alert("Password reset successful");
  window.location.href = "login.html";
}