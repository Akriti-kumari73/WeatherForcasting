import { useEffect, useState, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import CurrentWeather from "./components/CurrentWeather";
import WeatherDetails from "./components/WeatherDetails";
import HourlyForecast from "./components/HourlyForecast";
import ForecastCard from "./components/ForecastCard";
import AdminPanel from "./components/AdminPanel";
import { getCurrentWeather, getWeatherByCoords } from "./services/weatherApi";
import { CloudSun, RefreshCw, AlertCircle, Compass, Sparkles, ShieldCheck } from "lucide-react";

const POPULAR_CITIES = [
  "Bhopal",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "London",
  "New York",
  "Tokyo",
  "Dubai",
  "Paris",
];

export default function App() {
  const [city, setCity] = useState("Bhopal");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState(() => localStorage.getItem("weather_unit") || "C");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const toggleUnit = () => {
    setUnit((prev) => {
      const next = prev === "C" ? "F" : "C";
      localStorage.setItem("weather_unit", next);
      return next;
    });
  };

  const loadWeatherForCity = useCallback(async (cityName) => {
    const query = (cityName || city).trim();
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      const data = await getCurrentWeather(query);
      setWeatherData(data);
      setCity(data.location.name);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(err.message || `Unable to load weather for "${query}".`);
    } finally {
      setLoading(false);
    }
  }, [city]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const data = await getWeatherByCoords(latitude, longitude, "My Current Location");
          setWeatherData(data);
          setCity(data.location.name);
          setLastUpdated(new Date());
        } catch (err) {
          setError("Failed to fetch weather for your coordinates.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Location permission denied. Please search your city manually.");
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    loadWeatherForCity("Bhopal");
  }, []);

  // Compute ambient atmospheric colors based on current weather code and day/night
  const getAtmosphereConfig = () => {
    if (!weatherData?.current) {
      return {
        bg: "from-slate-950 via-slate-900 to-sky-950",
        orb1: "bg-sky-500/20",
        orb2: "bg-blue-600/20",
      };
    }

    const { weather_code, is_day } = weatherData.current;

    // Rainy / Thunderstorm
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather_code)) {
      return {
        bg: is_day
          ? "from-slate-950 via-slate-900 to-blue-950"
          : "from-black via-slate-950 to-indigo-950",
        orb1: "bg-blue-600/20",
        orb2: "bg-purple-900/20",
      };
    }

    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(weather_code)) {
      return {
        bg: "from-slate-950 via-slate-900 to-cyan-950",
        orb1: "bg-cyan-400/20",
        orb2: "bg-blue-300/15",
      };
    }

    // Overcast / Cloudy / Fog
    if ([2, 3, 45, 48].includes(weather_code)) {
      return {
        bg: is_day
          ? "from-slate-950 via-slate-900 to-zinc-900"
          : "from-black via-slate-950 to-neutral-900",
        orb1: "bg-slate-500/20",
        orb2: "bg-indigo-950/30",
      };
    }

    // Clear sky
    return is_day
      ? {
          bg: "from-sky-950 via-slate-950 to-blue-950",
          orb1: "bg-amber-500/20",
          orb2: "bg-sky-500/25",
        }
      : {
          bg: "from-slate-950 via-black to-indigo-950",
          orb1: "bg-indigo-600/20",
          orb2: "bg-purple-900/15",
        };
  };

  const atmosphere = getAtmosphereConfig();

  return (
    <div
      className={`relative min-h-dvh overflow-x-hidden bg-gradient-to-br ${atmosphere.bg} px-3 py-4 sm:px-6 sm:py-8 lg:px-8 text-white transition-all duration-1000 selection:bg-sky-500 selection:text-white`}
    >
      {/* Dynamic Ambient Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 h-96 w-96 rounded-full blur-[128px] transition-all duration-1000 ${atmosphere.orb1}`}
        />
        <div
          className={`absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full blur-[140px] transition-all duration-1000 ${atmosphere.orb2}`}
        />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-6 sm:space-y-8">
        {/* Top Floating App Bar */}
        <header className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/30 p-3 sm:p-4 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/25">
              <CloudSun className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  SkyCast
                </h1>
                <span className="rounded-full bg-gradient-to-r from-amber-400/20 to-sky-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Precision Real-Time Forecasts
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
            {lastUpdated && (
              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                Synced {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}

            <button
              onClick={() => setShowAdmin(!showAdmin)}
              title={showAdmin ? "Return to Weather" : "Open API & Business Admin"}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                showAdmin
                  ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-md shadow-amber-400/10"
                  : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>{showAdmin ? "Weather" : "Admin Hub"}</span>
            </button>

            <button
              onClick={() => loadWeatherForCity(city)}
              disabled={loading}
              title="Refresh weather data"
              aria-label="Refresh weather data"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/15 hover:text-white active:scale-95 disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* View Switch: Either Admin Panel OR Weather Display */}
        {showAdmin ? (
          <AdminPanel onClose={() => setShowAdmin(false)} />
        ) : (
          <>
            {/* Search & Quick Pick Cities */}
        <section className="space-y-3">
          <SearchBar
            city={city}
            setCity={setCity}
            onSearch={(target) => loadWeatherForCity(target || city)}
            onLocationSelect={(item) => {
              setCity(item.name);
              loadWeatherForCity(item.name);
            }}
            onGeoLocation={handleUseCurrentLocation}
            loading={loading}
          />

          {/* Popular Cities Quick Scrollable Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="shrink-0 text-xs font-semibold text-slate-400">
              Trending:
            </span>
            {POPULAR_CITIES.map((name) => {
              const active = weatherData?.location?.name?.toLowerCase() === name.toLowerCase();
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setCity(name);
                    loadWeatherForCity(name);
                  }}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "border border-sky-400/80 bg-sky-500/20 text-sky-300 shadow-sm shadow-sky-500/20"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Error Alert Box */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-red-200 shadow-2xl backdrop-blur-2xl"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div className="flex-1 text-sm">
              <p className="font-bold text-red-100">Unable to retrieve forecast</p>
              <p className="mt-0.5 text-xs sm:text-sm text-red-300">{error}</p>
            </div>
            <button
              onClick={() => loadWeatherForCity(city)}
              className="rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-100 transition hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Forecast Modules */}
        {loading && !weatherData ? (
          <div className="space-y-6 py-6">
            <div className="h-72 animate-pulse rounded-3xl bg-white/5" />
            <div className="h-44 animate-pulse rounded-3xl bg-white/5" />
            <div className="h-64 animate-pulse rounded-3xl bg-white/5" />
          </div>
        ) : weatherData ? (
          <main className="space-y-6 sm:space-y-8">
            {/* Hero Current Weather */}
            <CurrentWeather
              data={weatherData}
              unit={unit}
              onToggleUnit={toggleUnit}
            />

            {/* Hourly 24-Hour Forecast */}
            {weatherData.hourly && (
              <HourlyForecast hourly={weatherData.hourly} unit={unit} />
            )}

            {/* In-Depth Highlight Cards */}
            {weatherData.daily && (
              <WeatherDetails
                current={weatherData.current}
                daily={weatherData.daily}
              />
            )}

            {/* 7-Day Extended Forecast */}
            {weatherData.daily && (
              <ForecastCard daily={weatherData.daily} unit={unit} />
            )}
          </main>
        ) : (
          !loading &&
          !error && (
            <div className="py-20 text-center">
              <Compass className="mx-auto h-12 w-12 text-slate-500" />
              <p className="mt-3 text-lg font-bold text-slate-200">
                Explore the forecast anywhere on Earth
              </p>
              <p className="text-sm text-slate-400">
                Search any city name or tap your current location icon.
              </p>
            </div>
          )
        )}
          </>
        )}

        {/* Footer */}
        <footer className="border-t border-white/10 pt-6 pb-4 text-center text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            <span>Powered by</span>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-sky-400 hover:underline"
            >
              Open-Meteo
            </a>
            <span>• Built with React 19, Tailwind CSS & Express</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
