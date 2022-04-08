document.addEventListener("DOMContentLoaded", function (event) {
    // Your code to run since DOM is loaded and ready
    dataSetup()


    getDateData()
    getLastRating()


});

// Setup for data variable used for other functions
function dataSetup() {
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/reviews', options)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            getData(data)

            // Set all the base text using info from db
            document.getElementById('businessName').innerText = 'Advanced Report for ' + data['place_info'].title
            document.getElementById('totalRating').innerText = data['place_info'].rating + " Stars"
            document.getElementById('reviewCount').innerText = "Based on " + data['place_info'].reviews + " reviews"

            // Set up the table with topics with info from db
            var table = document.getElementById('topicTable');

            var i = 1
            console.log(data['topics'])
            for (const topic of data['topics']) {

                var row = table.insertRow(i)
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerText = topic.keyword
                cell2.innerText = topic.mentions

                if (topic.keyword == "washroom" || topic.keyword == "bathroom") {
                    cell1.style = "color:red;"
                    cell2.style = "color:red;"
                }
                if (topic.keyword == "frozen") {
                    cell1.style = "color:red;"
                    cell2.style = "color:red;"
                }
                if (topic.keyword == "atmosphere") {
                    cell1.style = "color:green;"
                    cell2.style = "color:green;"
                }
                if (topic.keyword == "to go") {
                    cell1.style = "color:green;"
                    cell2.style = "color:green;"
                }

                i++;
            }

            var washroom = false;
            var frozen = false;
            var atmosphere = false;
            var togo = false;
            var recoCount = 0;

            for (const topic of data['topics']) {
                if (topic.keyword == "washroom" || topic.keyword == "bathroom") {
                    if (topic.mentions >= 5) {
                        washroom = true;
                        recoCount++;
                    }
                }
                if (topic.keyword == "frozen") {
                    if (topic.mentions >= 5) {
                        frozen = true;
                        recoCount++;
                    }
                }
                if (topic.keyword == "atmosphere") {
                    if (topic.mentions >= 5) {
                        atmosphere = true;
                        recoCount++;
                    }
                }
                if (topic.keyword == "to go") {
                    if (topic.mentions >= 5) {
                        togo = true;
                        recoCount++;
                    }
                }
            }

            if (washroom) {
                const para = document.createElement("p");
                const node = document.createTextNode("Washroom sanitation could be improved.");
                para.appendChild(node);

                const element = document.getElementById("reco");
                element.appendChild(para);
            }
            if (frozen) {
                const para = document.createElement("p");
                const node = document.createTextNode("Cooking food fresh instead of from frozen would improve your ratings.");
                para.appendChild(node);

                const element = document.getElementById("reco");
                element.appendChild(para);
            }
            if (atmosphere) {
                const para = document.createElement("p");
                const node = document.createTextNode("The atmosphere is great, don't do anything to disturb it!");
                para.appendChild(node);

                const element = document.getElementById("reco");
                element.appendChild(para);
            }
            if (togo) {
                const para = document.createElement("p");
                const node = document.createTextNode("To Go orders are highly praised, keep that level of service up!");
                para.appendChild(node);

                const element = document.getElementById("reco");
                element.appendChild(para);
            }
            if (recoCount > 0) {
                document.getElementById("recoWait").innerText = ""
            }

        })
}

function getData(data) {
    var ratings = [0, 0, 0, 0, 0];
    var ratingsPercent = [0, 0, 0, 0, 0];
    var dates
    console.log("loaded");
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    // Get the data
    // Get the reviews from the data
    console.log(data)
    // Get every review and sort it
    for (const review of data['reviews']) {
        switch (review.rating) {
            case 5:
                ratings[0] += 1
                break;
            case 4:
                ratings[1] += 1
                break;
            case 3:
                ratings[2] += 1
                break;
            case 2:
                ratings[3] += 1
                break;
            case 1:
                ratings[4] += 1
                break;
        }
    }
    var totalRatings = ratings[0] + ratings[1] + ratings[2] + ratings[3] + ratings[4]
    ratingsPercent[0] = ratings[0] / totalRatings * 100
    ratingsPercent[1] = ratings[1] / totalRatings * 100
    ratingsPercent[2] = ratings[2] / totalRatings * 100
    ratingsPercent[3] = ratings[3] / totalRatings * 100
    ratingsPercent[4] = ratings[4] / totalRatings * 100

    buildCharts(ratingsPercent)

}

function getDateData() {
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/reviewsDates', options)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            buildDateChart(data)
        })
}


function getLastRating() {
    var ratingChange = 0.0;
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/loginsLast', options)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            ratingChange = data.recordset[data.recordset.length - 1].ratingAtLogin - data.recordset[data.recordset.length - 2].ratingAtLogin
            if (ratingChange > 0) {
                document.getElementById("last").style.color = 'green'
            } else if (ratingChange < 0) {
                document.getElementById("last").style.color = 'red'
            }
            document.getElementById("last").innerText = 'Change since last login = ' + ratingChange.toFixed(2)
        })
}

function buildDateChart(data) {
    var date = new Date()

    // Hacky way to fix new registered users
    if (data.recordset[0] === undefined) {
        const ctxLine = document.getElementById('myChartLine').getContext('2d');
        const myChartLine = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: ['April ' + date.getDate(), 'May ' + date.getDate(), 'June ' + date.getDate(), 'July ' + date.getDate(), 'August ' + date.getDate(), 'September ' + date.getDate(), 'October ' + date.getDate(), 'November ' + date.getDate(), 'December ' + date.getDate(), 'January ' + date.getDate(), 'February ' + date.getDate(), 'March ' + date.getDate(), 'April ' + date.getDate()],
                datasets: [{
                    label: 'Change',
                    data: /*data*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4.1],
                    fill: true,
                    backgroundColor: [
                        'rgba(102, 255, 102, 0.2)'
                    ],
                    borderColor: [
                        'rgba(102, 255, 102, 1)',
                    ],
                    tension: 0
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    const ctxLine = document.getElementById('myChartLine').getContext('2d');
    const myChartLine = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['April ' + date.getDate(), 'May ' + date.getDate(), 'June ' + date.getDate(), 'July ' + date.getDate(), 'August ' + date.getDate(), 'September ' + date.getDate(), 'October ' + date.getDate(), 'November ' + date.getDate(), 'December ' + date.getDate(), 'January ' + date.getDate(), 'February ' + date.getDate(), 'March ' + date.getDate(), 'April ' + date.getDate()],
            datasets: [{
                label: 'Change',
                data: /*data*/[data.recordset[0].rating, data.recordset[0].rating, data.recordset[0].rating, data.recordset[0].rating, data.recordset[0].rating, data.recordset[0].rating, data.recordset[0].rating, data.recordset[0].rating, data.recordset[0].rating, data.recordset[1].rating, data.recordset[2].rating, data.recordset[3].rating, data.recordset[4].rating],
                fill: true,
                backgroundColor: [
                    'rgba(102, 255, 102, 0.2)'
                ],
                borderColor: [
                    'rgba(102, 255, 102, 1)',
                ],
                tension: 0
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function buildCharts(data) {
    const ctxPie = document.getElementById('myChartPie').getContext('2d');
    const ctxBar = document.getElementById('myChartBar').getContext('2d');
    const myChartPie = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Real', 'Fake'],
            datasets: [{
                label: 'Fake Ratings',
                data: /*data*/['6', '1'],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]

        }
    });

    const myChartBar = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['5-Star', '4-Star', '3-Star', '2-Star', '1-Star'],
            datasets: [{
                label: 'Percentage',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            tooltips: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '%'
                        }
                        return label;
                    }
                }
            }
        }
    });


}