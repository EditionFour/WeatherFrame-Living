const app = document.getElementById("app");

const isTizenTV = /Tizen|SMART-TV|SamsungBrowser\/TV/i.test(navigator.userAgent);

if (isTizenTV) {
  document.documentElement.classList.add("tizen-tv");
  document.querySelector('meta[name="viewport"]').setAttribute("content", "width=1920, user-scalable=no");
}

app.innerHTML = `
  <div id="background" aria-hidden="true"></div>
  <div id="overlay" aria-hidden="true"></div>

  <main class="dashboard">
    <header class="topbar glass">
      <div class="location">
        <h1><span class="locationMark" aria-hidden="true"></span>Grießem</h1>
        <p id="date"></p>
      </div>
      <time id="clock" class="clock"></time>
    </header>

    <section class="hero glass" aria-label="Aktuelles Wetter">
      <div class="currentWeather">
        <img id="weatherIcon" class="weatherIcon" src="assets/icons/reference/sun.png" alt="">
        <div>
          <div id="temperature" class="temperature" aria-live="polite">--°</div>
          <div id="description" class="description" role="status">Wetter wird geladen…</div>
        </div>
      </div>

      <div class="weatherDetails">
        <div class="detail"><img src="assets/icons/weather-details/thermometer.svg" alt=""><p>Gefühlt<strong id="feelsLike">--°</strong></p></div>
        <div class="detail"><img src="assets/icons/weather-details/humidity.svg" alt=""><p>Luftfeuchtigkeit<strong id="humidity">--%</strong></p></div>
        <div class="detail"><img src="assets/icons/weather-details/wind.svg" alt=""><p>Wind<strong id="wind">-- km/h</strong><small id="windDirection">--</small></p></div>
        <div class="detail"><img src="assets/icons/weather-details/raindrop-measure.svg" alt=""><p>Niederschlag<strong id="precipitation">-- mm</strong></p></div>
      </div>

      <div class="astroDetails">
        <div><img src="assets/icons/weather-details/sunrise.svg" alt=""><p>Sonnenaufgang<strong id="sunrise">--:--</strong></p></div>
        <div><img src="assets/icons/weather-details/sunset.svg" alt=""><p>Sonnenuntergang<strong id="sunset">--:--</strong></p></div>
        <div class="moonDetail">
          <img id="moonIcon" src="assets/icons/reference/moon-new.png" alt="">
          <p>Mondphase<strong id="moonPhase">--</strong><small class="moonDates"><span id="nextFullMoon">Vollmond: --.--.</span><span id="nextNewMoon">Neumond: --.--.</span></small></p>
        </div>
      </div>
    </section>

    <section class="forecast hourlyPanel glass" aria-labelledby="hourlyTitle">
      <h2 id="hourlyTitle">16-Stunden-Vorhersage</h2>
      <div id="hourlyForecast" class="forecastRow"></div>
    </section>

    <section class="forecast dailyPanel glass" aria-labelledby="dailyTitle">
      <h2 id="dailyTitle">10-Tage-Vorhersage</h2>
      <div id="dailyForecast" class="forecastRow"></div>
    </section>
  </main>
`;

function updateClock() {
  const now = new Date();
  const clock = document.getElementById("clock");

  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
  document.getElementById("date").textContent = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin"
  });
}

updateClock();
setInterval(updateClock, 1000);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateClock();
});
