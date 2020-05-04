"use strict";
document.querySelector("body").onload = main;

function main() {
    display_cart (event);
}

function display_cart (event) {
    
    
    fetch("http://13.82.229.154/cart", {
        method: "GET",
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