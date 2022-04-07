document.addEventListener("DOMContentLoaded", function (event) {
    // Your code to run since DOM is loaded and ready
    getPlanDetails();
});

function getPlanDetails() {
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/planDetails/', options)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            changePageInfo(data.recordset[0]);
        })
}


function changePageInfo(plan) {
    const planName = document.getElementById("planName");
    planName.innerHTML = "Package Plan: " + plan.name;

    const price = document.getElementById("price");
    price.innerHTML = "Total: <b>$" + plan.price +"</b> / month";
}