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
const chart = require('chart.js');
const { redirect } = require("express/lib/response");
const e = require("express");


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
    trustServerCertificate: true,
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
app.get('/reviews', async (req, res) => {
    if (true/* googleReviews = true*/) { // For google reviews, will edit later as this is our only one right now
        var dataid = await executeQuery(`SELECT dataid FROM accounts WHERE userid = ${req.session.userid}`)

        if (dataid === undefined) {
            console.log("No Data ID found")
        }

        console.log(dataid)

        const params = { // Set up the parameters to use, these default ones should work the best
            engine: "google_maps_reviews",
            hl: "en",
            data_id: dataid.recordset[0].dataid,
        }

        // Do the search and receive 10 results
        search.json(params, function (reviews) {
            res.json(reviews)
        })
    }

})

// Used to get the DataID for use in getting reviews
app.post('/dataid', (req, res) => {
    const params = {
        engine: "google_maps",
        type: "search",
        google_domain: "google.com",
        q: `${req.body.url}`,
        hl: "en",
    };

    search.json(params, function (data) {
        console.log(data['place_results']);
        if (data['place_results'] === undefined) {
            res.redirect('urlLanding2')
        }
        else {
            var place = data['place_results'];
            console.log(place.data_id)
            executeQuery(`UPDATE accounts SET dataid = '${place.data_id}' WHERE userid = ${req.session.userid}`)
            if (req.session.firstTimeLogin) {
                res.redirect('/basicreport')
            } else {
                res.redirect('/dashboard')
            }
        }
    })
})

// Get objects for use in time graph
app.get('/reviewsDates', async (req, res) => {
    var reviews = await executeQuery(`SELECT * FROM ratingsDates WHERE userid = ${req.session.userid}`);

    res.json(reviews);

})

app.get('/currentUsername', async (req, res) => {
    var data = await executeQuery(`SELECT username FROM accounts WHERE userid = ${req.session.userid}`);

    res.json(data);

})

app.get('/currentPlan', async (req, res) => {
    var data = await executeQuery(`SELECT TOP 1 * FROM userPlans LEFT JOIN paymentPlans ON userPlans.planid = paymentPlans.planId WHERE userid =  ${req.session.userid} AND dateExpiry > CURRENT_TIMESTAMP ORDER BY dateSubscribed DESC`)
    res.json(data);

})


app.get('/planDetails', async (req, res) => {
    var data = await executeQuery(`SELECT * FROM paymentPlans WHERE planId = ${req.session.planToBuy}`);
    res.json(data);

})

// Return the last login for every user
app.get('/loginsLast', async (req, res) => {
    var logins = await executeQuery(`SELECT userid, ratingAtLogin, loginDate FROM logins WHERE userid = ${req.session.userid}`)

    res.json(logins)
})

// Start page route
app.get('/start', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/startLoggedIn.html'));
    } else {
        res.sendFile(path.join(__dirname + '/start.html'));
    }

})

// Packages page route
app.get('/packages', (req, res) => {
    res.sendFile(path.join(__dirname + '/packages.html'));
})

// Payment page route
app.get('/payment/:package', async (req, res) => {
    if (req.session.loggedin) {
        req.session.planToBuy = req.params["package"];
        res.sendFile(path.join(__dirname + '/payment.html'));
    } else {
        res.redirect('/login')
    }

})

// app.post('/users/update', async (req, res) => {
//     if (req.body.username != "" && req.body.email != ""){
//         await executeQuery(`UPDATE accounts SET username = '${req.body.username}', email = '${req.body.email}' WHERE userid = ${req.session.userid}`)
//     } else if (req.body.email == ""){
//         await executeQuery(`UPDATE accounts SET username = '${req.body.username}' WHERE userid = ${req.session.userid}`)
//     } else if (req.body.username == ""){
//         await executeQuery(`UPDATE accounts SET email = '${req.body.email}' WHERE userid = ${req.session.userid}`)
//     }

//     // Change Password
//     if (req.body.password != "" && req.body.password2 != ""){
//         if (req.body.password == req.body.password2) {
//             // Hash and salt password
//             const hashPassword = await bcrypt.hash(req.body.password, 10)
//             await executeQuery(`UPDATE accounts SET password = '${hashPassword}' WHERE userid = ${req.session.userid}`)
//         }
//     }
//     res.redirect('/profile')


// });

app.post('/paymentResult', async (req, res) => {
    if (req.session.loggedin) {

        // Convert card number to string, trim leading and trailing double quotes, then only save last 4 numbers of card for security reasons
        var partialCardNumber = JSON.stringify(req.body.cardNumber);
        partialCardNumber = partialCardNumber.slice(1, -1);
        partialCardNumber = partialCardNumber.substring(partialCardNumber.length - 4);

        // Log payment result in database
        await executeQuery(`INSERT INTO paymentLog VALUES ('${req.body.fullName}', '${req.body.email}', '${req.body.nameOnCard}', '${partialCardNumber}', ${req.body.expMonth},
            ${req.body.expYear}, ${req.body.cvv}, CURRENT_TIMESTAMP, ${req.session.userid}, '${req.body.result}', ${req.session.planToBuy})`);

        //If purchase is successful, add record to userPlan table
        if (req.body.result == "Payment success") {

            var plan = await executeQuery(`SELECT * FROM paymentPlans WHERE planId = ${req.session.planToBuy}`);
            var duration = plan.recordset[0].duration;
            var name = plan.recordset[0].name;
            console.log("d" + duration);

            await executeQuery(`INSERT INTO userPlans VALUES (${req.session.userid}, ${req.session.planToBuy}, CURRENT_TIMESTAMP, DATEADD(day, ${duration} , CURRENT_TIMESTAMP))`);
            // unset planToBuy after successful purchase
            req.session.planToBuy = null;
            req.session.plan = name;

            res.sendFile(path.join(__dirname + '/paymentSuccess.html'));
        } else {
            console.log("redirect back");
            res.sendFile(path.join(__dirname + '/paymentFailed.html'));
        }

    } else {
        res.redirect('/login')
    }
})

// Dashboard page route
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.firstTimeLogin) {
            res.redirect('/urlLanding')
        } else {
            res.sendFile(path.join(__dirname + '/dashboard.html'));
        }
    } else {
        res.redirect('/login')
    }
})

// Basic report page route
// While technically this page can be access before entering a URL and it crashes, it is exceedingly hard to do without knowing how to do it, so I will ignore the issue until later
app.get('/basicreport', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.firstTimeLogin) {
            req.session.firstTimeLogin = false;
            res.sendFile(path.join(__dirname + '/basicreport.html'));
        } else {
            res.sendFile(path.join(__dirname + '/basicreport.html'));
        }
    } else {
        res.redirect('/login')
    }
})

// Advanced report page route
app.get('/advancedreport', (req, res) => {
    if (req.session.loggedin) {

        res.sendFile(path.join(__dirname + '/advancedreport.html'));
    } else {
        res.redirect('/login')
    }
})

// Contacts page route
app.get('/contacts', (req, res) => {
    res.sendFile(path.join(__dirname + '/contacts.html'));
})

// Normal URL page
app.get('/urlLanding', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/url.html'))
    } else {
        res.redirect('/login')
    }
})

// Failure URL page
app.get('/urlLanding2', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/urlFail.html'))
    } else {
        res.redirect('/login')
    }
})

app.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/profileEditing.html'))
    } else {
        res.redirect('/login')
    }
})

app.get('/underconstruction', (req, res) => {
    res.sendFile(path.join(__dirname + '/underconstruction.html'))
})

app.get('/payment', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname + '/payment.html'))
    } else {
        res.redirect('/login')
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

app.get('/users/userplans', async (req, res) => {
    res.json(await executeQuery(`Select * FROM userPlans WHERE userid = '${req.session.userid}'`))
})

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
        if (user.recordset.length < 1) {
            const hashPassword = await bcrypt.hash(req.body.password, 10) // Hashes and salts the password

            var completeUser = await executeQuery(`INSERT INTO accounts (username, password, email) VALUES ('${req.body.username}', '${hashPassword}', '${req.body.email}'); SELECT SCOPE_IDENTITY() AS userid`)
            req.session.loggedin = true;
            req.session.username = req.body.username; // Log the user in via session instead of redirect to log in
            // Insert data in database

            // Later should change this to redirect, then hold database column that knows if the paid or not and redirect them based on that
            req.session.firstTimeLogin = true;
            req.session.userid = completeUser.recordset[0].userid;

            var dateString = new Date().toISOString().slice(0, 19).replace('T', ' ');

            await executeQuery(`INSERT INTO logins VALUES (${completeUser.recordset[0].userid}, 4.2, '${dateString}')`)

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

// Used to get info for current user
app.get('/user', async (req, res) => {
    console.log("Getting user")
    res.json(await executeQuery(`Select * FROM accounts WHERE userid = ${req.session.userid}`))
})

app.post('/users/update', async (req, res) => {
    if (req.body.username != "" && req.body.email != "") {
        await executeQuery(`UPDATE accounts SET username = '${req.body.username}', email = '${req.body.email}' WHERE userid = ${req.session.userid}`)
    } else if (req.body.email == "") {
        await executeQuery(`UPDATE accounts SET username = '${req.body.username}' WHERE userid = ${req.session.userid}`)
    } else if (req.body.username == "") {
        await executeQuery(`UPDATE accounts SET email = '${req.body.email}' WHERE userid = ${req.session.userid}`)
    }

    // Change Password
    if (req.body.password != "" && req.body.password2 != "") {
        if (req.body.password == req.body.password2) {
            // Hash and salt password
            const hashPassword = await bcrypt.hash(req.body.password, 10)
            await executeQuery(`UPDATE accounts SET password = '${hashPassword}' WHERE userid = ${req.session.userid}`)
        }
    }
    res.redirect('/profile')


});
// Used to login
app.post('/users/login', async (req, res) => {

    // Get the input
    let username = req.body.username;
    let password = req.body.password;
    var dateString = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(dateString)
    // Ensure the fields aren't empty
    if (username && password) {

        var user = await executeQuery(`Select * FROM accounts WHERE username = '${username}'`) // Get the user that has that username, will compare passwords in next step
        try {
            console.log(user.recordset[0].userid)
            // Compares two passwords
            if (await bcrypt.compare(req.body.password, user.recordset[0].password)) {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.userid = user.recordset[0].userid;

                // Insert the login time to database
                await executeQuery(`INSERT INTO logins VALUES (${user.recordset[0].userid}, 4.2, '${dateString}')`)

                // Check for user's plan
                // TODO
                var plan = await executeQuery(`SELECT TOP 1 * FROM userPlans LEFT JOIN paymentPlans ON userPlans.planid = paymentPlans.planId WHERE userid = ${user.recordset[0].userid} AND dateExpiry > CURRENT_TIMESTAMP ORDER BY dateSubscribed DESC`)
                // Will return either 1 record with with name field describing plan OR no records meaning no active plan
                // Set a session var for plan
                if (plan.recordset.length > 0) {
                    req.session.plan = plan.recordset[0].name;
                    // req.session.plan = "test";
                } else {
                    req.session.plan = "No Plan";
                }
                console.log(req.session.plan);

                // Redirect to dashboard
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