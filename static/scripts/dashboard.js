document.addEventListener("DOMContentLoaded", function (event) {
    // Your code to run since DOM is loaded and ready
    getCurrentUsername();
    getCurrentPlan();
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
            toggleFeatures(planName);
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