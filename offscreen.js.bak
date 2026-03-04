// offscreen.js – Niewidzialny Mózg Sensora
let handLandmarker;
let webcamRunning = false;
let animationId = null;

let prevHandY = null;
let smoothHandY = null;
const SMOOTHING = 0.05; // Ultra-reakcja, zero laga
const SCROLL_SCALE = 9000; // Gigantyczna moc przewijania

const video = document.createElement('video');
video.autoplay = true;
video.playsinline = true;

// Audio Keep-Alive (Zapobieganie usypianiu procesu przez Windows/Chrome)
const silencer = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD5AAAB+AAACABAAZGF0YQAAAAA=");
silencer.loop = true;

async function init() {
    try {
        const mp = await import(chrome.runtime.getURL('vision_bundle.js'));
        const { FilesetResolver, HandLandmarker } = mp;
        const vision = await FilesetResolver.forVisionTasks(chrome.runtime.getURL('wasm'));

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: chrome.runtime.getURL('hand_landmarker.task'),
                delegate: 'GPU'
            },
            numHands: 1,
            // MAKSYMALNY ZASIĘG - łapie dłoń z końca pokoju
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
            animationId = setInterval(process, 25);
            console.log("Sensor trybu duch: Aktywny");
        };
    } catch (e) { console.error("Ghost Init Error:", e); }
}

function process() {
    if (!webcamRunning) return;
    try {
        const results = handLandmarker.detectForVideo(video, performance.now());

        if (results.landmarks && results.landmarks.length > 0) {
            const lm = results.landmarks[0];

            // Pięść = Stop
            const isFist = lm[8].y > lm[6].y && lm[12].y > lm[10].y && lm[16].y > lm[14].y;
            if (isFist) {
                prevHandY = null;
                smoothHandY = null;
                return;
            }

            // Środek dłoni
            const points = [0, 5, 9, 13, 17];
            let sumY = 0;
            points.forEach(i => sumY += lm[i].y);
            const rawY = sumY / points.length;

            if (smoothHandY === null) smoothHandY = rawY;
            else smoothHandY = smoothHandY * (1 - SMOOTHING) + rawY * SMOOTHING;

            if (prevHandY !== null) {
                const delta = smoothHandY - prevHandY;
                if (Math.abs(delta) > 0.0001) {
                    chrome.runtime.sendMessage({ action: 'doScroll', pixels: delta * SCROLL_SCALE });
                }
            }
            prevHandY = smoothHandY;
        } else {
            prevHandY = null;
            smoothHandY = null;
        }
    } catch (e) { }
}

init();
