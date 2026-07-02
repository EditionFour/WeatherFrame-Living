function updateClock() {

    const now = new Date();

    const clock = document.getElementById("clock");
    const date = document.getElementById("date");

    if (!clock || !date) return;

    clock.textContent = now.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    date.textContent = now.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

}

updateClock();

setInterval(updateClock, 1000);