// offscreen.js – Niewidzialny Sensor (Moc 9000 + Tryb Duch)
let handLandmarker;
let webcamRunning = false;
let animationId = null;

let prevHandY = null;
let smoothHandY = null;
let prevRawX = null;
let baselineX = null;
let sensitivity = 1.0;

const SMOOTHING = 0.05;
const SCROLL_SCALE = 9000;
const SWIPE_THRESHOLD = 0.08; // Super czuły próg
let lastSwipeTime = 0;
const SWIPE_COOLDOWN = 200; // Prawie natychmiastowe kolejne swipy

let lastThumbTime = 0;
const THUMB_COOLDOWN = 1000;

const video = document.createElement('video');
video.autoplay = true;
video.playsinline = true;
video.muted = true; // Wymagane przez politykę autoplay przeglądarek

const silencer = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD5AAAB+AAACABAAZGF0YQAAAAA=");
silencer.loop = true;

// Nasłuchaj sensitivity zmian z background
try {
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'setSensitivity') {
            sensitivity = request.sensitivity;
        }
    });
} catch (e) {
    // Ignoruj błędy
}

async function init() {
    try {
        const mp = await import(chrome.runtime.getURL('vision_bundle.js'));
        const { FilesetResolver, HandLandmarker } = mp;
        const vision = await FilesetResolver.forVisionTasks(chrome.runtime.getURL('wasm/'));

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: chrome.runtime.getURL('hand_landmarker.task'), delegate: 'GPU' },
            numHands: 1,
            minHandDetectionConfidence: 0.1,
            minHandPresenceConfidence: 0.1,
            minTrackingConfidence: 0.1,
            runningMode: 'VIDEO'
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            webcamRunning = true;
            silencer.play().catch(() => { });
            startLoop();
        };
    } catch (e) {
        console.error('[Sensor] Błąd inicjalizacji:', e);
        chrome.runtime.sendMessage({ action: 'error', message: e.message });
    }
}

// Pętla klatek oparta o requestAnimationFrame (lepsza wydajność niż setInterval)
let lastFrameTime = 0;
const TARGET_FRAME_MS = 1000 / 50; // 50 FPS

function startLoop() {
    function loop(time) {
        if (!webcamRunning) return;
        if (time - lastFrameTime >= TARGET_FRAME_MS) {
            lastFrameTime = time;
            process();
        }
        animationId = requestAnimationFrame(loop);
    }
    animationId = requestAnimationFrame(loop);
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

            // Thumbs Up / Thumbs Down (Zatrzymywanie / Wznawianie)
            // Kciuk jest wysunięty, reszta zamknięta.
            const isThumbUp = lm[4].y < lm[3].y && lm[4].y < lm[2].y && lm[8].y > lm[6].y && lm[12].y > lm[10].y && lm[16].y > lm[14].y && lm[20].y > lm[18].y;
            const isThumbDown = lm[4].y > lm[3].y && lm[4].y > lm[2].y && !(lm[8].y < lm[6].y) && !(lm[12].y < lm[10].y) && !(lm[16].y < lm[14].y) && !(lm[20].y < lm[18].y); // Zabezpieczenie by kciuk opadał na dół

            // Dalsza ewolucja isThumbDown – jeżeli opuszczony kciuk jest wyraźny:
            const isStrictThumbDown = isThumbDown && lm[4].y > lm[0].y; // Kciuk schodzi poniżej nadgarstka i reszta palców zwinięta

            const nowTime = Date.now();
            if (isThumbUp && (nowTime - lastThumbTime > THUMB_COOLDOWN)) {
                chrome.runtime.sendMessage({ action: 'mediaPlay' });
                lastThumbTime = nowTime;
                return;
            } else if (isStrictThumbDown && (nowTime - lastThumbTime > THUMB_COOLDOWN)) {
                chrome.runtime.sendMessage({ action: 'mediaPause' });
                lastThumbTime = nowTime;
                return;
            }

            // 1. DETEKCJA TRYBU (Ile palców jest wyprostowanych?)
            const isIndexUp = lm[8].y < lm[6].y;
            const isMiddleUp = lm[12].y < lm[10].y;
            const isRingUp = lm[16].y < lm[14].y;
            const isPinkyUp = lm[20].y < lm[18].y;

            // Tryb Historii (Tylko Wskazujący i Środkowy - jak litera V)
            const isHistoryMode = isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp;
            // Tryb Kart/Przewijania (Wszystkie palce lub większość)
            const isWholeHand = isIndexUp && isMiddleUp && isRingUp;

            const points = [0, 5, 9, 13, 17];
            let sumY = 0;
            let sumX = 0;
            points.forEach(i => {
                sumY += lm[i].y;
                sumX += lm[i].x;
            });
            const rawY = sumY / points.length;
            const rawX = sumX / points.length;

            if (baselineX === null) baselineX = rawX;

            // 2. SWIPY (POZIOME) - Ulepszona detekcja "szarpnięcia"
            const diffX = rawX - baselineX;
            const diffY = rawY - (prevHandY || rawY);
            const now = Date.now();

            // Jeśli ruch poziomy jest wyraźnie silniejszy niż pionowy (zapobiega przypadkowym zmianom przy skrolowaniu)
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
                baselineX = rawX; // Błyskawiczny reset po wykryciu
                prevHandY = null; // Blokujemy scrolla przy swipe
                return;
            } else {
                // Jeszcze szybsze śledzenie bazy, żeby machnięcie zawsze liczyło się od "teraz"
                baselineX = baselineX * 0.4 + rawX * 0.6;
            }

            // 3. SCROLL (PIONOWY) - Działa tylko gdy nie machamy na boki
            if (isWholeHand && Math.abs(diffX) < SWIPE_THRESHOLD * 0.5) {
                if (smoothHandY === null) smoothHandY = rawY;
                else smoothHandY = smoothHandY * (1 - SMOOTHING) + rawY * SMOOTHING;

                if (prevHandY !== null) {
                    const deltaY = smoothHandY - prevHandY;
                    if (Math.abs(deltaY) > 0.0001) {
                        chrome.runtime.sendMessage({ action: 'doScroll', pixels: deltaY * SCROLL_SCALE * sensitivity });
                    }
                }
                prevHandY = smoothHandY;
            } else {
                prevHandY = null;
                smoothHandY = null;
            }
        } else {
            prevHandY = null;
            smoothHandY = null;
            baselineX = null;
        }
    } catch (e) {
        console.warn('[Sensor] Błąd przetwarzania klatki:', e);
    }
}

init();
