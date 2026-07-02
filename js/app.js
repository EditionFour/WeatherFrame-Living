const app = document.getElementById("app");

app.innerHTML = `
<div class="dashboard">

    <header class="topbar glass">

        <div class="location">
            <h2>📍 Grießem</h2>
            <p id="date"></p>
        </div>

        <div id="clock" class="clock"></div>

    </header>

    <section class="hero glass">

        <div class="heroLeft">

            <div id="weatherIcon" class="weatherIcon">
                ☀️
            </div>

            <div>

                <div id="temperature" class="temperature">
                    --
                </div>

                <div id="description" class="description">
                    Wetter wird geladen...
                </div>

            </div>

        </div>

        <div class="heroRight">

            <div class="infoCard">
                <span>🌡️ Gefühlte Temperatur</span>
                <h3 id="feelsLike">--°</h3>
            </div>

            <div class="infoCard">
                <span>💧 Luftfeuchtigkeit</span>
                <h3 id="humidity">--%</h3>
            </div>

            <div class="infoCard">
                <span>💨 Wind</span>
                <h3 id="wind">-- km/h</h3>
            </div>

            <div class="infoCard">
                <span>🌅 Sonnenaufgang</span>
                <h3 id="sunrise">--:--</h3>
            </div>

            <div class="infoCard">
                <span>🌇 Sonnenuntergang</span>
                <h3 id="sunset">--:--</h3>
            </div>

        </div>

    </section>

    <section class="glass hourly">

        <h2>Heute</h2>

        <div id="hourlyForecast" class="hourlyForecast">

        </div>

    </section>

</div>
`;

function updateClock() {

    const now = new Date();

    document.getElementById("clock").innerHTML =
        now.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
        });

    document.getElementById("date").innerHTML =
        now.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

}

updateClock();
setInterval(updateClock, 1000);