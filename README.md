# SkyCast - Weather Forecasting Web Application

A modern, full-stack weather forecasting web application with an **Express.js API backend** and a high-performance **React 19 + Vite + Tailwind CSS** frontend.

Powered by the [Open-Meteo API](https://open-meteo.com/) for accurate global weather forecasting and geocoding without requiring API keys.

---

## 🚀 Features

- **Live Weather Updates**: Current temperature, feels-like metric, day/night mode, humidity, wind speed, pressure, and precipitation.
- **Dynamic Weather Themes**: Background aesthetics dynamically change depending on weather condition (clear sunny, starry night, rain, thunderstorm, snow, overcast).
- **24-Hour Hourly Forecast**: Smooth-scrolling hourly timeline showing projected temperatures and rain probability for the next 24 hours.
- **7-Day Extended Forecast**: Daily breakdown with weather conditions, high/low ranges, precipitation chance, and peak wind speeds.
- **Today's Highlights**: Sunrise & Sunset schedules, UV Index with danger ratings, wind compass directions, and precipitation totals.
- **City Search with Autocomplete**: Fast debounced search suggestions as you type, supporting IME-safe input and keyboard navigation.
- **GPS / Geolocation**: 1-click "Use Current Location" button.
- **Unit Conversion**: Toggle between Celsius (°C) and Fahrenheit (°F) with local storage persistence.
- **Full-Stack Resilience**: Express REST API with seamless automatic client-side fallback directly to Open-Meteo if the backend is ever stopped.

---

## 🛠️ Project Structure

```
WeatherForcasting/
├── backend/weather-backend/     # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/         # Request handling & formatting
│   │   ├── routes/              # Express API route endpoints
│   │   ├── services/            # Open-Meteo external service calls
│   │   └── server.js            # Express server entry point (Port 5000)
│   ├── .env                     # Backend environment configuration
│   └── package.json
│
├── weather-app/                 # Frontend React 19 + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.jsx    # Accessible search with autocomplete & GPS
│   │   │   ├── CurrentWeather.jsx # Main temperature & condition widget
│   │   │   ├── HourlyForecast.jsx # 24-hour horizontal forecast timeline
│   │   │   ├── ForecastCard.jsx # 7-day daily forecast
│   │   │   └── WeatherDetails.jsx # UV index, sunrise/sunset, wind, humidity
│   │   ├── services/
│   │   │   └── weatherApi.js    # API client with auto-fallback
│   │   ├── App.jsx              # Application state and layout
│   │   └── index.css            # Tailwind CSS styling
│   ├── vite.config.js
│   └── package.json
│
└── package.json                 # Workspace root scripts
```

---

## ⚡ Quick Start

### 1. Run the Backend API

```bash
cd backend/weather-backend
npm install
npm run dev
```
> The API server will be available at `http://localhost:5000`.

### 2. Run the Frontend App

```bash
cd weather-app
npm install
npm run dev
```
> Open your browser at the Vite local URL (typically `http://localhost:5173`).

---

## 📡 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/weather/current?city={cityName}` - Current weather by city
- `GET /api/weather/current?lat={lat}&lon={lon}` - Current weather by coordinates
- `GET /api/weather/forecast?city={cityName}&days=7` - 7-day daily forecast
- `GET /api/weather/search?q={query}` - City autocomplete search
