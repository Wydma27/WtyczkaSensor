// background.js - Zarządca niewidzialnego sensora
let offscreenCreated = false;

async function runScroll(pixels) {
    chrome.windows.getAll({ windowTypes: ['normal'] }, (windows) => {
        const target = windows.find(w => w.focused && w.state !== 'minimized') || windows.find(w => w.state !== 'minimized') || windows[0];
        if (!target) return;
        chrome.tabs.query({ active: true, windowId: target.id }, (tabs) => {
            if (tabs && tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'scroll', pixels: pixels }).catch(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (p) => { window.scrollBy({ top: p, behavior: 'auto' }); },
                        args: [pixels]
                    }).catch(() => { });
                });
            }
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startGhostMode') {
        chrome.offscreen.hasDocument().then(has => {
            if (!has) {
                chrome.offscreen.createDocument({
                    url: 'offscreen.html',
                    reasons: ['USER_MEDIA'],
                    justification: 'Sensor kamery pracujący w cieniu'
                }).then(() => {
                    offscreenCreated = true;
                    chrome.storage.local.set({ isRunning: true });
                }).catch((err) => {
                    console.error("Błąd tworzenia offscreen:", err);
                    // Próbujemy mimo to ustawić stan, być może dokument już istnieje mimo błędu
                    chrome.storage.local.set({ isRunning: true });
                });
            } else {
                offscreenCreated = true;
                chrome.storage.local.set({ isRunning: true });
            }
        }).catch(() => {
            // Rezerwowy mechanizm dla starszych wersji Chrome lub błędów
            chrome.storage.local.set({ isRunning: true });
        });
    } else if (request.action === 'stopGhostMode') {
        chrome.offscreen.closeDocument().finally(() => {
            offscreenCreated = false;
            chrome.storage.local.set({ isRunning: false });
        });
    } else if (request.action === 'doScroll') {
        runScroll(request.pixels);
    } else if (request.action === 'switchTab') {
        chrome.windows.getLastFocused({ populate: true }, (window) => {
            if (!window || !window.tabs) return;
            const tabs = window.tabs;
            const activeTab = tabs.find(t => t.active);
            if (!activeTab) return;

            let newIndex = request.direction === 'right' ? activeTab.index + 1 : activeTab.index - 1;
            if (newIndex >= tabs.length) newIndex = 0;
            if (newIndex < 0) newIndex = tabs.length - 1;

            chrome.tabs.update(tabs[newIndex].id, { active: true });
        });
    } else if (request.action === 'historyMove') {
        chrome.windows.getLastFocused({ populate: true }, (window) => {
            if (!window) return;
            chrome.tabs.query({ active: true, windowId: window.id }, (tabs) => {
                if (!tabs[0]) return;
                if (request.direction === 'back') {
                    chrome.tabs.goBack(tabs[0].id).catch(() => { });
                } else {
                    chrome.tabs.goForward(tabs[0].id).catch(() => { });
                }
            });
        });
    } else if (request.action === 'syncHUD') {
        // Forward HUD data to current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'syncHUD', data: request.data }).catch(() => { });
            }
        });
    } else if (request.action === 'error') {
        console.error("SENSOR ERROR:", request.message);
        offscreenCreated = false;
        chrome.storage.local.set({ isRunning: false });
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon128.png',
            title: 'Błąd Sensora',
            message: request.message
        });
    }
    return true;
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.set({ isRunning: false });
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isRunning: false });
});
