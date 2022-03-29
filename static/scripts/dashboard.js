document.addEventListener("DOMContentLoaded", function(event) {
    // Your code to run since DOM is loaded and ready
    getCurrentUsername();
});

function getCurrentUsername(){
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/currentUsername', options)
        .then(function(response){
            return response.json();
        }).then(function(data){
            var username = data.recordset[0].username;
            changeTitleHeader(username);        
        })
}


function changeTitleHeader(username){
    const title = document.getElementById("title");
    title.innerHTML = "Welcome to your ReviewAA Dashboard, " + username + "!";
}