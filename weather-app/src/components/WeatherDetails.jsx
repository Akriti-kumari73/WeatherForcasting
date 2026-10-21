import {
  Sunrise,
  Sunset,
  SunMedium,
  Compass,
  Umbrella,
  Wind,
  Sparkles,
} from "lucide-react";

function getWindDirection(deg) {
  if (deg === undefined || deg === null) return "N/A";
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function getUVLevel(uv) {
  if (uv === undefined || uv === null) return { text: "N/A", color: "text-slate-400", badgeBg: "bg-slate-500/20" };
  if (uv <= 2) return { text: "Low", color: "text-emerald-400", badgeBg: "bg-emerald-500/20" };
  if (uv <= 5) return { text: "Moderate", color: "text-amber-400", badgeBg: "bg-amber-500/20" };
  if (uv <= 7) return { text: "High", color: "text-orange-400", badgeBg: "bg-orange-500/20" };
  if (uv <= 10) return { text: "Very High", color: "text-rose-400", badgeBg: "bg-rose-500/20" };
  return { text: "Extreme", color: "text-purple-400", badgeBg: "bg-purple-500/20" };
}

export default function WeatherDetails({ current, daily }) {
  if (!daily) return null;

  const sunrise = daily.sunrise?.[0]
    ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const sunset = daily.sunset?.[0]
    ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const uvMax = daily.uv_index_max?.[0] ?? 0;
  const uvLevel = getUVLevel(uvMax);
  const rainProb = daily.precipitation_probability_max?.[0] ?? 0;
  const rainSum = daily.precipitation_sum?.[0] ?? 0;
  const windDir = getWindDirection(current?.wind_direction_10m);
  const maxWind = daily.wind_speed_10m_max?.[0];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-sky-400" />
        <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
          Today's Meteorological Highlights
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sun Schedule */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-2xl transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Sun Schedule
            </span>
            <Sunrise className="h-4 w-4 text-amber-300" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
              <div className="flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-slate-300">Sunrise</span>
              </div>
              <span className="text-sm font-bold text-white">{sunrise}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
              <div className="flex items-center gap-2">
                <Sunset className="h-4 w-4 text-orange-400" />
                <span className="text-xs text-slate-300">Sunset</span>
              </div>
              <span className="text-sm font-bold text-white">{sunset}</span>
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-2xl transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              UV Index
            </span>
            <SunMedium className="h-4 w-4 text-amber-400" />
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black text-white">{uvMax}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${uvLevel.color} ${uvLevel.badgeBg}`}
              >
                {uvLevel.text}
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-700"
                style={{ width: `${Math.min((uvMax / 11) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-slate-400">
              {uvMax >= 6 ? "Sun protection strongly advised." : "Safe daytime sun exposure."}
            </p>
          </div>
        </div>

        {/* Precipitation Chance */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-2xl transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Rain Chance
            </span>
            <Umbrella className="h-4 w-4 text-sky-400" />
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black text-white">{rainProb}%</span>
              <span className="text-xs font-medium text-slate-400">
                Sum: <strong className="text-white">{rainSum} mm</strong>
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-700"
                style={{ width: `${rainProb}%` }}
              />
            </div>
            <p className="mt-2.5 text-xs text-slate-400">
              {rainProb > 40 ? "Rain or showers likely today." : "No significant rainfall expected."}
            </p>
          </div>
        </div>

        {/* Wind & Peak Gusts */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-2xl transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Wind & Direction
            </span>
            <Compass className="h-4 w-4 text-teal-400" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-white">
                {Math.round(current?.wind_speed_10m ?? 0)}
              </span>
              <span className="text-xs font-semibold text-slate-400">km/h</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Direction:</span>
              <span className="font-bold text-white">
                {windDir} ({Math.round(current?.wind_direction_10m ?? 0)}°)
              </span>
            </div>

            {maxWind !== undefined && (
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-1.5">
                <span>Peak gust:</span>
                <span className="font-semibold text-white">{Math.round(maxWind)} km/h</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
