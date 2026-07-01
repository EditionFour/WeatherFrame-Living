const app = document.getElementById("app");

app.innerHTML = `
<div class="dashboard">

    <header class="topbar glass">

        <div>
            <div class="location">📍 Grießem</div>
            <div class="date" id="date">Lädt...</div>
        </div>

        <div class="clock" id="clock">--:--</div>

    </header>

    <main class="hero">

        <section class="photo glass">

            <div class="overlay">

                <div class="weather-icon" id="weatherIcon">☀️</div>

                <div class="temperature" id="temperature">--°</div>

                <div class="condition" id="condition">
                    Wetter wird geladen...
                </div>

            </div>

        </section>

        <aside class="sidebar">

            <div class="card glass">

                <h3>Heute</h3>

                <p>🌡 Gefühlte Temperatur: <span id="feelsLike">--°</span></p>

                <p>💨 Wind: <span id="wind">-- km/h</span></p>

                <p>💧 Luftfeuchtigkeit: <span id="humidity">-- %</span></p>

                <p>🌅 Sonnenaufgang: <span id="sunrise">--:--</span></p>

                <p>🌇 Sonnenuntergang: <span id="sunset">--:--</span></p>

            </div>

        </aside>

    </main>

    <footer class="forecast glass" id="forecast">

        Wettervorhersage wird geladen...

    </footer>

</div>
`;