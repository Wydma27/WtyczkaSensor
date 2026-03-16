// background.js - Zarządca niewidzialnego sensora

// WAŻNE (MV3): offscreenCreated resetuje się gdy service worker jest uśpiony i budzony.
// Dlatego ZAWSZE sprawdzamy chrome.offscreen.hasDocument() zamiast polegać na tej fladze.
let offscreenCreated = false;

async function hasOffscreenDocument() {
    // chrome.offscreen.hasDocument jest dostępne w Chrome 122+
    if (chrome.offscreen && typeof chrome.offscreen.hasDocument === 'function') {
        return await chrome.offscreen.hasDocument();
    }
    // Fallback dla starszych wersji Chrome – polegamy na fladze
    return offscreenCreated;
}

async function runScroll(pixels) {
    try {
        // Promise-based API (Manifest V3)
        const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
        const target = windows.find(w => w.focused && w.state !== 'minimized')
            || windows.find(w => w.state !== 'minimized')
            || windows[0];
        if (!target) return;

        const tabs = await chrome.tabs.query({ active: true, windowId: target.id });
        if (!tabs || !tabs[0]) return;
        const tabId = tabs[0].id;

        // Najpierw próbujemy content script (szybsze, bez overheadu V8)
        try {
            await chrome.tabs.sendMessage(tabId, { action: 'scroll', pixels });
        } catch (_) {
            // Content script nie odpowiedział lub nie jest wstrzyknięty – fallback do executeScript
            await chrome.scripting.executeScript({
                target: { tabId },
                func: (p) => { window.scrollBy({ top: p, behavior: 'auto' }); },
                args: [pixels]
            }).catch(() => { }); // Ignoruj np. chrome:// strony
        }
    } catch (e) {
        // Okno/karta zamknięta podczas scrolla – bezpieczne do zignorowania
        console.debug('[Sensor/bg] runScroll skip:', e.message);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startGhostMode') {
        (async () => {
            try {
                const alreadyExists = await hasOffscreenDocument();
                if (alreadyExists) {
                    // Dokument już istnieje (np. service worker się obudził)
                    offscreenCreated = true;
                    chrome.storage.local.set({ isRunning: true });
                    return;
                }

                await chrome.offscreen.createDocument({
                    url: 'offscreen.html',
                    reasons: ['USER_MEDIA'],
                    justification: 'Sensor kamery pracujący w cieniu'
                });
                offscreenCreated = true;
                chrome.storage.local.set({ isRunning: true });

                // Wyślij sensitivity do offscreen po chwili (offscreen musi się załadować)
                setTimeout(async () => {
                    try {
                        const res = await chrome.storage.local.get(['sensitivity']);
                        const sens = res && res.sensitivity ? parseFloat(res.sensitivity) / 15 : 1.0;
                        chrome.runtime.sendMessage({ action: 'setSensitivity', sensitivity: sens }).catch(() => { });
                    } catch (e) { /* Ignoruj */ }
                }, 500);

            } catch (e) {
                console.error('[Sensor/bg] Błąd startGhostMode:', e);
                // Nie ustawiamy offscreenCreated = true, bo dokument NIE powstał
                chrome.storage.local.set({ isRunning: false });
            }
        })();
        return true; // async listener

    } else if (request.action === 'stopGhostMode') {
        (async () => {
            try {
                const exists = await hasOffscreenDocument();
                if (exists) {
                    await chrome.offscreen.closeDocument();
                }
            } catch (e) {
                console.warn('[Sensor/bg] Błąd stopGhostMode:', e);
            } finally {
                offscreenCreated = false;
                chrome.storage.local.set({ isRunning: false });
            }
        })();
        return true;

    } else if (request.action === 'doScroll') {
        (async () => {
            await runScroll(request.pixels);
        })();
        return true; 

    } else if (request.action === 'switchTab') {
        (async () => {
            const window = await chrome.windows.getLastFocused({ populate: true });
            if (!window || !window.tabs) return;
            const tabs = window.tabs;
            const activeTab = tabs.find(t => t.active);
            if (!activeTab) return;

            let newIndex = request.direction === 'right' ? activeTab.index + 1 : activeTab.index - 1;
            if (newIndex >= tabs.length) newIndex = 0;
            if (newIndex < 0) newIndex = tabs.length - 1;

            await chrome.tabs.update(tabs[newIndex].id, { active: true });
        })();
        return true;

    } else if (request.action === 'historyMove') {
        (async () => {
            const window = await chrome.windows.getLastFocused({ populate: true });
            if (!window) return;
            const tabs = await chrome.tabs.query({ active: true, windowId: window.id });
            if (!tabs[0]) return;
            if (request.direction === 'back') {
                await chrome.tabs.goBack(tabs[0].id).catch(() => { });
            } else {
                await chrome.tabs.goForward(tabs[0].id).catch(() => { });
            }
        })();
        return true;

    } else if (request.action === 'mediaPlay') {
        (async () => {
            const window = await chrome.windows.getLastFocused({ populate: true });
            if (!window) return;
            const tabs = await chrome.tabs.query({ active: true, windowId: window.id });
            if (!tabs[0]) return;
            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => {
                    const media = document.querySelector('video, audio');
                    if (media && media.paused) media.play();
                }
            }).catch(() => { });
        })();
        return true;

    } else if (request.action === 'mediaPause') {
        (async () => {
            const window = await chrome.windows.getLastFocused({ populate: true });
            if (!window) return;
            const tabs = await chrome.tabs.query({ active: true, windowId: window.id });
            if (!tabs[0]) return;
            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => {
                    const media = document.querySelector('video, audio');
                    if (media && !media.paused) media.pause();
                }
            }).catch(() => { });
        })();
        return true;

    } else if (request.action === 'error') {
        console.error('[Sensor] BŁĄD:', request.message);
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon128.png',
            title: 'Błąd Sensora',
            message: request.message
        });
    }
});

chrome.runtime.onStartup.addListener(() => {
    offscreenCreated = false;
    chrome.storage.local.set({ isRunning: false });
});

// Nasłuchuj zmian sensitivity i wyślij do offscreen
chrome.storage.onChanged.addListener(async (changes) => {
    if (changes.sensitivity) {
        const exists = await hasOffscreenDocument();
        if (exists) {
            const sens = parseFloat(changes.sensitivity.newValue) / 15;
            chrome.runtime.sendMessage({ action: 'setSensitivity', sensitivity: sens }).catch(() => { });
        }
    }
});
