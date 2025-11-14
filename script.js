/* ------------------------------------------------------
   CROP DATABASE
------------------------------------------------------ */
const cropDatabase = [
    {
        name: 'Rice',
        minRainfall: 1000,
        maxRainfall: 2500,
        minPH: 5.5,
        maxPH: 7.0,
        soilTypes: ['clayey', 'loamy'],
        season: 'Kharif',
        icon: '🌾'
    },
    {
        name: 'Wheat',
        minRainfall: 300,
        maxRainfall: 1000,
        minPH: 6.0,
        maxPH: 7.5,
        soilTypes: ['loamy', 'clayey'],
        season: 'Rabi',
        icon: '🌾'
    },
    {
        name: 'Cotton',
        minRainfall: 500,
        maxRainfall: 1200,
        minPH: 5.5,
        maxPH: 8.0,
        soilTypes: ['black', 'loamy'],
        season: 'Kharif',
        icon: '🌱'
    },
    {
        name: 'Sugarcane',
        minRainfall: 750,
        maxRainfall: 1500,
        minPH: 6.0,
        maxPH: 7.5,
        soilTypes: ['loamy', 'clayey'],
        season: 'Year-round',
        icon: '🎋'
    },
    {
        name: 'Maize',
        minRainfall: 500,
        maxRainfall: 1000,
        minPH: 5.5,
        maxPH: 7.5,
        soilTypes: ['loamy', 'sandy'],
        season: 'Kharif/Rabi',
        icon: '🌽'
    },
    {
        name: 'Groundnut',
        minRainfall: 500,
        maxRainfall: 1250,
        minPH: 6.0,
        maxPH: 7.0,
        soilTypes: ['sandy', 'loamy'],
        season: 'Kharif',
        icon: '🥜'
    },
    {
        name: 'Soybean',
        minRainfall: 450,
        maxRainfall: 1000,
        minPH: 6.0,
        maxPH: 7.5,
        soilTypes: ['loamy', 'black'],
        season: 'Kharif',
        icon: '🫘'
    },
    {
        name: 'Potato',
        minRainfall: 500,
        maxRainfall: 700,
        minPH: 5.0,
        maxPH: 6.5,
        soilTypes: ['loamy', 'sandy'],
        season: 'Rabi',
        icon: '🥔'
    },
    {
        name: 'Tomato',
        minRainfall: 400,
        maxRainfall: 650,
        minPH: 6.0,
        maxPH: 7.0,
        soilTypes: ['loamy', 'sandy'],
        season: 'Year-round',
        icon: '🍅'
    },
    {
        name: 'Onion',
        minRainfall: 350,
        maxRainfall: 650,
        minPH: 6.0,
        maxPH: 7.5,
        soilTypes: ['loamy', 'sandy'],
        season: 'Rabi',
        icon: '🧅'
    }
];

let weatherData = null;

/* ------------------------------------------------------
   FETCH WEATHER DATA
------------------------------------------------------ */
async function searchLocation() {
    const loc = document.getElementById("locationInput").value.trim();
    if (!loc) {
        alert("Please enter a location");
        return;
    }

    document.getElementById("weatherBox").innerHTML = "Loading weather data...";

    try {
        // Get geocoding data
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(loc)}&count=1`
        );
        const geo = await geoResponse.json();

        if (!geo.results || geo.results.length === 0) {
            throw new Error("Location not found. Please try another city name.");
        }

        const { latitude, longitude, name, country } = geo.results[0];

        // Get weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=365`
        );
        const weather = await weatherResponse.json();

        // Calculate annual rainfall (sum of past 365 days)
        const annualRain = weather.daily.precipitation_sum
            .slice(0, 365)
            .reduce((sum, val) => sum + (val || 0), 0);

        // Calculate average temperature (last 30 days)
        const avgTemp = weather.daily.temperature_2m_max
            .slice(0, 30)
            .reduce((sum, val) => sum + (val || 0), 0) / 30;

        weatherData = {
            location: name,
            country,
            annualRainfall: Math.round(annualRain),
            temperature: Math.round(weather.current.temperature_2m),
            humidity: weather.current.relative_humidity_2m,
            avgTemp: Math.round(avgTemp)
        };

        showWeather();
        calculateRecommendations();

    } catch (err) {
        document.getElementById("weatherBox").innerHTML = 
            `<span style="color: red;">Error: ${err.message}</span>`;
        console.error("Weather fetch error:", err);
    }
}

/* ------------------------------------------------------
   DISPLAY WEATHER DATA
------------------------------------------------------ */
function showWeather() {
    document.getElementById("weatherBox").innerHTML = `
        <b style="font-size: 18px; color: #1b5e20;">${weatherData.location}, ${weatherData.country}</b><br><br>
        <b>Annual Rainfall:</b> ${weatherData.annualRainfall} mm<br>
        <b>Average Temperature:</b> ${weatherData.avgTemp}°C<br>
        <b>Current Temperature:</b> ${weatherData.temperature}°C<br>
        <b>Humidity:</b> ${weatherData.humidity}%
    `;

    drawChart();
}

/* ------------------------------------------------------
   CALCULATE CROP RECOMMENDATIONS
------------------------------------------------------ */
function calculateRecommendations() {
    const soil = {
        ph: parseFloat(document.getElementById("phInput").value),
        type: document.getElementById("soilTypeInput").value,
        nitrogen: parseFloat(document.getElementById("nitrogenInput").value),
        phosphorus: parseFloat(document.getElementById("phosphorusInput").value),
        potassium: parseFloat(document.getElementById("potassiumInput").value)
    };

    // Filter crops based on rainfall, pH, and soil type
    const suitable = cropDatabase.filter(crop => 
        weatherData.annualRainfall >= crop.minRainfall &&
        weatherData.annualRainfall <= crop.maxRainfall &&
        soil.ph >= crop.minPH &&
        soil.ph <= crop.maxPH &&
        crop.soilTypes.includes(soil.type)
    );

    let html = "";
    
    if (suitable.length > 0) {
        suitable.forEach(crop => {
            html += `
                <div class="crop-card">
                    <b>${crop.icon} ${crop.name}</b><br>
                    <b>Season:</b> ${crop.season}<br>
                    <b>Rainfall Range:</b> ${crop.minRainfall}-${crop.maxRainfall} mm<br>
                    <b>pH Range:</b> ${crop.minPH}-${crop.maxPH}<br>
                    <b>Suitable Soil:</b> ${crop.soilTypes.join(", ")}
                </div>
            `;
        });
    } else {
        html = `<p style="color: #d32f2f; font-weight: 600;">
            No suitable crops found for the current conditions. Try adjusting soil parameters or searching a different location.
        </p>`;
    }

    document.getElementById("recommendationsBox").innerHTML = html;
}

/* ------------------------------------------------------
   DRAW SIMPLE CHART
------------------------------------------------------ */
function drawChart() {
    const canvas = document.getElementById("chart1");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Data values (scaled for visualization)
    const values = [
        weatherData.annualRainfall / 20,
        weatherData.avgTemp * 2,
        weatherData.humidity
    ];

    const labels = ["Rainfall", "Avg Temp", "Humidity"];
    const colors = ["#4CAF50", "#2196F3", "#FF9800"];

    const barWidth = 60;
    const gap = 40;
    let x = 40;

    // Draw bars
    values.forEach((value, index) => {
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, 180 - value, barWidth, value);

        // Draw labels
        ctx.fillStyle = "#333";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(labels[index], x + barWidth / 2, 195);

        x += barWidth + gap;
    });
}

/* ------------------------------------------------------
   ALLOW ENTER KEY TO SEARCH
------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('locationInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });
});