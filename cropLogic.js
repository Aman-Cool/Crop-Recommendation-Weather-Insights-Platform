// =============================
//  CROP DATASET
// =============================
const crops = [
  {
    name: "Rice",
    temp: 28,
    humidity: 70,
    rainfall: 200,
    ph: 5.5
  },
  {
    name: "Wheat",
    temp: 20,
    humidity: 55,
    rainfall: 100,
    ph: 6.8
  },
  {
    name: "Maize",
    temp: 26,
    humidity: 60,
    rainfall: 120,
    ph: 7.0
  },
  {
    name: "Sugarcane",
    temp: 30,
    humidity: 75,
    rainfall: 150,
    ph: 6.5
  },
  {
    name: "Cotton",
    temp: 27,
    humidity: 65,
    rainfall: 80,
    ph: 7.8
  },
  {
    name: "Millet",
    temp: 30,
    humidity: 50,
    rainfall: 60,
    ph: 6.0
  },
  {
    name: "Barley",
    temp: 18,
    humidity: 55,
    rainfall: 90,
    ph: 6.5
  },
  {
    name: "Sorghum",
    temp: 32,
    humidity: 45,
    rainfall: 70,
    ph: 6.2
  },
  {
    name: "Groundnut",
    temp: 27,
    humidity: 60,
    rainfall: 110,
    ph: 6.8
  },
  {
    name: "Soybean",
    temp: 24,
    humidity: 65,
    rainfall: 140,
    ph: 6.5
  },
  {
  name: "Chickpea",
  temp: 22,
  humidity: 45,
  rainfall: 60,
  ph: 7.0
},
{
  name: "Pigeon Pea",
  temp: 28,
  humidity: 50,
  rainfall: 90,
  ph: 6.3
},
{
  name: "Mustard",
  temp: 18,
  humidity: 40,
  rainfall: 50,
  ph: 7.2
},
{
  name: "Green Gram (Moong)",
  temp: 27,
  humidity: 55,
  rainfall: 80,
  ph: 6.5
},
{
  name: "Black Gram (Urad)",
  temp: 30,
  humidity: 60,
  rainfall: 100,
  ph: 6.0
},
{
  name: "Jute",
  temp: 29,
  humidity: 80,
  rainfall: 150,
  ph: 6.4
},
{
  name: "Tea",
  temp: 22,
  humidity: 85,
  rainfall: 220,
  ph: 5.0
},
{
  name: "Coffee",
  temp: 24,
  humidity: 70,
  rainfall: 180,
  ph: 6.0
},
{
  name: "Potato",
  temp: 17,
  humidity: 60,
  rainfall: 100,
  ph: 5.8
},
{
  name: "Tomato",
  temp: 25,
  humidity: 65,
  rainfall: 90,
  ph: 6.0
}

];




// =============================
//  TOP 3 RECOMMENDATION LOGIC
// =============================
function recommendCrop(temp, humidity, rainfall, ph) {
  if (!ph) return ["No soil data available"];

  // scoring will go here
    const crops = [
    { name: "Rice", temp: 28, humidity: 70, rainfall: 200, ph: 5.5 },
    { name: "Wheat", temp: 20, humidity: 55, rainfall: 100, ph: 6.8 },
    { name: "Maize", temp: 26, humidity: 60, rainfall: 120, ph: 7.0 },
    { name: "Sugarcane", temp: 30, humidity: 75, rainfall: 150, ph: 6.5 },
    { name: "Cotton", temp: 27, humidity: 65, rainfall: 80, ph: 7.8 },
    { name: "Millet", temp: 30, humidity: 50, rainfall: 60, ph: 6.0 },
    { name: "Barley", temp: 18, humidity: 55, rainfall: 90,  ph: 6.5 },
    { name: "Sorghum", temp: 32, humidity: 45, rainfall: 70,  ph: 6.2 },
    { name: "Groundnut", temp: 27, humidity: 60, rainfall: 110, ph: 6.8 },
    { name: "Soybean", temp: 24, humidity: 65, rainfall: 140, ph: 6.5 },
    { name: "Chickpea", temp: 22, humidity: 45, rainfall: 60,  ph: 7.0 },
    { name: "Pigeon Pea", temp: 28, humidity: 50, rainfall: 90,  ph: 6.3 },
    { name: "Mustard", temp: 18, humidity: 40, rainfall: 50,  ph: 7.2 },
    { name: "Green Gram (Moong)", temp: 27, humidity: 55, rainfall: 80, ph: 6.5 },
    { name: "Black Gram (Urad)", temp: 30, humidity: 60, rainfall: 100, ph: 6.0 },
    { name: "Jute", temp: 29, humidity: 80, rainfall: 150, ph: 6.4 },
    { name: "Tea", temp: 22, humidity: 85, rainfall: 220, ph: 5.0 },
    { name: "Coffee", temp: 24, humidity: 70, rainfall: 180, ph: 6.0 },
    { name: "Potato", temp: 17, humidity: 60, rainfall: 100, ph: 5.8 },
    { name: "Tomato", temp: 25, humidity: 65, rainfall: 90, ph: 6.0 }
  ];

    function score(crop) {
    const tempDiff = Math.abs(temp - crop.temp);
    const humidityDiff = Math.abs(humidity - crop.humidity);
    const rainDiff = Math.abs(rainfall - crop.rainfall);
    const phDiff = Math.abs(ph - crop.ph);

    return tempDiff + humidityDiff + rainDiff + phDiff;
  }
    const scored = crops.map(crop => ({
    name: crop.name,
    score: score(crop)
  }));

  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, 3).map(c => c.name);

}
