// ====================================================
//  SEARCH CITY → WEATHER → SOIL → CROP LOGIC
// ====================================================

// Store chart instances globally to destroy them before creating new ones
let soilChart = null;
let rainfallChart = null;

document.getElementById("searchBtn").addEventListener("click", searchCity);

async function searchCity() {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    alert("Enter a city name");
    return;
  }

  // 1️⃣ GET COORDINATES
  const coords = await getCoordinates(city);
  if (!coords) {
    alert("City not found");
    return;
  }
  const { lat, lon } = coords;
  console.log("Coordinates:", lat, lon);

  // 2️⃣ GET WEATHER
  const weather = await getWeather(lat, lon);
  console.log("Weather:", weather);

  // 3️⃣ GET SOIL PH (LOCAL JSON)
  const soil = await getSoilPH(city);
  console.log("Soil PH Data:", soil);

  const cropList = recommendCrop(
    weather.temperature,
    weather.humidity,
    weather.rainfall,
    soil?.ph
  );

  // 5️⃣ UPDATE UI
  updateWeatherUI(weather);
  updateSoilUI(soil);
  updateCropUI(cropList);
  
  // 6️⃣ UPDATE CHARTS
  updateCharts(soil, weather.rainfall);
}

// ====================================================
//  1. GET COORDINATES (CITY → LAT/LON)
// ====================================================

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) return null;

    return {
      lat: data.results[0].latitude,
      lon: data.results[0].longitude,
    };

  } catch (err) {
    console.error("Coordinate Error:", err);
    return null;
  }
}

// ====================================================
//  2. GET WEATHER
// ====================================================

async function getWeather(lat, lon) {
  // request current_weather + hourly fields (past 30 days)
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation&current_weather=true&timezone=auto&past_days=30`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Weather API Response:", data);

    // temperature/humidity: prefer current_weather, else use last hourly value if present
    let temperature = data.current_weather?.temperature ?? null;
    let humidity = data.current_weather?.relativehumidity ?? null; // current_weather uses different naming
    if ((temperature === null || humidity === null) && data.hourly) {
      if (Array.isArray(data.hourly.temperature_2m) && data.hourly.temperature_2m.length > 0) {
        temperature = temperature ?? data.hourly.temperature_2m[data.hourly.temperature_2m.length - 1];
      }
      if (Array.isArray(data.hourly.relative_humidity_2m) && data.hourly.relative_humidity_2m.length > 0) {
        humidity = humidity ?? data.hourly.relative_humidity_2m[data.hourly.relative_humidity_2m.length - 1];
      }
    }

    // precipitation can be returned as 'precipitation' or (rare) 'precipitation_sum' — handle both
    const hourlyPrecipitation = data.hourly?.precipitation ?? data.hourly?.precipitation_sum ?? null;

    let averageHourlyPrecipitation = 0;
    if (Array.isArray(hourlyPrecipitation) && hourlyPrecipitation.length > 0) {
      const totalHours = hourlyPrecipitation.length;
      const totalPrecipitation = hourlyPrecipitation.reduce((acc, val) => acc + (Number(val) || 0), 0);
      averageHourlyPrecipitation = totalHours ? totalPrecipitation / totalHours : 0;
      console.log(`Average hourly precipitation over ${totalHours} hours:`, averageHourlyPrecipitation);
    } else {
      console.warn("Precipitation hourly array not available on response.", data.hourly);
    }

    return {
      temperature,
      humidity,
      rainfall: averageHourlyPrecipitation,
    };

  } catch (err) {
    console.error("Weather Error:", err);
    return {
      temperature: null,
      humidity: null,
      rainfall: 0
    };
  }
}

// ====================================================
//  3. GET SOIL PH (FROM LOCAL JSON FILE)
// ====================================================

async function getSoilPH(city) {
  try {
    const res = await fetch("./india_soil_ph_data.json");
    const json = await res.json();

    const key = city.trim().toLowerCase();

    const match = json.soil_data.find(
      (item) => item.city.toLowerCase() === key
    );

    if (!match) return null;

    return {
      ph: match.pH_estimate,
      range: match.pH_range,
      confidence: match.confidence,
    };

  } catch (err) {
    console.error("Soil pH Error:", err);
    return null;
  }
}

// ====================================================
//  5. UPDATE UI SECTIONS
// ====================================================

function updateWeatherUI(weather) {
  document.querySelector(".details p:nth-child(1) span").textContent =
    weather.temperature;
  document.querySelector(".details p:nth-child(2) span").textContent =
    weather.humidity;
  document.querySelector(".details p:nth-child(3) span").textContent =
    weather.rainfall;
}

function updateSoilUI(soil) {
  if (!soil) {
    document.querySelector(".soil-details").innerHTML =
      `<p>No soil data found</p>`;
    return;
  }

  document.querySelector(".soil-details").innerHTML = `
    <p>Soil pH: <span>${soil.ph}</span></p>
    <p>Range: <span>${soil.range[0]} - ${soil.range[1]}</span></p>
    <p>Confidence: <span>${soil.confidence}</span></p>
  `;
}

function updateCropUI(crops) {
  const container = document.querySelector(".crop-recommendation");

  function emojiFor(crop) {
    const key = (crop || "").toLowerCase();
    const map = {
      rice: "🌾",
      wheat: "🌾",
      maize: "🌽",
      corn: "🌽",
      millet: "🌿",
      barley: "🌱",
      cotton: "🧶",
      mustard: "🌻",
      sugarcane: "🍃",
      potato: "🥔",
      tomato: "🍅",
      onion: "🧅",
      banana: "🍌",
      mango: "🥭",
      tea: "🍵",
      coffee: "☕",
      soybean: "🌱",
      lentil: "🥣",
      chickpea: "🥗",
      default: "🌾"
    };
    return map[key] || map.default;
  }

  if (!Array.isArray(crops)) {
    container.innerHTML = `
      <div class="crop-card single">
        <h3>Recommended Crop</h3>
        <div class="crop-item">
          <span class="emoji">${emojiFor(crops)}</span>
          <span class="name">${crops}</span>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="crop-card">
      <h3>Top ${crops.length} Recommended Crops</h3>
      <ol class="crop-list">
        ${crops.map(crop => `
          <li class="crop-item">
            <span class="emoji">${emojiFor(crop)}</span>
            <span class="name">${crop}</span>
          </li>
        `).join("")}
      </ol>
    </div>
  `;
}

// ====================================================
//  6. CREATE/UPDATE CHARTS
// ====================================================

function updateCharts(soil, rainfall) {
  // Destroy existing charts if they exist
  if (soilChart) {
    soilChart.destroy();
  }
  if (rainfallChart) {
    rainfallChart.destroy();
  }

  // Create Gauge Chart for pH
  createGaugeChart(soil);
  
  // Create Bar Chart for Rainfall
  createBarChart(rainfall);
}

function createGaugeChart(soil) {
  const phContainer = document.querySelector('.ph-graph');
  
  if (!soil) {
    phContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No soil data available</p>';
    return;
  }

  // Clear and create canvas
  phContainer.innerHTML = '<canvas id="phChart" width="300" height="300"></canvas>';
  const ctx = document.getElementById('phChart').getContext('2d');

  const phValue = soil.ph;

  soilChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [phValue, 14 - phValue],
        backgroundColor: [
          getPhColor(phValue),
          '#ecf0f1'
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        title: {
          display: true,
          text: `Soil pH Level`,
          font: { size: 16, weight: 'bold' },
          color: '#37673a',
          padding: { top: 5, bottom: 10 }
        }
      }
    },
    plugins: [{
      id: 'gaugeText',
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
        const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2 + 30;
        
        ctx.save();
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#37673a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(phValue.toFixed(1), centerX, centerY);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(getPhCategory(phValue), centerX, centerY + 30);
        ctx.restore();
      }
    }]
  });
}

function createBarChart(rainfall) {
  const rainfallContainer = document.querySelector('.rainfall-chart');
  
  // Clear and create canvas
  rainfallContainer.innerHTML = '<canvas id="rainfallChart" width="400" height="300"></canvas>';
  const ctx = document.getElementById('rainfallChart').getContext('2d');

  const rainfallValue = rainfall || 0;

  rainfallChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['No Rain\n(0mm)', 'Light\n(0-2.5mm)', 'Moderate\n(2.5-10mm)', 'Heavy\n(10-50mm)', 'Very Heavy\n(50+mm)'],
      datasets: [{
        label: 'Rainfall Category',
        data: [
          rainfallValue === 0 ? rainfallValue + 0.5 : 0,
          rainfallValue > 0 && rainfallValue <= 2.5 ? rainfallValue : 0,
          rainfallValue > 2.5 && rainfallValue <= 10 ? rainfallValue : 0,
          rainfallValue > 10 && rainfallValue <= 50 ? rainfallValue : 0,
          rainfallValue > 50 ? rainfallValue : 0
        ],
        backgroundColor: [
          '#ecf0f1',
          '#a8dadc',
          '#457b9d',
          '#1d3557',
          '#0a1929'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Rainfall (mm)',
            font: { size: 14, weight: 'bold' },
            color: '#37673a'
          },
          ticks: {
            color: '#666'
          }
        },
        x: {
          ticks: {
            color: '#666',
            font: { size: 10 }
          }
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Current Rainfall: ${rainfallValue}mm`,
          font: { size: 16, weight: 'bold' },
          color: '#37673a',
          padding: { top: 5, bottom: 15 }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${rainfallValue}mm`;
            }
          }
        }
      }
    }
  });
}

// ====================================================
//  HELPER FUNCTIONS FOR pH GAUGE
// ====================================================

function getPhColor(ph) {
  if (ph < 4.5) return '#e74c3c';      // Red - Highly Acidic
  if (ph < 6.0) return '#e67e22';      // Orange - Acidic
  if (ph < 6.8) return '#f39c12';      // Yellow-Orange - Slightly Acidic
  if (ph <= 7.2) return '#2ecc71';     // Green - Neutral
  if (ph <= 8.0) return '#3498db';     // Blue - Slightly Alkaline
  return '#9b59b6';                    // Purple - Alkaline
}

function getPhCategory(ph) {
  if (ph < 4.5) return 'Highly Acidic';
  if (ph < 6.0) return 'Acidic';
  if (ph < 6.8) return 'Slightly Acidic';
  if (ph <= 7.2) return 'Neutral';
  if (ph <= 8.0) return 'Slightly Alkaline';
  return 'Alkaline';
}