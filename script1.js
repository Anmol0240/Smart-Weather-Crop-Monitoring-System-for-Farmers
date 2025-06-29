// Define the IP address of your ESP32 (replace with your actual ESP32 IP address)
const ESP32_IP = 'http://192.168.X.X/data';  // Change this IP address to your ESP32 IP

// Function to load weather data from ESP32
function loadESP32Data() {
    // Fetch data from the ESP32 device (replace ESP32_IP with actual IP)
    fetch(ESP32_IP)
        .then(response => response.json())
        .then(data => {
            // Check if data exists and contains weather information
            if (data) {
                // Update the weather information on the page
                document.getElementById('temperature').textContent = `Temperature: ${data.temperature}°C`;
                document.getElementById('humidity').textContent = `Humidity: ${data.humidity}%`;
                document.getElementById('weather').textContent = `Weather: ${data.weather}`;
            } else {
                alert("No data received from ESP32.");
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert("Failed to fetch data from ESP32.");
        });
}
