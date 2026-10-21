/**
 * AETHERIA 3D // INTERACTIVE PARALLAX SCROLLING ENGINE
 * Combines Three.js WebGL, Lenis Smooth Inertia Scroll, GSAP ScrollTrigger,
 * Procedural Web Audio Synth, and Interactive 3D Tilt Mechanics.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. INITIALIZATION & STATE
  // ==========================================================================
  const state = {
    theme: 'nebula',
    audioActive: false,
    freeLook3D: false,
    wireframe: false,
    rotationSpeedMultiplier: 1.0,
    scrollProgress: 0,
    scrollVelocity: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    themeColors: {
      nebula: { primary: 0x00f5d4, secondary: 0x9b5de5, ambient: 0x18103c, light: 0x00f5d4 },
      cyber: { primary: 0x00ff88, secondary: 0x00b4d8, ambient: 0x052014, light: 0x50fa7b },
      solar: { primary: 0xff9e00, secondary: 0xff007f, ambient: 0x2e0c15, light: 0xffa200 },
      obsidian: { primary: 0xf4d06f, secondary: 0xc084fc, ambient: 0x1f1d18, light: 0xfef08a }
    }
  };

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ==========================================================================
  // 2. LENIS SMOOTH INERTIAL SCROLL SETUP
  // ==========================================================================
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });

    // Connect Lenis scroll to GSAP ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // ==========================================================================
  // 3. THREE.JS 3D SCENE & WEBGL PARALLAX ENGINE
  // ==========================================================================
  const canvas = document.getElementById('webgl-canvas');
  const container = document.getElementById('canvas-container');

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070712, 0.0012);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 100);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // LIGHTING
  const ambientLight = new THREE.AmbientLight(state.themeColors.nebula.ambient, 2.0);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(state.themeColors.nebula.primary, 3.5, 400);
  pointLight1.position.set(50, 40, 80);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(state.themeColors.nebula.secondary, 2.5, 400);
  pointLight2.position.set(-60, -30, 40);
  scene.add(pointLight2);

  // 3A. COSMIC PARTICLE STARFIELD (WARP TUNNEL)
  const particleCount = 4200;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const initialZ = new Float32Array(particleCount);

  const color1 = new THREE.Color(state.themeColors.nebula.primary);
  const color2 = new THREE.Color(state.themeColors.nebula.secondary);
  const tempColor = new THREE.Color();

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 800;
    const y = (Math.random() - 0.5) * 800;
    const z = (Math.random() - 0.5) * 1600;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
    initialZ[i] = z;

    // Blend between theme colors
    const ratio = Math.random();
    tempColor.copy(color1).lerp(color2, ratio);
    particleColors[i * 3] = tempColor.r;
    particleColors[i * 3 + 1] = tempColor.g;
    particleColors[i * 3 + 2] = tempColor.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  // Circular glowing particle texture
  function createParticleTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(180, 240, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(100, 150, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.Texture(c);
    texture.needsUpdate = true;
    return texture;
  }

  const particleMaterial = new THREE.PointsMaterial({
    size: 2.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    map: createParticleTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starField = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(starField);

  // 3B. HERO 3D MONOLITH ARTIFACT (CRYSTAL + GYROSCOPE RINGS)
  const artifactGroup = new THREE.Group();
  scene.add(artifactGroup);

  // Inner Core: Truncated Icosahedron
  const coreGeometry = new THREE.IcosahedronGeometry(14, 1);
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x11162b,
    emissive: state.themeColors.nebula.primary,
    emissiveIntensity: 0.45,
    metalness: 0.9,
    roughness: 0.15,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    wireframe: false,
    flatShading: true
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  artifactGroup.add(coreMesh);

  // Outer Wireframe Lattice
  const wireGeometry = new THREE.IcosahedronGeometry(14.8, 1);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: state.themeColors.nebula.primary,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
  artifactGroup.add(wireMesh);

  // Orbital Gyro Ring 1
  const ring1Geo = new THREE.TorusGeometry(22, 0.35, 16, 100);
  const ring1Mat = new THREE.MeshStandardMaterial({
    color: state.themeColors.nebula.primary,
    metalness: 0.9,
    roughness: 0.2,
    emissive: state.themeColors.nebula.primary,
    emissiveIntensity: 0.25
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 3;
  artifactGroup.add(ring1);

  // Orbital Gyro Ring 2
  const ring2Geo = new THREE.TorusGeometry(26, 0.25, 16, 100);
  const ring2Mat = new THREE.MeshStandardMaterial({
    color: state.themeColors.nebula.secondary,
    metalness: 0.9,
    roughness: 0.2,
    emissive: state.themeColors.nebula.secondary,
    emissiveIntensity: 0.3
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 2.5;
  artifactGroup.add(ring2);

  // Orbiting Shards
  const shardsCount = 14;
  const shardsGroup = new THREE.Group();
  artifactGroup.add(shardsGroup);
  const shardGeo = new THREE.OctahedronGeometry(1.8, 0);

  for (let i = 0; i < shardsCount; i++) {
    const shardMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? state.themeColors.nebula.primary : state.themeColors.nebula.secondary,
      metalness: 0.8,
      roughness: 0.2,
      emissive: i % 2 === 0 ? state.themeColors.nebula.primary : state.themeColors.nebula.secondary,
      emissiveIntensity: 0.2
    });
    const shard = new THREE.Mesh(shardGeo, shardMat);
    const theta = (i / shardsCount) * Math.PI * 2;
    const radius = 32 + (Math.random() - 0.5) * 8;
    shard.position.set(
      Math.cos(theta) * radius,
      (Math.random() - 0.5) * 12,
      Math.sin(theta) * radius
    );
    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    shardsGroup.add(shard);
  }

  // Initial artifact positioning for Section 1 (Hero)
  artifactGroup.position.set(30, -2, 10);

  // ==========================================================================
  // 4. PARALLAX MATH & CAMERA INTERPOLATION
  // ==========================================================================
  // Target coordinates for 3D camera & object based on active scroll section
  const sectionTransforms = [
    // 0: Hero
    { objX: 28, objY: -2, objZ: 10, rotY: 0, camZ: 95, camX: 0, camY: 0 },
    // 1: Quantum Core
    { objX: 38, objY: 6, objZ: -20, rotY: Math.PI * 0.8, camZ: 85, camX: -10, camY: 5 },
    // 2: Monoliths
    { objX: 25, objY: 0, objZ: 0, rotY: Math.PI * 1.5, camZ: 75, camX: -5, camY: 0 },
    // 3: Continuum
    { objX: 0, objY: 0, objZ: -60, rotY: Math.PI * 2.2, camZ: 50, camX: 0, camY: 0 },
    // 4: Singularity / Event Horizon
    { objX: 0, objY: -10, objZ: -120, rotY: Math.PI * 3.5, camZ: 40, camX: 0, camY: -8 }
  ];

  let currentTransform = { ...sectionTransforms[0] };
  let targetTransform = { ...sectionTransforms[0] };

  // Calculate overall scroll progress (0.0 to 1.0)
  function getScrollProgress() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    return totalHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / totalHeight)) : 0;
  }

  // Update target 3D transform according to continuous scroll
  function updateScrollTransforms() {
    const progress = getScrollProgress();
    state.scrollProgress = progress;

    const sectionsTotal = sectionTransforms.length - 1;
    const scaled = progress * sectionsTotal;
    const index = Math.floor(scaled);
    const fraction = scaled - index;

    const currentSec = sectionTransforms[Math.min(index, sectionsTotal)];
    const nextSec = sectionTransforms[Math.min(index + 1, sectionsTotal)];

    // Smooth lerp interpolation between keyframe points
    targetTransform.objX = currentSec.objX + (nextSec.objX - currentSec.objX) * fraction;
    targetTransform.objY = currentSec.objY + (nextSec.objY - currentSec.objY) * fraction;
    targetTransform.objZ = currentSec.objZ + (nextSec.objZ - currentSec.objZ) * fraction;
    targetTransform.rotY = currentSec.rotY + (nextSec.rotY - currentSec.rotY) * fraction;
    targetTransform.camZ = currentSec.camZ + (nextSec.camZ - currentSec.camZ) * fraction;
    targetTransform.camX = currentSec.camX + (nextSec.camX - currentSec.camX) * fraction;
    targetTransform.camY = currentSec.camY + (nextSec.camY - currentSec.camY) * fraction;

    // Update HUD Telemetry
    const depthEl = document.getElementById('hud-depth');
    const velocityEl = document.getElementById('hud-velocity');
    const fillEl = document.getElementById('hud-progress-fill');

    if (depthEl) {
      depthEl.textContent = `${(progress * 148.5).toFixed(3)} LY`;
    }
    if (velocityEl) {
      const warp = (1.0 + Math.abs(state.scrollVelocity) * 0.04).toFixed(3);
      velocityEl.textContent = `${warp}c`;
    }
    if (fillEl) {
      fillEl.style.height = `${(progress * 100).toFixed(1)}%`;
    }

    // Update active nav link
    const sections = document.querySelectorAll('section.section');
    const navLinks = document.querySelectorAll('.nav-link');
    let activeIndex = 0;
    sections.forEach((sec, i) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.2) {
        activeIndex = i;
      }
    });

    navLinks.forEach((link, idx) => {
      if (idx === activeIndex) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 5. DOM MULTI-LAYER DIFFERENTIAL PARALLAX (GSAP / CSS TRANSFORMS)
  // ==========================================================================
  const parallaxElements = document.querySelectorAll('[data-speed]');

  function updateDomParallax() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-speed')) || 0;
      const rect = el.getBoundingClientRect();
      // Only process when visible in viewport window
      if (rect.bottom >= -100 && rect.top <= windowH + 100) {
        const offset = (windowH * 0.5 - (rect.top + rect.height * 0.5)) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      }
    });
  }

  // ==========================================================================
  // 6. 3D TILT CARDS WITH DYNAMIC SPECULAR GLARE
  // ==========================================================================
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const tiltX = (y - centerY) / centerY;
      const tiltY = (centerX - x) / centerX;

      // Update CSS variables for specular reflection
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

      card.style.transform = `perspective(1000px) rotateX(${tiltX * 12}deg) rotateY(${tiltY * 12}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });

  // ==========================================================================
  // 7. CUSTOM 3D MOUSE CURSOR WITH INERTIA
  // ==========================================================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let ringX = cursorX;
  let ringY = cursorY;

  window.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;

    // Normalized mouse coordinates for Three.js camera tilt (-1 to 1)
    state.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Cursor expand on hoverable elements
  const hoverables = document.querySelectorAll('a, button, input, .theme-btn, .parallax-card, .timeline-node');
  hoverables.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      if (cursorRing) cursorRing.classList.add('active');
      playUiHoverSound();
    });
    item.addEventListener('mouseleave', () => {
      if (cursorRing) cursorRing.classList.remove('active');
    });
  });

  function updateCursor() {
    if (cursorDot) {
      cursorDot.style.left = `${cursorX}px`;
      cursorDot.style.top = `${cursorY}px`;
    }

    if (cursorRing) {
      ringX += (cursorX - ringX) * 0.18;
      ringY += (cursorY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
  }

  // ==========================================================================
  // 8. PROCEDURAL WEB AUDIO SYNTHESIZER
  // ==========================================================================
  let audioCtx = null;
  let ambientDroneOsc1 = null;
  let ambientDroneOsc2 = null;
  let droneGain = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      // Master Ambient Gain Node
      droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, audioCtx.currentTime);

      // Low Detuned Drone Osc 1 (55Hz / A1)
      ambientDroneOsc1 = audioCtx.createOscillator();
      ambientDroneOsc1.type = 'sawtooth';
      ambientDroneOsc1.frequency.setValueAtTime(55, audioCtx.currentTime);

      // Ethereal Sub Osc 2 (110Hz / A2 detuned)
      ambientDroneOsc2 = audioCtx.createOscillator();
      ambientDroneOsc2.type = 'sine';
      ambientDroneOsc2.frequency.setValueAtTime(110.4, audioCtx.currentTime);

      ambientDroneOsc1.connect(filter);
      ambientDroneOsc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(audioCtx.destination);

      ambientDroneOsc1.start();
      ambientDroneOsc2.start();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function toggleAudio() {
    initAudio();
    const btn = document.getElementById('audio-toggle');
    const label = btn.querySelector('.sound-label');

    if (!state.audioActive) {
      state.audioActive = true;
      btn.classList.add('playing');
      label.textContent = 'AUDIO ACTIVE';
      // Fade in ambient drone smoothly
      droneGain.gain.cancelScheduledValues(audioCtx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 1.5);
      playChime(440, 0.2);
    } else {
      state.audioActive = false;
      btn.classList.remove('playing');
      label.textContent = 'AUDIO OFF';
      droneGain.gain.cancelScheduledValues(audioCtx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    }
  }

  function playUiHoverSound() {
    if (!state.audioActive || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  function playChime(freq, duration = 0.4) {
    if (!state.audioActive || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  document.getElementById('audio-toggle')?.addEventListener('click', toggleAudio);

  // ==========================================================================
  // 9. THEME SWITCHER
  // ==========================================================================
  const themeBtn = document.getElementById('theme-btn');
  const themePanel = document.getElementById('theme-panel');
  const themeOptionBtns = document.querySelectorAll('[data-set-theme]');

  themeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    themePanel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!themePanel.contains(e.target) && e.target !== themeBtn) {
      themePanel.classList.remove('open');
    }
  });

  themeOptionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-set-theme');
      setDimensionTheme(selected);
      themeOptionBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      themePanel.classList.remove('open');
      playChime(660, 0.3);
    });
  });

  function setDimensionTheme(themeName) {
    state.theme = themeName;
    document.body.setAttribute('data-theme', themeName);

    const colors = state.themeColors[themeName] || state.themeColors.nebula;

    // Update Three.js materials & lights
    ambientLight.color.setHex(colors.ambient);
    pointLight1.color.setHex(colors.primary);
    pointLight2.color.setHex(colors.secondary);

    coreMaterial.emissive.setHex(colors.primary);
    wireMaterial.color.setHex(colors.primary);
    ring1Mat.color.setHex(colors.primary);
    ring1Mat.emissive.setHex(colors.primary);
    ring2Mat.color.setHex(colors.secondary);
    ring2Mat.emissive.setHex(colors.secondary);

    // Re-color star particles
    const c1 = new THREE.Color(colors.primary);
    const c2 = new THREE.Color(colors.secondary);
    const pos = particleGeometry.attributes.position.array;
    const col = particleGeometry.attributes.color.array;

    for (let i = 0; i < particleCount; i++) {
      const ratio = Math.random();
      tempColor.copy(c1).lerp(c2, ratio);
      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;
    }
    particleGeometry.attributes.color.needsUpdate = true;
  }

  // ==========================================================================
  // 10. INTERACTIVE 3D CONTROLS (WIREFRAME & ROTATION)
  // ==========================================================================
  const wireframeToggle = document.getElementById('wireframe-toggle');
  wireframeToggle?.addEventListener('click', () => {
    state.wireframe = !state.wireframe;
    coreMaterial.wireframe = state.wireframe;
    wireframeToggle.classList.toggle('active', state.wireframe);
    wireframeToggle.querySelector('.chip-state').textContent = state.wireframe ? 'ON' : 'OFF';
    playChime(750, 0.2);
  });

  const rotationSlider = document.getElementById('rotation-speed');
  rotationSlider?.addEventListener('input', (e) => {
    state.rotationSpeedMultiplier = parseFloat(e.target.value) * 0.5;
  });

  // Free-look orbit toggle
  const inspectBtn = document.getElementById('inspect-3d-btn');
  inspectBtn?.addEventListener('click', () => {
    state.freeLook3D = !state.freeLook3D;
    inspectBtn.classList.toggle('active', state.freeLook3D);
    inspectBtn.querySelector('span').textContent = state.freeLook3D ? 'EXIT ORBIT MODE' : '3D ORBIT FREE-LOOK';
    playChime(520, 0.25);
  });

  // Interactive Hyperdrive Burst Button
  const hyperdriveBtn = document.getElementById('hyperdrive-btn');
  let warpSpeedActive = false;

  hyperdriveBtn?.addEventListener('click', () => {
    if (warpSpeedActive) return;
    warpSpeedActive = true;
    playChime(220, 0.8);
    if (state.audioActive && audioCtx) {
      // Sound frequency sweep
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    }

    gsap.to(camera, {
      fov: 95,
      duration: 0.6,
      ease: 'power2.in',
      onUpdate: () => camera.updateProjectionMatrix(),
      onComplete: () => {
        gsap.to(camera, {
          fov: 60,
          duration: 1.4,
          ease: 'elastic.out(1, 0.5)',
          onUpdate: () => camera.updateProjectionMatrix(),
          onComplete: () => {
            warpSpeedActive = false;
          }
        });
      }
    });
  });

  // Shockwave Gravitational Pulse
  const pulseBtn = document.getElementById('gravity-pulse-btn');
  pulseBtn?.addEventListener('click', () => {
    playChime(350, 0.6);
    // Shockwave ripple on artifact scale
    gsap.fromTo(
      artifactGroup.scale,
      { x: 1.8, y: 1.8, z: 1.8 },
      { x: 1, y: 1, z: 1, duration: 1.2, ease: 'elastic.out(1, 0.4)' }
    );
  });

  // ==========================================================================
  // 11. METRIC COUNTERS ANIMATION ON SCROLL
  // ==========================================================================
  let countersAnimated = false;
  function animateCounters() {
    const singularitySection = document.getElementById('singularity');
    if (!singularitySection || countersAnimated) return;

    const rect = singularitySection.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.75) {
      countersAnimated = true;
      const metricNumbers = document.querySelectorAll('.metric-number');

      metricNumbers.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-target'));
        const isDecimal = target % 1 !== 0;
        gsap.to(
          { val: 0 },
          {
            val: target,
            duration: 2.2,
            ease: 'power3.out',
            onUpdate: function () {
              el.textContent = isDecimal ? this.targets()[0].val.toFixed(2) : Math.floor(this.targets()[0].val);
            }
          }
        );
      });
    }
  }

  // ==========================================================================
  // 12. SMOOTH RESIZE HANDLER
  // ==========================================================================
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // ==========================================================================
  // 13. MAIN ANIMATION LOOP (60-120 FPS)
  // ==========================================================================
  let lastScrollY = window.scrollY;
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTimer = 0;

  function renderLoop(time) {
    requestAnimationFrame(renderLoop);

    const delta = (time - lastTime) * 0.001;
    lastTime = time;

    // FPS Meter
    frameCount++;
    fpsTimer += delta;
    if (fpsTimer >= 1.0) {
      const fpsEl = document.getElementById('hud-fps');
      if (fpsEl) fpsEl.textContent = `${frameCount} FPS`;
      frameCount = 0;
      fpsTimer = 0;
    }

    // Measure Scroll Velocity
    const currentScrollY = window.scrollY;
    state.scrollVelocity = (currentScrollY - lastScrollY) / (delta * 1000 || 1);
    lastScrollY = currentScrollY;

    // Update coordinates & parallax transforms
    updateScrollTransforms();
    updateDomParallax();
    updateCursor();
    animateCounters();

    // Mouse lerping
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.08;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.08;

    // Interpolate current 3D transforms toward target
    const lerpSpeed = 0.06;
    currentTransform.objX += (targetTransform.objX - currentTransform.objX) * lerpSpeed;
    currentTransform.objY += (targetTransform.objY - currentTransform.objY) * lerpSpeed;
    currentTransform.objZ += (targetTransform.objZ - currentTransform.objZ) * lerpSpeed;
    currentTransform.rotY += (targetTransform.rotY - currentTransform.rotY) * lerpSpeed;
    currentTransform.camZ += (targetTransform.camZ - currentTransform.camZ) * lerpSpeed;
    currentTransform.camX += (targetTransform.camX - currentTransform.camX) * lerpSpeed;
    currentTransform.camY += (targetTransform.camY - currentTransform.camY) * lerpSpeed;

    // Position artifact
    artifactGroup.position.set(currentTransform.objX, currentTransform.objY, currentTransform.objZ);

    // Continuous artifact rotation
    const rotSpeed = state.rotationSpeedMultiplier * delta;
    coreMesh.rotation.y += rotSpeed * 0.6;
    coreMesh.rotation.x += rotSpeed * 0.3;
    wireMesh.rotation.y = coreMesh.rotation.y;
    wireMesh.rotation.x = coreMesh.rotation.x;

    ring1.rotation.z += rotSpeed * 0.8;
    ring2.rotation.x += rotSpeed * 0.7;
    shardsGroup.rotation.y += rotSpeed * 0.5;

    // Interactive Camera Tilt & Free-Look
    if (state.freeLook3D) {
      camera.position.x = currentTransform.camX + state.mouse.x * 25;
      camera.position.y = currentTransform.camY + state.mouse.y * 25;
      camera.position.z = currentTransform.camZ;
      camera.lookAt(artifactGroup.position);
    } else {
      camera.position.x = currentTransform.camX + state.mouse.x * 6;
      camera.position.y = currentTransform.camY + state.mouse.y * 6;
      camera.position.z = currentTransform.camZ;
      camera.lookAt(currentTransform.camX * 0.3, currentTransform.camY * 0.3, 0);
    }

    // Warp Starfield movement
    const pos = particleGeometry.attributes.position.array;
    const warpMultiplier = warpSpeedActive ? 18.0 : (1.0 + Math.abs(state.scrollVelocity) * 0.25);

    for (let i = 0; i < particleCount; i++) {
      // Particles stream forward toward viewer
      pos[i * 3 + 2] += (0.8 + (i % 3) * 0.4) * warpMultiplier;

      // Wrap around when past camera
      if (pos[i * 3 + 2] > camera.position.z + 100) {
        pos[i * 3 + 2] = -900;
        pos[i * 3] = (Math.random() - 0.5) * 800;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 800;
      }
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // Render WebGL
    renderer.render(scene, camera);
  }

  // Start the animation loop
  requestAnimationFrame(renderLoop);

  // Smooth anchor navigation jump using Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: 0, duration: 1.4 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

})();
