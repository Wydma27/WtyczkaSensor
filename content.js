// content.js – Cyber-HUD (Moc 9000 Visuals)
class CyberHUD {
    constructor() {
        this.container = null;
        this.orb = null;
        this.fingers = [];
        this.label = null;
        this.isActive = false;
        this.particles = [];
        this.init();
    }

    init() {
        if (document.getElementById('__cyber_hud')) return;

        this.container = document.createElement('div');
        this.container.id = '__cyber_hud';
        this.container.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            pointer-events: none;
            z-index: 2147483647;
            display: none;
            font-family: 'Consolas', 'Monaco', monospace;
            background: radial-gradient(circle at center, rgba(0,255,255,0.02) 0%, transparent 70%);
        `;

        // Glowing Orb (Hand center)
        this.orb = document.createElement('div');
        this.orb.style.cssText = `
            position: absolute;
            width: 44px; height: 44px;
            background: radial-gradient(circle, rgba(0,255,255,0.9) 0%, rgba(0,255,255,0) 70%);
            border: 2px solid rgba(0,255,255,0.6);
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(0,255,255,0.4), inset 0 0 15px rgba(0,255,255,0.4);
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s, border-color 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Inner core
        const core = document.createElement('div');
        core.style.cssText = `
            width: 8px; height: 8px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 10px #fff;
        `;
        this.orb.appendChild(core);

        // Finger indicators
        for (let i = 0; i < 5; i++) {
            const f = document.createElement('div');
            f.style.cssText = `
                position: absolute;
                width: 10px; height: 10px;
                background: rgba(0,255,255,0.8);
                border: 1px solid #fff;
                border-radius: 50%;
                opacity: 0;
                box-shadow: 0 0 15px #00ffff;
                transform: translate(-50%, -50%);
                transition: opacity 0.2s, background 0.2s;
            `;
            this.fingers.push(f);
            this.orb.appendChild(f);
        }

        // Action Label with Scanline
        this.labelContainer = document.createElement('div');
        this.labelContainer.style.cssText = `
            position: absolute;
            top: 60px; left: 50%;
            transform: translateX(-50%);
            padding: 4px 12px;
            background: rgba(0, 20, 40, 0.8);
            border-left: 3px solid #00ffff;
            backdrop-filter: blur(5px);
            overflow: hidden;
        `;

        this.label = document.createElement('div');
        this.label.style.cssText = `
            color: #00ffff;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-weight: bold;
            font-size: 11px;
            white-space: nowrap;
            position: relative;
            z-index: 1;
        `;

        // Scanline effect
        const scanline = document.createElement('div');
        scanline.style.cssText = `
            position: absolute;
            top: 0; left: 0; width: 100%; height: 2px;
            background: rgba(0, 255, 255, 0.3);
            animation: __hud_scan 2s linear infinite;
        `;

        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes __hud_scan { 0% { top: 0; } 100% { top: 100%; } }
            @keyframes __hud_particle { 0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); } }
        `;
        document.head.appendChild(styleSheet);

        this.labelContainer.appendChild(scanline);
        this.labelContainer.appendChild(this.label);
        this.orb.appendChild(this.labelContainer);
        this.container.appendChild(this.orb);
        document.body.appendChild(this.container);
    }

    createParticle(x, y, color) {
        const p = document.createElement('div');
        p.style.cssText = `
            position: absolute;
            left: ${x}px; top: ${y}px;
            width: 4px; height: 4px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            animation: __hud_particle 0.6s ease-out forwards;
            z-index: 2147483646;
        `;
        this.container.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }

    update(data) {
        if (!data) {
            this.container.style.display = 'none';
            this.isActive = false;
            return;
        }

        if (!this.isActive) {
            this.container.style.display = 'block';
            this.isActive = true;
        }

        const screenX = (1 - data.x) * window.innerWidth;
        const screenY = data.y * window.innerHeight;

        this.orb.style.left = `${screenX}px`;
        this.orb.style.top = `${screenY}px`;

        // Particles
        if (Math.random() > 0.3) {
            const color = data.gesture === 'scroll' ? '#00ffaa' : (data.gesture === 'history' ? '#ff00ff' : '#00ffff');
            this.createParticle(screenX, screenY, color);
        }

        // Update fingers status
        data.fingers.forEach((up, i) => {
            this.fingers[i].style.opacity = up ? '1' : '0.1';
            const angle = (i * 40) - 80;
            const dist = up ? 40 : 25;
            const fx = Math.cos(angle * Math.PI / 180) * dist;
            const fy = Math.sin(angle * Math.PI / 180) * dist;
            this.fingers[i].style.left = `calc(50% + ${fx}px)`;
            this.fingers[i].style.top = `calc(50% + ${fy}px)`;
            if (up) this.fingers[i].style.background = '#fff';
            else this.fingers[i].style.background = 'rgba(0,255,255,0.3)';
        });

        // UI Feedback based on gesture
        if (data.gesture === 'scroll') {
            this.orb.style.borderColor = '#00ffaa';
            this.orb.style.boxShadow = '0 0 40px rgba(0,255,170,0.5)';
            this.label.textContent = 'LINK_SYNC: SCROLLING';
            this.label.style.color = '#00ffaa';
            this.labelContainer.style.borderColor = '#00ffaa';
        } else if (data.gesture === 'history') {
            this.orb.style.borderColor = '#ff00ff';
            this.orb.style.boxShadow = '0 0 40px rgba(255,0,255,0.5)';
            this.label.textContent = 'DATA_FLOW: NAVIGATION';
            this.label.style.color = '#ff00ff';
            this.labelContainer.style.borderColor = '#ff00ff';
        } else {
            this.orb.style.borderColor = '#00ffff';
            this.orb.style.boxShadow = '0 0 30px rgba(0,255,255,0.3)';
            this.label.textContent = 'NEURAL_LINK: ACTIVE';
            this.label.style.color = '#00ffff';
            this.labelContainer.style.borderColor = '#00ffff';
        }
    }
}

const hud = new CyberHUD();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scroll') {
        window.scrollBy({ top: request.pixels, behavior: 'auto' });
    } else if (request.action === 'syncHUD') {
        hud.update(request.data);
    }
});
