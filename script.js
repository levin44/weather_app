const apiKey = 'cd9c006055124425aaf125754250507';

function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (city === '') {
        alert('Please enter a city name');
        return;
    }

    // Get current and forecast weather
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3`;
    
    // Get historical weather for the past 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    const historyUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=${sevenDaysAgo}`;

    Promise.all([
        fetch(forecastUrl).then(response => response.json()),
        fetch(historyUrl).then(response => response.json())
    ])
    .then(([forecastData, historyData]) => {
        showCurrentWeather(forecastData);
        showForecast(forecastData);
        showHistory(historyData);
    })
    .catch(err => alert('City not found or API Error'));
}

function showCurrentWeather(data) {
    const weatherDiv = document.getElementById('weatherResult');
    weatherDiv.innerHTML = `
        <div class="current-weather">
            <h2>${data.location.name}, ${data.location.country}</h2>
            <p><strong>Temperature:</strong> ${data.current.temp_c}°C</p>
            <p><strong>Condition:</strong> ${data.current.condition.text}</p>
            <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${data.current.wind_kph} km/h</p>
            <img src="${data.current.condition.icon}" alt="weather icon">
        </div>
    `;
}

function showForecast(data) {
    const forecastDiv = document.createElement('div');
    forecastDiv.className = 'forecast-weather';
    forecastDiv.innerHTML = '<h3>3-Day Forecast</h3>';

    data.forecast.forecastday.forEach(day => {
        forecastDiv.innerHTML += `
            <div class="forecast-day">
                <h4>${new Date(day.date).toLocaleDateString()}</h4>
                <img src="${day.day.condition.icon}" alt="weather icon">
                <p>Max: ${day.day.maxtemp_c}°C</p>
                <p>Min: ${day.day.mintemp_c}°C</p>
                <p>${day.day.condition.text}</p>
            </div>
        `;
    });

    document.getElementById('weatherResult').appendChild(forecastDiv);
}

function showHistory(data) {
    const historyDiv = document.createElement('div');
    historyDiv.className = 'history-weather';
    historyDiv.innerHTML = '<h3>Past 7 Days</h3>';

    data.forecast.forecastday.forEach(day => {
        historyDiv.innerHTML += `
            <div class="history-day">
                <h4>${new Date(day.date).toLocaleDateString()}</h4>
                <p>Avg: ${day.day.avgtemp_c}°C</p>
                <p>Max: ${day.day.maxtemp_c}°C</p>
                <p>Min: ${day.day.mintemp_c}°C</p>
            </div>
        `;
    });

    document.getElementById('weatherResult').appendChild(historyDiv);
}
