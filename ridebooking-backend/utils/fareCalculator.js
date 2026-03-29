/**
 * Calculate ride fare using vehicle rates, trip distance/time, and surge multiplier.
 */
const calculateFare = (vehicleType, distanceKm, durationMinutes, surgeMultiplier = 1) => {
  const rates = {
    UberX: { baseFare: 50, perKm: 12, perMinute: 1.5 },
    Comfort: { baseFare: 80, perKm: 16, perMinute: 2 },
    XL: { baseFare: 100, perKm: 20, perMinute: 2.5 },
    Black: { baseFare: 150, perKm: 25, perMinute: 3 },
  };

  const selected = rates[vehicleType] || rates.UberX;
  const distanceFare = Number(distanceKm) * selected.perKm;
  const timeFare = Number(durationMinutes) * selected.perMinute;
  const subtotal = selected.baseFare + distanceFare + timeFare;
  const totalFare = Math.ceil(subtotal * surgeMultiplier);

  return {
    baseFare: selected.baseFare,
    distanceFare: Math.ceil(distanceFare),
    timeFare: Math.ceil(timeFare),
    surgeMultiplier,
    totalFare,
    currency: "INR",
  };
};

/**
 * Calculate distance in kilometers between two coordinates using Haversine formula.
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;

  return Number(distance.toFixed(2));
};

/**
 * Estimate trip duration in minutes assuming average city speed of 30 km/h.
 */
const estimateDuration = (distanceKm) => {
  const duration = (Number(distanceKm) / 30) * 60;
  return Math.ceil(duration);
};

/**
 * Determine surge multiplier based on demand (active rides) and supply (available drivers).
 */
const getSurgeMultiplier = (activeRides, availableDrivers) => {
  if (availableDrivers === 0) return 2.5;

  const ratio = activeRides / availableDrivers;
  if (ratio < 0.5) return 1;
  if (ratio < 1) return 1.2;
  if (ratio < 1.5) return 1.5;
  if (ratio < 2) return 1.8;
  return 2.5;
};

module.exports = {
  calculateFare,
  calculateDistance,
  estimateDuration,
  getSurgeMultiplier,
};
