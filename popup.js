// popup.js - Sterowanie trybem duch
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');
const statusBadge = document.getElementById('statusBadge');

function update(isRunning) {
    if (isRunning) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        if (statusText) statusText.textContent = 'Tryb: AKTYWNY (Ukryty)';
        if (statusBadge) statusBadge.style.color = '#10b981';
    } else {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        if (statusText) statusText.textContent = 'Tryb: Wyłączony';
        if (statusBadge) statusBadge.style.color = '#9ca3af';
    }
}

chrome.storage.local.get(['isRunning'], (res) => update(res.isRunning));

startBtn.addEventListener('click', async () => {
    try {
        // Prośba o dostęp do kamery (musi być wywołana gestem użytkownika)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Jeśli dostaliśmy stream, zamykamy go i odpalamy tryb Ghost
        stream.getTracks().forEach(t => t.stop());
        
        console.log('[Popup] Uprawnienia OK, startuję Ghost Mode...');
        chrome.runtime.sendMessage({ action: 'startGhostMode' });
        update(true);
        
        // Zamknij popup po chwili, żeby dać czas na wysłanie wiadomości
        setTimeout(() => window.close(), 500);
    } catch (e) {
        console.error('[Popup] Krytyczny błąd startu:', e);
        chrome.notifications.create('cam-error', {
            type: 'basic',
            iconUrl: 'icon128.png',
            title: 'Błąd kamery',
            message: 'Nie można uzyskać dostępu do kamery. Sprawdź ustawienia uprawnień.'
        });
    }
});

stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopGhostMode' });
    update(false);
});

// Kalibracja Kamery – otwórz stronę z uprawnieniami kamery
const permBtn = document.getElementById('permBtn');
if (permBtn) {
    permBtn.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'chrome://settings/content/camera' });
    });
}
