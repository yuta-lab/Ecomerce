// "use strict";
// document.querySelector("body").onload = main;

// function main () {
//     document.getElementById("upload_form").onsubmit = (event) => {
//         event.preventDefault();

//         processForm(event);

//         return false;
//     };

//     document.getElementById("upload_form").onsubmit = (event) => {
//         event.preventDefault();

//         processForm(event);

//         return false;
//     };

// }

// function processForm (event) {
//     const img = document.getElementById("img").value;
//     const id = document.getElementById("id").value;
//     const type = document.getElementById("type").value;
    
//     const data = {img, id, type};
//     fetch("http://13.82.229.154/owner", {
//         method: "post",
//         body: JSON.stringify(data),
//         headers: {"Content-Type": "application/json"}
//     }).then( res => {
//         return res.json();
//     }).then( data => {
//         console.log(data);
//     }).catch( err => {
//         console.log(err);
//     });
// }