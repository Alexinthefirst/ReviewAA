document.addEventListener("DOMContentLoaded", function(event) {
     // Your code to run since DOM is loaded and ready
     getData()
});

function getData(){
    var ratings = [0, 0, 0, 0, 0];
    console.log("loaded");
            const options = {
                method: "GET",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" }
            }
            // Get the data
            fetch('http://localhost:8000/reviews', options)
                .then(function(response){
                    return response.json();
                }).then(function(data){
                    // Get the reviews from the data
                    console.log(data)
                    // Get every review and sort it
                    for (const review of data){
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

                    return ratings;
                }).then(function(data){
                    buildCharts(data)
                })
}

function buildCharts(data){
    const ctxPie = document.getElementById('myChartPie').getContext('2d');
    const ctxBar = document.getElementById('myChartBar').getContext('2d');
    const ctxLine = document.getElementById('myChartLine').getContext('2d');
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
            }
        }
    });

    const myChartLine = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['November', 'December', 'January', 'February', 'March'],
            datasets: [{
                label: 'Change',
                data: /*data*/['3.6', '4', '4.4', '4.1', '4.3'],
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