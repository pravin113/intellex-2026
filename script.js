/* ========================================
   INTELLEX 2026 — BRIGHT THEME Script
   Colorful 3D Background + Interactions
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
    // 2. THREE.JS 3D BRIGHT BACKGROUND
    // ===================================
    const container = document.getElementById('bg3d');
    let scene, camera, renderer;
    let warpParticles, floatingShapes = [];
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let clock;

    function init3D() {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xf5f0ff, 0.0006);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
        camera.position.set(0, 50, 200);

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

        createBrightWarpField();
        createColorfulShapes();
        createSoftGrid();
        createBubbleParticles();
        createColorClouds();
        createRings();

        animate3D();
    }

    // --- BRIGHT WARP FIELD PARTICLES ---
    function createBrightWarpField() {
        const count = 5000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorPalette = [
            new THREE.Color(0x7c3aed), // purple
            new THREE.Color(0xf43f5e), // rose
            new THREE.Color(0xf97316), // orange
            new THREE.Color(0x06b6d4), // cyan
            new THREE.Color(0x10b981), // emerald
            new THREE.Color(0xec4899), // pink
            new THREE.Color(0x8b5cf6), // violet
            new THREE.Color(0xeab308), // amber
        ];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 30 + Math.random() * 450;
            const z = (Math.random() - 0.5) * 2000;

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(angle) * radius;
            positions[i * 3 + 2] = z;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 4 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                varying float vOpacity;
                uniform float uTime;
                uniform float uPixelRatio;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;

                    // Warp fly-through
                    pos.z = mod(pos.z + uTime * 60.0, 2000.0) - 1000.0;

                    // Gentle spiral
                    float angle = uTime * 0.08 + pos.z * 0.0008;
                    float c = cos(angle);
                    float s = sin(angle);
                    pos.xy = mat2(c, -s, s, c) * pos.xy;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    float depth = -mvPosition.z;
                    gl_PointSize = size * uPixelRatio * (180.0 / depth);
                    gl_PointSize = clamp(gl_PointSize, 1.0, 25.0);
                    
                    // Fade based on depth
                    vOpacity = smoothstep(1000.0, 200.0, depth) * 0.6;
                    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    if (dist > 0.5) discard;
                    
                    // Soft glow
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= vOpacity;
                    
                    // Bright saturated colors
                    vec3 brightColor = vColor * 1.3;
                    gl_FragColor = vec4(brightColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

        warpParticles = new THREE.Points(geometry, material);
        scene.add(warpParticles);
    }

    // --- COLORFUL FLOATING GEOMETRIC SHAPES ---
    function createColorfulShapes() {
        const geometries = [
            new THREE.OctahedronGeometry(14, 0),
            new THREE.IcosahedronGeometry(12, 0),
            new THREE.TetrahedronGeometry(16, 0),
            new THREE.DodecahedronGeometry(13, 0),
            new THREE.TorusGeometry(12, 3, 8, 6),
            new THREE.TorusKnotGeometry(10, 3, 50, 8),
            new THREE.BoxGeometry(14, 14, 14),
            new THREE.ConeGeometry(10, 18, 6),
        ];

        const colors = [0x7c3aed, 0xf43f5e, 0xf97316, 0x06b6d4, 0x10b981, 0xec4899, 0x8b5cf6];

        for (let i = 0; i < 30; i++) {
            const geo = geometries[Math.floor(Math.random() * geometries.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Wireframe version
            const edgesGeo = new THREE.EdgesGeometry(geo);
            const mat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.2 + Math.random() * 0.15,
            });

            const wireframe = new THREE.LineSegments(edgesGeo, mat);

            wireframe.position.set(
                (Math.random() - 0.5) * 900,
                (Math.random() - 0.5) * 600,
                (Math.random() - 0.5) * 800
            );

            wireframe.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            wireframe._rotSpeed = {
                x: (Math.random() - 0.5) * 0.008,
                y: (Math.random() - 0.5) * 0.008,
                z: (Math.random() - 0.5) * 0.004
            };
            wireframe._floatSpeed = Math.random() * 0.4 + 0.15;
            wireframe._floatOffset = Math.random() * Math.PI * 2;
            wireframe._baseY = wireframe.position.y;

            scene.add(wireframe);
            floatingShapes.push(wireframe);

            // Also add a faint solid fill for some shapes
            if (Math.random() > 0.6) {
                const solidMat = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.04,
                    side: THREE.DoubleSide
                });
                const solidMesh = new THREE.Mesh(geo, solidMat);
                solidMesh.position.copy(wireframe.position);
                solidMesh.rotation.copy(wireframe.rotation);
                solidMesh._parent = wireframe;
                scene.add(solidMesh);
                floatingShapes.push(solidMesh);
            }
        }
    }

    // --- SOFT GRID FLOOR ---
    function createSoftGrid() {
        const gridSize = 2000;
        const divisions = 50;

        const grid = new THREE.GridHelper(gridSize, divisions, 0xc4b5fd, 0xe9e2ff);
        grid.position.y = -180;
        grid.material.opacity = 0.15;
        grid.material.transparent = true;
        scene.add(grid);

        const grid2 = new THREE.GridHelper(gridSize, divisions / 2, 0xa78bfa, 0xf0ebff);
        grid2.position.y = -180;
        grid2.material.opacity = 0.06;
        grid2.material.transparent = true;
        scene.add(grid2);
    }

    // --- BUBBLE PARTICLES (scattered everywhere) ---
    function createBubbleParticles() {
        const count = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const cols = [
            new THREE.Color(0xc4b5fd),
            new THREE.Color(0xfda4af),
            new THREE.Color(0x99f6e4),
            new THREE.Color(0xfde68a),
            new THREE.Color(0xa5f3fc),
            new THREE.Color(0xfbcfe8),
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1600;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1600;

            const col = cols[Math.floor(Math.random() * cols.length)];
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;

            sizes[i] = Math.random() * 4 + 1.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2.5,
            transparent: true,
            opacity: 0.35,
            vertexColors: true,
            blending: THREE.NormalBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const pts = new THREE.Points(geometry, material);
        pts.name = 'bubbleParticles';
        scene.add(pts);
    }

    // --- COLOR CLOUDS (bright nebulae) ---
    function createColorClouds() {
        const cloudGeo = new THREE.PlaneGeometry(700, 700);

        const clouds = [
            { color: 0xc4b5fd, x: -250, y: 120, z: -500 },  // lavender
            { color: 0xfda4af, x: 300, y: -80, z: -600 },    // pink
            { color: 0x99f6e4, x: 100, y: 200, z: -450 },    // mint
            { color: 0xfde68a, x: -300, y: -120, z: -350 },   // amber
            { color: 0xa5f3fc, x: 200, y: 50, z: -700 },      // sky
        ];

        clouds.forEach((n, i) => {
            const size = 256;
            const cnv = document.createElement('canvas');
            cnv.width = size;
            cnv.height = size;
            const ctxN = cnv.getContext('2d');

            const col = new THREE.Color(n.color);
            const r = Math.floor(col.r * 255);
            const g = Math.floor(col.g * 255);
            const b = Math.floor(col.b * 255);

            const gradient = ctxN.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.18)`);
            gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.08)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctxN.fillStyle = gradient;
            ctxN.fillRect(0, 0, size, size);

            const texture = new THREE.CanvasTexture(cnv);

            const mat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.7,
                blending: THREE.NormalBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(cloudGeo, mat);
            mesh.position.set(n.x, n.y, n.z);
            mesh.rotation.z = Math.random() * Math.PI;
            mesh._driftSpeed = 0.0003 + Math.random() * 0.0004;
            mesh._driftOffset = i * 1.2;
            mesh.name = 'colorCloud';
            scene.add(mesh);
        });
    }

    // --- GLOWING RINGS ---
    function createRings() {
        const ringColors = [0x7c3aed, 0xf43f5e, 0x06b6d4, 0xf97316];

        for (let i = 0; i < 6; i++) {
            const radius = 80 + Math.random() * 200;
            const tubeRadius = 0.5 + Math.random() * 1;
            const geo = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
            const color = ringColors[Math.floor(Math.random() * ringColors.length)];

            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.08 + Math.random() * 0.06,
                side: THREE.DoubleSide
            });

            const ring = new THREE.Mesh(geo, mat);
            ring.position.set(
                (Math.random() - 0.5) * 400,
                (Math.random() - 0.5) * 300,
                -200 + (Math.random() - 0.5) * 600
            );
            ring.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                0
            );
            ring._rotSpeed = (Math.random() - 0.5) * 0.003;
            ring._axis = Math.random() > 0.5 ? 'x' : 'y';
            ring.name = 'glowRing';
            scene.add(ring);
        }
    }

    // --- MAIN 3D ANIMATION LOOP ---
    function animate3D() {
        requestAnimationFrame(animate3D);

        const elapsed = clock.getElapsedTime();

        // Smooth mouse follow
        targetMouseX += (mouseX - targetMouseX) * 0.04;
        targetMouseY += (mouseY - targetMouseY) * 0.04;

        // Camera
        camera.position.x = targetMouseX * 60;
        camera.position.y = 50 + targetMouseY * -30;
        camera.rotation.x = targetMouseY * 0.08;
        camera.rotation.y = targetMouseX * -0.12;

        // Drift
        camera.position.x += Math.sin(elapsed * 0.15) * 12;
        camera.position.y += Math.cos(elapsed * 0.12) * 8;

        // Update warp particles
        if (warpParticles) {
            warpParticles.material.uniforms.uTime.value = elapsed;
        }

        // Animate shapes
        floatingShapes.forEach((shape, i) => {
            if (shape._parent) {
                // Solid fill follows wireframe
                shape.rotation.copy(shape._parent.rotation);
                shape.position.copy(shape._parent.position);
                return;
            }

            shape.rotation.x += shape._rotSpeed.x;
            shape.rotation.y += shape._rotSpeed.y;
            shape.rotation.z += shape._rotSpeed.z;

            shape.position.y = shape._baseY + Math.sin(elapsed * shape._floatSpeed + shape._floatOffset) * 25;
        });

        // Animate clouds
        scene.children.forEach(child => {
            if (child.name === 'colorCloud') {
                child.position.x += Math.sin(elapsed * child._driftSpeed * 80 + child._driftOffset) * 0.25;
                child.position.y += Math.cos(elapsed * child._driftSpeed * 60 + child._driftOffset) * 0.2;
                child.rotation.z += child._driftSpeed * 0.5;
            }

            if (child.name === 'bubbleParticles') {
                child.rotation.y = elapsed * 0.015;
                child.rotation.x = Math.sin(elapsed * 0.008) * 0.04;
            }

            if (child.name === 'glowRing') {
                child.rotation[child._axis] += child._rotSpeed;
            }
        });

        camera.lookAt(0, 0, -200);

        renderer.render(scene, camera);
    }

    // --- MOUSE ---
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    // --- RESIZE ---
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
    // 6. SCROLL REVEAL ANIMATIONS
    // ===================================
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseFloat(entry.target.getAttribute('data-delay') || 0);
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay * 1000);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    function triggerHeroReveal() {
        const heroReveals = document.querySelectorAll('.hero .reveal-up');
        heroReveals.forEach(el => {
            const delay = parseFloat(el.getAttribute('data-delay') || 0);
            setTimeout(() => {
                el.classList.add('revealed');
            }, delay * 1000 + 200);
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
    // 8. SCHEDULE DAY TABS
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
                        setTimeout(() => {
                            item.classList.add('revealed');
                        }, i * 100 + 100);
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

    modalClose.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
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
    // 11. PARALLAX ON HERO
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
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ===================================
    // 13. KEYFRAME INJECTION
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
