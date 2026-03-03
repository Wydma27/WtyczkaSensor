// app.js – Finalny Silnik (Whole Hand + Side Panel Fix)
let handLandmarker;
let webcamRunning = false;
let animationId = null;

// Fizyka skrolowania
let prevY = null;
let smoothY = null;
const SMOOTHING = 0.05; // Maksymalna responsywność
const SCROLL_FORCE = 9000; // Ekstremalna moc skrolowania

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
    try {
        alertBox.textContent = "⚙️ Inicjalizacja AI...";
        const mp = await import(chrome.runtime.getURL('vision_bundle.js'));
        const { FilesetResolver, HandLandmarker } = mp;
        const vision = await FilesetResolver.forVisionTasks(chrome.runtime.getURL('wasm'));

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: chrome.runtime.getURL('hand_landmarker.task'),
                delegate: 'GPU'
            },
            numHands: 1,
            // Maksymalny zasięg i czułość
            minHandDetectionConfidence: 0.1,
            minHandPresenceConfidence: 0.1,
            minTrackingConfidence: 0.1,
            runningMode: 'VIDEO'
        });
        alertBox.textContent = "✅ AI Gotowe!";
    } catch (err) {
        alertBox.textContent = "❌ Błąd AI: " + err.message;
        console.error(err);
    }
}

function getPalmPosition(landmarks) {
    // Używamy uśrednionej pozycji środka dłoni (punkty 0, 5, 9, 13, 17)
    const points = [0, 5, 9, 13, 17];
    let y = 0;
    points.forEach(i => y += landmarks[i].y);
    return y / points.length;
}

function checkFist(lm) {
    // Sprawdzamy czy końcówki palców są poniżej stawów (zaciśnięta dłoń)
    return lm[8].y > lm[6].y && lm[12].y > lm[10].y && lm[16].y > lm[14].y;
}

async function start() {
    if (!handLandmarker) await setupAI();

    try {
        // Uproszczone parametry - niektóre kamery nie lubią zbyt wielu wymagań na start
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            webcamRunning = true;
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            silencer.play().catch(() => { });

            alertBox.textContent = "🚀 Sensor Działa!";
            if (animationId) clearInterval(animationId);
            animationId = setInterval(processFrame, 25); // ~40 FPS dla stabilności
        };
    } catch (err) {
        let errMsg = "Błąd kamery";
        if (err.name === 'NotAllowedError') {
            errMsg = `❌ Brak uprawnień! <br><br>
                     <a href="#" id="openFullPage" style="color:#38bdf8; text-decoration:underline;">Kliknij tutaj, aby otworzyć sensor w nowej karcie</a> 
                     i tam kliknij 'Zezwól' na górze strony. Potem wróć tutaj.`;
        }
        else if (err.name === 'NotFoundError') errMsg = "❌ Nie znaleziono kamery!";
        else if (err.name === 'NotReadableError') errMsg = "❌ Kamera jest używana przez inny program!";
        else errMsg = "❌ Błąd: " + err.message;

        alertBox.innerHTML = errMsg;

        // Funkcjonalność linku
        const link = document.getElementById('openFullPage');
        if (link) {
            link.onclick = (e) => {
                e.preventDefault();
                window.open(chrome.runtime.getURL('app.html'));
            };
        }

        alertBox.style.background = "rgba(225, 29, 72, 0.2)";
        console.error("DEBUG Kamera:", err);
    }
}

function stop() {
    webcamRunning = false;
    if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
    if (animationId) clearInterval(animationId);
    silencer.pause();
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    alertBox.textContent = "⏹ Zatrzymano.";
    statusBadge.textContent = "OTOCZENIE: OK";
    statusBadge.style.background = "#1e293b";
}

function processFrame() {
    if (!webcamRunning) return;
    const now = performance.now();

    try {
        const results = handLandmarker.detectForVideo(video, now);

        if (results.landmarks && results.landmarks.length > 0) {
            const lm = results.landmarks[0];
            detectText.textContent = "WIDOCZNA";

            // PIĘŚĆ = STOP
            if (checkFist(lm)) {
                prevY = null;
                smoothY = null;
                statusBadge.textContent = "✊ STOP (PIĘŚĆ)";
                statusBadge.style.background = "#374151";
                return;
            }

            const currentY = getPalmPosition(lm);

            // Wygładzanie
            if (smoothY === null) smoothY = currentY;
            else smoothY = smoothY * (1 - SMOOTHING) + currentY * SMOOTHING;

            if (prevY !== null) {
                const delta = smoothY - prevY;
                const sensitivity = parseInt(sensSlider.value) / 15;

                if (Math.abs(delta) > 0.0001) {
                    const px = delta * SCROLL_FORCE * sensitivity;
                    scroll(px);
                    statusBadge.textContent = delta > 0 ? "👇 W DÓŁ" : "👆 W GÓRĘ";
                    statusBadge.style.background = delta > 0 ? "#991b1b" : "#065f46";
                }
            } else {
                statusBadge.textContent = "🖐 RUCH DŁONIĄ";
                statusBadge.style.background = "#38bdf8";
            }
            prevY = smoothY;
        } else {
            prevY = null;
            smoothY = null;
            detectText.textContent = "BRAK";
            statusBadge.textContent = "SZUKAM DŁONI...";
            statusBadge.style.background = "#1e293b";
        }

        fpsText.textContent = Math.round(1000 / (performance.now() - now + 1)) + " FPS";
    } catch (e) { }
}

function scroll(px) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'scroll', pixels: px }).catch(() => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: (p) => { window.scrollBy({ top: p, behavior: 'auto' }); },
                    args: [px]
                }).catch(() => { });
            });
        }
    });
}

// Listenery
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
sensSlider.addEventListener('input', () => sensValText.textContent = sensSlider.value);

// Start
setupAI();
