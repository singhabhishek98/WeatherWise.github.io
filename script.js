//Declare a variable to store the searched city
var city = "";
// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var sCity = [];

// searches the city to see if it exists in the entries from the storage
function find(c) {
    for (var i = 0; i < sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}

//Set up the API key
var APIKey = "a0aca8a89948154a4182dcecc780b513";

// Display the current and future weather to the user after grabbing the city from the input text box.
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

// Here we create the AJAX call
function currentWeather(city) {
    // Here we build the URL so we can get data from the server side.
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {

        // parse the response to display the current weather including the City name. the Date and the weather icon. 
        console.log(response);
        // Data object from server-side API for icon property.
        var weathericon = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
        // The date format method is taken from the https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date = new Date(response.dt * 1000).toLocaleDateString();
        // parse the response for the name of the city and concatenating the date and icon.
        $(currentCity).html(response.name + " (" + date + ") " + "<img src=" + iconurl + ">");
        // parse the response to display the current temperature in Celsius.
        // Convert the temp to Celsius
        var tempC = (response.main.temp - 273.15).toFixed(2);
        $(currentTemperature).html(tempC + "&#8451");
        // Display the Humidity
        $(currentHumidity).html(response.main.humidity + "%");
        // Display Wind speed and convert to meters per second (m/s)
        var ws = response.wind.speed;
        var windsmph = (ws).toFixed(1); // Wind speed is already in m/s
        $(currentWSpeed).html(windsmph + " m/s");
        // Display UV Index.
        // By Geographic coordinates method and using appid and coordinates as a parameter, we are going to build our UV query URL inside the function below.
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            } else {
                if (find(city) > 0) {
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
// This function returns the UVIindex response.
function UVIndex(ln, lt) {
    //lets build the url for uvindex.
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}

// Here we display the 5 days forecast for the current city.
function forecast(cityid) {
    var dayover = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {

        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempC = (((tempK - 273.15)).toFixed(2)) + "&#8451";
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconurl + ">");
            $("#fTemp" + i).html(tempC);
            $("#fHumidity" + i).html(humidity + "%");
        }

    });
}

// Dynamically add the passed city to the search history
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}
// Display the past search again when the list group item is clicked in search history
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}

// render function
function loadlastCity() {
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i - 1];
        currentWeather(city);
    }
}

// Clear the search history from the page
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();
}

// Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);
