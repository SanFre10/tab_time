let activeTab = null;
let startTime = null;
let timeSpent = {};

const timeSpentKey = (tab) => new URL(tab.url).hostname || tab.url;

function startTimer(tab) {
    activeTab = tab;
    startTime = Date.now();
}

function saveTime() {
    if (activeTab && startTime) {
        const elapsed = Date.now() - startTime;

        const currentHost = timeSpentKey(activeTab)
        const current = timeSpent[currentHost]?.time || 0;

        timeSpent[currentHost] = {
            ...(timeSpent[currentHost] || { visited: 0 }),
            url: activeTab.url,
            hostname: currentHost,
            time: current + elapsed,
        };
        if (activeTab.favIconUrl) timeSpent[currentHost].icon = activeTab.favIconUrl;

        startTime = null;
    }
}

function incrementVisit(tab) {
    const currentHost = timeSpentKey(tab)
    const currentVisited = timeSpent[currentHost]?.visited || 0;

    timeSpent[currentHost] = {
        ...(timeSpent[currentHost] || { time: 0 }),
        url: tab.url,
        hostname: currentHost,
        visited: currentVisited + 1,
    };
    if (tab.favIconUrl) timeSpent[currentHost].icon = tab.favIconUrl;
}

async function changeTab(tabId) {
    const tab = await browser.tabs.get(tabId);
    if (tab?.active) {
        saveTime();
        incrementVisit(tab);
        setActive(tab)
        startTimer(tab);
    }
}

function setActive(tab) {
    Object.keys(timeSpent).forEach(key => {
        timeSpent[key].active = false;
    });
    timeSpent[timeSpentKey(tab)].active = true;
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
        sendResponse({ timeSpent: Object.values(timeSpent) });
        startTimer(activeTab); // Resume timing
    }
});
