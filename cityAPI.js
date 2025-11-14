export let latitude = null;
export let longitude = null;

document.getElementById("searchBtn").addEventListener("click", async () => {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    console.error("Please enter a city name");
    return;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.error("City not found");
      return;
    }

    latitude = data.results[0].latitude;
    longitude = data.results[0].longitude;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    // You can now use latitude & longitude anywhere in your app
  } catch (error) {
    console.error("Error fetching geolocation:", error);
  }
});
