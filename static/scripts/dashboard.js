document.addEventListener("DOMContentLoaded", function (event) {
    // Your code to run since DOM is loaded and ready
    getCurrentUsername();
    getCurrentPlan();
    getPlan();
});

function getCurrentUsername() {
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/currentUsername', options)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            var username = data.recordset[0].username;
            addUsernameToHeader(username);
        })
}

function getCurrentPlan() {
            changeTitleHeader(username);
        })
}

function getPlan() {
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/currentPlan', options)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            if (data.recordset.length > 0) {
                var planName = data.recordset[0].name;
            } else {
                var planName = "No Plan";
            }

            addPlanToHeader(planName);
    fetch('http://localhost:8000/users/userplans', options)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data)
            // 1 = basic, 2 = advanced, 3 = trial
            if (data.recordset[0].planId == 3 || data.recordset[0].planId == 1) {
                document.getElementById('advanced').href = "javascript:void(0)"
                document.getElementById('advanced').classList.add("grayout")
                document.getElementById('advancedP').innerText = "Available with Advanced plan"
            }
        })
}



function addUsernameToHeader(username) {
    const title = document.getElementById("title");
    title.innerHTML = "Welcome to your ReviewAA Dashboard, " + username + "!";
}

function addPlanToHeader(planName) {
    const title = document.getElementById("title");
    title.innerHTML = title.innerHTML + " Plan: " + planName;
}

function toggleFeatures(planName) {
    //change style of features based on what plan is currently used
    if (planName == "Basic") {
        // document.getElementById("advancedButton").style.color = '#d00';
        document.getElementById("advancedSquare").style.opacity = 0.5;
        document.getElementById("advancedButton").style['pointer-events'] = 'none';
    } else {
        document.getElementById("advancedButton").style.color = white;
        document.getElementById("advancedButton").style['pointer-events'] = 'auto';
    }
}