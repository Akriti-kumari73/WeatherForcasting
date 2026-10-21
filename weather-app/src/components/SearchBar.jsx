import { useEffect, useRef, useState } from "react";
import { searchCities } from "../services/weatherApi";
import { Search, MapPin, X, Loader2, Navigation } from "lucide-react";

export default function SearchBar({
  city,
  setCity,
  onSearch,
  onLocationSelect,
  onGeoLocation,
  loading,
}) {
  const [query, setQuery] = useState(city);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  // Sync internal state when parent city changes
  useEffect(() => {
    setQuery(city);
  }, [city]);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch city suggestions as the user types
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearchingCities(true);
      try {
        const results = await searchCities(val);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSearchingCities(false);
      }
    }, 250);
  };

  const handleKeyDown = (e) => {
    // IME-safe enter-to-submit
    if (e.isComposing || e.keyCode === 229) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        selectCity(suggestions[selectedIndex]);
      } else {
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (!query.trim()) return;
    setCity(query);
    onSearch(query);
  };

  const selectCity = (item) => {
    const displayName = `${item.name}${item.country ? `, ${item.country}` : ""}`;
    setQuery(displayName);
    setCity(displayName);
    setShowSuggestions(false);
    if (onLocationSelect) {
      onLocationSelect(item);
    } else {
      onSearch(displayName);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="group relative flex items-center gap-2 rounded-2xl sm:rounded-3xl border border-white/15 bg-slate-900/40 p-1.5 sm:p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 focus-within:border-sky-400/70 focus-within:bg-slate-900/60 focus-within:ring-4 focus-within:ring-sky-500/20"
      >
        <div className="relative flex flex-1 items-center">
          <label htmlFor="city-search-input" className="sr-only">
            Search city name
          </label>
          <Search className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-sky-400" />

          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search city, district, or country..."
            autoComplete="off"
            className="w-full bg-transparent py-2.5 sm:py-3 pl-11 pr-10 text-sm sm:text-base font-medium text-white outline-none placeholder:text-slate-400/80"
          />

          {isSearchingCities ? (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-sky-400" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              aria-label="Clear search input"
              className="absolute right-2.5 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* GPS Location Button */}
        {onGeoLocation && (
          <button
            type="button"
            onClick={onGeoLocation}
            title="Use current location"
            aria-label="Use current location"
            className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 text-sky-300 transition-all duration-200 hover:scale-105 hover:border-sky-400/40 hover:bg-sky-500/20 hover:text-sky-200 active:scale-95"
          >
            <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}

        {/* Search Submit Button */}
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-200 hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="custom-scrollbar absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-2xl"
        >
          {suggestions.map((item, idx) => (
            <li
              key={`${item.id || item.latitude}-${idx}`}
              role="option"
              aria-selected={idx === selectedIndex}
              onClick={() => selectCity(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 ${
                idx === selectedIndex
                  ? "bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-sky-200"
                  : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-medium text-white">{item.name}</span>
                  {item.admin1 && (
                    <span className="ml-1.5 text-xs text-slate-400">
                      • {item.admin1}
                    </span>
                  )}
                </div>
              </div>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-slate-300">
                {item.country_code || item.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
