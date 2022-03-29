document.addEventListener("DOMContentLoaded", function(event) {
     // Your code to run since DOM is loaded and ready
     dataSetup()

     
     getDateData()
     getLastRating()


});

// Setup for data variable used for other functions
function dataSetup(){
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/reviews', options)
    .then(function(response){
        return response.json();
    }).then(function(data){
        getData(data)
        
        document.getElementById('businessName').innerText = 'Basic Report for ' + data['place_info'].title
        document.getElementById('totalRating').innerText = data['place_info'].rating + " Stars"
        document.getElementById('reviewCount').innerText = "Based on " + data['place_info'].reviews + " reviews"


    })
}

function getData(data){
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
                for (const review of data['reviews']){
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

function getDateData(){
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/reviewsDates', options)
        .then(function(response){
            return response.json();
        }).then(function(data){
            buildDateChart(data)
        })
}


function getLastRating(){
    var ratingChange = 0.0;
    const options = {
        method: "GET",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
    }
    fetch('http://localhost:8000/loginsLast', options)
        .then(function(response){
            return response.json();
        }).then(function(data){
            ratingChange = data.recordset[data.recordset.length - 1].ratingAtLogin - data.recordset[data.recordset.length - 2].ratingAtLogin
            if (ratingChange > 0){
                document.getElementById("last").style.color = 'green'
            } else if (ratingChange < 0){
                document.getElementById("last").style.color = 'red'
            }
            document.getElementById("last").innerText = 'Change since last login = ' + ratingChange.toFixed(2)
        })
}

function buildDateChart(data){
    var date = new Date()

    const ctxLine = document.getElementById('myChartLine').getContext('2d');
    const myChartLine = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['November ' + date.getDate(), 'December ' + date.getDate(), 'January ' + date.getDate(), 'February ' + date.getDate(), 'March ' + date.getDate()],
            datasets: [{
                label: 'Change',
                data: /*data*/[data.recordset[0].rating, data.recordset[1].rating, data.recordset[2].rating, data.recordset[3].rating, data.recordset[4].rating],
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

function buildCharts(data){
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
                label: 'Ratings',
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
                    label: function(context) {
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