const apiKey = 'cd9c006055124425aaf125754250507';

function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (city === '') {
        alert('Please enter a city name');
        return;
    }

    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    fetch(url)
        .then(response => response.json())
        .then(data => showWeather(data))
        .catch(err => alert('City not found or API Error'));
}

function showWeather(data) {
    const weatherDiv = document.getElementById('weatherResult');
    weatherDiv.innerHTML = `
        <h2>${data.location.name}, ${data.location.country}</h2>
        <p><strong>Temperature:</strong> ${data.current.temp_c}°C</p>
        <p><strong>Condition:</strong> ${data.current.condition.text}</p>
        <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.current.wind_kph} km/h</p>
        <img src="${data.current.condition.icon}" alt="weather icon">
    `;
}
