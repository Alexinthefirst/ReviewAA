// Called on page load
// ALL PAGE LOGIC GOES IN HERE
document.addEventListener("DOMContentLoaded", function(event) {
    console.log("Made it here")
    // Get our profile info
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/user', options)
    .then(function(response){
        return response.json()
    }).then(function(data){
        console.log(data)
        document.getElementById('username').placeholder = data.recordset[0].username
        document.getElementById('email').placeholder = data.recordset[0].email
    })

});