const LAT = 52.0606;
const LON = 9.2603;

const WEATHER_MAP = {
  0:["clear-day","Klar"],1:["mostly-clear-day","Überwiegend klar"],2:["partly-cloudy-day","Leicht bewölkt"],3:["overcast","Bewölkt"],
  45:["fog","Nebel"],48:["fog","Reifnebel"],51:["drizzle","Leichter Nieselregen"],53:["drizzle","Nieselregen"],
  55:["rain","Starker Nieselregen"],56:["sleet","Gefrierender Nieselregen"],57:["sleet","Starker gefrierender Nieselregen"],
  61:["rain","Leichter Regen"],63:["rain","Regen"],65:["heavy-rain","Starker Regen"],66:["sleet","Gefrierender Regen"],
  67:["sleet","Starker gefrierender Regen"],71:["snow","Leichter Schneefall"],73:["snow","Schneefall"],
  75:["snow","Starker Schneefall"],77:["snow","Schneegriesel"],80:["rain","Leichte Regenschauer"],
  81:["rain","Regenschauer"],82:["heavy-rain","Starke Regenschauer"],85:["snow","Leichte Schneeschauer"],
  86:["snow","Starke Schneeschauer"],95:["thunderstorms","Gewitter"],96:["thunderstorm-hail","Gewitter mit Hagel"],99:["thunderstorm-hail","Starkes Gewitter mit Hagel"]
};

const weatherFor = (code) => WEATHER_MAP[code] || ["overcast", "Unbekannt"];
const REFERENCE_ICONS = {
  "clear-day": "assets/icons/reference/sun.png",
  "mostly-clear-day": "assets/icons/reference/partly-cloudy.png",
  "partly-cloudy-day": "assets/icons/reference/partly-cloudy.png",
  "overcast": "assets/icons/reference/cloud.png",
  "drizzle": "assets/icons/reference/rain.png",
  "rain": "assets/icons/reference/rain.png",
  "heavy-rain": "assets/icons/reference/heavy-rain.png",
  "thunderstorm-hail": "assets/icons/reference/thunderstorm-hail.png"
};
function iconPath(name, isDay = 1) {
  if (!Number(isDay)) {
    if (name === "clear-day") return "assets/icons/reference/clear-night.png";
    if (name === "mostly-clear-day" || name === "partly-cloudy-day") return "assets/icons/reference/partly-cloudy-night.png";
  }
  return REFERENCE_ICONS[name] || `assets/icons/weather/${name}.svg`;
}
const formatTime = (value) => value.slice(11, 16);
const formatDay = (value) => new Date(`${value}T12:00`).toLocaleDateString("de-DE", { weekday: "short" });
const formatDate = (value) => new Date(`${value}T12:00`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
const formatMoonDate = (value) => value.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", timeZone: "Europe/Berlin" });

function windCompass(degrees) {
  return ["N","NO","O","SO","S","SW","W","NW"][Math.round(degrees / 45) % 8];
}

function moonData(date = new Date()) {
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const lunarCycle = 29.53058867;
  const age = ((date - knownNewMoon) / 86400000 % lunarCycle + lunarCycle) % lunarCycle;
  const phase = age < 1.85 || age >= 27.68 ? ["moon-new", "Neumond"]
    : age < 7.38 ? ["moon-waxing-crescent", "Zunehmender Mond"]
    : age < 9.23 ? ["moon-first-quarter", "Erstes Viertel"]
    : age < 14.77 ? ["moon-waxing-gibbous", "Zunehmender Mond"]
    : age < 16.61 ? ["moon-full", "Vollmond"]
    : age < 22.15 ? ["moon-waning-gibbous", "Abnehmender Mond"]
    : age < 24 ? ["moon-last-quarter", "Letztes Viertel"]
    : ["moon-waning-crescent", "Abnehmender Mond"];

  function nextEvent(targetAge) {
    let daysUntil = (targetAge - age + lunarCycle) % lunarCycle;
    if (daysUntil < 0.01) daysUntil = lunarCycle;
    return new Date(date.getTime() + daysUntil * 86400000);
  }

  return {
    icon: phase[0],
    label: phase[1],
    nextFullMoon: nextEvent(lunarCycle / 2),
    nextNewMoon: nextEvent(0)
  };
}

function renderHourly(hourly, currentTime) {
  const container = document.getElementById("hourlyForecast");
  const currentHour = `${currentTime.slice(0, 13)}:00`;
  let start = hourly.time.findIndex((time) => time >= currentHour);
  if (start < 0) start = 0;

  container.replaceChildren();
  hourly.time.slice(start, start + 16).forEach((time, offset) => {
    if (offset % 2 !== 0) return;

    const index = start + offset;
    const [icon, label] = weatherFor(hourly.weather_code[index]);
    const card = document.createElement("article");
    card.className = offset === 0 ? "hourCard isCurrent" : "hourCard";
    card.setAttribute("aria-label", `${formatTime(time)}, ${label}, ${Math.round(hourly.temperature_2m[index])} Grad`);
    card.innerHTML = `<time>${offset === 0 ? "Jetzt" : formatTime(time)}</time><img src="${iconPath(icon, hourly.is_day[index])}" alt=""><strong>${Math.round(hourly.temperature_2m[index])}°</strong>`;
    container.appendChild(card);
  });
}

function renderDaily(daily) {
  const container = document.getElementById("dailyForecast");
  container.replaceChildren();

  daily.time.slice(0, 10).forEach((day, index) => {
    const [icon, label] = weatherFor(daily.weather_code[index]);
    const card = document.createElement("article");
    card.className = "dayCard";
    card.setAttribute("aria-label", `${formatDay(day)}, ${label}, ${Math.round(daily.temperature_2m_max[index])} bis ${Math.round(daily.temperature_2m_min[index])} Grad`);
    card.innerHTML = `<strong>${index === 0 ? "Heute" : formatDay(day)}</strong><time>${formatDate(day)}</time><img src="${iconPath(icon)}" alt=""><p>${Math.round(daily.temperature_2m_max[index])}° <small>/ ${Math.round(daily.temperature_2m_min[index])}°</small></p>`;
    container.appendChild(card);
  });
}

async function loadWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=10&timezone=Europe%2FBerlin`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo antwortet mit ${response.status}`);
    const data = await response.json();
    const current = data.current;
    const [icon, label] = weatherFor(current.weather_code);
    const moon = moonData();

    document.getElementById("weatherIcon").src = iconPath(icon, current.is_day);
    document.getElementById("description").textContent = label;
    document.getElementById("temperature").textContent = `${Math.round(current.temperature_2m)}°`;
    document.getElementById("feelsLike").textContent = `${Math.round(current.apparent_temperature)}°`;
    document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
    document.getElementById("wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById("windDirection").textContent = windCompass(current.wind_direction_10m);
    document.getElementById("precipitation").textContent = `${current.precipitation.toFixed(1)} mm`;
    document.getElementById("sunrise").textContent = formatTime(data.daily.sunrise[0]);
    document.getElementById("sunset").textContent = formatTime(data.daily.sunset[0]);
    document.getElementById("moonIcon").src = `assets/icons/reference/${moon.icon}.png`;
    document.getElementById("moonPhase").textContent = moon.label;
    document.getElementById("nextFullMoon").textContent = `Vollmond: ${formatMoonDate(moon.nextFullMoon)}`;
    document.getElementById("nextNewMoon").textContent = `Neumond: ${formatMoonDate(moon.nextNewMoon)}`;

    renderHourly(data.hourly, current.time);
    renderDaily(data.daily);
    updateBackground(current.weather_code, current.time, data.daily.sunrise[0], data.daily.sunset[0]);
  } catch (error) {
    console.error("Wetterdaten konnten nicht geladen werden:", error);
    document.getElementById("weatherIcon").src = iconPath("overcast");
    document.getElementById("description").textContent = "Wetterdaten momentan nicht verfügbar";
  }
}

loadWeather();
setInterval(loadWeather, 600000);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) loadWeather();
});

window.addEventListener("online", loadWeather);
