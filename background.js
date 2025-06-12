let activeTab = null;
let startTime = null;
let timeSpent = {};

function startTimer(tab) {
    if (!tab) return;
    activeTab = tab;
    startTime = Date.now();
}

function stopTimer() {
    if (activeTab && startTime) {
        const elapsed = Date.now() - startTime;

        const currentHost = new URL(activeTab.url).hostname
        const current = timeSpent[currentHost]?.time || 0;
        timeSpent[currentHost] = {
            icon: activeTab.favIconUrl,
            url: activeTab.url,
            hostname: currentHost,
            time: current + elapsed
        };
        startTime = null;
    }
}

browser.tabs.onActivated.addListener(async ({ tabId }) => {
    stopTimer();
    const tab = await browser.tabs.get(tabId);
    console.log(tab)
    const window = await browser.windows.get(tab.windowId);
    if (window.focused) startTimer(tab);
});

browser.windows.onFocusChanged.addListener(async (windowId) => {
    stopTimer();
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
        const [tab] = await browser.tabs.query({ active: true, windowId });
        if (tab) startTimer(tab);
    }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "getTime") {
        stopTimer();
        sendResponse({ timeSpent: Object.values(timeSpent) });
        startTimer(activeTab);
    }
});
