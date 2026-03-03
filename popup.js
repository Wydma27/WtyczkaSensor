// popup.js - Sterowanie trybem duch (Cyber Edition)
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const permBtn = document.getElementById('permBtn');

function update(isRunning) {
    if (isRunning) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        statusText.textContent = 'SYSTEM AKTYWNY';
        statusBadge.style.color = '#10b981';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
    } else {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        statusText.textContent = 'SYSTEM GOTOWY';
        statusBadge.style.color = '#9ca3af';
        statusBadge.style.background = 'rgba(156, 163, 175, 0.1)';
    }
}

chrome.storage.local.get(['isRunning'], (res) => {
    update(res && res.isRunning);
});

startBtn.addEventListener('click', async () => {
    try {
        // Próba uzyskania uprawnień, jeśli jeszcze ich nie ma
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        
        chrome.runtime.sendMessage({ action: 'startGhostMode' });
        update(true);
        setTimeout(() => window.close(), 400);
    } catch (e) {
        console.error("Camera access error:", e);
        alert("BŁĄD: Brak dostępu do kamery! Użyj przycisku kalibracji poniżej.");
    }
});

stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopGhostMode' });
    update(false);
});

permBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        alert("✓ Kamera skalibrowana pomyślnie!");
    } catch (e) {
        alert("Błąd kalibracji.");
    }
});

