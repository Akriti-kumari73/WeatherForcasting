/**
 * Weather Service: Interacts with the Open-Meteo APIs (Geocoding and Forecast)
 */

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Searches for city suggestions / coordinates
 * @param {string} query
 * @param {number} count
 */
async function searchLocations(query, count = 5) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('City query is required');
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query.trim())}&count=${count}&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding service failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Fetches comprehensive weather data for a given coordinate
 */
async function getForecastByCoords(latitude, longitude, timezone = 'auto', days = 7) {
  const url = new URL(FORECAST_BASE_URL);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m'
  );
  url.searchParams.set(
    'hourly',
    'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m'
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max'
  );
  url.searchParams.set('timezone', timezone || 'auto');
  url.searchParams.set('forecast_days', days);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather forecast service failed with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetches complete weather data by city name
 */
async function getWeatherByCity(cityName, days = 7) {
  const locations = await searchLocations(cityName, 1);
  if (!locations || locations.length === 0) {
    throw new Error(`City "${cityName}" not found.`);
  }

  const topLocation = locations[0];
  const weatherData = await getForecastByCoords(
    topLocation.latitude,
    topLocation.longitude,
    topLocation.timezone || 'auto',
    days
  );

  return {
    location: {
      name: topLocation.name,
      country: topLocation.country,
      country_code: topLocation.country_code,
      admin1: topLocation.admin1,
      latitude: topLocation.latitude,
      longitude: topLocation.longitude,
      timezone: topLocation.timezone,
    },
    current: weatherData.current,
    daily: weatherData.daily,
    hourly: weatherData.hourly,
    units: {
      ...weatherData.current_units,
      ...weatherData.daily_units,
    },
    raw: weatherData,
  };
}

module.exports = {
  searchLocations,
  getForecastByCoords,
  getWeatherByCity,
};
