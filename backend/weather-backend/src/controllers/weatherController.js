const weatherService = require('../services/weatherService');

/**
 * Controller to get current weather and summary
 */
async function getCurrentWeather(req, res) {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a city name or latitude and longitude coordinates.',
      });
    }

    let result;
    if (city) {
      result = await weatherService.getWeatherByCity(city, 7);
    } else {
      const forecast = await weatherService.getForecastByCoords(Number(lat), Number(lon));
      result = {
        location: {
          name: req.query.name || 'Your Location',
          latitude: Number(lat),
          longitude: Number(lon),
          timezone: forecast.timezone,
        },
        current: forecast.current,
        daily: forecast.daily,
        hourly: forecast.hourly,
        units: {
          ...forecast.current_units,
          ...forecast.daily_units,
        },
      };
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message || 'Internal server error while fetching weather data.',
    });
  }
}

/**
 * Controller to get daily and hourly forecast
 */
async function getForecast(req, res) {
  try {
    const { city, lat, lon, days = 7 } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a city name or latitude and longitude coordinates.',
      });
    }

    let result;
    if (city) {
      result = await weatherService.getWeatherByCity(city, Number(days));
    } else {
      const forecast = await weatherService.getForecastByCoords(Number(lat), Number(lon), 'auto', Number(days));
      result = {
        location: {
          name: req.query.name || 'Custom Location',
          latitude: Number(lat),
          longitude: Number(lon),
        },
        daily: forecast.daily,
        hourly: forecast.hourly,
        units: forecast.daily_units,
      };
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message || 'Internal server error while fetching forecast.',
    });
  }
}

/**
 * Controller for searching cities autocomplete
 */
async function searchCities(req, res) {
  try {
    const { q, count = 6 } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required.',
      });
    }

    const locations = await weatherService.searchLocations(q, Number(count));
    const formatted = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      country: loc.country,
      country_code: loc.country_code,
      admin1: loc.admin1,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error searching cities:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error searching cities.',
    });
  }
}

module.exports = {
  getCurrentWeather,
  getForecast,
  searchCities,
};
