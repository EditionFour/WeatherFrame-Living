const LAT = 52.0606;
const LON = 9.2603;

async function loadWeather() {

    const url =
`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=sunrise,sunset&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    updateWeather(data);

}

function weatherIcon(code){

    if(code===0) return "☀️";
    if(code<=3) return "⛅";
    if(code<=48) return "☁️";
    if(code<=67) return "🌧";
    if(code<=77) return "❄️";
    if(code<=82) return "🌦";
    if(code<=99) return "⛈";

    return "☁️";

}

function weatherText(code){

    if(code===0) return "Sonnig";
    if(code<=3) return "Teilweise bewölkt";
    if(code<=48) return "Bewölkt";
    if(code<=67) return "Regen";
    if(code<=77) return "Schnee";
    if(code<=82) return "Schauer";
    if(code<=99) return "Gewitter";

    return "";

}

function updateWeather(data){

    const current=data.current;

    document.getElementById("temperature").innerHTML=
        Math.round(current.temperature_2m)+"°";

    document.getElementById("description").innerHTML=
        weatherText(current.weather_code);

    document.getElementById("weatherIcon").innerHTML=
        weatherIcon(current.weather_code);

    document.getElementById("feelsLike").innerHTML=
        Math.round(current.apparent_temperature)+"°";

    document.getElementById("humidity").innerHTML=
        current.relative_humidity_2m+"%";

    document.getElementById("wind").innerHTML=
        Math.round(current.wind_speed_10m)+" km/h";

    document.getElementById("sunrise").innerHTML=
        data.daily.sunrise[0].substring(11,16);

    document.getElementById("sunset").innerHTML=
        data.daily.sunset[0].substring(11,16);

    const hourly=document.getElementById("hourlyForecast");

    hourly.innerHTML="";

    for(let i=0;i<24;i++){

        const time=data.hourly.time[i].substring(11,16);

        const temp=Math.round(data.hourly.temperature_2m[i]);

        const icon=weatherIcon(data.hourly.weather_code[i]);

        hourly.innerHTML+=`

            <div class="hourCard">

                <h3>${time}</h3>

                <div class="icon">${icon}</div>

                <div class="temp">${temp}°</div>

            </div>

        `;

    }

}

loadWeather();