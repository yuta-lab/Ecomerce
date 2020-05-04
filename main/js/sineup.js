"use strict";
document.querySelector("body").onload = main;

function main () {
    document.getElementById("register_form").onsubmit = (event) => {
        event.preventDefault();

        processForm(event);

        return false;
    };
}

function processForm (event) {
    // const owner = document.getElementById("owner").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords aren't the same.");
        return;
    }
    const data = {username, password};
    fetch("http://13.82.229.154/register", {
        method: "post",
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }).then( res => {
        return res.json();
    }).then( data => {
        console.log(data);
    }).catch( err => {
        console.log(err);
    });
}