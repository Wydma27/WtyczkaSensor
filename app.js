// app.js – Silnik Sensora (Zoptymalizowany + Naprawiony)
let handLandmarker;
let webcamRunning = false;
let animationId = null;
let aiReady = false;

// Fizyka scrollowania
let prevY = null;
let smoothY = null;
const SMOOTHING = 0.05;
const SCROLL_FORCE = 9000;

// Cache aktywnej zakładki (bez odpytywania przy każdej klatce)
let cachedTabId = null;
function refreshActiveTab() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs && tabs[0]) cachedTabId = tabs[0].id;
    });
}
chrome.tabs.onActivated.addListener(refreshActiveTab);
chrome.windows.onFocusChanged.addListener((wid) => {
    if (wid !== chrome.windows.WINDOW_ID_NONE) refreshActiveTab();
});
refreshActiveTab();

// Pętla klatek
let lastVideoTime = -1;
let lastFrameTime = 0;
const FPS = 30;
const frameInterval = 1000 / FPS;

// DOM
const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusBadge = document.getElementById('statusBadge');
const alertBox = document.getElementById('alertBox');
const fpsText = document.getElementById('fpsStat');
const detectText = document.getElementById('detectStat');
const sensSlider = document.getElementById('sensSlider');
const sensValText = document.getElementById('sensVal');

// Cichy dźwięk do utrzymania procesu
const silencer = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD5AAAB+AAACABAAZGF0YQAAAAA=");
silencer.loop = true;

async function setupAI() {
    if (aiReady) return; // NAPRAWKA: nie inicjalizuj dwukrotnie
    try {
        alertBox.textContent = "⚙️ Inicjalizacja AI...";
        const mp = await import(chrome.runtime.getURL('vision_bundle.js'));
        const { FilesetResolver, HandLandmarker } = mp;
        const vision = await FilesetResolver.forVisionTasks(chrome.runtime.getURL('wasm/'));

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: chrome.runtime.getURL('hand_landmarker.task'),
                delegate: 'GPU'
            },
            numHands: 1,
            minHandDetectionConfidence: 0.3,
            minHandPresenceConfidence: 0.3,
            minTrackingConfidence: 0.3,
            runningMode: 'VIDEO'
        });

        aiReady = true;
        alertBox.textContent = "✅ AI Gotowe – możesz uruchomić sensor";
    } catch (err) {
        alertBox.textContent = "❌ Błąd AI: " + err.message;
        console.error(err);
    }
}

function getPalmY(landmarks) {
    const points = [0, 5, 9, 13, 17];
    let y = 0;
    points.forEach(i => y += landmarks[i].y);
    return y / points.length;
}

function isFist(lm) {
    return lm[8].y > lm[6].y && lm[12].y > lm[10].y && lm[16].y > lm[14].y;
}

function startLoop() {
    function loop(time) {
        if (!webcamRunning) return;

        const delta = time - lastFrameTime;
        if (delta >= frameInterval) {
            // Sprawdź czy video ma nową klatkę gotową
            if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
                processFrame(time);
            }
            lastFrameTime = time - (delta % frameInterval);
        }

        animationId = requestAnimationFrame(loop);
    }
    animationId = requestAnimationFrame(loop);
}

async function start() {
    if (!aiReady) await setupAI();
    if (!aiReady) return; // setupAI się nie powiodło

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 30 }
            }
        });

        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            webcamRunning = true;
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            silencer.play().catch(() => { });

            alertBox.textContent = "🚀 Sensor Działa!";
            alertBox.style.background = "rgba(56, 189, 248, 0.1)";

            // NAPRAWKA: anuluj poprzednią pętlę zanim zaczniesz nową
            if (animationId) cancelAnimationFrame(animationId);
            lastVideoTime = -1;
            lastFrameTime = 0;
            startLoop();
        };
    } catch (err) {
        let errMsg = "Błąd kamery";
        if (err.name === 'NotAllowedError') {
            errMsg = `❌ Brak uprawnień do kamery!<br><br>
                     <a href="#" id="openFullPage" style="color:#38bdf8; text-decoration:underline;">
                     Kliknij tutaj, aby otworzyć sensor w nowej karcie</a>
                     i tam kliknij 'Zezwól' na górze strony. Potem wróć tutaj.`;
        } else if (err.name === 'NotFoundError') {
            errMsg = "❌ Nie znaleziono kamery!";
        } else if (err.name === 'NotReadableError') {
            errMsg = "❌ Kamera jest używana przez inny program!";
        } else {
            errMsg = "❌ Błąd: " + err.message;
        }

        alertBox.innerHTML = errMsg;
        alertBox.style.background = "rgba(225, 29, 72, 0.2)";

        const link = document.getElementById('openFullPage');
        if (link) {
            link.onclick = (e) => {
                e.preventDefault();
                window.open(chrome.runtime.getURL('app.html'));
            };
        }

        console.error("Błąd kamery:", err);
    }
}

function stop() {
    webcamRunning = false;

    if (animationId) {
        cancelAnimationFrame(animationId); // NAPRAWKA: cancelAnimationFrame zamiast clearInterval
        animationId = null;
    }

    if (video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
    }

    prevY = null;
    smoothY = null;
    lastVideoTime = -1;

    silencer.pause();
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    alertBox.textContent = "⏹ Sensor zatrzymany.";
    alertBox.style.background = "rgba(56, 189, 248, 0.1)";
    statusBadge.textContent = "GOTOWY";
    statusBadge.style.background = "#1e293b";

    chrome.storage.local.set({ isRunning: false });
}

function processFrame(time) {
    if (!webcamRunning || !handLandmarker) return;
    const t0 = performance.now();

    try {
        const results = handLandmarker.detectForVideo(video, t0);

        if (results.landmarks && results.landmarks.length > 0) {
            const lm = results.landmarks[0];
            if (detectText) detectText.textContent = "WIDOCZNA";


            if (isFist(lm)) {
                prevY = null;
                smoothY = null;
                if (statusBadge) {
                    statusBadge.textContent = "✊ STOP (pięść)";
                    statusBadge.style.background = "#374151";
                }
                return;
            }

            const currentY = getPalmY(lm);

            if (smoothY === null) smoothY = currentY;
            else smoothY = smoothY * (1 - SMOOTHING) + currentY * SMOOTHING;

            if (prevY !== null) {
                const delta = smoothY - prevY;
                if (Math.abs(delta) > 0.0001) {
                    const sensitivity = (sensSlider ? parseFloat(sensSlider.value) : 15) / 15;
                    const px = delta * SCROLL_FORCE * sensitivity;
                    scrollActiveTab(px);
                    if (statusBadge) {
                        statusBadge.textContent = delta > 0 ? "👇 W DÓŁ" : "👆 W GÓRĘ";
                        statusBadge.style.background = delta > 0 ? "#991b1b" : "#065f46";
                    }
                }
            } else {
                if (statusBadge) {
                    statusBadge.textContent = "🖐 Połóż rękę i zacznij ruszać";
                    statusBadge.style.background = "#1e3a5f";
                }
            }
            prevY = smoothY;

        } else {
            prevY = null;
            smoothY = null;
            if (detectText) detectText.textContent = "BRAK";
            if (statusBadge) {
                statusBadge.textContent = "🔍 Szukam dłoni...";
                statusBadge.style.background = "#1e293b";
            }
        }

        if (fpsText) fpsText.textContent = Math.round(1000 / (performance.now() - t0 + 1)) + " FPS";
    } catch (e) {
    }
}

function scrollActiveTab(px) {
    if (!cachedTabId) {
        refreshActiveTab();
        return;
    }
    chrome.tabs.sendMessage(cachedTabId, { action: 'scroll', pixels: px }).catch(() => {
        // Content script nie odpowiada – spróbuj scriptingiem
        chrome.scripting.executeScript({
            target: { tabId: cachedTabId },
            func: (p) => { window.scrollBy({ top: p, behavior: 'auto' }); },
            args: [px]
        }).catch(() => { });
    });
}

// Przyciski
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ isRunning: true });
        }
        start();
    });
}

if (stopBtn) {
    stopBtn.addEventListener('click', stop);
}

if (sensSlider) {
    sensSlider.addEventListener('input', () => {
        if (sensValText) sensValText.textContent = sensSlider.value;
        if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ sensitivity: sensSlider.value });
        }
    });
}

// Inicjalizuj sensitivity z storage
if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['sensitivity'], (res) => {
        if (res.sensitivity && sensSlider) {
            sensSlider.value = res.sensitivity;
            if (sensValText) sensValText.textContent = res.sensitivity;
        }
    });

    // Synchronizacja stanu między oknami
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.isRunning) {
            if (changes.isRunning.newValue && !webcamRunning) {
                start();
            } else if (!changes.isRunning.newValue && webcamRunning) {
                stop();
            }
        }
    });

    // Inicjalizacja – sprawdź stan i zainicjuj AI
    chrome.storage.local.get(['isRunning'], (res) => {
        if (res.isRunning) {
            if (startBtn) startBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'block';
        }
    });
}

// NAPRAWKA: setupAI wywołany tylko RAZ przy załadowaniu strony
setupAI();
