export function recommendCrop(temp, rainfall, ph) {
  if (ph == null) return "No soil data available";

  if (ph < 6.0) {
    if (rainfall > 20) return "Rice";
    return "Millets";
  }

  if (ph >= 6 && ph <= 7.5) {
    if (temp > 30) return "Sugarcane";
    return "Wheat";
  }

  if (ph > 7.5) {
    return "Cotton";
  }

  return "Maize";
}
