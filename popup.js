// popup.js - Przełącznik trybu duch
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const permBtn = document.getElementById('permBtn');

function update(isRunning) {
    if (isRunning) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        status.textContent = 'Tryb: AKTYWNY (Ukryty)';
        status.style.color = '#10b981';
    } else {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        status.textContent = 'Tryb: Wyłączony';
        status.style.color = '#9ca3af';
    }
}

chrome.storage.local.get(['isRunning'], (res) => update(res.isRunning));

startBtn.addEventListener('click', async () => {
    // KLUCZOWE: Musimy poprosić o kamerę w popupie, żeby Chrome zapamiętał wybór
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop()); // Zamykamy od razu

        chrome.runtime.sendMessage({ action: 'startGhostMode' });
        update(true);
        setTimeout(() => window.close(), 1000); // Samozamknięcie okna!
    } catch (e) {
        alert("BŁĄD: Musisz najpierw nadać uprawnienia! Kliknij link poniżej.");
    }
});

stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopGhostMode' });
    update(false);
});

permBtn.addEventListener('click', () => {
    // Otwórz specjalną kartę do nadania uprawnień
    window.open(chrome.runtime.getURL('app.html'));
});
