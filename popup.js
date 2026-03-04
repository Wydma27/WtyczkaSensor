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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        chrome.runtime.sendMessage({ action: 'startGhostMode' });
        update(true);
        setTimeout(() => window.close(), 800);
    } catch (e) {
        alert("BŁĄD: Musisz najpierw nadać uprawnienia do kamery!");
    }
});

stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopGhostMode' });
    update(false);
});
