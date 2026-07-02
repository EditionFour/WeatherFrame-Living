const LAT = 52.0606;
const LON = 9.2603;

const WEATHER_MAP = {
  0:{icon:"☀️",text:"Klar"},
  1:{icon:"🌤️",text:"Überwiegend klar"},
  2:{icon:"⛅",text:"Teilweise bewölkt"},
  3:{icon:"☁️",text:"Bewölkt"},
  45:{icon:"🌫️",text:"Nebel"},
  48:{icon:"🌫️",text:"Raureif"},
  51:{icon:"🌦️",text:"Nieselregen"},
  61:{icon:"🌦️",text:"Leichter Regen"},
  63:{icon:"🌧️",text:"Regen"},
  65:{icon:"🌧️",text:"Starker Regen"},
  71:{icon:"❄️",text:"Schnee"},
  80:{icon:"🌦️",text:"Regenschauer"},
  95:{icon:"⛈️",text:"Gewitter"}
};

async function loadWeather(){
 const url=`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=auto`;
 try{
  const res=await fetch(url);
  if(!res.ok) throw new Error("API Fehler");
  const data=await res.json();
  const c=data.current;
  const w=WEATHER_MAP[c.weather_code]||{icon:"❔",text:"Unbekannt"};
  document.getElementById("weatherIcon").textContent=w.icon;
  document.getElementById("description").textContent=w.text;
  document.getElementById("temperature").textContent=Math.round(c.temperature_2m)+"°";
  document.getElementById("feelsLike").textContent=Math.round(c.apparent_temperature)+"°";
  document.getElementById("humidity").textContent=c.relative_humidity_2m+"%";
  document.getElementById("wind").textContent=Math.round(c.wind_speed_10m)+" km/h";
  document.getElementById("sunrise").textContent=new Date(data.daily.sunrise[0]).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
  document.getElementById("sunset").textContent=new Date(data.daily.sunset[0]).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
 }catch(e){
  console.error(e);
  document.getElementById("description").textContent="Wetterdaten konnten nicht geladen werden.";
 }
}
loadWeather();
setInterval(loadWeather,600000);
