const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/weather/current?city=Bhopal or ?lat=23.25&lon=77.40
router.get('/current', weatherController.getCurrentWeather);

// GET /api/weather/forecast?city=Bhopal&days=7
router.get('/forecast', weatherController.getForecast);

// GET /api/weather/search?q=Bhop
router.get('/search', weatherController.searchCities);

module.exports = router;
