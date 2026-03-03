/* ========================================
   INTELLEX 2026 — MATRIX RAIN + VIBRANT
   Digital Rain + Scan Lines + Glow FX
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
    // 2. MATRIX DIGITAL RAIN BACKGROUND
    //    Colorful falling characters
    // ===================================
    const container = document.getElementById('bg3d');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Scan line overlay
    const scanOverlay = document.createElement('div');
    scanOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 0;
        background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
        );
    `;
    container.appendChild(scanOverlay);

    // Grid overlay
    const gridOverlay = document.createElement('div');
    gridOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 0;
        background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 50px 50px;
    `;
    container.appendChild(gridOverlay);

    let W, H;
    let columns, drops;
    let mouse = { x: -1, y: -1 };
    let time = 0;

    // Characters for the rain — mix of tech symbols, numbers, and code characters
    const chars = '01アイウエオカキクケコINTELLEX{}[]<>/=+*#@$%^&|~0123456789ABCDEFλΣΩπ∞∑∆√';
    const charArray = chars.split('');

    // Vibrant color palette for the rain
    const rainColors = [
        '#ff6b6b', '#f06595', '#cc5de8', '#845ef7', '#5c7cfa',
        '#339af0', '#22b8cf', '#20c997', '#51cf66', '#ffd43b',
        '#ff922b', '#ff6b6b', '#e599f7', '#74c0fc', '#63e6be',
    ];

    // Each column gets its own color
    let columnColors = [];
    let columnSpeeds = [];
    let columnBrightness = [];

    function resizeCanvas() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;

        const fontSize = 16;
        columns = Math.floor(W / fontSize);
        drops = [];
        columnColors = [];
        columnSpeeds = [];
        columnBrightness = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
            columnColors[i] = rainColors[Math.floor(Math.random() * rainColors.length)];
            columnSpeeds[i] = 0.3 + Math.random() * 0.8;
            columnBrightness[i] = 0.5 + Math.random() * 0.5;
        }
    }

    function drawMatrixRain() {
        // Semi-transparent background for trail effect
        ctx.fillStyle = 'rgba(20, 10, 40, 0.06)';
        ctx.fillRect(0, 0, W, H);

        // Draw gradient background (very subtle, underneath rain)
        if (time % 200 === 0) {
            const bgGrad = ctx.createLinearGradient(0, 0, W, H);
            bgGrad.addColorStop(0, 'rgba(20, 10, 40, 0.02)');
            bgGrad.addColorStop(0.5, 'rgba(40, 10, 60, 0.02)');
            bgGrad.addColorStop(1, 'rgba(10, 20, 50, 0.02)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);
        }

        const fontSize = 16;

        for (let i = 0; i < columns; i++) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Distance from mouse
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseInfluence = dist < 150;

            // Lead character (brightest — white/bright glow)
            if (mouseInfluence) {
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${fontSize + 4}px 'Orbitron', 'Share Tech Mono', monospace`;
            } else {
                ctx.shadowColor = columnColors[i];
                ctx.shadowBlur = 15;
                ctx.fillStyle = columnColors[i];
                ctx.font = `${fontSize}px 'Share Tech Mono', 'Courier New', monospace`;
            }

            // Draw the character
            ctx.globalAlpha = columnBrightness[i];
            ctx.fillText(char, x, y);

            // Draw trailing characters (dimmer)
            const trailLength = 8 + Math.floor(Math.random() * 6);
            for (let t = 1; t <= trailLength; t++) {
                const trailY = y - t * fontSize;
                if (trailY < 0) continue;
                const trailChar = charArray[Math.floor(Math.random() * charArray.length)];
                const alpha = (1 - t / trailLength) * 0.3 * columnBrightness[i];
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 0;
                ctx.fillStyle = columnColors[i];
                ctx.font = `${fontSize}px 'Share Tech Mono', 'Courier New', monospace`;
                ctx.fillText(trailChar, x, trailY);
            }

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            // Move drop down
            drops[i] += columnSpeeds[i];

            // Reset when off screen (random reset for variety)
            if (drops[i] * fontSize > H && Math.random() > 0.985) {
                drops[i] = 0;
                columnColors[i] = rainColors[Math.floor(Math.random() * rainColors.length)];
                columnSpeeds[i] = 0.3 + Math.random() * 0.8;
                columnBrightness[i] = 0.5 + Math.random() * 0.5;
            }
        }

        // Draw floating light orbs
        for (let i = 0; i < 6; i++) {
            const ox = W * (0.1 + i * 0.15) + Math.sin(time * 0.01 + i * 1.5) * 100;
            const oy = H * (0.3 + Math.sin(i * 2.5) * 0.2) + Math.cos(time * 0.008 + i) * 80;
            const or = 60 + Math.sin(time * 0.005 + i) * 20;
            const color = rainColors[i % rainColors.length];

            const col = hexToRgb(color);
            if (!col) continue;

            const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
            grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0.08)`);
            grad.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, 0.03)`);
            grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ox, oy, or, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mouse glow
        if (mouse.x > 0) {
            const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
            mg.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            mg.addColorStop(0.3, 'rgba(132, 94, 247, 0.05)');
            mg.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = mg;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
            ctx.fill();
        }

        time++;
        requestAnimationFrame(drawMatrixRain);
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Initialize
    resizeCanvas();

    // Fill initial background
    ctx.fillStyle = '#140a28';
    ctx.fillRect(0, 0, W, H);

    drawMatrixRain();

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('resize', resizeCanvas);

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
    // 6. SCROLL REVEAL
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
