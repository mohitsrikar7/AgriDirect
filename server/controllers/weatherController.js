const axios = require("axios");

exports.getWeatherByLocation = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and Longitude required" });
    }

    const apiKey = process.env.WEATHER_API_KEY;

    // 🔥 1️⃣ Get current weather (for dashboard display)
const currentWeather = await axios.get(
  `https://api.openweathermap.org/data/2.5/weather`,
  {
    params: {
      lat,
      lon,
      appid: apiKey,
      units: "metric",
    },
  }
);

// 🔥 2️⃣ Get 5-day forecast data (for ML calculations)
const forecastWeather = await axios.get(
  `https://api.openweathermap.org/data/2.5/forecast`,
  {
    params: {
      lat,
      lon,
      appid: apiKey,
      units: "metric",
    },
  }
);

const currentData = currentWeather.data;
const forecastData = forecastWeather.data.list;

// 🔥 Calculate averages
let totalTemp = 0;
let totalHumidity = 0;
let totalRainfall = 0;
let count = forecastData.length;

forecastData.forEach((item) => {
  totalTemp += item.main.temp;
  totalHumidity += item.main.humidity;
  totalRainfall += item.rain ? item.rain["3h"] || 0 : 0;
});

const avgTemperature5Days = totalTemp / count;
const avgHumidity5Days = totalHumidity / count;

res.json({
  location: currentData.name,

  // Current weather (for UI)
  temperature: currentData.main.temp,
  humidity: currentData.main.humidity,
  windSpeed: currentData.wind.speed,
  rainfall: currentData.rain ? currentData.rain["1h"] || 0 : 0,
  condition: currentData.weather[0].description,

  // 🔥 ML-ready climate averages
  avgTemperature5Days: Number(avgTemperature5Days.toFixed(2)),
  avgHumidity5Days: Number(avgHumidity5Days.toFixed(2)),
  totalRainfall5Days: Number(totalRainfall.toFixed(2)),
});
  } catch (error) {
    res.status(500).json({
      message: "Weather fetch failed",
      error: error.message,
    });
  }
};
