// background.js - Zarządca niewidzialnego sensora
let offscreenCreated = false;

// Funkcja wykonująca przewijanie w aktywnej karcie
function runScroll(pixels) {
    chrome.windows.getAll({ windowTypes: ['normal'] }, (windows) => {
        const target = windows.find(w => w.focused && w.state !== 'minimized') || windows.find(w => w.state !== 'minimized') || windows[0];
        if (!target) return;

        chrome.tabs.query({ active: true, windowId: target.id }, (tabs) => {
            if (tabs && tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'scroll', pixels: pixels }).catch(() => {
                    // Siłowe przewinięcie jeśli content script nie odpowiedział
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
        if (!offscreenCreated) {
            chrome.offscreen.createDocument({
                url: 'offscreen.html',
                reasons: ['USER_MEDIA'],
                justification: 'Sensor kamery pracujący w cieniu'
            }).then(() => {
                offscreenCreated = true;
                chrome.storage.local.set({ isRunning: true });
            });
        }
    } else if (request.action === 'stopGhostMode') {
        if (offscreenCreated) {
            chrome.offscreen.closeDocument().then(() => {
                offscreenCreated = false;
                chrome.storage.local.set({ isRunning: false });
            });
        }
    } else if (request.action === 'doScroll') {
        runScroll(request.pixels);
    }
    return true;
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.set({ isRunning: false });
});
