import { latitude, longitude } from "./main.js";
async function getWeather() {
 
  if (!lat || !lon) {
    alert("Please enter both latitude and longitude");
    return;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=precipitation_sum,relative_humidity_2m_mean&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("Current Weather:", data.current_weather);
    console.log("Daily:", data.daily);

    document.getElementById("output").textContent =
      JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}
    getWeather();