document.addEventListener("DOMContentLoaded", function(event) {
    // Your code to run since DOM is loaded and ready
    getCurrentUsername();
    getPlan();
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

function getPlan(){
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/users/userplans', options)
        .then(function(response){
            return response.json();
        }).then(function(data){
            console.log(data)
            // 1 = basic, 2 = advanced, 3 = trial
            if (data.recordset[0].planId == 3 || data.recordset[0].planId == 1){
                document.getElementById('advanced').href = "javascript:void(0)"
                document.getElementById('advanced').classList.add("grayout")
                document.getElementById('advancedP').innerText = "Available with Advanced plan"
            }   
        })
}


function changeTitleHeader(username){
    const title = document.getElementById("title");
    title.innerHTML = "Welcome to your ReviewAA Dashboard, " + username + "!";
}