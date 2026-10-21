import { weatherCodeInfo } from "./CurrentWeather";
import { Droplet, Clock } from "lucide-react";

export default function HourlyForecast({ hourly, unit = "C" }) {
  if (!hourly?.time || hourly.time.length === 0) return null;

  const now = new Date();
  const items = [];
  const total = hourly.time.length;

  let startIndex = 0;
  for (let i = 0; i < total; i++) {
    const itemDate = new Date(hourly.time[i]);
    if (itemDate >= now) {
      startIndex = Math.max(0, i - 1);
      break;
    }
  }

  const sliceEnd = Math.min(startIndex + 24, total);

  for (let i = startIndex; i < sliceEnd; i++) {
    items.push({
      time: hourly.time[i],
      temp: hourly.temperature_2m[i],
      code: hourly.weather_code[i],
      rainProb: hourly.precipitation_probability[i],
      isNow: i === startIndex,
    });
  }

  const convertTemp = (val) => {
    if (val === undefined || val === null) return "--";
    if (unit === "F") return Math.round((val * 9) / 5 + 32);
    return Math.round(val);
  };

  return (
    <section className="rounded-3xl border border-white/15 bg-slate-900/40 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-sky-400" />
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-white uppercase tracking-wider">
            Hourly Outlook
          </h3>
        </div>
        <span className="text-xs font-medium text-slate-400">Next 24 Hours</span>
      </div>

      <div className="custom-scrollbar mt-4 flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1">
        {items.map((item) => {
          const date = new Date(item.time);
          const timeLabel = item.isNow
            ? "Now"
            : date.toLocaleTimeString([], { hour: "numeric", hour12: true });
          const info = weatherCodeInfo[item.code] || { icon: "🌤️" };

          return (
            <div
              key={item.time}
              className={`flex min-w-[4.6rem] sm:min-w-[5.2rem] flex-col items-center justify-between rounded-2xl border p-3 sm:p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                item.isNow
                  ? "border-sky-400/80 bg-gradient-to-b from-sky-500/25 to-blue-600/15 shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/40"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <span className={`text-[11px] sm:text-xs font-semibold ${item.isNow ? "text-sky-300" : "text-slate-400"}`}>
                {timeLabel}
              </span>

              <span className="my-2 text-2xl sm:text-3xl select-none filter drop-shadow">
                {info.icon}
              </span>

              <span className="text-sm sm:text-base font-extrabold text-white">
                {convertTemp(item.temp)}°
              </span>

              {item.rainProb > 0 ? (
                <div className="mt-1.5 flex items-center gap-0.5 rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                  <Droplet className="h-2.5 w-2.5 fill-sky-300" />
                  <span>{item.rainProb}%</span>
                </div>
              ) : (
                <div className="mt-1.5 h-4 text-[10px] text-slate-600 font-mono">-</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
