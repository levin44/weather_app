const apiKey = 'cd9c006055124425aaf125754250507';

// User preferences management
const defaultPreferences = {
    theme: 'light',
    unit: 'metric'
};

let userPreferences = loadPreferences();

function loadPreferences() {
    const saved = localStorage.getItem('weatherAppPreferences');
    return saved ? JSON.parse(saved) : { ...defaultPreferences };
}

function savePreferences() {
    localStorage.setItem('weatherAppPreferences', JSON.stringify(userPreferences));
}

function applyPreferences() {
    // Apply theme
    document.documentElement.setAttribute('data-theme', userPreferences.theme);
    document.getElementById(userPreferences.theme + 'Theme').checked = true;

    // Apply units
    document.getElementById('unitSystem').value = userPreferences.unit;
}

// Settings panel management
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('active');
}

// Event listeners for settings changes
document.addEventListener('DOMContentLoaded', () => {
    applyPreferences();

    // Theme toggle
    document.querySelectorAll('input[name="theme"]').forEach(input => {
        input.addEventListener('change', (e) => {
            userPreferences.theme = e.target.value;
            applyPreferences();
            savePreferences();
        });
    });

    // Unit change
    document.getElementById('unitSystem').addEventListener('change', (e) => {
        userPreferences.unit = e.target.value;
        savePreferences();
        if (document.getElementById('weatherResult').innerHTML.trim()) {
            getWeather(); // Refresh weather display with new units
        }
    });
});

// Unit conversion functions
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function kmhToMph(kmh) {
    return kmh * 0.621371;
}

function mmToInches(mm) {
    return mm * 0.0393701;
}

function formatTemperature(temp_c, unitSystem) {
    if (unitSystem === 'imperial') {
        return `${celsiusToFahrenheit(temp_c).toFixed(1)}°F`;
    }
    return `${temp_c.toFixed(1)}°C`;
}

function formatWindSpeed(wind_kph, unitSystem) {
    if (unitSystem === 'imperial') {
        return `${kmhToMph(wind_kph).toFixed(1)} mph`;
    }
    return `${wind_kph.toFixed(1)} km/h`;
}

function formatPrecipitation(precip_mm, unitSystem) {
    if (unitSystem === 'imperial') {
        return `${mmToInches(precip_mm).toFixed(2)} in`;
    }
    return `${precip_mm.toFixed(1)} mm`;
}

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
    const historyPromises = [];
    
    // Create 7 separate calls for each day of history
    for (let i = 1; i <= 7; i++) {
        const historyDate = new Date(today);
        historyDate.setDate(today.getDate() - i);
        const dateString = historyDate.toISOString().split('T')[0];
        const historyUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=${dateString}`;
        historyPromises.push(fetch(historyUrl).then(response => response.json()));
    }

    // Fetch both forecast and history data
    Promise.all([
        fetch(forecastUrl).then(response => response.json()),
        Promise.all(historyPromises)
    ])
    .then(([forecastData, historyDataArray]) => {
        showCurrentWeather(forecastData);
        showForecast(forecastData);
        showHistory(historyDataArray);
    })
    .catch(err => alert('City not found or API Error'));
}

function showCurrentWeather(data) {
    const weatherDiv = document.getElementById('weatherResult');
    weatherDiv.innerHTML = `
        <div class="current-weather">
            <h2>${data.location.name}, ${data.location.country}</h2>
            <p><strong>Temperature:</strong> ${formatTemperature(data.current.temp_c, userPreferences.unit)}</p>
            <p><strong>Feels like:</strong> ${formatTemperature(data.current.feelslike_c, userPreferences.unit)}</p>
            <p><strong>Condition:</strong> ${data.current.condition.text}</p>
            <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${formatWindSpeed(data.current.wind_kph, userPreferences.unit)}</p>
            <p><strong>Precipitation:</strong> ${formatPrecipitation(data.current.precip_mm, userPreferences.unit)}</p>
            <img src="${data.current.condition.icon}" alt="weather icon">
        </div>
    `;
}

function showForecast(data) {
    const forecastDiv = document.createElement('div');
    forecastDiv.className = 'forecast-weather';
    forecastDiv.innerHTML = '<h3>3-Day Forecast</h3>';

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'forecast-cards-container';

    data.forecast.forecastday.forEach(day => {
        cardsContainer.innerHTML += `
            <div class="forecast-day">
                <h4>${new Date(day.date).toLocaleDateString()}</h4>
                <img src="${day.day.condition.icon}" alt="weather icon">
                <p>Max: ${formatTemperature(day.day.maxtemp_c, userPreferences.unit)}</p>
                <p>Min: ${formatTemperature(day.day.mintemp_c, userPreferences.unit)}</p>
                <p>Wind: ${formatWindSpeed(day.day.maxwind_kph, userPreferences.unit)}</p>
                <p>Precipitation: ${formatPrecipitation(day.day.totalprecip_mm, userPreferences.unit)}</p>
                <p>${day.day.condition.text}</p>
            </div>
        `;
    });

    forecastDiv.appendChild(cardsContainer);
    document.getElementById('weatherResult').appendChild(forecastDiv);
}

function showHistory(historyDataArray) {
    const historyDiv = document.createElement('div');
    historyDiv.className = 'history-weather';
    historyDiv.innerHTML = '<h3>Past 7 Days</h3>';

    // Create container for history cards
    const historyCardsContainer = document.createElement('div');
    historyCardsContainer.className = 'forecast-cards-container'; // Reuse the same layout as forecast

    // Sort the history data by date (newest to oldest)
    historyDataArray.sort((a, b) => {
        return new Date(b.forecast.forecastday[0].date) - new Date(a.forecast.forecastday[0].date);
    });

    historyDataArray.forEach(data => {
        const day = data.forecast.forecastday[0];
        historyCardsContainer.innerHTML += `
            <div class="history-day">
                <h4>${new Date(day.date).toLocaleDateString()}</h4>
                <img src="${day.day.condition.icon}" alt="weather icon">
                <p>Average: ${formatTemperature(day.day.avgtemp_c, userPreferences.unit)}</p>
                <p>Max: ${formatTemperature(day.day.maxtemp_c, userPreferences.unit)}</p>
                <p>Min: ${formatTemperature(day.day.mintemp_c, userPreferences.unit)}</p>
                <p>Wind: ${formatWindSpeed(day.day.maxwind_kph, userPreferences.unit)}</p>
                <p>Precipitation: ${formatPrecipitation(day.day.totalprecip_mm, userPreferences.unit)}</p>
                <p>${day.day.condition.text}</p>
            </div>
        `;
    });

    historyDiv.appendChild(historyCardsContainer);
    document.getElementById('weatherResult').appendChild(historyDiv);
}
