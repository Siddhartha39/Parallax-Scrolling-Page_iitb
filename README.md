# AETHERIA // 3D Interactive Parallax Scrolling Experience

> An award-winning, physics-driven 3D interactive parallax scrolling web experience crafted for the **Interactive Parallax Scrolling Page** challenge.

---

## 🌟 Key Features

1. **True Multi-Layer 3D Depth Perception**:
   - **Layer 0 (Background WebGL)**: 4,200 dynamic star particles forming an endless warp tunnel in Three.js, accelerating realistically with scroll velocity.
   - **Layer 1 (Atmospheric Lighting)**: Volumetric radial gradients and subtle cybernetic grid perspective masks.
   - **Layer 2 (Celestial 3D Polyhedron)**: An interactive 3D crystalline monolith, dual gyroscopic orbital rings, and orbiting octahedron shards rendered in real-time WebGL. Its camera angle, depth ($Z$), and rotation smoothly interpolate across 5 distinct narrative stages.
   - **Layer 3 (Differential DOM Parallax)**: Floating glassmorphism cards and telemetry readouts moving at differential velocities (`data-speed="-0.3"` to `0.7"`).
   - **Layer 4 (Interactive 3D Tilt Cards)**: Physics-anchored tilt tracking the user's cursor with dynamic specular glare highlights.
   - **Layer 5 (Custom 3D Magnetic Cursor)**: Dual-stage glowing cursor dot and orbital ring with smooth lerp physics.

2. **Ultra-Smooth Inertial Scroll (60-144 FPS)**:
   - Integrated with **Studio Freight's Lenis** smooth scroll library to provide fluid momentum, dampening jitter, and natural easing.
   - Synced with **GSAP ScrollTrigger** and requestAnimationFrame loop.

3. **Real-Time HUD Telemetry**:
   - Live **Depth Level** counter measuring progress in Light Years (`LY`).
   - Dynamic **Warp Factor** calculated based on instantaneous scroll velocity ($1.000c - 3.500c$).
   - Live **FPS Engine Meter** tracking rendering framerate.
   - Mini vertical progress rail and stage indicator.

4. **Multi-Dimension Theme Switcher**:
   - 🌌 **Hyper Nebula**: Radiant Cyan & Ultraviolet
   - ⚡ **Matrix Jade**: Cyber Emerald & Dark Mint
   - ☀️ **Solar Flare**: Radiant Amber & Electric Magenta
   - 💎 **Obsidian Gold**: Champagne Gold & Ice Platinum
   - Seamlessly updates CSS variables, Three.js point lights, ambient lighting, particle colors, and material emissive properties on the fly.

5. **Procedural Web Audio Synthesizer**:
   - Built entirely on the browser's native **Web Audio API** — zero external audio assets required.
   - Ethereal detuned ambient space drone running through a modulated low-pass filter.
   - High-tech frequency chirp audio feedback on button clicks and UI hover states.

6. **Interactive 3D Controls**:
   - **Wireframe Toggle**: Switches the crystal's physical mesh into a neon wireframe hologram.
   - **Rotation Slider**: Dynamically adjusts gyroscopic spin momentum.
   - **3D Orbit Free-Look**: Uncouples camera trajectory to allow mouse-driven 3D spatial navigation.
   - **Hyperdrive Burst**: Widens field of view (FOV) and accelerates particles by 18x.
   - **Gravitational Shockwave**: Triggers an elastic dimensional ripple across the 3D meshes.

---

## 🚀 Quick Start / How to Run

### Method 1: Direct File Open
Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox). No installation or build step needed!

### Method 2: Local HTTP Server (Recommended)
You can run a local server using Python or Node:

```bash
# Using Python 3
python3 -m http.server 3000

# Or using npx
npx serve
```
Then visit: `http://localhost:3000`

---

## 🛠️ Tech Stack
- **Three.js (r128)**: 3D scene graph, camera interpolation, physical shaders, and particle systems.
- **Lenis Scroll**: Butter-smooth inertial momentum scrolling.
- **GSAP 3**: Timeline orchestration and easing.
- **HTML5 & CSS3**: Glassmorphism, 3D transforms (`preserve-3d`, `perspective`), CSS custom properties.
- **Web Audio API**: Real-time generative sound design.
- **Lucide Icons**: Futuristic UI iconography.
