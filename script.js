// ====================================================
//  SEARCH CITY → WEATHER → SOIL → CROP LOGIC
// ====================================================

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

 const cropList  = recommendCrop(
  weather.temperature,
  weather.humidity,
  weather.rainfall,
  soil?.ph
);

  // 5️⃣ UPDATE UI
  updateWeatherUI(weather);
  updateSoilUI(soil);
  updateCropUI(cropList);
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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&hourly=precipitation`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      rainfall: data.hourly.precipitation[0] || 0,
    };

  } catch (err) {
    console.error("Weather Error:", err);
    return null;
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
//  4. SIMPLE CROP RECOMMENDATION LOGIC
// ====================================================




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
}// ...existing code...
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
// ...existing code...