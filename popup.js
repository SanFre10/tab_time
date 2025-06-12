function formatTime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(ms / 1000 / 60 / 60);
    return `${hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""}
            ${minutes > 0 ? `${minutes.toString().padStart(2, "0")}:` : ""}
            ${seconds.toString().padStart(2, "0")}`;
}

function updateTimer() {
    browser.runtime.sendMessage({ command: "getTime" }).then(response => {
        const list = document.getElementById("timer-list");
        list.innerHTML = "";

        const sortedTimes = response.timeSpent.toSorted((a, b) => b.time - a.time);
        for (const item of sortedTimes) {
            const li = document.createElement("li");

            const iconWrapper = document.createElement("div");
            iconWrapper.className = "icon-wrapper";

            const icon = document.createElement("img");
            icon.src = item.icon || "";
            iconWrapper.appendChild(icon);

            const content = document.createElement("div");
            content.className = "time-text";

            const time = document.createElement("div");
            time.textContent = formatTime(item.time);

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
    });
}

// Update every second
setInterval(updateTimer, 1000);
updateTimer();
