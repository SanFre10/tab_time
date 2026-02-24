let activeTab = null;
let startTime = null;

let dailyStats = {};

browser.storage.local.get("dailyStats").then(res => {
    if (res.dailyStats) {
        dailyStats = res.dailyStats;
    }
});

function persistStats() {
    browser.storage.local.set({ dailyStats });
}

const getCurrentDate = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
};

const timeSpentKey = (tab) => new URL(tab.url).hostname || tab.url;

function startTimer(tab) {
    activeTab = tab;
    startTime = Date.now();
}

function saveTime() {
    if (activeTab && startTime) {
        const elapsed = Date.now() - startTime;
        const currentHost = timeSpentKey(activeTab);
        const date = getCurrentDate();

        if (!dailyStats[date]) dailyStats[date] = {};

        const current = dailyStats[date][currentHost]?.time || 0;

        dailyStats[date][currentHost] = {
            ...(dailyStats[date][currentHost] || { visited: 0 }),
            url: activeTab.url,
            hostname: currentHost,
            time: current + elapsed,
        };
        if (activeTab.favIconUrl) dailyStats[date][currentHost].icon = activeTab.favIconUrl;

        startTime = null;
        persistStats();
    }
}

function incrementVisit(tab) {
    const currentHost = timeSpentKey(tab);
    const date = getCurrentDate();

    if (!dailyStats[date]) dailyStats[date] = {};

    const currentVisited = dailyStats[date][currentHost]?.visited || 0;

    dailyStats[date][currentHost] = {
        ...(dailyStats[date][currentHost] || { time: 0 }),
        url: tab.url,
        hostname: currentHost,
        visited: currentVisited + 1,
    };
    if (tab.favIconUrl) dailyStats[date][currentHost].icon = tab.favIconUrl;
    persistStats();
}

async function changeTab(tabId) {
    const tab = await browser.tabs.get(tabId);
    if (tab?.active) {
        saveTime();
        incrementVisit(tab);
        setActive(tab);
        startTimer(tab);
    }
}

function setActive(tab) {
    const date = getCurrentDate();
    if (!dailyStats[date]) return;

    Object.keys(dailyStats[date]).forEach(key => {
        dailyStats[date][key].active = false;
    });

    if (dailyStats[date][timeSpentKey(tab)]) {
        dailyStats[date][timeSpentKey(tab)].active = true;
    }
}

browser.tabs.onActivated.addListener(({ tabId }) => changeTab(tabId));

browser.webNavigation.onCommitted.addListener(({ tabId, frameId }) => {
    if (frameId === 0) changeTab(tabId);
});

browser.webNavigation.onHistoryStateUpdated.addListener(({ tabId, frameId }) => {
    if (frameId === 0) changeTab(tabId);
});

browser.windows.onFocusChanged.addListener(async (windowId) => {
    saveTime();
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
        const [tab] = await browser.tabs.query({ active: true, windowId });
        if (tab) {
            startTimer(tab);
        }
    }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "getTime") {
        saveTime(); // Only update time, not visits
        const date = getCurrentDate();
        const todayStats = dailyStats[date] ? Object.values(dailyStats[date]) : [];
        sendResponse({ timeSpent: todayStats });
        startTimer(activeTab); // Resume timing
        return true;
    }
});
