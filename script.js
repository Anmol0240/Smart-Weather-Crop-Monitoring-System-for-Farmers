const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';

// Map OpenWeatherMap icon codes to custom icons
function getCustomWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'sunny.png', // Clear sky (day)
        '01n': 'sunny.png', // Clear sky (night)
        '02d': 'partly-cloudy.png', // Few clouds (day)
        '02n': 'partly-cloudy.png', // Few clouds (night)
        '03d': 'cloudy.png', // Scattered clouds (day)
        '03n': 'cloudy.png', // Scattered clouds (night)
        '04d': 'cloudy.png', // Broken clouds (day)
        '04n': 'cloudy.png', // Broken clouds (night)
        '09d': 'rain.png', // Shower rain (day)
        '09n': 'rain.png', // Shower rain (night)
        '10d': 'rain.png', // Rain (day)
        '10n': 'rain.png', // Rain (night)
        '11d': 'thunderstorm.png', // Thunderstorm (day)
        '11n': 'thunderstorm.png', // Thunderstorm (night)
        '13d': 'cloudy.png', // Snow (day) - Using cloudy as placeholder
        '13n': 'cloudy.png', // Snow (night) - Using cloudy as placeholder
        '50d': 'wind.png', // Mist/Wind (day)
        '50n': 'wind.png'  // Mist/Wind (night)
    };
    // Return the custom icon path, default to cloudy if not found
    return `icons/${iconMap[iconCode] || 'cloudy.png'}`;
}

$(document).ready(function() {
    // Set default city
    getWeatherData('Gubbi');
    
    // Search button click handler
    $('#city-input-btn').click(function() {
        const city = $('#city-input').val().trim();
        if (city) {
            getWeatherData(city);
        }
    });
    
    // Enter key handler for input
    $('#city-input').keypress(function(e) {
        if (e.which === 13) {
            const city = $('#city-input').val().trim();
            if (city) {
                getWeatherData(city);
            }
        }
    });
});

async function getWeatherData(city) {
    try {
        // Get current weather
        const currentResponse = await fetch(`${weatherUrl}?q=${city}&appid=${apiKey}&units=metric`);
        const currentData = await currentResponse.json();
        
        if (!currentResponse.ok) {
            alert('City not found. Please try again.');
            return;
        }
        
        // Get forecast data
        const forecastResponse = await fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();
        
        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again later.');
    }
}

function updateCurrentWeather(data) {
    $('#city-name').text(`${data.name}, ${data.sys.country}`);
    $('#current-date').text(moment().format('dddd, MMMM Do YYYY'));
    $('#temperature').text(Math.round(data.main.temp));
    $('#description').text(data.weather[0].description);
    $('#feels-like').text(Math.round(data.main.feels_like));
    $('#humidity').text(`${data.main.humidity}%`);
    $('#pressure').text(`${data.main.pressure} mBar`);
    $('#wind-speed').text(`${(data.wind.speed * 3.6).toFixed(1)} km/h`);
    $('#wind-direction').text(getWindDirection(data.wind.deg));
    $('#visibility').text(`${(data.visibility / 1000).toFixed(1)} km`);
    
    // Calculate dew point
    const dewPoint = calculateDewPoint(data.main.temp, data.main.humidity);
    $('#dew-point').text(Math.round(dewPoint));
    
    // Set custom weather icon
    $('#weather-icon').attr('src', getCustomWeatherIcon(data.weather[0].icon));
    
    // Convert sunrise/sunset times
    $('#sunrise').text(moment.unix(data.sys.sunrise).format('h:mm A'));
    $('#sunset').text(moment.unix(data.sys.sunset).format('h:mm A'));
}

function updateForecast(data) {
    updateHourlyForecast(data);
    updateDailyForecast(data);
}

function updateHourlyForecast(data) {
    const hourlyContainer = $('#hourly-forecast');
    hourlyContainer.empty();
    
    // Show next 12 hours (every 3 hours)
    for (let i = 0; i < 5; i++) {
        const forecast = data.list[i];
        const time = moment.unix(forecast.dt).format('h A');
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        
        hourlyContainer.append(`
            <div class="hourly-item">
                <div class="time">${time}</div>
                <img src="${getCustomWeatherIcon(icon)}" alt="Weather icon">
                <div class="temp">${temp}°</div>
            </div>
        `);
    }
}

function updateDailyForecast(data) {
    const dailyContainer = $('#daily-forecast');
    dailyContainer.empty();
    
    // Group by day
    const dailyData = {};
    data.list.forEach(item => {
        const date = moment.unix(item.dt).format('YYYY-MM-DD');
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weather: [],
                date: date
            };
        }
        dailyData[date].temps.push(item.main.temp);
        // Store weather data for noon time
        if (moment.unix(item.dt).hour() === 12) {
            dailyData[date].weather.push(item.weather[0]);
        }
    });
    
    // Create daily items for next 6 days
    const dates = Object.keys(dailyData).slice(0, 7);
    dates.forEach((date, index) => {
        const dayData = dailyData[date];
        const maxTemp = Math.round(Math.max(...dayData.temps));
        const minTemp = Math.round(Math.min(...dayData.temps));
        const dayName = index === 0 ? 'Today' : moment(date).format('dddd');
        const weatherIcon = dayData.weather.length > 0 ? dayData.weather[0].icon : '01d';
        
        dailyContainer.append(`
            <div class="daily-item">
                <div class="day">${dayName}</div>
                <img class="weather-icon" src="${getCustomWeatherIcon(weatherIcon)}" alt="Weather icon">
                <div class="temps">
                    <div class="high">${maxTemp}°</div>
                    <div class="low">${minTemp}°</div>
                </div>
            </div>
        `);
    });
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((degrees % 360) / 45);
    return directions[index % 8];
}

function calculateDewPoint(temp, humidity) {
    // Magnus formula for dew point calculation
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
}