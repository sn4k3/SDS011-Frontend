// Configuration defaults
var AQI_CONFIG = {
    UPDATE_FREQUENCY        : 60,	// Default seconds to auto refresh the data if not specified by the user via url.
    MIN_UPDATE_FREQUENCY    : 10,	// Min seconds for the refresh frequency, must be greater than 1, if user use lower than that, the value will be set to this.
    SHOW_AQI                : true,	// Show AQI index values by default or not

    GRAPH_WIDTH             : 720,  // Set the graph width, note the graph is responsive
    GRAPH_HEIGHT            : 420,  // Set the graph height, note the graph is responsive
    GRAPH_MAX_DOTS          : 50,   // Set the max dots to show on the graph
};


// Don't edit
var AQI_TIMEOUT = null;


function aqiGetData() {
    if (AQI_TIMEOUT) {
        clearTimeout(AQI_TIMEOUT);
        AQI_TIMEOUT = null;
    }

    document.getElementById("aqiIndexImg").style.display = AQI_CONFIG.SHOW_AQI ? 'block' : 'none';
    document.getElementById("aqi_chart").setAttribute('width', AQI_CONFIG.GRAPH_WIDTH);
    document.getElementById("aqi_chart").setAttribute('height', AQI_CONFIG.GRAPH_HEIGHT);

    fetch("aqi.json").then(response => {
        response.json().then(data => {

            updateHtml(data[data.length - 1]);


            // Plot
            let labels = [];
            let datapm25 = [];
            let datapm10 = [];

            for (let model of data.slice(-AQI_CONFIG.GRAPH_MAX_DOTS)) {
                labels.push(model.time.slice(11));
                datapm25.push(AQI_CONFIG.SHOW_AQI ? calcAQIpm25(model.pm25) : model.pm25);
                datapm10.push(AQI_CONFIG.SHOW_AQI ? calcAQIpm10(model.pm10) : model.pm10);
            }

            let ctx = document.getElementById("aqi_chart").getContext("2d");
            let config = {
                type: 'line',
                options: {
                    responsive: true,
                    title: {
                        display: false,
                        text: 'AQI Chart'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: true
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                fontSize: 24
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                fontSize: 18
                            }
                        }]
                    },
                },
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'PM2.5',
                        data: datapm25,
                        backgroundColor: [
                            //'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            //'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        fill: true,
                        borderWidth: 2,
                    },
                        {
                            label: 'PM10',
                            data: datapm10,
                            backgroundColor: [
                                //'rgba(255, 99, 132, 0.2)',
                                //'rgba(54, 162, 235, 0.2)',
                                //'rgba(255, 206, 86, 0.2)',
                                //'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                //'rgba(255,99,132,1)',
                                //'rgba(54, 162, 235, 1)',
                                //'rgba(255, 206, 86, 1)',
                                //'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            fill: true,
                            borderWidth: 2,
                        }]
                }
            };

            var APIChart = new Chart(ctx, config);
        })
    }).catch(err => {
        console.log(err);
    });

    if (AQI_CONFIG.UPDATE_FREQUENCY && AQI_CONFIG.UPDATE_FREQUENCY > 0) {
        AQI_TIMEOUT = setTimeout(function () {
            aqiGetData();
        }, 1000 * AQI_CONFIG.UPDATE_FREQUENCY);
    }
}

function updateHtml(data) {
    let aqiPm25 = calcAQIpm25(data.pm25);
    let aqiPm10 = calcAQIpm10(data.pm10);
    let colorsPm25 = getColor(aqiPm25);
    let colorsPm10 = getColor(aqiPm10);

    //update HTML
    document.getElementById("time").innerHTML = "Last measurement: <strong>" + data.time + "</strong>";

    if(AQI_CONFIG.SHOW_AQI) {
        document.getElementById("aqiPm25Label").innerHTML = "AQI (PM2.5)";
        document.getElementById("aqiPm10Label").innerHTML = "AQI (PM10)";
        document.getElementById("aqiPm25").innerHTML = aqiPm25;
        document.getElementById("aqiPm10").innerHTML = aqiPm10;
        document.getElementById("pm25").innerHTML = "(PM2.5: " + data.pm25 + " µg/m³)";
        document.getElementById("pm10").innerHTML = "(PM10: " + data.pm10 + " µg/m³)";
    }
    else{
        document.getElementById("aqiPm25Label").innerHTML = "PM2.5 (µg/m³)";
        document.getElementById("aqiPm10Label").innerHTML = "PM10 (µg/m³)";
        document.getElementById("aqiPm25").innerHTML = Math.round(data.pm25);
        document.getElementById("aqiPm10").innerHTML = Math.round(data.pm10);
        document.getElementById("pm25").innerHTML = colorsPm25.evaluation;
        document.getElementById("pm10").innerHTML = colorsPm10.evaluation;
    }

    //set colors
    document.getElementById("containerPm25").style.background = colorsPm25.bg;
    document.getElementById("containerPm25").style.color = colorsPm25.textColor;
    document.getElementById("containerPm10").style.background = colorsPm10.bg;
    document.getElementById("containerPm10").style.color = colorsPm10.textColor;
}

function getColor(aqi) {
    let color;
    let evaluation;
    switch (true) {
        case (aqi >= 50 && aqi < 100):
            color = "yellow";
            evaluation = "Moderate";
            break;
        case (aqi >= 100 && aqi < 150):
            color = "orange";
            evaluation = "Bad";
            break;
        case (aqi >= 150 && aqi < 200):
            color = "red";
            evaluation = "Unhealthy";
            break;
        case (aqi >= 200 && aqi < 300):
            color = "purple";
            evaluation = "Very Unhealthy";
            break;
        case (aqi >= 300):
            color = "brown";
            evaluation = "Hazardous";
            break;
        default:
            color = "Lime";
            evaluation = "Good";
    }
    return {bg: color, textColor: (aqi > 200) ? "white" : "black", evaluation: evaluation};
}

function calcAQIpm25(pm25) {
    let pm1 = 0;
    let pm2 = 12;
    let pm3 = 35.4;
    let pm4 = 55.4;
    let pm5 = 150.4;
    let pm6 = 250.4;
    let pm7 = 350.4;
    let pm8 = 500.4;

    let aqi1 = 0;
    let aqi2 = 50;
    let aqi3 = 100;
    let aqi4 = 150;
    let aqi5 = 200;
    let aqi6 = 300;
    let aqi7 = 400;
    let aqi8 = 500;

    let aqipm25 = 0;

    if (pm25 >= pm1 && pm25 <= pm2) {
        aqipm25 = ((aqi2 - aqi1) / (pm2 - pm1)) * (pm25 - pm1) + aqi1;
    } else if (pm25 >= pm2 && pm25 <= pm3) {
        aqipm25 = ((aqi3 - aqi2) / (pm3 - pm2)) * (pm25 - pm2) + aqi2;
    } else if (pm25 >= pm3 && pm25 <= pm4) {
        aqipm25 = ((aqi4 - aqi3) / (pm4 - pm3)) * (pm25 - pm3) + aqi3;
    } else if (pm25 >= pm4 && pm25 <= pm5) {
        aqipm25 = ((aqi5 - aqi4) / (pm5 - pm4)) * (pm25 - pm4) + aqi4;
    } else if (pm25 >= pm5 && pm25 <= pm6) {
        aqipm25 = ((aqi6 - aqi5) / (pm6 - pm5)) * (pm25 - pm5) + aqi5;
    } else if (pm25 >= pm6 && pm25 <= pm7) {
        aqipm25 = ((aqi7 - aqi6) / (pm7 - pm6)) * (pm25 - pm6) + aqi6;
    } else if (pm25 >= pm7 && pm25 <= pm8) {
        aqipm25 = ((aqi8 - aqi7) / (pm8 - pm7)) * (pm25 - pm7) + aqi7;
    }
    else if (pm25 >= pm8) {
        aqipm25 = ((aqi8 - aqi7) / (pm8 - pm7)) * (pm25 - pm8) + aqi8;
    }
    return aqipm25.toFixed(0);
}

function calcAQIpm10(pm10) {
    let pm1 = 0;
    let pm2 = 54;
    let pm3 = 154;
    let pm4 = 254;
    let pm5 = 354;
    let pm6 = 424;
    let pm7 = 504;
    let pm8 = 604;

    let aqi1 = 0;
    let aqi2 = 50;
    let aqi3 = 100;
    let aqi4 = 150;
    let aqi5 = 200;
    let aqi6 = 300;
    let aqi7 = 400;
    let aqi8 = 500;

    let aqipm10 = 0;

    if (pm10 >= pm1 && pm10 <= pm2) {
        aqipm10 = ((aqi2 - aqi1) / (pm2 - pm1)) * (pm10 - pm1) + aqi1;
    } else if (pm10 >= pm2 && pm10 <= pm3) {
        aqipm10 = ((aqi3 - aqi2) / (pm3 - pm2)) * (pm10 - pm2) + aqi2;
    } else if (pm10 >= pm3 && pm10 <= pm4) {
        aqipm10 = ((aqi4 - aqi3) / (pm4 - pm3)) * (pm10 - pm3) + aqi3;
    } else if (pm10 >= pm4 && pm10 <= pm5) {
        aqipm10 = ((aqi5 - aqi4) / (pm5 - pm4)) * (pm10 - pm4) + aqi4;
    } else if (pm10 >= pm5 && pm10 <= pm6) {
        aqipm10 = ((aqi6 - aqi5) / (pm6 - pm5)) * (pm10 - pm5) + aqi5;
    } else if (pm10 >= pm6 && pm10 <= pm7) {
        aqipm10 = ((aqi7 - aqi6) / (pm7 - pm6)) * (pm10 - pm6) + aqi6;
    } else if (pm10 >= pm7 && pm10 <= pm8) {
        aqipm10 = ((aqi8 - aqi7) / (pm8 - pm7)) * (pm10 - pm7) + aqi7;
    }
    else if (pm10 >= pm8) {
        aqipm10 = ((aqi8 - aqi7) / (pm8 - pm7)) * (pm10 - pm8) + aqi8;
    }
    return aqipm10.toFixed(0);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

let tempConfig = parseInt(getParameterByName('refresh'));
if (tempConfig !== null && !isNaN(tempConfig))
    AQI_CONFIG.UPDATE_FREQUENCY = Math.max(AQI_CONFIG.MIN_UPDATE_FREQUENCY, tempConfig);

tempConfig = parseInt(getParameterByName('showaqi'));
if (tempConfig !== null && !isNaN(tempConfig))
    AQI_CONFIG.SHOW_AQI = tempConfig > 0;

tempConfig = parseInt(getParameterByName('graphwidth'));
if (tempConfig !== null && !isNaN(tempConfig) && tempConfig > 0)
    AQI_CONFIG.GRAPH_WIDTH = tempConfig;

tempConfig = parseInt(getParameterByName('graphheight'));
if (tempConfig !== null && !isNaN(tempConfig) && tempConfig > 0)
    AQI_CONFIG.GRAPH_HEIGHT = tempConfig;

tempConfig = parseInt(getParameterByName('graphdots'));
if (tempConfig !== null && !isNaN(tempConfig) && tempConfig > 0)
    AQI_CONFIG.GRAPH_MAX_DOTS = tempConfig;