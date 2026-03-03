/* ========================================
   INTELLEX 2026 — VIBRANT 3D SCENE
   Morphing Icosahedron + Orbiting Spheres
   + DNA Helix + Scroll-linked camera
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
    // 2. THREE.JS — VIBRANT 3D SCENE
    // ===================================
    const container = document.getElementById('bg3d');
    let scene, camera, renderer, clock;
    let centerShape, dnaGroup;
    let orbitingSpheres = [];
    let mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0;

    function init3D() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 0, 300);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0); // transparent — CSS gradient shows through
        container.appendChild(renderer.domElement);

        clock = new THREE.Clock();

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambient);

        const p1 = new THREE.PointLight(0xff6b6b, 2, 500);
        p1.position.set(100, 100, 100);
        scene.add(p1);

        const p2 = new THREE.PointLight(0x339af0, 2, 500);
        p2.position.set(-100, -50, 150);
        scene.add(p2);

        const p3 = new THREE.PointLight(0x845ef7, 1.5, 400);
        p3.position.set(0, 150, -100);
        scene.add(p3);

        createCenterShape();
        createDNAHelix();
        createOrbitingSpheres();
        createFloatingCubes();
        createParticleField();

        animate3D();
    }

    // --- MORPHING CENTER ICOSAHEDRON ---
    function createCenterShape() {
        const geo = new THREE.IcosahedronGeometry(50, 4);
        const originalPositions = geo.attributes.position.array.slice();

        const mat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.2,
            roughness: 0.1,
            transparent: true,
            opacity: 0.15,
            wireframe: false,
            side: THREE.DoubleSide,
        });

        centerShape = new THREE.Mesh(geo, mat);
        centerShape._originalPositions = originalPositions;
        scene.add(centerShape);

        // Wireframe overlay
        const wireGeo = new THREE.IcosahedronGeometry(50, 2);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
        });
        const wire = new THREE.Mesh(wireGeo, wireMat);
        centerShape.add(wire);
        centerShape._wire = wire;
    }

    // --- DNA DOUBLE HELIX ---
    function createDNAHelix() {
        dnaGroup = new THREE.Group();
        const helixLength = 600;
        const turns = 4;
        const pointsPerTurn = 30;
        const totalPoints = turns * pointsPerTurn;
        const radius = 25;

        const colors1 = [0xff6b6b, 0xf06595, 0xcc5de8, 0x845ef7, 0x5c7cfa, 0x339af0, 0x22b8cf, 0x20c997];
        const colors2 = [0xffd43b, 0xffa94d, 0xff6b6b, 0xf06595, 0xcc5de8, 0x845ef7, 0x5c7cfa, 0x339af0];

        for (let i = 0; i < totalPoints; i++) {
            const t = i / totalPoints;
            const angle = t * Math.PI * 2 * turns;
            const y = (t - 0.5) * helixLength;

            // Strand 1
            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;
            const sphere1 = new THREE.Mesh(
                new THREE.SphereGeometry(2, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: colors1[i % colors1.length],
                    transparent: true,
                    opacity: 0.5
                })
            );
            sphere1.position.set(x1, y, z1);
            dnaGroup.add(sphere1);

            // Strand 2
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;
            const sphere2 = new THREE.Mesh(
                new THREE.SphereGeometry(2, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: colors2[i % colors2.length],
                    transparent: true,
                    opacity: 0.5
                })
            );
            sphere2.position.set(x2, y, z2);
            dnaGroup.add(sphere2);

            // Cross-links every N points
            if (i % 4 === 0) {
                const linkGeo = new THREE.CylinderGeometry(0.3, 0.3, radius * 2, 4);
                const linkMat = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.1
                });
                const link = new THREE.Mesh(linkGeo, linkMat);
                link.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
                link.rotation.z = Math.PI / 2;
                link.rotation.y = angle;
                dnaGroup.add(link);
            }
        }

        dnaGroup.position.set(180, 0, -100);
        dnaGroup.rotation.z = 0.3;
        scene.add(dnaGroup);
    }

    // --- ORBITING SPHERES ---
    function createOrbitingSpheres() {
        const colors = [0xff6b6b, 0x339af0, 0xffd43b, 0x20c997, 0xcc5de8, 0xff922b, 0x51cf66, 0xf06595];

        for (let i = 0; i < 14; i++) {
            const radius = 6 + Math.random() * 12;
            const geo = new THREE.SphereGeometry(radius, 16, 16);
            const color = colors[i % colors.length];

            const mat = new THREE.MeshPhysicalMaterial({
                color: color,
                metalness: 0.3,
                roughness: 0.2,
                transparent: true,
                opacity: 0.35,
                clearcoat: 0.8,
            });

            const sphere = new THREE.Mesh(geo, mat);

            // Orbit parameters
            sphere._orbitRadius = 80 + Math.random() * 150;
            sphere._orbitSpeed = 0.15 + Math.random() * 0.3;
            sphere._orbitOffset = (i / 14) * Math.PI * 2;
            sphere._orbitTilt = (Math.random() - 0.5) * 1.2;
            sphere._verticalRange = 50 + Math.random() * 80;
            sphere._verticalSpeed = 0.2 + Math.random() * 0.4;

            // Glow
            const glowGeo = new THREE.SphereGeometry(radius * 1.6, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.05, side: THREE.BackSide });
            sphere.add(new THREE.Mesh(glowGeo, glowMat));

            scene.add(sphere);
            orbitingSpheres.push(sphere);
        }
    }

    // --- FLOATING CUBES ---
    function createFloatingCubes() {
        const colors = [0xff6b6b, 0x845ef7, 0x339af0, 0xffd43b, 0x20c997, 0xf06595];

        for (let i = 0; i < 20; i++) {
            const size = 4 + Math.random() * 10;
            const geo = new THREE.BoxGeometry(size, size, size);
            const edgeGeo = new THREE.EdgesGeometry(geo);
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.15 + Math.random() * 0.1 });
            const cube = new THREE.LineSegments(edgeGeo, mat);

            cube.position.set(
                (Math.random() - 0.5) * 600,
                (Math.random() - 0.5) * 400,
                (Math.random() - 0.5) * 400
            );

            cube._rotSpeed = {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.005
            };
            cube._floatSpeed = Math.random() * 0.3 + 0.1;
            cube._floatOffset = Math.random() * Math.PI * 2;
            cube._baseY = cube.position.y;
            cube.name = 'floatingCube';
            scene.add(cube);
        }
    }

    // --- PARTICLE FIELD ---
    function createParticleField() {
        const count = 600;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const palette = [
            new THREE.Color(0xffffff),
            new THREE.Color(0xffd43b),
            new THREE.Color(0xff6b6b),
            new THREE.Color(0x339af0),
            new THREE.Color(0x20c997),
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 800;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 2,
            transparent: true,
            opacity: 0.4,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const pts = new THREE.Points(geo, mat);
        pts.name = 'particleField';
        scene.add(pts);
    }

    // --- ANIMATION LOOP ---
    function animate3D() {
        requestAnimationFrame(animate3D);
        const t = clock.getElapsedTime();

        tMouseX += (mouseX - tMouseX) * 0.03;
        tMouseY += (mouseY - tMouseY) * 0.03;

        // Camera follows mouse + subtle drift
        camera.position.x = tMouseX * 40 + Math.sin(t * 0.1) * 15;
        camera.position.y = tMouseY * -30 + Math.cos(t * 0.08) * 10;
        camera.lookAt(0, 0, 0);

        // Morph center icosahedron
        if (centerShape) {
            const positions = centerShape.geometry.attributes.position.array;
            const original = centerShape._originalPositions;
            for (let i = 0; i < positions.length; i += 3) {
                const ox = original[i], oy = original[i + 1], oz = original[i + 2];
                const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
                const noise = Math.sin(ox * 0.05 + t * 1.5) * Math.cos(oy * 0.05 + t * 1.2) * Math.sin(oz * 0.05 + t * 0.8);
                const scale = 1 + noise * 0.15;
                positions[i] = ox * scale;
                positions[i + 1] = oy * scale;
                positions[i + 2] = oz * scale;
            }
            centerShape.geometry.attributes.position.needsUpdate = true;
            centerShape.rotation.y = t * 0.15;
            centerShape.rotation.x = Math.sin(t * 0.1) * 0.2;

            if (centerShape._wire) {
                centerShape._wire.rotation.y = -t * 0.05;
            }
        }

        // DNA helix rotation
        if (dnaGroup) {
            dnaGroup.rotation.y = t * 0.2;
            dnaGroup.position.y = Math.sin(t * 0.15) * 20;
        }

        // Orbiting spheres
        orbitingSpheres.forEach(s => {
            const angle = t * s._orbitSpeed + s._orbitOffset;
            s.position.x = Math.cos(angle) * s._orbitRadius;
            s.position.z = Math.sin(angle) * s._orbitRadius + Math.sin(angle * s._orbitTilt) * 30;
            s.position.y = Math.sin(t * s._verticalSpeed + s._orbitOffset) * s._verticalRange;

            const pulse = 1 + Math.sin(t * 2 + s._orbitOffset) * 0.1;
            s.scale.set(pulse, pulse, pulse);
        });

        // Floating cubes
        scene.children.forEach(child => {
            if (child.name === 'floatingCube') {
                child.rotation.x += child._rotSpeed.x;
                child.rotation.y += child._rotSpeed.y;
                child.rotation.z += child._rotSpeed.z;
                child.position.y = child._baseY + Math.sin(t * child._floatSpeed + child._floatOffset) * 20;
            }
            if (child.name === 'particleField') {
                child.rotation.y = t * 0.008;
            }
        });

        renderer.render(scene, camera);
    }

    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    init3D();

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
