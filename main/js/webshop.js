"use strict";

const id = _id => document.getElementById(_id);
let default_items = '';
let local_items = [];

document.querySelector("body").onload = main;

function main() {
    default_items = id('clothes-list').innerHTML;
    // get the items from the server as soon as the page loads
    getclothesItems();

    document.getElementById('upload-form').onsubmit = (event) => {
        // preventDefault() stops the browser's default behavior of
        // sending the form data and refreshing the page
        event.preventDefault();

        processFormSubmit(event);

        return false;
    }

    
    document.getElementById('delete-area').onsubmit = (event) => {
        // preventDefault() stops the browser's default behavior of
        // sending the form data and refreshing the page
        event.preventDefault();

        processFilterSubmit(event);

        return false;
    }
}

async function processFormSubmit(event) {
    const text = id('clothes-item-text').value;
    id('clothes-item-text').value = '';
    if (text !== '' && text !== 'clear') {
        let id = id('clothes-item-id').value;
        console.log(`New item: ${text} ${id}`);
        const data = {
            text: text,
            id: id
        };
        
        // Send the new data to the server and processing the response
        try {
            const res = await fetch('http://13.82.229.154/owner', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {"Content-Type": "application/json"}
            });
            
            console.log("POST /owner: response");
            console.log(res);
            if (res.redirected) {
                return window.location = res.url;
            }

            if (res.status === 403) {
                alert("You can't do that");
            } else if (res.status === 200) {
                local_items.push(data);
                render();
            }
        } catch (err) {
            console.log(err);
        }
     
        
    }
}

function render() {
    const template = document.getElementById('clothes-item-template');
    let list_elt = document.getElementById('clothes-list');
    list_elt.innerHTML = '';
    for (let i = 0; i < local_items.length; ++i) {
        let new_li = document.importNode(template.content, true);
        new_li.querySelector('.clothes-item-text').textContent = local_items[i].text;
        new_li.querySelector('.clothes-item-id').textContent = local_items[i].id;
        list_elt.appendChild(new_li);
    }
}

function getclothesItems () {
    fetch('http://13.82.229.154/webshop', {
        method: 'GET'
    }).then( res => {
        console.log(res)
        return res.json();
    }).then( data => {
        // log the data
        console.log(data);
        // overwrite local_items with the array of clothes items
        // recieved from the server
        local_items = data.clothes_items;
        // render the list of items received from the server
        render();
    }).catch( err => {
        console.log(err);
    });
}

async function processFilterSubmit (event) {
    const id = id('clothes-filter-id').value;
    if (id === 'All') {
        getclothesItems();
    } else {
        findClothesId(id);
    }
}

async function findClothesId (id) {
    const res = await fetch(`http://13.82.229.154/Clothes/${id}`, {
        method: 'GET'
    });
    console.log(res)
    if (res.status === 200) {
        const data = await res.json();
        // log the data
        console.log(data);
        // overwrite local_items with the array of clothes items
        // recieved from the server
        local_items = data.clothes_items;
        // render the list of items received from the server
        render();
    } else {
        alert(`${res.status}: ${res.statusText}`);
    }
    
}
