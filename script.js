/* ========================================
   INTELLEX 2026 — BRIGHT THEME Script
   NEW 3D: Morphing Wave + Glass Spheres
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
            setTimeout(() => {
                preloader.style.display = 'none';
                initAllAnimations();
            }, 800);
        }, 2200);
    });

    function initAllAnimations() {
        initScrollReveal();
        triggerHeroReveal();
    }

    // ===================================
    // 2. THREE.JS — NEW 3D BACKGROUND
    //    Morphing Wave + Glass Orbs + Beams
    // ===================================
    const container = document.getElementById('bg3d');
    let scene, camera, renderer, clock;
    let waveMesh, waveMesh2;
    let orbs = [];
    let beams = [];
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    function init3D() {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xf5f0ff, 0.00035);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
        camera.position.set(0, 120, 400);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0xf5f0ff, 1);
        container.appendChild(renderer.domElement);

        clock = new THREE.Clock();

        // Add lights for the spheres
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(200, 300, 200);
        scene.add(dirLight);

        const pointLight1 = new THREE.PointLight(0x7c3aed, 1.5, 600);
        pointLight1.position.set(-150, 100, 100);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xf43f5e, 1.2, 600);
        pointLight2.position.set(200, 80, -100);
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0x06b6d4, 1, 500);
        pointLight3.position.set(0, 150, -200);
        scene.add(pointLight3);

        createWaveTerrain();
        createGlassOrbs();
        createLightBeams();
        createFloatingRings();
        createSparkles();

        animate3D();
    }

    // --- MORPHING WAVE TERRAIN ---
    function createWaveTerrain() {
        const segments = 120;
        const size = 1200;

        // First wave layer — purple/pink gradient
        const geo1 = new THREE.PlaneGeometry(size, size, segments, segments);
        const mat1 = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(0x7c3aed) },
                uColor2: { value: new THREE.Color(0xf43f5e) },
                uColor3: { value: new THREE.Color(0xf97316) },
                uOpacity: { value: 0.25 }
            },
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    // Complex wave pattern
                    float wave1 = sin(pos.x * 0.008 + uTime * 0.5) * 25.0;
                    float wave2 = sin(pos.y * 0.006 + uTime * 0.3) * 20.0;
                    float wave3 = sin((pos.x + pos.y) * 0.005 + uTime * 0.7) * 15.0;
                    float wave4 = cos(pos.x * 0.01 - uTime * 0.4) * sin(pos.y * 0.008 + uTime * 0.6) * 18.0;
                    float ripple = sin(length(pos.xy) * 0.008 - uTime * 0.8) * 12.0;
                    
                    pos.z = wave1 + wave2 + wave3 + wave4 + ripple;
                    vElevation = pos.z;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;
                uniform float uOpacity;
                uniform float uTime;
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    // Gradient based on position and elevation
                    float mixVal = (vElevation + 40.0) / 80.0;
                    vec3 color = mix(uColor1, uColor2, vUv.x);
                    color = mix(color, uColor3, vUv.y * 0.5);
                    color = mix(color, vec3(1.0), mixVal * 0.3);
                    
                    // Add shimmer
                    float shimmer = sin(vUv.x * 50.0 + uTime * 2.0) * 0.03;
                    color += shimmer;
                    
                    gl_FragColor = vec4(color, uOpacity + mixVal * 0.08);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: false,
            depthWrite: false
        });

        waveMesh = new THREE.Mesh(geo1, mat1);
        waveMesh.rotation.x = -Math.PI / 2.2;
        waveMesh.position.y = -80;
        scene.add(waveMesh);

        // Second wave layer — wireframe overlay
        const geo2 = new THREE.PlaneGeometry(size, size, 60, 60);
        const mat2 = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0x7c3aed) },
            },
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    float wave1 = sin(pos.x * 0.008 + uTime * 0.5) * 25.0;
                    float wave2 = sin(pos.y * 0.006 + uTime * 0.3) * 20.0;
                    float wave3 = sin((pos.x + pos.y) * 0.005 + uTime * 0.7) * 15.0;
                    float wave4 = cos(pos.x * 0.01 - uTime * 0.4) * sin(pos.y * 0.008 + uTime * 0.6) * 18.0;
                    float ripple = sin(length(pos.xy) * 0.008 - uTime * 0.8) * 12.0;
                    
                    pos.z = wave1 + wave2 + wave3 + wave4 + ripple + 1.0;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying vec2 vUv;
                
                void main() {
                    gl_FragColor = vec4(uColor, 0.06);
                }
            `,
            transparent: true,
            wireframe: true,
            depthWrite: false
        });

        waveMesh2 = new THREE.Mesh(geo2, mat2);
        waveMesh2.rotation.x = -Math.PI / 2.2;
        waveMesh2.position.y = -80;
        scene.add(waveMesh2);
    }

    // --- GLASS ORBS (reflective floating spheres) ---
    function createGlassOrbs() {
        const orbData = [
            { radius: 20, pos: [-120, 60, -50], color: 0x7c3aed, speed: 0.4 },
            { radius: 15, pos: [180, 90, -100], color: 0xf43f5e, speed: 0.5 },
            { radius: 25, pos: [50, 130, -200], color: 0x06b6d4, speed: 0.3 },
            { radius: 12, pos: [-200, 40, 50], color: 0xf97316, speed: 0.6 },
            { radius: 18, pos: [250, 70, -30], color: 0x10b981, speed: 0.35 },
            { radius: 10, pos: [-80, 110, -150], color: 0xec4899, speed: 0.55 },
            { radius: 22, pos: [0, 160, -250], color: 0x8b5cf6, speed: 0.25 },
            { radius: 8, pos: [150, 30, 100], color: 0xeab308, speed: 0.7 },
            { radius: 14, pos: [-250, 100, -80], color: 0x7c3aed, speed: 0.45 },
            { radius: 16, pos: [100, 50, 80], color: 0xf43f5e, speed: 0.5 },
            { radius: 9, pos: [-150, 150, 30], color: 0x06b6d4, speed: 0.65 },
            { radius: 13, pos: [220, 120, -180], color: 0x10b981, speed: 0.4 },
        ];

        orbData.forEach((data, i) => {
            const geo = new THREE.SphereGeometry(data.radius, 32, 32);

            // Glass-like material
            const mat = new THREE.MeshPhysicalMaterial({
                color: data.color,
                metalness: 0.1,
                roughness: 0.05,
                transparent: true,
                opacity: 0.45,
                envMapIntensity: 1,
                clearcoat: 1,
                clearcoatRoughness: 0.1,
            });

            const orb = new THREE.Mesh(geo, mat);
            orb.position.set(...data.pos);

            // Inner glow sphere
            const glowGeo = new THREE.SphereGeometry(data.radius * 0.6, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.15,
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            orb.add(glow);

            // Outer halo
            const haloGeo = new THREE.SphereGeometry(data.radius * 1.4, 16, 16);
            const haloMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.04,
                side: THREE.BackSide
            });
            const halo = new THREE.Mesh(haloGeo, haloMat);
            orb.add(halo);

            orb._basePos = { x: data.pos[0], y: data.pos[1], z: data.pos[2] };
            orb._speed = data.speed;
            orb._offset = i * 0.8;

            scene.add(orb);
            orbs.push(orb);
        });
    }

    // --- LIGHT BEAMS ---
    function createLightBeams() {
        const beamColors = [0x7c3aed, 0xf43f5e, 0x06b6d4, 0xf97316, 0xec4899];

        for (let i = 0; i < 8; i++) {
            const height = 400 + Math.random() * 300;
            const width = 2 + Math.random() * 4;
            const geo = new THREE.PlaneGeometry(width, height);

            const color = beamColors[Math.floor(Math.random() * beamColors.length)];
            const col = new THREE.Color(color);

            // Create gradient texture for beam
            const cnv = document.createElement('canvas');
            cnv.width = 4;
            cnv.height = 128;
            const ctx = cnv.getContext('2d');
            const grad = ctx.createLinearGradient(0, 0, 0, 128);
            grad.addColorStop(0, `rgba(${Math.floor(col.r * 255)}, ${Math.floor(col.g * 255)}, ${Math.floor(col.b * 255)}, 0)`);
            grad.addColorStop(0.3, `rgba(${Math.floor(col.r * 255)}, ${Math.floor(col.g * 255)}, ${Math.floor(col.b * 255)}, 0.12)`);
            grad.addColorStop(0.7, `rgba(${Math.floor(col.r * 255)}, ${Math.floor(col.g * 255)}, ${Math.floor(col.b * 255)}, 0.12)`);
            grad.addColorStop(1, `rgba(${Math.floor(col.r * 255)}, ${Math.floor(col.g * 255)}, ${Math.floor(col.b * 255)}, 0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 4, 128);

            const texture = new THREE.CanvasTexture(cnv);

            const mat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });

            const beam = new THREE.Mesh(geo, mat);
            beam.position.set(
                (Math.random() - 0.5) * 800,
                height / 2 - 100,
                (Math.random() - 0.5) * 600 - 200
            );
            beam.rotation.z = (Math.random() - 0.5) * 0.3;
            beam._swaySpeed = Math.random() * 0.3 + 0.1;
            beam._swayOffset = Math.random() * Math.PI * 2;
            beam._baseRotZ = beam.rotation.z;
            beam.name = 'beam';

            scene.add(beam);
            beams.push(beam);
        }
    }

    // --- FLOATING RINGS ---
    function createFloatingRings() {
        const ringColors = [0x7c3aed, 0xf43f5e, 0x06b6d4, 0xf97316, 0x10b981];

        for (let i = 0; i < 8; i++) {
            const radius = 30 + Math.random() * 80;
            const tube = 1 + Math.random() * 2;
            const geo = new THREE.TorusGeometry(radius, tube, 16, 64);
            const color = ringColors[Math.floor(Math.random() * ringColors.length)];

            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.06 + Math.random() * 0.06,
                wireframe: Math.random() > 0.5,
                side: THREE.DoubleSide
            });

            const ring = new THREE.Mesh(geo, mat);
            ring.position.set(
                (Math.random() - 0.5) * 600,
                30 + Math.random() * 200,
                (Math.random() - 0.5) * 400 - 100
            );
            ring.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                0
            );
            ring._rotSpeedX = (Math.random() - 0.5) * 0.004;
            ring._rotSpeedY = (Math.random() - 0.5) * 0.003;
            ring.name = 'floatingRing';
            scene.add(ring);
        }
    }

    // --- SPARKLE PARTICLES ---
    function createSparkles() {
        const count = 800;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const sparkleColors = [
            new THREE.Color(0xc4b5fd), new THREE.Color(0xfda4af),
            new THREE.Color(0x99f6e4), new THREE.Color(0xfde68a),
            new THREE.Color(0xa5f3fc), new THREE.Color(0xfbcfe8),
            new THREE.Color(0xffffff),
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1200;
            positions[i * 3 + 1] = Math.random() * 350;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

            const col = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 2.5,
            transparent: true,
            opacity: 0.5,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const sparkles = new THREE.Points(geo, mat);
        sparkles.name = 'sparkles';
        scene.add(sparkles);
    }

    // --- MAIN ANIMATION LOOP ---
    function animate3D() {
        requestAnimationFrame(animate3D);
        const elapsed = clock.getElapsedTime();

        // Smooth mouse
        targetMouseX += (mouseX - targetMouseX) * 0.03;
        targetMouseY += (mouseY - targetMouseY) * 0.03;

        // Camera sway
        camera.position.x = targetMouseX * 50 + Math.sin(elapsed * 0.1) * 20;
        camera.position.y = 120 + targetMouseY * -25 + Math.cos(elapsed * 0.08) * 10;
        camera.position.z = 400 + Math.sin(elapsed * 0.05) * 15;
        camera.lookAt(0, 20, -100);

        // Update wave terrain
        if (waveMesh) {
            waveMesh.material.uniforms.uTime.value = elapsed;
        }
        if (waveMesh2) {
            waveMesh2.material.uniforms.uTime.value = elapsed;
        }

        // Animate orbs
        orbs.forEach((orb) => {
            const t = elapsed * orb._speed + orb._offset;
            orb.position.x = orb._basePos.x + Math.sin(t) * 30;
            orb.position.y = orb._basePos.y + Math.sin(t * 1.3) * 20 + Math.cos(t * 0.7) * 10;
            orb.position.z = orb._basePos.z + Math.cos(t * 0.8) * 25;
            orb.rotation.y = elapsed * 0.2;

            // Pulse scale
            const scale = 1 + Math.sin(t * 2) * 0.08;
            orb.scale.set(scale, scale, scale);
        });

        // Animate beams
        beams.forEach((beam) => {
            beam.rotation.z = beam._baseRotZ + Math.sin(elapsed * beam._swaySpeed + beam._swayOffset) * 0.05;
            beam.material.opacity = 0.3 + Math.sin(elapsed * 0.5 + beam._swayOffset) * 0.15;
        });

        // Animate rings
        scene.children.forEach(child => {
            if (child.name === 'floatingRing') {
                child.rotation.x += child._rotSpeedX;
                child.rotation.y += child._rotSpeedY;
            }
            if (child.name === 'sparkles') {
                child.rotation.y = elapsed * 0.01;
                // Twinkle effect via opacity
                child.material.opacity = 0.4 + Math.sin(elapsed * 1.5) * 0.15;
            }
        });

        renderer.render(scene, camera);
    }

    document.addEventListener('mousemove', (e) => {
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
    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorDot.style.left = cursorX + 'px';
        cursorDot.style.top = cursorY + 'px';
    });

    function animateCursor() {
        ringX += (cursorX - ringX) * 0.15;
        ringY += (cursorY - ringY) * 0.15;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverTargets = document.querySelectorAll('a, button, input, select, .event-card, .stat-card, .checkbox-label');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('hovering');
            cursorRing.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('hovering');
            cursorRing.classList.remove('hovering');
        });
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
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveNavLink();
    });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id], footer[id]');
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }

    // ===================================
    // 5. COUNTDOWN TIMER
    // ===================================
    const eventDate = new Date('2026-04-10T09:00:00+05:30').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = eventDate - now;
        if (diff <= 0) {
            document.getElementById('countDays').textContent = '00';
            document.getElementById('countHours').textContent = '00';
            document.getElementById('countMinutes').textContent = '00';
            document.getElementById('countSeconds').textContent = '00';
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        document.getElementById('countDays').textContent = String(days).padStart(2, '0');
        document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countMinutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('countSeconds').textContent = String(seconds).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ===================================
    // 6. SCROLL REVEAL
    // ===================================
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseFloat(entry.target.getAttribute('data-delay') || 0);
                    setTimeout(() => { entry.target.classList.add('revealed'); }, delay * 1000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        reveals.forEach(el => observer.observe(el));
    }

    function triggerHeroReveal() {
        const heroReveals = document.querySelectorAll('.hero .reveal-up');
        heroReveals.forEach(el => {
            const delay = parseFloat(el.getAttribute('data-delay') || 0);
            setTimeout(() => { el.classList.add('revealed'); }, delay * 1000 + 200);
        });
    }

    // ===================================
    // 7. EVENT FILTERING
    // ===================================
    const eventTabs = document.querySelectorAll('.event-tab');
    const eventCards = document.querySelectorAll('.event-card');
    eventTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            eventTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.getAttribute('data-category');
            eventCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden-card');
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.classList.add('hidden-card');
                }
            });
        });
    });

    // ===================================
    // 8. SCHEDULE TABS
    // ===================================
    const scheduleTabs = document.querySelectorAll('.schedule-tab');
    const timelineDays = document.querySelectorAll('.timeline-day');
    scheduleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            scheduleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const day = tab.getAttribute('data-day');
            timelineDays.forEach(d => {
                d.classList.remove('active');
                if (d.getAttribute('data-day') === day) {
                    d.classList.add('active');
                    const items = d.querySelectorAll('.reveal-left, .reveal-right');
                    items.forEach((item, i) => {
                        item.classList.remove('revealed');
                        setTimeout(() => { item.classList.add('revealed'); }, i * 100 + 100);
                    });
                }
            });
        });
    });

    // ===================================
    // 9. REGISTRATION FORM
    // ===================================
    const registerForm = document.getElementById('registerForm');
    const successModal = document.getElementById('successModal');
    const modalClose = document.getElementById('modalClose');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const college = document.getElementById('regCollege').value.trim();
        const year = document.getElementById('regYear').value;
        const dept = document.getElementById('regDept').value.trim();
        if (!name || !email || !phone || !college || !year || !dept) return;
        const checkedEvents = registerForm.querySelectorAll('input[name="events"]:checked');
        if (checkedEvents.length === 0) {
            alert('Please select at least one event!');
            return;
        }
        successModal.classList.add('active');
        registerForm.reset();
    });

    modalClose.addEventListener('click', () => { successModal.classList.remove('active'); });
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.classList.remove('active');
    });

    // ===================================
    // 10. SMOOTH SCROLL
    // ===================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const position = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    });

    // ===================================
    // 11. PARALLAX
    // ===================================
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const hero = document.querySelector('.hero-content');
        if (hero && scrollY < window.innerHeight) {
            hero.style.transform = `translateY(${scrollY * 0.3}px)`;
            hero.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
        }
    });

    // ===================================
    // 12. LUCIDE ICONS
    // ===================================
    if (typeof lucide !== 'undefined') { lucide.createIcons(); }

    // ===================================
    // 13. KEYFRAME
    // ===================================
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);

})();
