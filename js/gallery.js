const BACKGROUNDS = {
  clear: "assets/photos/weather-clear-day.jpg",
  rain: "assets/photos/weather-rain.jpg",
  sunset: "assets/photos/weather-sunset-autumn.jpg",
  night: "assets/photos/weather-night-winter.jpg"
};

const CUSTOM_PHOTO_MANIFEST = "assets/photos/custom/manifest.json";

function photoContext(weatherCode, currentTime, sunrise, sunset) {
  const month = Number(currentTime.slice(5, 7));
  const hour = Number(currentTime.slice(11, 13));
  const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
  const snowCodes = [71, 73, 75, 77, 85, 86];
  const stormCodes = [95, 96, 99];

  const season = month >= 3 && month <= 5 ? "spring"
    : month >= 6 && month <= 8 ? "summer"
    : month >= 9 && month <= 11 ? "autumn"
    : "winter";
  const daytime = currentTime < sunrise || currentTime >= sunset ? "night"
    : hour < 10 ? "morning"
    : hour < 17 ? "midday"
    : "evening";
  const weather = stormCodes.includes(weatherCode) ? "storm"
    : snowCodes.includes(weatherCode) ? "snow"
    : rainCodes.includes(weatherCode) ? "rain"
    : [45, 48].includes(weatherCode) ? "fog"
    : weatherCode === 3 ? "cloudy"
    : "clear";

  return { season, daytime, weather };
}

function builtInBackground(weatherCode, currentTime, sunrise, sunset) {
  const context = photoContext(weatherCode, currentTime, sunrise, sunset);
  const sunsetTime = new Date(sunset);
  const now = new Date(currentTime);
  const nearSunset = now >= new Date(sunsetTime.getTime() - 90 * 60 * 1000) && context.daytime !== "night";

  if (context.daytime === "night") return BACKGROUNDS.night;
  if (["rain", "storm"].includes(context.weather)) return BACKGROUNDS.rain;
  if (nearSunset || context.season === "autumn") return BACKGROUNDS.sunset;
  return BACKGROUNDS.clear;
}

function matchingCustomPhoto(images, context, currentTime) {
  const candidates = images.map((image) => {
    let score = 0;
    for (const key of ["season", "daytime", "weather"]) {
      if (image[key] === context[key]) score += 2;
      else if (image[key] !== "any") return null;
    }
    return { image, score };
  }).filter(Boolean);

  if (!candidates.length) return null;
  const bestScore = Math.max(...candidates.map((candidate) => candidate.score));
  const best = candidates.filter((candidate) => candidate.score === bestScore);
  const rotationKey = currentTime.slice(0, 13);
  const hash = rotationKey.split("").reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 7);
  return best[hash % best.length].image.file;
}

async function customBackground(weatherCode, currentTime, sunrise, sunset) {
  try {
    const response = await fetch(`${CUSTOM_PHOTO_MANIFEST}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    const manifest = await response.json();
    if (!manifest.images || !Array.isArray(manifest.images)) return null;
    return matchingCustomPhoto(manifest.images, photoContext(weatherCode, currentTime, sunrise, sunset), currentTime);
  } catch (error) {
    return null;
  }
}

async function updateBackground(weatherCode, currentTime, sunrise, sunset) {
  const background = document.getElementById("background");
  const custom = await customBackground(weatherCode, currentTime, sunrise, sunset);
  const image = custom || builtInBackground(weatherCode, currentTime, sunrise, sunset);
  const preload = new Image();

  preload.onload = () => {
    background.style.backgroundImage = `url("${image}")`;
  };
  preload.src = image;
}
