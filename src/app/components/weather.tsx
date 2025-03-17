"use client";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { WiHumidity, WiStrongWind } from "react-icons/wi";
import Image from 'next/image';


interface WeatherData {
  location: { name: string; region: string; country: string };
  current: {
    temp_c: number;
    condition: { text: string; icon: string };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    is_day: number; // 1 for day, 0 for night
  };
  forecast: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: { text: string; icon: string };
      };
    }[];
  };
}
const WeatherApp = () => {
  // State management
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);

  // Background themes based on weather conditions and time of day
  const getBackground = (condition: string, isDay: number) => {
    const backgrounds = {
      sunny: isDay
        ? "bg-[url('/sunny.jpg')] bg-cover bg-center"
        : "bg-[url('/night_clear.jpg')] bg-cover bg-center",
      cloudy: isDay
        ? "bg-[url('/cloudy.jpg')] bg-cover bg-center"
        : "bg-[url('/night_Cloud.avif')] bg-cover bg-center",
      rainy: isDay
        ? "bg-[url('/rainy.jpg')] bg-cover bg-center"
        : "bg-[url('/night_Rainy.avif')] bg-cover bg-center",
      snowy: isDay
        ? "bg-[url('/snowy.jpg')] bg-cover bg-center"
        : "bg-[url('/night_snowy.jpg')] bg-cover bg-center",
      stormy: isDay
        ? "bg-[url('/stormy.jpg')] bg-cover bg-center"
        : "bg-[url('/night_stormy.jpg')] bg-cover bg-center",
      foggy: isDay
        ? "bg-[url('/foggy.jpg')] bg-cover bg-center"
        : "bg-[url('/night_foggy.jpg')] bg-cover bg-center",
      default: isDay
        ? "bg-[url('/default.jpg')] bg-cover bg-center"
        : "bg-[url('/night_default.jpg')] bg-cover bg-center",
    };

    if (condition.includes("Sunny") || condition.includes("Clear"))
      return backgrounds.sunny;
    if (condition.includes("Cloudy") || condition.includes("Partly cloudy"))
      return backgrounds.cloudy;
    if (
      condition.includes("Rain") ||
      condition.includes("Drizzle") ||
      condition.includes("Overcast") ||
      condition.includes("Showers")
    )
      return backgrounds.rainy;
    if (condition.includes("Snow") || condition.includes("Sleet"))
      return backgrounds.snowy;
    if (condition.includes("Storm") || condition.includes("Thunder"))
      return backgrounds.stormy;
    if (
      condition.includes("Fog") ||
      condition.includes("Mist") ||
      condition.includes("Haze")
    )
      return backgrounds.foggy;

    return backgrounds.default;
  };

  // Apply dark mode changes
  useEffect(() => {
    document.body.className = isDarkMode
      ? "bg-gray-900 text-white"
      : "bg-gray-100 text-gray-900";
  }, [isDarkMode]);

  // API interaction
  const fetchWeather = async () => {
    if (!location) {
      setError("Please enter a location.");
      return;
    }

    setLoading(true);
    setError("");

    
try {
  const response = await axios.get(
    `http://api.weatherapi.com/v1/forecast.json?key=3e1ae28170e34665a2f65526251603&q=${location}&days=7&aqi=no&alerts=no`
  );
  setWeather(response.data);
} catch {
  setError("Unable to fetch weather data. Please check the location.");
  setWeather(null);
} finally {
  setLoading(false);
}
  };

  // Unit conversion utilities
  const toggleTemperatureUnit = () => setIsCelsius(!isCelsius);
  const convertTemperature = (tempC: number) =>
    isCelsius ? tempC : (tempC * 9) / 5 + 32;

  const Loader = () => (
    <div className="flex justify-center items-center space-x-2">
      <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce"></div>
      <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
      <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce delay-400"></div>
    </div>
  );

  return (
    <main
      className={`min-h-screen w-full flex flex-col items-center justify-start p-8 transition-all duration-500 ${
        weather
          ? getBackground(
              weather.current.condition.text,
              weather.current.is_day
            )
          : isDarkMode
          ? "bg-gray-900"
          : "bg-blue-100"
      }`}
    >
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="md:text-4xl text-2xl font-bold drop-shadow-lg">
          Weather Forecasting
        </h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-600 transition"
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {isDarkMode ? <BsSunFill size={20} /> : <BsMoonFill size={20} />}
        </button>
      </header>

      <section className="w-full max-w-4xl mb-8">
        <form
          className="flex gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            fetchWeather();
          }}
        >
          <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 md:p-3 p-1 border-2 border-gray-400 rounded-lg shadow-sm md:text-2xl text-lg"
            aria-label="Location input"
          />
          <button
            type="submit"
            className={`md:px-6 md:py-3 p-2 rounded-lg shadow-md transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-700"
            } text-white md:text-xl text-sm`}
            disabled={loading}
          >
            {loading ? <Loader /> : "Get Weather"}
          </button>
        </form>
        {error && (
          <p className="text-red-500 font-semibold mt-2" role="alert">
            {error}
          </p>
        )}
      </section>
      {weather && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full text-center max-w-full bg-transparent md:p-6 p-4 rounded-xl shadow-gray-400 mb-6 shadow-lg"
        >
          <section className="w-full text-center max-w-full bg-transparent md:p-6 p-4 rounded-xl shadow-gray-400 mb-6 shadow-lg">
            <header className="mb-4">
              <h2 className="text-3xl font-semibold text-gray-800">
                {weather.location.name}, {weather.location.country}
              </h2>
              {weather.location.region && (
                <p className="text-gray-700">{weather.location.region}</p>
              )}
            </header>

            <article className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-4">
              <Image
      src={weather.current.condition.icon.startsWith('//') ? `https:${weather.current.condition.icon}` : weather.current.condition.icon}
      alt=""
      width={80}
      height={80}
    />
                <div>
                  <p className="md:text-5xl text-3xl font-bold">
                    {convertTemperature(weather.current.temp_c).toFixed(1)}°
                    {isCelsius ? "C" : "F"}
                  </p>
                  <p className="text-xl text-gray-700">
                    {weather.current.condition.text}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center md:gap-2 gap-1 md:mb-2">
                  <WiStrongWind
                    size={24}
                    className="text-black md:size-11 size-7"
                  />
                  <p className="text-gray-700">
                    {weather.current.wind_kph} kph
                  </p>
                </div>
                <div className="flex items-center md:gap-2 gap-1 mb-2">
                  <WiHumidity
                    size={24}
                    className="text-blue-600 md:size-11 size-7"
                  />
                  <p className="text-gray-700">{weather.current.humidity}%</p>
                </div>
                <p className="text-gray-700">
                  Feels like:{" "}
                  {convertTemperature(weather.current.feelslike_c).toFixed(1)}°
                  {isCelsius ? "C" : "F"}
                </p>
              </div>
            </article>
          </section>

          <section className="w-full max-w-full bg-transparent md:p-6 p-4 rounded-xl shadow-xl">
            <header className="flex justify-between items-center mb-4">
              <h3 className="md:text-4xl text-2xl font-semibold">
                7-Day Forecast
              </h3>
              <button
                onClick={toggleTemperatureUnit}
                className="md:px-6 md:py-3 p-2 bg-gray-800 md:text-xl text-sm text-white rounded-lg shadow-md hover:bg-gray-700"
              >
                Switch to °{isCelsius ? "F" : "C"}
              </button>
            </header>

            <ul className="grid grid-cols-2 lg:grid-cols-7 gap-4">
              {weather.forecast.forecastday.map((day, index) => {
                const condition = day.day.condition.text.toLowerCase();
                const isDay = weather.current.is_day;
                let bgClass = "bg-gray-100 bg-opacity-70";
                let icon = day.day.condition.icon;

                if (
                  condition.includes("sunny") ||
                  condition.includes("clear")
                ) {
                  bgClass = isDay
                    ? "bg-yellow-100 bg-opacity-70"
                    : "bg-yellow-900 bg-opacity-70";
                } else if (
                  condition.includes("cloudy") ||
                  condition.includes("overcast")
                ) {
                  bgClass = isDay
                    ? "bg-gray-300 bg-opacity-70"
                    : "bg-gray-700 bg-opacity-70";
                } else if (
                  condition.includes("rain") ||
                  condition.includes("drizzle") ||
                  condition.includes("showers")
                ) {
                  bgClass = isDay
                    ? "bg-blue-200 bg-opacity-70"
                    : "bg-blue-900 bg-opacity-70";
                } else if (
                  condition.includes("snow") ||
                  condition.includes("sleet")
                ) {
                  bgClass = isDay
                    ? "bg-white bg-opacity-70"
                    : "bg-gray-400 bg-opacity-70";
                } else if (
                  condition.includes("storm") ||
                  condition.includes("thunder")
                ) {
                  bgClass = isDay
                    ? "bg-purple-200 bg-opacity-70"
                    : "bg-purple-900 bg-opacity-70";
                } else if (
                  condition.includes("fog") ||
                  condition.includes("mist") ||
                  condition.includes("haze")
                ) {
                  bgClass = isDay
                    ? "bg-gray-400 bg-opacity-70"
                    : "bg-gray-800 bg-opacity-70";
                }

                return (
                  <li
                    key={index}
                    className={`${bgClass} p-3 rounded-lg shadow-md`}
                  >
                    <h4 className="font-medium">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </h4>
                    <Image
          src={icon.startsWith('//') ? `https:${icon}` : icon}
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 mx-auto my-2"
        />
                    <p className="font-medium">
                      {convertTemperature(day.day.maxtemp_c).toFixed(0)}° /{" "}
                      {convertTemperature(day.day.mintemp_c).toFixed(0)}°
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {day.day.condition.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </motion.section>
      )}
    </main>
  );
};

export default WeatherApp;
