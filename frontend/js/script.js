function register() {
  alert("Registered successfully (demo)");
  window.location.href = "login.html";
}

function login() {
  alert("Login successful (demo)");
}

function sendOTP() {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Enter email");
    return;
  }

  localStorage.setItem("otp", "123456"); // demo OTP
  alert("OTP sent: 123456");

  window.location.href = "reset.html";
}

function resetPassword() {
  const pass = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (pass !== confirm) {
    alert("Passwords do not match");
    return;
  }

  alert("Password reset successful");
  window.location.href = "login.html";
}