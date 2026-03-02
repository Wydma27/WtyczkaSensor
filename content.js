// content.js – Ultra Smooth Scroll Receiver
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scroll') {
        const px = request.pixels;

        // 1. Główne przewijanie (auto dla braku lagów przy gestach)
        window.scrollBy({
            top: px,
            behavior: 'auto'
        });

        // 2. Obsługa kontenerów (SPA)
        const scrollEl = document.scrollingElement || document.documentElement;
        if (scrollEl && Math.abs(px) > 0) {
            // Jeśli window.scrollBy nie ruszyło nic (np. overflow hidden na body)
            // Możemy próbować dotrzeć do kontenera, ale zwykle documentElement wystarcza
        }

        // 3. Wskaźnik (opcjonalny, bardzo lekki)
        showIndicator(px > 0);

        sendResponse({ success: true });
    }
});

let indicatorTimer;
function showIndicator(isDown) {
    let el = document.getElementById('__sensor_indicator');
    if (!el) {
        el = document.createElement('div');
        el.id = '__sensor_indicator';
        el.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            color: white;
            border-radius: 8px;
            font-family: sans-serif;
            font-weight: bold;
            z-index: 999999;
            pointer-events: none;
            transition: opacity 0.2s;
            opacity: 0;
            font-size: 14px;
        `;
        document.body.appendChild(el);
    }

    el.style.background = isDown ? '#991b1b' : '#065f46';
    el.textContent = isDown ? '👇 PRZEWIJANIE' : '👆 PRZEWIJANIE';
    el.style.opacity = '1';

    clearTimeout(indicatorTimer);
    indicatorTimer = setTimeout(() => {
        el.style.opacity = '0';
    }, 500);
}
