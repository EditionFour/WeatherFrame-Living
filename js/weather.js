const LAT = 52.0606;
const LON = 9.2603;

async function loadWeather() {

    const url =
`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API konnte nicht geladen werden.");
        }

        const data = await response.json();

        console.log("Weather:", data);

        updateCurrent(data);

    } catch (error) {

        console.error(error);

    }

}

function updateCurrent(data) {

    const current = data.current;

    document.getElementById("temperature").textContent =
        Math.round(current.temperature_2m) + "°";

    document.getElementById("feelsLike").textContent =
        Math.round(current.apparent_temperature) + "°";

    document.getElementById("humidity").textContent =
        current.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
        Math.round(current.wind_speed_10m) + " km/h";

}

loadWeather();