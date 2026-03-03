// offscreen.js – Niewidzialny Sensor (Moc 9000 + Tryb Duch)
let handLandmarker;
let webcamRunning = false;
let animationId = null;

let prevHandY = null;
let smoothHandY = null;
let prevRawX = null;
let baselineX = null;

const SMOOTHING = 0.12; // Złoty środek między szybkością a stabilnością
const SCROLL_SCALE = 8500; // Zredukowana prędkość (zgodnie z prośbą)
const SWIPE_THRESHOLD = 0.07;
let lastSwipeTime = 0;
const SWIPE_COOLDOWN = 250;

const video = document.createElement('video');
video.autoplay = true;
video.playsinline = true;

const silencer = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD5AAAB+AAACABAAZGF0YQAAAAA=");
silencer.loop = true;

async function init() {
    try {
        const mp = await import(chrome.runtime.getURL('vision_bundle.js'));
        const { FilesetResolver, HandLandmarker } = mp;
        const vision = await FilesetResolver.forVisionTasks(chrome.runtime.getURL('wasm'));

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: chrome.runtime.getURL('hand_landmarker.task'), delegate: 'GPU' },
            numHands: 1,
            minHandDetectionConfidence: 0.1,
            minHandPresenceConfidence: 0.1,
            minTrackingConfidence: 0.1,
            runningMode: 'VIDEO'
        });

        // Używamy 'ideal', żeby nie wywaliło błędu jeśli kamera nie wspiera dokładnie 640x480
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                }
            });
        } catch (err) {
            console.warn("Próba z idealnymi wymiarami padła, biorę co jest:", err);
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            webcamRunning = true;
            silencer.play().catch(() => { });
            animationId = setInterval(process, 25);
        };
    } catch (e) {
        chrome.runtime.sendMessage({ action: 'error', message: e.message });
    }
}

function process() {
    if (!webcamRunning || !handLandmarker) return;
    try {
        const results = handLandmarker.detectForVideo(video, performance.now());
        if (results.landmarks && results.landmarks.length > 0) {
            const lm = results.landmarks[0];

            // Pięść = STOP
            if (lm[8].y > lm[6].y && lm[12].y > lm[10].y && lm[16].y > lm[14].y) {
                prevHandY = null;
                smoothHandY = null;
                baselineX = null;
                return;
            }

            // 1. DETEKCJA TRYBU
            const isIndexUp = lm[8].y < lm[6].y;
            const isMiddleUp = lm[12].y < lm[10].y;
            const isRingUp = lm[16].y < lm[14].y;
            const isPinkyUp = lm[20].y < lm[18].y;
            const isThumbUp = Math.abs(lm[4].x - lm[2].x) > 0.05;

            const isHistoryMode = isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp;
            const isWholeHand = isIndexUp && isMiddleUp && isRingUp;

            const points = [0, 5, 9, 13, 17];
            let sumY = 0;
            let sumX = 0;
            points.forEach(i => {
                sumY += lm[i].y;
                sumX += lm[i].x;
            });
            let rawY = sumY / points.length;
            let rawX = sumX / points.length;

            // --- REMAPOWANIE (WIĘKSZY ZASIĘG EFEKTYWNY) ---
            // Używamy większych marginesów (szczególnie w pionie), 
            // żebyś nie musiał fizycznie zjeżdżać ręką do samej podłogi.
            const marginX = 0.1;
            const marginY = 0.3; // 30% marginesu - wystarczy mały ruch góra/dół żeby "przelecieć" przez ekran

            rawX = (rawX - marginX) / (1 - 2 * marginX);
            rawY = (rawY - marginY) / (1 - 2 * marginY);

            rawX = Math.max(0, Math.min(1, rawX));
            rawY = Math.max(0, Math.min(1, rawY));

            if (baselineX === null) baselineX = rawX;

            // --- HUD SYNC ---
            chrome.runtime.sendMessage({
                action: 'syncHUD',
                data: {
                    x: rawX,
                    y: rawY,
                    fingers: [isThumbUp, isIndexUp, isMiddleUp, isRingUp, isPinkyUp],
                    gesture: isHistoryMode ? 'history' : (isWholeHand ? 'scroll' : 'pointing')
                }
            });

            // 2. SWIPY
            const diffX = rawX - baselineX;
            const diffY = rawY - (prevHandY || rawY);
            const now = Date.now();

            const isHorizontalIntention = Math.abs(diffX) > Math.abs(diffY) * 1.5;

            if (Math.abs(diffX) > SWIPE_THRESHOLD && isHorizontalIntention && now - lastSwipeTime > SWIPE_COOLDOWN) {
                if (isHistoryMode) {
                    chrome.runtime.sendMessage({
                        action: 'historyMove',
                        direction: diffX > 0 ? 'back' : 'forward'
                    });
                } else if (isWholeHand) {
                    chrome.runtime.sendMessage({
                        action: 'switchTab',
                        direction: diffX > 0 ? 'left' : 'right'
                    });
                }
                lastSwipeTime = now;
                baselineX = rawX;
                prevHandY = null;
                return;
            } else {
                baselineX = baselineX * 0.5 + rawX * 0.5;
            }

            // 3. SCROLL
            if (isWholeHand && Math.abs(diffX) < SWIPE_THRESHOLD * 0.8) {
                if (smoothHandY === null) smoothHandY = rawY;
                else smoothHandY = smoothHandY * (1 - SMOOTHING) + rawY * SMOOTHING;

                if (prevHandY !== null) {
                    const deltaY = smoothHandY - prevHandY;
                    if (Math.abs(deltaY) > 0.0001) {
                        chrome.runtime.sendMessage({ action: 'doScroll', pixels: deltaY * SCROLL_SCALE });
                    }
                }
                prevHandY = smoothHandY;
            } else {
                prevHandY = null;
                smoothHandY = null;
            }
        } else {
            chrome.runtime.sendMessage({ action: 'syncHUD', data: null });
            prevHandY = null;
            smoothHandY = null;
            baselineX = null;
        }
    } catch (e) { }
}

init();
