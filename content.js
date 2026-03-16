// content.js – Cyber-HUD (Zoptymalizowany) – TYLKO LOGIKA SCROLLA
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scroll') {
        window.scrollBy({ top: request.pixels, behavior: 'auto' });
        sendResponse({ ok: true });
    }
});

