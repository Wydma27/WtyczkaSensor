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
        if (!offscreenCreated) {
            chrome.offscreen.createDocument({
                url: 'offscreen.html',
                reasons: ['USER_MEDIA'],
                justification: 'Sensor kamery pracujący w cieniu'
            }).then(() => {
                offscreenCreated = true;
                chrome.storage.local.set({ isRunning: true });

                // Wyślij sensitivity do offscreen
                setTimeout(() => {
                    chrome.storage.local.get(['sensitivity'], (res) => {
                        const sens = res && res.sensitivity ? parseFloat(res.sensitivity) / 15 : 1.0;
                        try {
                            chrome.runtime.sendMessage({
                                action: 'setSensitivity',
                                sensitivity: sens
                            }).catch(() => { });
                        } catch (e) {
                            // Ignoruj
                        }
                    });
                }, 300);
            }).catch(() => {
                offscreenCreated = true;
                chrome.storage.local.set({ isRunning: true });
            });
        }
    } else if (request.action === 'stopGhostMode') {
        if (offscreenCreated) {
            chrome.offscreen.closeDocument().then(() => {
                offscreenCreated = false;
                chrome.storage.local.set({ isRunning: false });
            }).catch(() => {
                offscreenCreated = false;
                chrome.storage.local.set({ isRunning: false });
            });
        }
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
    } else if (request.action === 'mediaPlay') {
        chrome.windows.getLastFocused({ populate: true }, (window) => {
            if (!window) return;
            chrome.tabs.query({ active: true, windowId: window.id }, (tabs) => {
                if (!tabs[0]) return;
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        const media = document.querySelector('video, audio');
                        if (media && media.paused) {
                            media.play();
                        }
                    }
                }).catch(() => { });
            });
        });
    } else if (request.action === 'mediaPause') {
        chrome.windows.getLastFocused({ populate: true }, (window) => {
            if (!window) return;
            chrome.tabs.query({ active: true, windowId: window.id }, (tabs) => {
                if (!tabs[0]) return;
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        const media = document.querySelector('video, audio');
                        if (media && !media.paused) {
                            media.pause();
                        }
                    }
                }).catch(() => { });
            });
        });
    } else if (request.action === 'error') {
        console.error("SENSOR ERROR:", request.message);
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon128.png',
            title: 'Błąd Sensora',
            message: request.message
        });
    }
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.set({ isRunning: false });
});

// Nasłuchaj zmian sensitivity i wyślij do offscreen
chrome.storage.onChanged.addListener((changes) => {
    if (changes.sensitivity && offscreenCreated) {
        const sens = parseFloat(changes.sensitivity.newValue) / 15;
        try {
            chrome.runtime.sendMessage({
                action: 'setSensitivity',
                sensitivity: sens
            }).catch(() => { });
        } catch (e) {
            // Ignoruj błędy
        }
    }
});
