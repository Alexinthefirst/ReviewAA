const express = require("express"); //Node Framework
const dotenv = require("dotenv").config() // Used for environment variables
const app = express(); // Application entry
const session = require('express-session'); // Manage login sessions
const sql = require('mssql'); // Database access 
const path = require('path'); // Utility
const bcrypt = require("bcrypt") // Cryptography
const bodyParser = require("body-parser"); // JSON parser
const { response } = require("express");
const SerpApi = require("google-search-results-nodejs")
const chart = require('chart.js')

var search = new SerpApi.GoogleSearch(process.env.REVIEW_API_KEY)

const PORT = process.env.PORT || 8000; // Port setup

const users = [] // For testing, not used

// Session setup
app.use(session({
	secret: 'reviewAbA',
	resave: true,
	saveUninitialized: true
}));

// Express setup
app.use(express.json()); // Allows express to use JSON requests
app.use(express.urlencoded({ extended: true })); // Allows express to use HTML form POST
app.use(express.static(path.join(__dirname, 'static'))) // Allow express to use files in the static folder
app.use(express.static(__dirname + '/node_modules'));

// SQL Connection -- Change details in .env
var config = {
    user: 'raa',
    password: '!ReviewAA1',
    server: process.env.SERVER_NAME,
    database: 'ReviewAA',
    trustServerCertificate: true
};

// Call when accessing database
async function executeQuery(query) {
    try {
        await sql.connect(config) 
        const result = await sql.query(query)
        //console.log(result)
        return result;
    } catch (err) {
        console.log(err)
    }
    
}

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Base route
app.get('/', (req, res) => {
        res.redirect('/start')
    
})

// CONVERT THIS OVER TO GOOGLE SEARCH API FOR GENERAL REVIEWS, STILL USE GOOGLE MAPS REVIEWS FOR TOPICS FOR ADVANCED REPORTING
// Route to receive reviews from every site in profile
// Remember to fix this so not just anyone can use this route and waste my monthly allowance 
app.get('/reviews', (req, res) => {
    if (true/* googleReviews = true*/ ){ // For google reviews, will edit later as this is our only one right now
        const params = { // Set up the parameters to use, these default ones should work the best
            engine: "google_maps_reviews",
            hl: "en",
            data_id: "0x882b9ba7b6381219:0xc2ac30285bf0e016",
        }
        
        // Do the search and receive 10 results
        search.json(params, function(reviews) {
            res.json(reviews['reviews'])
        })
        
    }
})

app.get('/reviewsDates', async (req, res) => {
    var reviews = await executeQuery(`SELECT * FROM ratingsDates WHERE userid = ${req.session.userid}`);

    res.json(reviews);

})

// Return the last login for every user
app.get('/loginsLast', async (req, res) => {
    var logins = await executeQuery(`SELECT userid, ratingAtLogin, loginDate FROM logins WHERE userid = ${req.session.userid}`)

    res.json(logins)
})

// Start page route
app.get('/start', (req, res) => {
    res.sendFile(path.join(__dirname + '/start.html'));
})

// Packages page route
app.get('/packages', (req, res) => {
        res.sendFile(path.join(__dirname + '/packages.html'));

})

// Payment page route
app.get('/payment/:package', async (req, res) => {
    if (req.session.loggedin){
        // Move where this happens after payment processing is implemented
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        var datefinal = year + "-" + month + "-" + date;

        //Saves plan selection to database for later use
        await executeQuery(`INSERT INTO userPlans VALUES (${req.session.userid}, ${req.params["package"]}, '${datefinal}')`)
        res.sendFile(path.join(__dirname + '/payment.html'));
    } else {
        res.redirect('/login')
    }
})

// Dashboard page route
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin){
        if (req.session.firstTimeLogin){
            res.redirect('/basicreport')
        } else {
            res.sendFile(path.join(__dirname + '/dashboard.html'));
        }
    } else {
        res.redirect('/login')
    }
})

// Basic report page route
app.get('/basicreport', (req, res) => {
    if (req.session.loggedin){
        if (req.session.firstTimeLogin){
            req.session.firstTimeLogin = false;
            res.sendFile(path.join(__dirname + '/basicreport.html'));
        } else {
            res.sendFile(path.join(__dirname + '/basicreport.html'));
        }
    } else {
        res.redirect('/login')
    }
})

// Contacts page route
app.get('/contacts', (req, res) => {
        res.sendFile(path.join(__dirname + '/contacts.html'));
})

app.get('/urlLanding', (req, res) => {
    res.sendFile(path.join(__dirname + '/url.html'))
})

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname + '/profileEditing.html'))
})

app.get('/underconstruction', (req, res) => {
    res.sendFile(path.join(__dirname + '/underconstruction.html'))
})

// Login route, user facing
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/login.html'));
});

// Login route, user facing
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + '/register.html'));
});

// Used to get list of users, shouldn't be publicly accessible -- Will disable on production
app.get('/users', async (req, res) => {
    res.statusCode = 403;
    res.statusMessage = "Access Denied.";
    res.send("Access Denied.");
})

app.get('/users/logout', async (req, res) => {
    req.session.loggedin = false;
    req.session.username = null;
    req.session.userid = null;
    res.redirect('/start')
});

// Used to register a new user
app.post('/users/register', jsonParser, async (req, res) => {
    try {
        // Check to see if the username already exists
        var user = await executeQuery(`Select * FROM accounts WHERE username = '${req.body.username}'`)
        // If user doesn't already exist
        if (user.recordset.length < 1)
        {
            const hashPassword = await bcrypt.hash(req.body.password, 10) // Hashes and salts the password
            
            var completeUser = await executeQuery(`INSERT INTO accounts (username, password, email) VALUES ('${req.body.username}', '${hashPassword}', '${req.body.email}'); SELECT SCOPE_IDENTITY() AS userid`)
            req.session.loggedin = true;
            req.session.username = req.body.username; // Log the user in via session instead of redirect to log in
            // Insert data in database
            
            // Later should change this to redirect, then hold database column that knows if the paid or not and redirect them based on that
            req.session.firstTimeLogin = true;
            req.session.userid = completeUser.recordset[0].userid;

            res.redirect(/*307*/"/packages") // Log the user in
        } else {
            res.send("User already exists.")
        }
        // If there is an error, send it to us and terminate connection
    } catch (ex) {
        console.log(req.body)
        res.status(500).send()
        console.log(ex)
    }
   
})

// Used to login
app.post('/users/login', async (req, res) => {
    
    // Get the input
    let username = req.body.username;
    let password = req.body.password;
    var dateString = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(dateString)
    // Ensure the fields aren't empty
    if (username && password){

        var user = await executeQuery(`Select * FROM accounts WHERE username = '${username}'`) // Get the user that has that username, will compare passwords in next step
        try {
            console.log(user.recordset[0].userid)
            // Compares two passwords
            if (await bcrypt.compare(req.body.password, user.recordset[0].password)){
                req.session.loggedin = true;
                req.session.username = username;
                req.session.userid = user.recordset[0].userid;

                // Insert the login time to database
                await executeQuery(`INSERT INTO logins VALUES (${user.recordset[0].userid}, 4.2, '${dateString}')`)
                res.redirect('/dashboard')
            } else {
                res.send("Cannot find user.")
            }
        } catch {
            return res.status(500).send()
        }
    }

})

// Starts server
app.listen(PORT, () => {
    console.log(process.env.REVIEW_API_KEY)
    console.log(`Listening on port ${PORT}`)
});