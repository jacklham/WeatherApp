const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeather = document.querySelector(".hourly-weather .weather-list");

const API_KEY = "de32de8e7e1c41c292214307240309"; // API key

const weatherCodes = {
  clear: [1000],
  clouds: [1003, 1006, 1009],
  mist: [1030, 1135, 1147],
  rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
  moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
  snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
};

const displayHourlyForecast = (hourlyData) => {
  hourlyWeather.innerHTML = hourlyData.slice(0, 24).map(({ time, temp_c, condition }) => {
    const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(condition.code));
    return `<li class="weather-item">
              <p class="time">${time.split(' ')[1].substring(0, 5)}</p>
              <img src="assets/images/icons/${weatherIcon}.svg" class="weather-icon">
              <p class="temperature">${Math.floor(temp_c)}°</p>
            </li>`;
  }).join('');
};

const getWeatherDetails = async (API_URL) => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const { temp_c, condition, wind_kph, humidity, cloud } = data.current;
    const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(condition.code));

    // Update current weather display
    currentWeatherDiv.querySelector(".weather-icon").src = `assets/images/icons/${weatherIcon}.svg`;
    currentWeatherDiv.querySelector(".temperature").innerHTML = `${Math.floor(temp_c)}<span>°C</span>`;
    currentWeatherDiv.querySelector(".description").innerText = condition.text;
    currentWeatherDiv.querySelector(".city-name").innerText = data.location.name;
    //currentWeatherDiv.querySelector(".country-flag").src = `https://flagcdn.com/144x108/${data?.location?.sys?.country.toLowerCase()}.png`;; // Example flag API

    // Update parameter values
    document.querySelector("[data-windspeed]").innerText = `${wind_kph} km/h`;
    document.querySelector("[data-humidity]").innerText = `${humidity}%`;
    document.querySelector("[data-cloudiness]").innerText = `${cloud}%`;

    const combinedHourlyData = [...data.forecast.forecastday[0].hour, ...data.forecast.forecastday[1].hour];
    searchInput.value = data.location.name;
    displayHourlyForecast(combinedHourlyData);
  } catch {
    document.body.classList.add("show-no-results");
  }
};

const setupWeatherRequest = (cityName) => {
  const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
  getWeatherDetails(API_URL);
};

searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && searchInput.value.trim()) {
    setupWeatherRequest(searchInput.value.trim());
  }
});

locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
    setupWeatherRequest(`${latitude},${longitude}`);
  }, () => {
    alert("Location access denied. Please enable permissions to use this feature.");
  });
});

setupWeatherRequest("Cairo"); // Initial weather request for Cairo
