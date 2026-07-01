const app = document.getElementById("app");

app.innerHTML = `
<div class="dashboard">

    <header class="topbar glass">
        <div>
            <div class="location">📍 Grießem</div>
            <div class="date" id="date"></div>
        </div>

        <div class="clock" id="clock"></div>
    </header>

    <main class="hero">

        <section class="photo glass">

            <div class="overlay">

                <div class="weather-icon">☀</div>

                <div class="temperature">24°</div>

                <div class="condition">
                    Leicht bewölkt
                </div>

            </div>

        </section>

        <aside class="sidebar">

            <div class="card glass">
                <h3>Heute</h3>

                <p>Wind&nbsp;&nbsp;&nbsp;14 km/h</p>
                <p>Luftfeuchte&nbsp;&nbsp;58%</p>
                <p>UV-Index&nbsp;&nbsp;&nbsp;3</p>
                <p>Sonnenaufgang&nbsp;05:08</p>
                <p>Sonnenuntergang&nbsp;21:47</p>

            </div>

        </aside>

    </main>

    <footer class="forecast glass">

        <div>Do<br>☀<br>27°</div>
        <div>Fr<br>🌤<br>28°</div>
        <div>Sa<br>🌦<br>24°</div>
        <div>So<br>🌧<br>22°</div>
        <div>Mo<br>☀<br>25°</div>
        <div>Di<br>☀<br>26°</div>
        <div>Mi<br>🌤<br>27°</div>

    </footer>

</div>
`;

function updateClock(){

    const now=new Date();

    document.getElementById("clock").innerHTML=
        now.toLocaleTimeString("de-DE",{
            hour:"2-digit",
            minute:"2-digit"
        });

    document.getElementById("date").innerHTML=
        now.toLocaleDateString("de-DE",{
            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"
        });

}

updateClock();

setInterval(updateClock,1000);