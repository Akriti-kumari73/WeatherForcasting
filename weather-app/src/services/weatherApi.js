/**
 * Weather API Client: Connects to the Express backend (http://localhost:5000/api/weather)
 * with automatic client-side fallback directly to Open-Meteo if the backend is unreachable.
 */

const BACKEND_BASE_URL = 'http://localhost:5000/api/weather';
const OPEN_METEO_GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Direct Open-Meteo Geocoding fallback
 */
async function fallbackSearchLocations(city) {
  const res = await fetch(
    `${OPEN_METEO_GEO_URL}?name=${encodeURIComponent(city.trim())}&count=5&language=en&format=json`
  );
  if (!res.ok) throw new Error('Geocoding request failed');
  const data = await res.json();
  return data.results || [];
}

/**
 * Direct Open-Meteo Forecast fallback
 */
async function fallbackGetForecast(lat, lon, timezone = 'auto', days = 7) {
  const url = new URL(OPEN_METEO_FORECAST_URL);
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
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
  url.searchParams.set('timezone', timezone);
  url.searchParams.set('forecast_days', days);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Weather forecast request failed');
  return await res.json();
}

/**
 * Search city suggestions
 */
export async function searchCities(query) {
  if (!query || !query.trim()) return [];

  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/search?q=${encodeURIComponent(query.trim())}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    // Backend offline, fallback to direct geocoding
  }

  const results = await fallbackSearchLocations(query);
  return results.map((loc) => ({
    id: loc.id,
    name: loc.name,
    country: loc.country,
    country_code: loc.country_code,
    admin1: loc.admin1,
    latitude: loc.latitude,
    longitude: loc.longitude,
    timezone: loc.timezone,
  }));
}

/**
 * Get current weather for a city
 */
export async function getCurrentWeather(cityName) {
  if (!cityName || !cityName.trim()) {
    throw new Error('City name is required.');
  }

  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/current?city=${encodeURIComponent(cityName.trim())}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    // Backend unreachable, use direct API fallback
  }

  // Fallback direct call
  const locations = await fallbackSearchLocations(cityName);
  if (!locations.length) {
    throw new Error(`City "${cityName}" not found.`);
  }

  const top = locations[0];
  const weather = await fallbackGetForecast(top.latitude, top.longitude, top.timezone || 'auto', 7);

  return {
    location: {
      name: top.name,
      country: top.country,
      country_code: top.country_code,
      admin1: top.admin1,
      latitude: top.latitude,
      longitude: top.longitude,
      timezone: top.timezone,
    },
    current: weather.current,
    daily: weather.daily,
    hourly: weather.hourly,
    units: {
      ...weather.current_units,
      ...weather.daily_units,
    },
  };
}

/**
 * Get weather forecast for a city
 */
export async function getForecast(cityName, days = 7) {
  if (!cityName || !cityName.trim()) {
    throw new Error('City name is required.');
  }

  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/forecast?city=${encodeURIComponent(cityName.trim())}&days=${days}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    // Fallback direct call
  }

  const data = await getCurrentWeather(cityName);
  return {
    location: data.location,
    daily: data.daily,
    hourly: data.hourly,
    units: data.units,
  };
}

/**
 * Get weather by GPS coordinates
 */
export async function getWeatherByCoords(latitude, longitude, name = 'Current Location') {
  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/current?lat=${latitude}&lon=${longitude}&name=${encodeURIComponent(name)}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    // Fallback direct call
  }

  const weather = await fallbackGetForecast(latitude, longitude, 'auto', 7);
  return {
    location: {
      name,
      country: '',
      latitude,
      longitude,
      timezone: weather.timezone,
    },
    current: weather.current,
    daily: weather.daily,
    hourly: weather.hourly,
    units: {
      ...weather.current_units,
      ...weather.daily_units,
    },
  };
}
