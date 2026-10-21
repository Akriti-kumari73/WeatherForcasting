import {
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Eye,
  Thermometer,
  Calendar,
  Clock,
} from "lucide-react";

export const weatherCodeInfo = {
  0: { label: "Clear Sky", icon: "☀️", color: "text-amber-400", glow: "rgba(251, 191, 36, 0.2)" },
  1: { label: "Mainly Clear", icon: "🌤️", color: "text-amber-300", glow: "rgba(252, 211, 77, 0.2)" },
  2: { label: "Partly Cloudy", icon: "⛅", color: "text-sky-300", glow: "rgba(125, 211, 252, 0.2)" },
  3: { label: "Overcast", icon: "☁️", color: "text-slate-300", glow: "rgba(148, 163, 184, 0.15)" },
  45: { label: "Foggy", icon: "🌫️", color: "text-slate-400", glow: "rgba(148, 163, 184, 0.15)" },
  48: { label: "Depositing Rime Fog", icon: "🌫️", color: "text-slate-400", glow: "rgba(148, 163, 184, 0.15)" },
  51: { label: "Light Drizzle", icon: "🌦️", color: "text-cyan-400", glow: "rgba(34, 211, 238, 0.2)" },
  53: { label: "Moderate Drizzle", icon: "🌦️", color: "text-cyan-400", glow: "rgba(34, 211, 238, 0.2)" },
  55: { label: "Dense Drizzle", icon: "🌧️", color: "text-blue-400", glow: "rgba(96, 165, 250, 0.2)" },
  61: { label: "Slight Rain", icon: "🌧️", color: "text-blue-400", glow: "rgba(96, 165, 250, 0.2)" },
  63: { label: "Moderate Rain", icon: "🌧️", color: "text-blue-500", glow: "rgba(59, 130, 246, 0.25)" },
  65: { label: "Heavy Rain", icon: "🌧️", color: "text-indigo-400", glow: "rgba(129, 140, 248, 0.25)" },
  71: { label: "Slight Snow", icon: "🌨️", color: "text-sky-200", glow: "rgba(186, 230, 253, 0.25)" },
  73: { label: "Moderate Snow", icon: "🌨️", color: "text-sky-200", glow: "rgba(186, 230, 253, 0.25)" },
  75: { label: "Heavy Snow", icon: "❄️", color: "text-indigo-200", glow: "rgba(199, 210, 254, 0.3)" },
  80: { label: "Light Showers", icon: "🌦️", color: "text-sky-400", glow: "rgba(56, 189, 248, 0.2)" },
  81: { label: "Moderate Showers", icon: "🌧️", color: "text-blue-400", glow: "rgba(96, 165, 250, 0.25)" },
  82: { label: "Violent Showers", icon: "⛈️", color: "text-indigo-400", glow: "rgba(129, 140, 248, 0.3)" },
  95: { label: "Thunderstorm", icon: "⛈️", color: "text-purple-400", glow: "rgba(192, 132, 252, 0.3)" },
  96: { label: "Thunderstorm with Hail", icon: "⛈️", color: "text-purple-400", glow: "rgba(192, 132, 252, 0.3)" },
  99: { label: "Severe Thunderstorm", icon: "⛈️", color: "text-rose-400", glow: "rgba(251, 113, 133, 0.35)" },
};

export default function CurrentWeather({ data, unit = "C", onToggleUnit }) {
  if (!data) return null;

  const { location, current, units, daily } = data;
  const weatherInfo =
    weatherCodeInfo[current?.weather_code] || {
      label: "Clear",
      icon: current?.is_day ? "☀️" : "🌙",
      color: "text-amber-400",
      glow: "rgba(251, 191, 36, 0.2)",
    };

  const convertTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return "--";
    if (unit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const todayMax = daily?.temperature_2m_max?.[0];
  const todayMin = daily?.temperature_2m_min?.[0];
  const currentTemp = current?.temperature_2m;

  // Temperature position percentage for visual range bar
  const tempRangePercentage =
    todayMax !== undefined && todayMin !== undefined && todayMax > todayMin
      ? Math.max(0, Math.min(100, Math.round(((currentTemp - todayMin) / (todayMax - todayMin)) * 100)))
      : 50;

  // Formatted date string
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-3xl sm:rounded-4xl border border-white/15 bg-slate-900/40 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-3xl transition-all duration-300">
      {/* Ambient Radial Glow Behind Weather Icon */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl transition-all duration-700"
        style={{ background: weatherInfo.glow }}
      />

      {/* Header Bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-sky-300 uppercase">
              Live Conditions
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="h-3 w-3" />
              {dateFormatted}
            </span>
          </div>

          <h2 className="mt-2 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            {location.name}
            {location.admin1 ? (
              <span className="text-lg sm:text-2xl font-light text-slate-400">
                , {location.admin1}
              </span>
            ) : null}
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-400">
            {location.country || "GPS Coordinates"}
          </p>
        </div>

        {/* Temperature Unit Switcher */}
        {onToggleUnit && (
          <button
            type="button"
            onClick={onToggleUnit}
            className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-1 text-xs font-bold text-white shadow-inner backdrop-blur-md transition hover:border-white/30"
            aria-label="Toggle Temperature Unit"
          >
            <span
              className={`rounded-xl px-3 py-1.5 transition-all duration-200 ${
                unit === "C"
                  ? "bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 shadow-md font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              °C
            </span>
            <span
              className={`rounded-xl px-3 py-1.5 transition-all duration-200 ${
                unit === "F"
                  ? "bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 shadow-md font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              °F
            </span>
          </button>
        )}
      </div>

      {/* Main Hero Weather Display */}
      <div className="relative my-6 sm:my-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              {convertTemp(current.temperature_2m)}°
            </span>
            <span className="text-2xl sm:text-3xl font-light text-slate-400">
              {unit}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg sm:text-2xl font-semibold text-sky-200">
              {weatherInfo.label}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              Feels like {convertTemp(current.apparent_temperature)}°{unit}
            </span>
          </div>

          {/* Visual Today Temperature Range Bar (Apple Weather style) */}
          {todayMax !== undefined && todayMin !== undefined && (
            <div className="pt-2 max-w-xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>L: {convertTemp(todayMin)}°</span>
                <span className="text-slate-300">Today's Range</span>
                <span>H: {convertTemp(todayMax)}°</span>
              </div>
              <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400 opacity-60 rounded-full" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-900 shadow-md transition-all duration-500"
                  style={{ left: `calc(${tempRangePercentage}% - 7px)` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Weather Icon with Floating Depth */}
        <div className="flex shrink-0 items-center justify-center sm:self-center">
          <div className="text-8xl sm:text-9xl filter drop-shadow-2xl select-none transition-transform hover:scale-105 duration-300">
            {weatherInfo.icon}
          </div>
        </div>
      </div>

      {/* Grid of Micro-Metrics */}
      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
        <MetricCard
          icon={<Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400" />}
          label="Humidity"
          value={`${current.relative_humidity_2m}%`}
          detail={current.relative_humidity_2m > 65 ? "Humid air" : "Comfortable"}
        />
        <MetricCard
          icon={<Wind className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />}
          label="Wind Speed"
          value={`${Math.round(current.wind_speed_10m)} ${units?.wind_speed_10m || "km/h"}`}
          detail={`Direction: ${Math.round(current.wind_direction_10m || 0)}°`}
        />
        <MetricCard
          icon={<CloudRain className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />}
          label="Precipitation"
          value={`${current.precipitation ?? 0} ${units?.precipitation || "mm"}`}
          detail="In past hour"
        />
        <MetricCard
          icon={<Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />}
          label="Pressure"
          value={`${Math.round(current.surface_pressure || 1013)} hPa`}
          detail="Sea level avg"
        />
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value, detail }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:shadow-lg">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 shadow-inner group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
      </div>
      <div className="mt-2.5">
        <p className="text-base sm:text-lg font-bold text-white tracking-tight">{value}</p>
        {detail && <p className="mt-0.5 text-[11px] text-slate-400/90 truncate">{detail}</p>}
      </div>
    </div>
  );
}
