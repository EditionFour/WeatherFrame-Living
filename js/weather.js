const LAT = 52.0436;
const LON = 9.2478;

async function loadWeather() {

    try {

        const url =
`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Fehler beim Laden der Wetterdaten");
        }

        const data = await response.json();

        document.getElementById("temperature").textContent =
            Math.round(data.current.temperature_2m) + "°";

        document.getElementById("feelsLike").textContent =
            Math.round(data.current.apparent_temperature) + "°";

        document.getElementById("wind").textContent =
            Math.round(data.current.wind_speed_10m) + " km/h";

        document.getElementById("humidity").textContent =
            data.current.relative_humidity_2m + " %";

        document.getElementById("sunrise").textContent =
            data.daily.sunrise[0].substring(11,16);

        document.getElementById("sunset").textContent =
            data.daily.sunset[0].substring(11,16);

        const code = data.current.weather_code;

        let icon = "☀️";
        let text = "Sonnig";

        if ([1,2].includes(code)) {
            icon = "🌤️";
            text = "Leicht bewölkt";
        }

        if (code === 3) {
            icon = "☁️";
            text = "Bewölkt";
        }

        if ([51,53,55,61,63,65,80,81,82].includes(code)) {
            icon = "🌧️";
            text = "Regen";
        }

        if ([71,73,75,85,86].includes(code)) {
            icon = "❄️";
            text = "Schnee";
        }

        if ([95,96,99].includes(code)) {
            icon = "⛈️";
            text = "Gewitter";
        }

        document.getElementById("weatherIcon").textContent = icon;
        document.getElementById("condition").textContent = text;

        const weekdays = ["So","Mo","Di","Mi","Do","Fr","Sa"];

        let html = "";

        for (let i = 0; i < 7; i++) {

            const day = new Date(data.daily.time[i]);

            html += `
                <div>
                    ${weekdays[day.getDay()]}<br><br>
                    ${Math.round(data.daily.temperature_2m_max[i])}°<br>
                    ${Math.round(data.daily.temperature_2m_min[i])}°
                </div>
            `;
        }

        document.getElementById("forecast").innerHTML = html;

    }

    catch(error){

        console.error(error);

        document.getElementById("condition").textContent =
            "Wetterdaten konnten nicht geladen werden.";

    }

}

loadWeather();