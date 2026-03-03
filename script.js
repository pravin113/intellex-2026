/* ========================================
   INTELLEX 2026 — LIQUID AURORA THEME
   Interactive Color Art Background
   ======================================== */

(function () {
    'use strict';

    // ===================================
    // 1. PRELOADER
    // ===================================
    window.addEventListener('load', () => {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            preloader.classList.add('hidden');
            setTimeout(() => { preloader.style.display = 'none'; initAllAnimations(); }, 800);
        }, 2200);
    });
    function initAllAnimations() { initScrollReveal(); triggerHeroReveal(); }

    // ===================================
    // 2. LIQUID AURORA BACKGROUND
    //    Metaballs + Aurora Waves + Mouse Trail
    // ===================================
    const container = document.getElementById('bg3d');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    let W, H;
    let mouse = { x: -500, y: -500, trail: [] };
    let time = 0;
    let blobs = [];
    let auroras = [];
    let trailParticles = [];

    // HSL color cycling
    let hueShift = 0;

    class GradientBlob {
        constructor(i, total) {
            this.reset(i, total);
        }
        reset(i, total) {
            W = canvas.width; H = canvas.height;
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.radius = 150 + Math.random() * 250;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;

            // Vibrant base hues spread across spectrum
            const hues = [0, 30, 60, 120, 180, 240, 280, 320]; // Red, orange, yellow, green, cyan, blue, purple, magenta
            this.baseHue = hues[i % hues.length];
            this.saturation = 85 + Math.random() * 15;
            this.lightness = 55 + Math.random() * 15;
            this.opacity = 0.4 + Math.random() * 0.2;

            this.wobbleSpeedX = 0.002 + Math.random() * 0.003;
            this.wobbleSpeedY = 0.002 + Math.random() * 0.003;
            this.wobbleAmplitude = 30 + Math.random() * 50;
            this.phaseX = Math.random() * Math.PI * 2;
            this.phaseY = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.005 + Math.random() * 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update(time) {
            // Organic movement
            this.x += this.vx + Math.sin(time * this.wobbleSpeedX + this.phaseX) * 0.8;
            this.y += this.vy + Math.cos(time * this.wobbleSpeedY + this.phaseY) * 0.8;

            // Bounce off edges softly
            if (this.x < -this.radius) this.x = W + this.radius;
            if (this.x > W + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = H + this.radius;
            if (this.y > H + this.radius) this.y = -this.radius;

            // Mouse attraction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400) {
                const force = (400 - dist) / 400;
                this.x += dx * force * 0.005;
                this.y += dy * force * 0.005;
            }

            // Pulsing radius
            this.currentRadius = this.radius + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 30;

            // Shift hue over time
            this.currentHue = (this.baseHue + hueShift) % 360;
        }

        draw() {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.currentRadius
            );
            const h = this.currentHue;
            const s = this.saturation;
            const l = this.lightness;
            gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${this.opacity})`);
            gradient.addColorStop(0.4, `hsla(${h + 15}, ${s}%, ${l - 5}%, ${this.opacity * 0.6})`);
            gradient.addColorStop(0.7, `hsla(${h + 30}, ${s - 10}%, ${l - 10}%, ${this.opacity * 0.2})`);
            gradient.addColorStop(1, `hsla(${h + 40}, ${s - 20}%, ${l - 15}%, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class AuroraWave {
        constructor(i) {
            this.baseY = H * (0.2 + i * 0.2);
            this.amplitude = 60 + Math.random() * 80;
            this.frequency = 0.002 + Math.random() * 0.003;
            this.speed = 0.3 + Math.random() * 0.5;
            this.hue = [300, 180, 60, 120, 30][i % 5]; // magenta, cyan, yellow, green, orange
            this.thickness = 100 + Math.random() * 80;
            this.opacity = 0.06 + Math.random() * 0.04;
            this.phase = Math.random() * Math.PI * 2;
            this.drift = (Math.random() - 0.5) * 0.2;
        }

        draw(time) {
            ctx.beginPath();

            const h = (this.hue + hueShift * 0.5) % 360;
            const gradient = ctx.createLinearGradient(0, this.baseY - this.thickness, 0, this.baseY + this.thickness);
            gradient.addColorStop(0, `hsla(${h}, 90%, 65%, 0)`);
            gradient.addColorStop(0.3, `hsla(${h}, 90%, 60%, ${this.opacity})`);
            gradient.addColorStop(0.5, `hsla(${h + 20}, 85%, 55%, ${this.opacity * 1.5})`);
            gradient.addColorStop(0.7, `hsla(${h + 40}, 80%, 60%, ${this.opacity})`);
            gradient.addColorStop(1, `hsla(${h + 40}, 80%, 65%, 0)`);

            ctx.fillStyle = gradient;

            ctx.moveTo(0, H);
            for (let x = 0; x <= W; x += 3) {
                const wave1 = Math.sin(x * this.frequency + time * this.speed + this.phase) * this.amplitude;
                const wave2 = Math.sin(x * this.frequency * 1.5 + time * this.speed * 0.7 + this.phase * 2) * this.amplitude * 0.4;
                const wave3 = Math.cos(x * this.frequency * 0.5 + time * this.speed * 1.3) * this.amplitude * 0.3;
                const mouseInfluence = Math.exp(-Math.pow((x - mouse.x) / 200, 2)) * 40 * Math.sin(time * 3);
                const y = this.baseY + wave1 + wave2 + wave3 + mouseInfluence + this.drift * time;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(W, H);
            ctx.closePath();
            ctx.fill();
        }
    }

    class TrailParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4 - 2;
            this.radius = 3 + Math.random() * 8;
            this.life = 1;
            this.decay = 0.008 + Math.random() * 0.015;
            this.hue = (Math.random() * 360 + hueShift) % 360;
            this.gravity = 0.02 + Math.random() * 0.03;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.vx *= 0.99;
            this.life -= this.decay;
            this.radius *= 0.995;
        }

        draw() {
            if (this.life <= 0) return;
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${this.life * 0.8})`);
            gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 90%, 60%, ${this.life * 0.4})`);
            gradient.addColorStop(1, `hsla(${this.hue + 40}, 80%, 50%, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function resizeCanvas() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function initBackground() {
        resizeCanvas();

        // Create blobs
        blobs = [];
        for (let i = 0; i < 10; i++) {
            blobs.push(new GradientBlob(i, 10));
        }

        // Create aurora waves
        auroras = [];
        for (let i = 0; i < 5; i++) {
            auroras.push(new AuroraWave(i));
        }
    }

    // Mouse trail
    let lastMouseX = 0, lastMouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Spawn trail particles on movement
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 3) {
            const count = Math.min(Math.floor(speed / 5), 4);
            for (let i = 0; i < count; i++) {
                trailParticles.push(new TrailParticle(e.clientX, e.clientY));
            }
        }

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    // Click explosion
    document.addEventListener('click', (e) => {
        for (let i = 0; i < 30; i++) {
            const p = new TrailParticle(e.clientX, e.clientY);
            p.vx = (Math.random() - 0.5) * 12;
            p.vy = (Math.random() - 0.5) * 12;
            p.radius = 5 + Math.random() * 15;
            p.decay = 0.005 + Math.random() * 0.01;
            trailParticles.push(p);
        }
    });

    function animateBackground() {
        requestAnimationFrame(animateBackground);
        time += 0.016;

        // Slowly shift all colors over time
        hueShift = (time * 8) % 360;

        // Clear with gradient base
        const bgGrad = ctx.createLinearGradient(0, 0, W * 0.7, H);
        const h1 = (340 + hueShift * 0.3) % 360;
        const h2 = (260 + hueShift * 0.3) % 360;
        const h3 = (200 + hueShift * 0.3) % 360;
        bgGrad.addColorStop(0, `hsl(${h1}, 80%, 65%)`);
        bgGrad.addColorStop(0.4, `hsl(${h2}, 75%, 55%)`);
        bgGrad.addColorStop(1, `hsl(${h3}, 80%, 58%)`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Set blend mode for additive/screen blending
        ctx.globalCompositeOperation = 'screen';

        // Draw gradient blobs
        blobs.forEach(b => {
            b.update(time);
            b.draw();
        });

        // Draw aurora waves
        ctx.globalCompositeOperation = 'screen';
        auroras.forEach(a => a.draw(time));

        // Draw trail particles
        ctx.globalCompositeOperation = 'screen';
        trailParticles.forEach(p => {
            p.update();
            p.draw();
        });
        trailParticles = trailParticles.filter(p => p.life > 0);

        // Draw floating light orbs (bright spots)
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 8; i++) {
            const ox = W * (0.1 + 0.1 * i) + Math.sin(time * (0.3 + i * 0.1) + i * 1.5) * 100;
            const oy = H * (0.3 + Math.sin(i * 2) * 0.2) + Math.cos(time * (0.2 + i * 0.08) + i * 2) * 80;
            const or = 40 + Math.sin(time * 0.5 + i) * 15;
            const oh = (i * 45 + hueShift) % 360;

            const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
            orbGrad.addColorStop(0, `hsla(${oh}, 100%, 85%, 0.6)`);
            orbGrad.addColorStop(0.3, `hsla(${oh + 15}, 90%, 70%, 0.3)`);
            orbGrad.addColorStop(0.6, `hsla(${oh + 30}, 80%, 60%, 0.1)`);
            orbGrad.addColorStop(1, `hsla(${oh + 40}, 70%, 50%, 0)`);
            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(ox, oy, or, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mouse glow
        if (mouse.x > 0) {
            const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
            const mh = (time * 50) % 360;
            mg.addColorStop(0, `hsla(${mh}, 100%, 85%, 0.25)`);
            mg.addColorStop(0.5, `hsla(${mh + 30}, 90%, 70%, 0.08)`);
            mg.addColorStop(1, `hsla(${mh + 60}, 80%, 60%, 0)`);
            ctx.fillStyle = mg;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    initBackground();
    animateBackground();

    window.addEventListener('resize', () => {
        resizeCanvas();
        blobs.forEach((b, i) => {
            b.x = Math.random() * W;
            b.y = Math.random() * H;
        });
        auroras.forEach((a, i) => {
            a.baseY = H * (0.2 + i * 0.2);
        });
    });

    // ===================================
    // 3. CUSTOM CURSOR
    // ===================================
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    let cX = 0, cY = 0, rX = 0, rY = 0;

    document.addEventListener('mousemove', e => {
        cX = e.clientX; cY = e.clientY;
        cursorDot.style.left = cX + 'px'; cursorDot.style.top = cY + 'px';
    });
    function animCursor() {
        rX += (cX - rX) * 0.15; rY += (cY - rY) * 0.15;
        cursorRing.style.left = rX + 'px'; cursorRing.style.top = rY + 'px';
        requestAnimationFrame(animCursor);
    }
    animCursor();

    document.querySelectorAll('a, button, input, select, .event-card, .stat-card, .checkbox-label').forEach(el => {
        el.addEventListener('mouseenter', () => { cursorDot.classList.add('hovering'); cursorRing.classList.add('hovering'); });
        el.addEventListener('mouseleave', () => { cursorDot.classList.remove('hovering'); cursorRing.classList.remove('hovering'); });
    });

    // ===================================
    // 4. NAVIGATION
    // ===================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
        updateActiveNavLink();
    });
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active'); mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileLinks.forEach(l => l.addEventListener('click', () => {
        navToggle.classList.remove('active'); mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }));
    function updateActiveNavLink() {
        let current = '';
        document.querySelectorAll('section[id], footer[id]').forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
        navLinks.forEach(l => { l.classList.toggle('active', l.dataset.section === current); });
    }

    // ===================================
    // 5. COUNTDOWN
    // ===================================
    const eventDate = new Date('2026-04-10T09:00:00+05:30').getTime();
    function updateCountdown() {
        const diff = eventDate - Date.now();
        if (diff <= 0) { ['countDays', 'countHours', 'countMinutes', 'countSeconds'].forEach(id => document.getElementById(id).textContent = '00'); return; }
        document.getElementById('countDays').textContent = String(Math.floor(diff / 864e5)).padStart(2, '0');
        document.getElementById('countHours').textContent = String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0');
        document.getElementById('countMinutes').textContent = String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0');
        document.getElementById('countSeconds').textContent = String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0');
    }
    updateCountdown(); setInterval(updateCountdown, 1000);

    // ===================================
    // 6. 3D SCROLL REVEAL
    // ===================================
    function initScrollReveal() {
        const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const d = parseFloat(e.target.dataset.delay || 0);
                    setTimeout(() => e.target.classList.add('revealed'), d * 1000);
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        els.forEach(el => obs.observe(el));
    }
    function triggerHeroReveal() {
        document.querySelectorAll('.hero .reveal-up').forEach(el => {
            const d = parseFloat(el.dataset.delay || 0);
            setTimeout(() => el.classList.add('revealed'), d * 1000 + 200);
        });
    }

    // ===================================
    // 7-8. EVENT + SCHEDULE TABS
    // ===================================
    document.querySelectorAll('.event-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.event-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.dataset.category;
            document.querySelectorAll('.event-card').forEach(c => {
                if (cat === 'all' || c.dataset.category === cat) { c.classList.remove('hidden-card'); c.style.animation = 'fadeInUp 0.5s ease forwards'; }
                else c.classList.add('hidden-card');
            });
        });
    });
    document.querySelectorAll('.schedule-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.schedule-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.timeline-day').forEach(d => {
                d.classList.remove('active');
                if (d.dataset.day === tab.dataset.day) {
                    d.classList.add('active');
                    d.querySelectorAll('.reveal-left, .reveal-right').forEach((item, i) => {
                        item.classList.remove('revealed');
                        setTimeout(() => item.classList.add('revealed'), i * 100 + 100);
                    });
                }
            });
        });
    });

    // ===================================
    // 9. REGISTRATION
    // ===================================
    const form = document.getElementById('registerForm');
    const modal = document.getElementById('successModal');
    const modalBtn = document.getElementById('modalClose');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const fields = ['regName', 'regEmail', 'regPhone', 'regCollege', 'regYear', 'regDept'];
        if (fields.some(id => !document.getElementById(id).value.trim())) return;
        if (!form.querySelectorAll('input[name="events"]:checked').length) { alert('Please select at least one event!'); return; }
        modal.classList.add('active'); form.reset();
    });
    modalBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

    // ===================================
    // 10. SMOOTH SCROLL
    // ===================================
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
        });
    });

    // ===================================
    // 11. PARALLAX
    // ===================================
    window.addEventListener('scroll', () => {
        const s = window.scrollY;
        const hero = document.querySelector('.hero-content');
        if (hero && s < window.innerHeight) {
            hero.style.transform = `translateY(${s * 0.3}px)`;
            hero.style.opacity = 1 - s / (window.innerHeight * 0.8);
        }
    });

    // ===================================
    // 12-13. ICONS + KEYFRAMES
    // ===================================
    if (typeof lucide !== 'undefined') lucide.createIcons();
    const ss = document.createElement('style');
    ss.textContent = `@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`;
    document.head.appendChild(ss);

})();
