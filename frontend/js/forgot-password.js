console.log("Forgot Password JS Loaded");

const forgotForm = document.getElementById("forgotPasswordForm");

if (forgotForm) {

forgotForm.addEventListener("submit", function(e){

e.preventDefault();

const email = document.getElementById("email").value.trim();
const messageBox = document.getElementById("messageBox");

messageBox.style.display = "none";

if(email === ""){

messageBox.innerText = "Enter email";
messageBox.style.display = "block";
return;

}

fetch("http://localhost:8080/api/auth/forgot-password", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
email: email
})

})

.then(res => {

if(!res.ok){
throw new Error("Server error");
}

return res.json();

})

.then(data => {

messageBox.style.display = "block";

if(data.success){

messageBox.style.color = "green";
messageBox.innerText = "Reset link sent to email";

}else{

messageBox.style.color = "red";
messageBox.innerText = data.message;

}

})

.catch(err => {

console.error(err);

messageBox.style.display = "block";
messageBox.style.color = "red";
messageBox.innerText = "Server error";

});

});

}