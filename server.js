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

// SQL Connection -- Change this to your database details
var config = {
    user: 'raa',
    password: '!ReviewAA1',
    server: 'BANGDITO\\SQLEXPRESS',
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
    if (req.session.loggedin){
        res.send('Welcome back, ' + req.session.username + '!')
    } else {
        res.send('Please login to view this page.')
    }
})

// Route to receive reviews from every site in profile
// Remember to fix this so not just anyone can use this route and waste my monthly allowance 
app.get('/reviews', (req, res) => {
    if (true/* googleReviews = true*/ ){ // For google reviews, will edit later as this is our only one right now
        const params = { // Set up the parameters to use, these default ones should work the best
            engine: "google_maps_reviews",
            data_id: "0x89c259a61c75684f:0x79d31adb123348d2",
            sortBy: "qualityScore"
        }
        
        // Do the search and receive 10 results
        search.json(params, function(reviews) {
            res.json(reviews['reviews'])
        })
        
    }
})

app.get('/dashboard', (req, res) => {
    if (req.session.loggedin){
        res.sendFile(path.join(__dirname + '/dashboard.html'));
    }
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

// Used to register a new user
app.post('/users/register', jsonParser, async (req, res) => {
    try {
        // Check to see if the username already exists
        var user = await executeQuery(`Select * FROM accounts WHERE username = '${req.body.username}'`)
        // If user doesn't already exist
        if (user.recordset.length < 1)
        {
            const hashPassword = await bcrypt.hash(req.body.password, 10) // Hashes and salts the password
            
            await executeQuery(`INSERT INTO accounts (username, password, email) VALUES ('${req.body.username}', '${hashPassword}', 'test@test.ca')`) // Insert data in database

            res.redirect("/login") // Send to the login screen
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

    // Ensure the fields aren't empty
    if (username && password){

        var user = await executeQuery(`Select * FROM accounts WHERE username = '${username}'`) // Get the user that has that username, will compare passwords in next step
        try {
            // Compares two passwords
            if (await bcrypt.compare(req.body.password, user.recordset[0].password)){
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/')
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