import { weatherCodeInfo } from "./CurrentWeather";
import { Droplet, CalendarDays } from "lucide-react";

export default function ForecastCard({ daily, unit = "C" }) {
  if (!daily?.time || daily.time.length === 0) return null;

  const convertTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return "--";
    if (unit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  // Calculate week-wide min and max for proportional temperature bars
  const weekMin = Math.min(...daily.temperature_2m_min);
  const weekMax = Math.max(...daily.temperature_2m_max);
  const weekRange = weekMax - weekMin || 1;

  return (
    <section className="rounded-3xl border border-white/15 bg-slate-900/40 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-sky-400" />
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
            7-Day Extended Forecast
          </h3>
        </div>
        <span className="text-xs font-medium text-slate-400">Min — Max Temperature</span>
      </div>

      <div className="divide-y divide-white/5 pt-2">
        {daily.time.map((date, index) => {
          const dateObj = new Date(`${date}T12:00:00`);
          const code = daily.weather_code[index];
          const info = weatherCodeInfo[code] || { label: "Clear", icon: "☀️" };
          const rainProb = daily.precipitation_probability_max?.[index] ?? 0;
          const minTempC = daily.temperature_2m_min[index];
          const maxTempC = daily.temperature_2m_max[index];
          const todayCard = isToday(date);

          // Calculate bar position & width
          const leftPercent = Math.max(0, Math.min(100, ((minTempC - weekMin) / weekRange) * 100));
          const widthPercent = Math.max(12, Math.min(100 - leftPercent, ((maxTempC - minTempC) / weekRange) * 100));

          return (
            <div
              key={date}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-3 rounded-2xl transition duration-150 hover:bg-white/5 ${
                todayCard ? "bg-white/5 font-semibold" : ""
              }`}
            >
              {/* Day Label & Date */}
              <div className="flex items-center justify-between sm:justify-start sm:w-44 gap-3">
                <span className={`text-sm sm:text-base ${todayCard ? "text-sky-300 font-bold" : "text-white"}`}>
                  {todayCard ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-xs text-slate-400">
                  {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>

              {/* Weather Condition Icon & Rain Probability */}
              <div className="flex items-center justify-between sm:justify-start gap-4 sm:w-48">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl select-none filter drop-shadow">
                    {info.icon}
                  </span>
                  <span className="text-xs font-medium text-slate-300 hidden md:inline truncate max-w-[100px]">
                    {info.label}
                  </span>
                </div>

                {rainProb > 0 ? (
                  <div className="flex items-center gap-1 text-xs font-semibold text-sky-400">
                    <Droplet className="h-3 w-3 fill-sky-400" />
                    <span>{rainProb}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">-</span>
                )}
              </div>

              {/* Visual Temperature Range Bar */}
              <div className="flex items-center gap-3 flex-1 sm:max-w-md">
                <span className="w-10 text-right text-xs font-bold text-slate-400">
                  {convertTemp(minTempC)}°
                </span>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400 shadow-sm"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="w-10 text-left text-xs font-bold text-white">
                  {convertTemp(maxTempC)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
