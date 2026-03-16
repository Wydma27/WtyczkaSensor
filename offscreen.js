// offscreen.js – Niewidzialny Sensor (Moc 9000 + Tryb Duch)

// --- Ładowanie konfiguracji z config.json ---
let CFG = null;
async function loadConfig() {
    try {
        const res = await fetch(chrome.runtime.getURL('config.json'));
        CFG = await res.json();
    } catch (e) {
        console.warn('[Sensor] Nie można załadować config.json, używam wartości domyślnych:', e);
        CFG = {}; // pustka – będą używane fallbacki
    }
}

function cfg(path, fallback) {
    const keys = path.split('.');
    let val = CFG;
    for (const k of keys) {
        if (val == null || typeof val !== 'object') return fallback;
        val = val[k];
    }
    return val !== undefined ? val : fallback;
}
// --- Koniec ładowania konfiguracji ---

let handLandmarker;
let webcamRunning = false;
let animationId = null;

let prevHandY = null;
let smoothHandY = null;
let prevRawX = null;
let baselineX = null;
let sensitivity = 1.0;

// Wartości domyślne (nadpisane przez config.json po init)
const SMOOTHING_DEFAULT = 0.08;
const SCROLL_SCALE_DEFAULT = 12000;
const SWIPE_THRESHOLD_DEFAULT = 0.08;
const SWIPE_COOLDOWN_DEFAULT = 200;

let SMOOTHING = SMOOTHING_DEFAULT;
let SCROLL_SCALE = SCROLL_SCALE_DEFAULT;
let SWIPE_THRESHOLD = SWIPE_THRESHOLD_DEFAULT;
let SWIPE_COOLDOWN = SWIPE_COOLDOWN_DEFAULT;

let lastSwipeTime = 0;
let lastThumbTime = 0;
const THUMB_COOLDOWN = 1000;

// Pobieramy element video z DOM offscreen.html
const video = document.getElementById('video') || document.createElement('video');
if (!video.id) {
    video.id = 'video';
    document.body.appendChild(video);
}
video.autoplay = true;
video.playsinline = true;
video.muted = true;

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
        await loadConfig();

        // Wczytaj wartości z config.json
        SMOOTHING = cfg('scroll_settings.smoothing_factor', SMOOTHING_DEFAULT);
        SCROLL_SCALE = cfg('scroll_settings.scroll_scale', SCROLL_SCALE_DEFAULT);
        SWIPE_THRESHOLD = cfg('swipe_settings.threshold', SWIPE_THRESHOLD_DEFAULT);
        SWIPE_COOLDOWN = cfg('swipe_settings.cooldown_ms', SWIPE_COOLDOWN_DEFAULT);

        const useGPU = cfg('performance.enable_gpu_delegate', true) ? 'GPU' : 'CPU';
        const numHands = cfg('hand_detection.num_hands', 1);
        const detConf = cfg('hand_detection.min_hand_detection_confidence', 0.3);
        const presConf = cfg('hand_detection.min_hand_presence_confidence', 0.3);
        const trackConf = cfg('hand_detection.min_tracking_confidence', 0.3);
        const targetFPS = cfg('hand_detection.target_fps', 30);

        const mp = await import(chrome.runtime.getURL('vision_bundle.js'));
        const { FilesetResolver, HandLandmarker } = mp;
        
        // Gwarantujemy, że ścieżka do WASM kończy się slashem
        const wasmPath = chrome.runtime.getURL('wasm/');
        const vision = await FilesetResolver.forVisionTasks(wasmPath);

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: chrome.runtime.getURL('hand_landmarker.task'), delegate: useGPU },
            numHands,
            minHandDetectionConfidence: detConf,
            minHandPresenceConfidence: presConf,
            minTrackingConfidence: trackConf,
            runningMode: 'VIDEO'
        });

        const camW = cfg('camera_settings.width_ideal', 640);
        const camH = cfg('camera_settings.height_ideal', 480);
        const camFPS = cfg('camera_settings.fps_ideal', targetFPS);

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: camW }, height: { ideal: camH }, frameRate: { ideal: camFPS } }
        });
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

// Pętla klatek oparta o setInterval (niezawodna w tle)
const TARGET_INTERVAL_MS = 1000 / 36; // 36 FPS (wyższa płynność przy scrollowaniu)

function startLoop() {
    if (animationId) clearInterval(animationId);
    animationId = setInterval(process, TARGET_INTERVAL_MS);
}

function process() {
    if (!webcamRunning || !handLandmarker) return;
    
    // Sprawdzamy czy video faktycznie dostarcza dane
    if (video.readyState < 2) return; 

    try {
        const results = handLandmarker.detectForVideo(video, performance.now());
        if (results.landmarks && results.landmarks.length > 0) {
            const lm = results.landmarks[0];

            // Pięść = STOP (Zatrzymanie scrollowania i reset)
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
                    // Obniżony próg detekcji ruchu (0.001) dla lepszej czułości w dolnych partiach
                    if (Math.abs(deltaY) > 0.001) {
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
