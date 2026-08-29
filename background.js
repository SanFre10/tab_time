let activeTab = null;
let startTime = null;

let dailyStats = {};
let siteSettings = {};

browser.storage.local.get(["dailyStats", "siteSettings"]).then(res => {
    if (res.dailyStats) {
        dailyStats = JSON.parse(res.dailyStats);
    }
    if (res.siteSettings) {
        siteSettings = JSON.parse(res.siteSettings);
    }
});

function persistStats() {
    browser.storage.local.set({ dailyStats: JSON.stringify(dailyStats) });
}

function persistSiteSettings() {
    browser.storage.local.set({ siteSettings: JSON.stringify(siteSettings) });
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
            time: current + elapsed,
        };
        if (activeTab.favIconUrl) {
            siteSettings[currentHost] = {
                ...siteSettings[currentHost] || {},
                icon: activeTab.favIconUrl,
            };
            persistSiteSettings();
        }

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
        visited: currentVisited + 1,
    };
    if (tab.favIconUrl) {
        siteSettings[currentHost] = {
            ...siteSettings[currentHost] || {},
            icon: tab.favIconUrl,
        };
        persistSiteSettings();
    }
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
        saveTime();
        const date = message.date || getCurrentDate();
        const todayStats = dailyStats[date] ? Object.entries(dailyStats[date]) : [];
        const timeSpent = todayStats.map(([hostname, entry]) => ({
            ...entry,
            icon: siteSettings[hostname]?.icon || "",
            hostname
        }));
        sendResponse({ timeSpent });
        startTimer(activeTab);
        return true;
    }
});
