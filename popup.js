function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    return `${hours > 0 ? `${hours.toString().padStart(2, "0")} :` : ""}
            ${minutes > 0 ? `${minutes.toString().padStart(2, "0")} :` : ""}
            ${seconds.toString().padStart(2, "0")}`;
}

const today = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
};

let selectedDate = today()

function updateDateDisplay() {
    document.getElementById('current-date').textContent = selectedDate
    const nextBtn = document.getElementById('next-date');
    nextBtn.disabled = selectedDate >= today();
}

function changeDate(days) {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    selectedDate = date.toISOString().split('T')[0];
    updateDateDisplay();
    updateTimer();
}

document.getElementById('prev-date').addEventListener('click', () => changeDate(-1));
document.getElementById('next-date').addEventListener('click', () => changeDate(1));

function updateTimer() {
    browser.runtime.sendMessage({ command: "getTime", date: selectedDate }).then(response => {
        const list = document.getElementById("timer-list");
        list.innerHTML = "";

        let totalTime = 0;
        let totalVisited = 0;

        const sortedTimes = response.timeSpent.toSorted((a, b) => b.time - a.time);
        for (const item of sortedTimes) {
            const li = document.createElement("li");
            li.className = item.active ? "active" : "";

            const iconWrapper = document.createElement("div");
            iconWrapper.className = "icon-wrapper";

            const icon = document.createElement("img");
            icon.src = item.icon || "";
            iconWrapper.appendChild(icon);

            const content = document.createElement("div");
            content.className = "time-text";

            const time = document.createElement("div");
            time.textContent = formatTime(item.time);
            totalTime += item.time;

            const visited = document.createElement("span")
            visited.className = "visited"
            visited.textContent = ` (${item.visited})`
            time.appendChild(visited)
            totalVisited += item.visited;

            const url = document.createElement("div");
            url.className = "url";
            url.textContent = item.hostname || "";
            url.title = item.url || "";

            content.appendChild(time);
            content.appendChild(url);

            li.appendChild(iconWrapper);
            li.appendChild(content);
            list.appendChild(li);
        }

        const total = document.getElementById("total")
        total.textContent = `${formatTime(totalTime)} `
        const span = document.createElement("span")
        span.className = "visited"
        span.textContent = `(${totalVisited})`
        total.appendChild(span)
    });
}

// Update every second (only if viewing today)
setInterval(() => {
    if (selectedDate === today()) updateTimer();
}, 1000);
updateDateDisplay();
updateTimer();
