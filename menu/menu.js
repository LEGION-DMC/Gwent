document.addEventListener('contextmenu', function (e) {
    const isCard = e.target.closest('.card, .collection-card, .deck-card');
    if (!isCard) {
        e.preventDefault();
        return false;
    }
});

const FireParticles = (() => {
    let canvas = null;
    let ctx = null;
    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const particles = [];
    const MAX_PARTICLES = 600;
    const PER_FRAME = 4;

    let deathY = 0;

    function init() {
        if (canvas) return;

        canvas = document.createElement('canvas');
        canvas.className = 'fire-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');
        resize();

        window.addEventListener('resize', resize);
    }

    function resize() {
        if (!canvas) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;

        deathY = -10;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width - 200;
            this.y = height + 100;

            this.length = 2 + Math.random() * 3;
            this.width = 0.1 + Math.random() * 0.5;

            this.speedX = (Math.random() - 0.2) * 4;
            this.speedY = Math.random() * -5 - 1;

            const r = 255;
            const g = Math.floor(50 + Math.random() * 100);
            const b = 0;
            this.color = `rgb(${r},${g},${b})`;
            this.alpha = 1;

            this.angle = Math.atan2(this.speedY, this.speedX);

            // Время жизни — гарантирует смерть частицы
            this.life = 0;
            this.maxLife = 400 + Math.random() * 400;
        }

        update() {
            this.life++;
            this.x += this.speedX;
            this.y += this.speedY;

            this.speedY *= 0.998;

            this.alpha -= 0.0015;

            if (this.y > 50) {
                this.alpha = Math.max(this.alpha, 0.15);
            }

            this.angle = Math.atan2(this.speedY, this.speedX);

            return this.y < deathY || this.alpha <= 0 || this.life > this.maxLife;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.length, this.width, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = Math.max(0, this.alpha) * 0.9;
            ctx.fillStyle = `rgb(255, 200, 100)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.length * 0.5, this.width * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    function handleParticles() {
        const spawnCount = Math.min(PER_FRAME, MAX_PARTICLES - particles.length);
        for (let i = 0; i < spawnCount; i++) {
            particles.push(new Particle());
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            const dead = p.update();

            if (dead) {
                particles[i] = particles[particles.length - 1];
                particles.pop();
                continue;
            }

            p.draw();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        handleParticles();
        rafId = requestAnimationFrame(animate);
    }

    function start() {
        init();
        if (!rafId) {
            rafId = requestAnimationFrame(animate);
        }
    }

    /** Остановить анимацию и очистить canvas (частицы исчезают мгновенно) */
    function stop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
        particles.length = 0;
        if (ctx) {
            ctx.clearRect(0, 0, width, height);
        }
    }

    /** Полностью удалить canvas из DOM */
    function destroy() {
        stop();
        window.removeEventListener('resize', resize);
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        canvas = null;
        ctx = null;
    }

    return { start, stop, destroy };
})();

window.FireParticles = FireParticles;

document.addEventListener('DOMContentLoaded', () => {
    FireParticles.start();

    const startPage = document.querySelector('.start-page');

    startPage.innerHTML = `
        <img src="ui/logo.png" alt="Gwent" class="logo">
        <div class="main-menu-buttons">
            <button class="menu-btn play-btn" id="playBtn">ИГРАТЬ</button>
            <button class="menu-btn collection-btn" id="collectionBtn">КОЛЛЕКЦИЯ</button>
            <button class="menu-btn rules-btn" id="rulesBtn">ПРАВИЛА</button>
            <button class="menu-btn settings-btn" id="settingsBtn">ОПЦИИ</button>
        </div>
    `;

    const elements = {
        logo: document.querySelector('.logo'),
        menuButtons: document.querySelector('.main-menu-buttons'),
        playBtn: document.getElementById('playBtn'),
        collectionBtn: document.getElementById('collectionBtn'),
        rulesBtn: document.getElementById('rulesBtn'),
        settingsBtn: document.getElementById('settingsBtn')
    };

    const animateTransition = (callback) => {
        if (elements.logo) {
            elements.logo.style.animation = 'fadeOutUp 0.5s ease forwards';
        }
        if (elements.menuButtons) {
            elements.menuButtons.style.animation = 'fadeOutDown 0.5s ease forwards';
        }

        setTimeout(() => {
            if (startPage) {
                startPage.style.opacity = '0';
                setTimeout(() => {
                    startPage.style.display = 'none';
                    callback?.();
                }, 300);
            } else {
                callback?.();
            }
        }, 500);
    };

    elements.playBtn?.addEventListener('click', () => {
        audioManager.playSound('button');
        animateTransition(() => window.factionModule?.initFactionSelection());
    });

    elements.collectionBtn?.addEventListener('click', () => {
        audioManager.playSound('button');
        animateTransition(() => window.collectionModule?.initCollection());
    });

    elements.rulesBtn?.addEventListener('click', () => {
        audioManager.playSound('button');
        window.rulesModule.initRulesPage();
    });

    elements.settingsBtn?.addEventListener('click', () => {
        audioManager.playSound('button');
        showSettingsModal();
    });

    [elements.playBtn, elements.collectionBtn, elements.rulesBtn, elements.settingsBtn]
        .forEach(btn => btn?.addEventListener('mouseenter', () => audioManager.playSound('touch')));
});