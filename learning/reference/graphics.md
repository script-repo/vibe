# Modern Graphics and Visual Design Techniques for Single-File Web Apps

A comprehensive guide to creating stunning visual effects in web applications under 1MB, focusing on CSS, Canvas, SVG, and WebGL techniques.

---

## Table of Contents
1. [CSS Gradients](#css-gradients)
2. [CSS Animations and Transitions](#css-animations-and-transitions)
3. [Canvas API for 2D Graphics](#canvas-api-for-2d-graphics)
4. [SVG Graphics and Animations](#svg-graphics-and-animations)
5. [WebGL Basics](#webgl-basics-for-advanced-graphics)
6. [Modern CSS Features](#modern-css-features)
7. [Particle Effects and Visual Effects](#particle-effects-and-visual-effects)
8. [Modern Design Trends](#modern-design-trends)
9. [Performance Optimization](#performance-optimization-for-graphics)

---

## CSS Gradients

### Linear Gradients

Basic linear gradients create smooth color transitions along a straight line.

```css
/* Simple two-color gradient */
.gradient-basic {
  background: linear-gradient(to right, #00d4ff, #a855f7);
}

/* Multi-color gradient with direction */
.gradient-diagonal {
  background: linear-gradient(135deg, #9333ea, #ec4899, #a855f7);
}

/* Gradient with specific stops */
.gradient-stops {
  background: linear-gradient(
    to bottom,
    #00d4ff 0%,
    #a855f7 50%,
    #ec4899 100%
  );
}

/* Hard color stops (no blending) */
.gradient-hard {
  background: linear-gradient(
    90deg,
    #00d4ff 0% 33%,
    #a855f7 33% 66%,
    #ec4899 66% 100%
  );
}

/* Animated gradient background */
.gradient-animated {
  background: linear-gradient(
    270deg,
    #00d4ff,
    #a855f7,
    #ec4899,
    #00d4ff
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Radial Gradients

Radial gradients create circular or elliptical color transitions.

```css
/* Basic radial gradient */
.radial-basic {
  background: radial-gradient(circle, #00d4ff, #a855f7);
}

/* Positioned radial gradient */
.radial-positioned {
  background: radial-gradient(
    circle at top right,
    rgba(147, 51, 234, 0.3),
    transparent 50%
  );
}

/* Elliptical gradient */
.radial-ellipse {
  background: radial-gradient(
    ellipse at center,
    #00d4ff 0%,
    #a855f7 50%,
    transparent 100%
  );
}

/* Multiple radial gradients (layered) */
.radial-multi {
  background:
    radial-gradient(
      circle at 20% 50%,
      rgba(0, 212, 255, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 50%,
      rgba(168, 85, 247, 0.3) 0%,
      transparent 50%
    ),
    #000000;
}

/* Spotlight effect */
.radial-spotlight {
  background: radial-gradient(
    circle 200px at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.15),
    transparent
  );
}
```

### Conic Gradients

Conic gradients rotate colors around a center point.

```css
/* Basic conic gradient */
.conic-basic {
  background: conic-gradient(#00d4ff, #a855f7, #ec4899, #00d4ff);
}

/* Color wheel */
.conic-wheel {
  background: conic-gradient(
    from 0deg,
    red,
    yellow,
    lime,
    aqua,
    blue,
    magenta,
    red
  );
  border-radius: 50%;
}

/* Pie chart effect */
.conic-pie {
  background: conic-gradient(
    from 0deg,
    #00d4ff 0deg 120deg,
    #a855f7 120deg 240deg,
    #ec4899 240deg 360deg
  );
  border-radius: 50%;
}

/* Loading spinner with conic gradient */
.conic-spinner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    #00d4ff 360deg
  );
  mask: radial-gradient(
    circle,
    transparent 60%,
    black 61%
  );
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Starburst pattern */
.conic-starburst {
  background: repeating-conic-gradient(
    from 0deg,
    #00d4ff 0deg 10deg,
    #a855f7 10deg 20deg
  );
  border-radius: 50%;
}
```

### Mesh Gradients (CSS Houdini)

While true mesh gradients require CSS Houdini, we can approximate them with layered radial gradients.

```css
/* Approximated mesh gradient */
.mesh-gradient {
  background:
    radial-gradient(at 0% 0%, rgba(147, 51, 234, 0.5) 0px, transparent 50%),
    radial-gradient(at 50% 0%, rgba(236, 72, 153, 0.5) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.5) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(0, 212, 255, 0.5) 0px, transparent 50%),
    radial-gradient(at 100% 50%, rgba(0, 255, 136, 0.5) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(255, 190, 11, 0.5) 0px, transparent 50%),
    radial-gradient(at 50% 100%, rgba(251, 86, 7, 0.5) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(131, 56, 236, 0.5) 0px, transparent 50%),
    linear-gradient(180deg, #000428 0%, #004e92 100%);
}

/* Animated mesh gradient */
.mesh-animated {
  background:
    radial-gradient(
      ellipse at 20% 30%,
      rgba(147, 51, 234, 0.4) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse at 80% 70%,
      rgba(236, 72, 153, 0.4) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse at 50% 50%,
      rgba(168, 85, 247, 0.3) 0%,
      transparent 70%
    ),
    linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  animation: meshShift 20s ease-in-out infinite;
}

@keyframes meshShift {
  0%, 100% {
    background-position: 0% 0%, 100% 100%, 50% 50%;
  }
  50% {
    background-position: 100% 100%, 0% 0%, 70% 30%;
  }
}
```

### Gradient Text Effects

```css
/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 4rem;
  font-weight: bold;
}

/* Animated gradient text */
.gradient-text-animated {
  background: linear-gradient(
    270deg,
    #00d4ff,
    #a855f7,
    #ec4899,
    #00d4ff
  );
  background-size: 400% 400%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 8s ease infinite;
}
```

---

## CSS Animations and Transitions

### Transitions

Transitions create smooth changes between CSS states.

```css
/* Basic transition */
.transition-basic {
  background: #00d4ff;
  transition: all 0.3s ease;
}

.transition-basic:hover {
  background: #a855f7;
  transform: scale(1.05);
}

/* Multiple property transitions */
.transition-multi {
  background: #00d4ff;
  transform: translateY(0);
  opacity: 1;
  transition:
    background 0.3s ease,
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s ease-in;
}

.transition-multi:hover {
  background: #a855f7;
  transform: translateY(-5px);
  opacity: 0.9;
}

/* Easing functions */
.transition-easing {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Common easing curves */
/*
  ease: cubic-bezier(0.25, 0.1, 0.25, 1)
  ease-in: cubic-bezier(0.42, 0, 1, 1)
  ease-out: cubic-bezier(0, 0, 0.58, 1)
  ease-in-out: cubic-bezier(0.42, 0, 0.58, 1)
  bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
  smooth: cubic-bezier(0.16, 1, 0.3, 1)
*/
```

### Keyframe Animations

```css
/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.6s ease;
}

/* Slide in from bottom */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-up {
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Bounce animation */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.bounce {
  animation: bounce 2s ease infinite;
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Rotate animation */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate {
  animation: rotate 2s linear infinite;
}

/* Shake animation */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.shake {
  animation: shake 0.5s ease;
}

/* Glow pulse animation */
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 212, 255, 1);
  }
}

.glow-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}

/* Float animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.float {
  animation: float 3s ease-in-out infinite;
}

/* Wave animation */
@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.wave {
  animation: wave 2s ease infinite;
  transform-origin: 70% 70%;
}

/* Flip animation */
@keyframes flip {
  0% {
    transform: perspective(400px) rotateY(0);
  }
  100% {
    transform: perspective(400px) rotateY(360deg);
  }
}

.flip {
  animation: flip 2s ease infinite;
}
```

### Advanced Animation Techniques

```css
/* Animation with delays */
.stagger-animation > * {
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Infinite loading animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.loading-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s linear infinite;
}

/* Typewriter effect */
@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.typewriter {
  overflow: hidden;
  border-right: 2px solid;
  white-space: nowrap;
  animation: typewriter 4s steps(40) 1s forwards;
}

/* Reveal animation */
@keyframes reveal {
  0% {
    clip-path: inset(0 100% 0 0);
  }
  100% {
    clip-path: inset(0 0 0 0);
  }
}

.reveal {
  animation: reveal 1s ease forwards;
}
```

---

## Canvas API for 2D Graphics

### Basic Canvas Setup

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    canvas {
      border: 1px solid #00d4ff;
      display: block;
      margin: 20px auto;
      background: #000;
    }
  </style>
</head>
<body>
  <canvas id="canvas" width="800" height="600"></canvas>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Make canvas responsive
    function resizeCanvas() {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.7;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  </script>
</body>
</html>
```

### Drawing Shapes

```javascript
// Rectangle
ctx.fillStyle = '#00d4ff';
ctx.fillRect(50, 50, 200, 100);

// Stroked rectangle
ctx.strokeStyle = '#a855f7';
ctx.lineWidth = 3;
ctx.strokeRect(300, 50, 200, 100);

// Circle
ctx.beginPath();
ctx.arc(150, 300, 50, 0, Math.PI * 2);
ctx.fillStyle = '#ec4899';
ctx.fill();

// Rounded rectangle (custom function)
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

roundRect(ctx, 50, 400, 200, 100, 15);
ctx.fillStyle = '#00ff88';
ctx.fill();

// Triangle
ctx.beginPath();
ctx.moveTo(400, 400);
ctx.lineTo(500, 400);
ctx.lineTo(450, 300);
ctx.closePath();
ctx.fillStyle = '#ffbe0b';
ctx.fill();
```

### Gradients on Canvas

```javascript
// Linear gradient
const linearGradient = ctx.createLinearGradient(0, 0, 200, 0);
linearGradient.addColorStop(0, '#00d4ff');
linearGradient.addColorStop(0.5, '#a855f7');
linearGradient.addColorStop(1, '#ec4899');

ctx.fillStyle = linearGradient;
ctx.fillRect(50, 50, 200, 100);

// Radial gradient
const radialGradient = ctx.createRadialGradient(400, 300, 20, 400, 300, 100);
radialGradient.addColorStop(0, '#ffffff');
radialGradient.addColorStop(0.5, '#00d4ff');
radialGradient.addColorStop(1, '#a855f7');

ctx.fillStyle = radialGradient;
ctx.beginPath();
ctx.arc(400, 300, 100, 0, Math.PI * 2);
ctx.fill();
```

### Particle System

```javascript
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 1.0;
    this.decay = Math.random() * 0.01 + 0.005;
    this.size = Math.random() * 4 + 2;
    this.color = `hsl(${Math.random() * 60 + 180}, 100%, 60%)`;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // gravity
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

const particles = [];

function createExplosion(x, y, count = 50) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y));
  }
}

function animateParticles() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.update();
    particle.draw(ctx);

    if (particle.isDead()) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animateParticles);
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  createExplosion(x, y);
});

animateParticles();
```

### Drawing Images and Patterns

```javascript
// Create pattern from data URL
const patternCanvas = document.createElement('canvas');
patternCanvas.width = 20;
patternCanvas.height = 20;
const pCtx = patternCanvas.getContext('2d');

pCtx.fillStyle = '#00d4ff';
pCtx.fillRect(0, 0, 10, 10);
pCtx.fillStyle = '#a855f7';
pCtx.fillRect(10, 10, 10, 10);

const pattern = ctx.createPattern(patternCanvas, 'repeat');
ctx.fillStyle = pattern;
ctx.fillRect(50, 50, 300, 200);

// Drawing with shadows
ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;
ctx.fillStyle = '#a855f7';
ctx.fillRect(400, 50, 200, 100);

// Reset shadow
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
```

### Text on Canvas

```javascript
// Basic text
ctx.font = 'bold 48px sans-serif';
ctx.fillStyle = '#00d4ff';
ctx.fillText('Hello Canvas', 50, 100);

// Stroked text
ctx.strokeStyle = '#a855f7';
ctx.lineWidth = 2;
ctx.strokeText('Hello Canvas', 50, 200);

// Text with gradient
const textGradient = ctx.createLinearGradient(50, 0, 400, 0);
textGradient.addColorStop(0, '#00d4ff');
textGradient.addColorStop(1, '#a855f7');

ctx.font = 'bold 64px sans-serif';
ctx.fillStyle = textGradient;
ctx.fillText('Gradient Text', 50, 300);

// Text with shadow/glow
ctx.shadowColor = '#00d4ff';
ctx.shadowBlur = 20;
ctx.fillStyle = '#ffffff';
ctx.fillText('Glowing Text', 50, 400);
```

### Animation Loop

```javascript
let time = 0;

function animate() {
  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  time += 0.01;

  // Animated circle
  const x = canvas.width / 2 + Math.cos(time) * 200;
  const y = canvas.height / 2 + Math.sin(time) * 100;

  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${time * 50 % 360}, 70%, 60%)`;
  ctx.fill();

  // Continue animation
  requestAnimationFrame(animate);
}

animate();
```

---

## SVG Graphics and Animations

### Basic SVG Shapes

```html
<svg width="800" height="600" viewBox="0 0 800 600">
  <!-- Rectangle -->
  <rect x="50" y="50" width="200" height="100"
        fill="#00d4ff" stroke="#a855f7" stroke-width="3"/>

  <!-- Circle -->
  <circle cx="400" cy="100" r="50"
          fill="#ec4899" opacity="0.8"/>

  <!-- Ellipse -->
  <ellipse cx="600" cy="100" rx="80" ry="50"
           fill="#a855f7"/>

  <!-- Line -->
  <line x1="50" y1="200" x2="750" y2="200"
        stroke="#00d4ff" stroke-width="2"/>

  <!-- Polyline -->
  <polyline points="50,250 100,300 150,250 200,300 250,250"
            fill="none" stroke="#00ff88" stroke-width="3"/>

  <!-- Polygon -->
  <polygon points="400,250 450,300 450,350 400,400 350,350 350,300"
           fill="#ffbe0b" stroke="#fb5607" stroke-width="2"/>

  <!-- Path (complex shapes) -->
  <path d="M 600 250 Q 650 200 700 250 T 800 250"
        fill="none" stroke="#8338ec" stroke-width="3"/>
</svg>
```

### SVG Gradients

```html
<svg width="800" height="600">
  <defs>
    <!-- Linear Gradient -->
    <linearGradient id="linearGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>

    <!-- Radial Gradient -->
    <radialGradient id="radialGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#00d4ff;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.5" />
    </radialGradient>
  </defs>

  <rect x="50" y="50" width="300" height="200" fill="url(#linearGrad)"/>
  <circle cx="600" cy="150" r="100" fill="url(#radialGrad)"/>
</svg>
```

### SVG Filters

```html
<svg width="800" height="600">
  <defs>
    <!-- Blur Filter -->
    <filter id="blur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5"/>
    </filter>

    <!-- Glow Filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Drop Shadow -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="4" dy="4" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Neon Glow -->
    <filter id="neon">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
      <feColorMatrix in="blur" mode="matrix"
                     values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                     result="glow"/>
      <feBlend in="SourceGraphic" in2="glow" mode="lighten"/>
    </filter>
  </defs>

  <rect x="50" y="50" width="150" height="100" fill="#00d4ff" filter="url(#blur)"/>
  <circle cx="350" cy="100" r="50" fill="#a855f7" filter="url(#glow)"/>
  <rect x="500" y="50" width="150" height="100" fill="#ec4899" filter="url(#shadow)"/>
  <text x="50" y="250" font-size="48" fill="#00d4ff" filter="url(#neon)">NEON</text>
</svg>
```

### SVG Animations (SMIL)

```html
<svg width="800" height="600">
  <!-- Animated Circle -->
  <circle cx="100" cy="100" r="30" fill="#00d4ff">
    <animate attributeName="cx" from="100" to="700"
             dur="3s" repeatCount="indefinite"/>
  </circle>

  <!-- Pulsing Circle -->
  <circle cx="400" cy="200" r="30" fill="#a855f7">
    <animate attributeName="r" values="30;50;30"
             dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.5;1"
             dur="2s" repeatCount="indefinite"/>
  </circle>

  <!-- Rotating Rectangle -->
  <rect x="-50" y="-25" width="100" height="50" fill="#ec4899">
    <animateTransform attributeName="transform" type="rotate"
                      from="0 400 300" to="360 400 300"
                      dur="4s" repeatCount="indefinite"/>
  </rect>

  <!-- Path Animation -->
  <path d="M 50 400 Q 400 300 750 400" fill="none"
        stroke="#00ff88" stroke-width="2"/>
  <circle r="10" fill="#00ff88">
    <animateMotion dur="5s" repeatCount="indefinite">
      <mpath href="#motionPath"/>
    </animateMotion>
  </circle>
  <path id="motionPath" d="M 50 400 Q 400 300 750 400"
        fill="none" opacity="0"/>

  <!-- Morphing Shape -->
  <path fill="#ffbe0b">
    <animate attributeName="d"
             values="M 100 500 L 150 550 L 150 600 L 100 650 L 50 600 L 50 550 Z;
                     M 100 500 C 150 500 150 650 100 650 C 50 650 50 500 100 500 Z;
                     M 100 500 L 150 550 L 150 600 L 100 650 L 50 600 L 50 550 Z"
             dur="3s" repeatCount="indefinite"/>
  </path>
</svg>
```

### SVG with CSS Animations

```html
<style>
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  .rotating-svg {
    animation: rotate 4s linear infinite;
    transform-origin: center;
  }

  .pulsing-svg {
    animation: pulse 2s ease-in-out infinite;
    transform-origin: center;
  }
</style>

<svg width="200" height="200" viewBox="0 0 200 200">
  <circle class="rotating-svg" cx="100" cy="100" r="50"
          fill="none" stroke="#00d4ff" stroke-width="3"/>
  <circle class="pulsing-svg" cx="100" cy="100" r="30"
          fill="#a855f7" opacity="0.6"/>
</svg>
```

### Inline SVG Icons

```html
<!-- Checkmark Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4ff"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12"></polyline>
</svg>

<!-- Star Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="#ffbe0b"
     stroke="#fb5607" stroke-width="2">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>

<!-- Heart Icon -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="#ec4899"
     stroke="#ec4899" stroke-width="2">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>
```

---

## WebGL Basics for Advanced Graphics

### WebGL Setup

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    canvas {
      display: block;
      width: 100%;
      height: 100vh;
      background: #000;
    }
  </style>
</head>
<body>
  <canvas id="glCanvas"></canvas>

  <script>
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      alert('WebGL not supported');
    }

    // Resize canvas to match display size
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Clear canvas with color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  </script>
</body>
</html>
```

### Simple WebGL Triangle

```javascript
// Vertex shader
const vertexShaderSource = `
  attribute vec2 position;
  attribute vec3 color;
  varying vec3 vColor;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vColor = color;
  }
`;

// Fragment shader
const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

// Create shader
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Create program
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

// Setup
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Triangle vertices (x, y, r, g, b)
const vertices = new Float32Array([
  // Position     Color
   0.0,  0.5,    1.0, 0.0, 0.0,  // top (red)
  -0.5, -0.5,    0.0, 1.0, 0.0,  // bottom left (green)
   0.5, -0.5,    0.0, 0.0, 1.0   // bottom right (blue)
]);

// Create buffer
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Setup attributes
const positionLocation = gl.getAttribLocation(program, 'position');
const colorLocation = gl.getAttribLocation(program, 'color');

gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 20, 0);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 20, 8);
gl.enableVertexAttribArray(positionLocation);
gl.enableVertexAttribArray(colorLocation);

// Draw
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

### Animated WebGL Gradient

```javascript
const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float time;
  uniform vec2 resolution;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Setup (same as before)
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Full-screen quad
const vertices = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
   1,  1
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, 'position');
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);

const timeLocation = gl.getUniformLocation(program, 'time');
const resolutionLocation = gl.getUniformLocation(program, 'resolution');

gl.useProgram(program);

let startTime = Date.now();

function render() {
  const time = (Date.now() - startTime) * 0.001;

  gl.uniform1f(timeLocation, time);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(render);
}

render();
```

### WebGL Particle System

```javascript
const vertexShaderSource = `
  attribute vec2 position;
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = size;
    vColor = color;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float alpha = 1.0 - (dist * 2.0);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

class ParticleSystem {
  constructor(gl, count) {
    this.gl = gl;
    this.count = count;
    this.particles = [];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.01,
        size: Math.random() * 10 + 5,
        r: Math.random(),
        g: Math.random(),
        b: Math.random()
      });
    }

    this.buffer = gl.createBuffer();
  }

  update() {
    for (let particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -1 || particle.x > 1) particle.vx *= -1;
      if (particle.y < -1 || particle.y > 1) particle.vy *= -1;
    }
  }

  getVertexData() {
    const data = new Float32Array(this.count * 6);
    for (let i = 0; i < this.count; i++) {
      const p = this.particles[i];
      data[i * 6 + 0] = p.x;
      data[i * 6 + 1] = p.y;
      data[i * 6 + 2] = p.size;
      data[i * 6 + 3] = p.r;
      data[i * 6 + 4] = p.g;
      data[i * 6 + 5] = p.b;
    }
    return data;
  }
}

const particleSystem = new ParticleSystem(gl, 100);

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  particleSystem.update();
  const vertices = particleSystem.getVertexData();

  gl.bindBuffer(gl.ARRAY_BUFFER, particleSystem.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

  // Setup attributes (position, size, color)
  const stride = 24; // 6 floats * 4 bytes
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
  gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, stride, 8);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, stride, 12);

  gl.drawArrays(gl.POINTS, 0, particleSystem.count);

  requestAnimationFrame(render);
}

render();
```

---

## Modern CSS Features

### Backdrop Filter (Glassmorphism)

```css
/* Glass card with backdrop blur */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Frosted glass effect */
.frosted-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) brightness(1.1);
  -webkit-backdrop-filter: blur(20px) brightness(1.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Dark glass */
.dark-glass {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px) contrast(1.2);
  -webkit-backdrop-filter: blur(15px) contrast(1.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glassmorphism navbar */
.glass-navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}
```

### Clip-Path

```css
/* Circle clip */
.clip-circle {
  clip-path: circle(50% at 50% 50%);
}

/* Polygon shapes */
.clip-triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.clip-hexagon {
  clip-path: polygon(
    50% 0%, 100% 25%, 100% 75%,
    50% 100%, 0% 75%, 0% 25%
  );
}

.clip-star {
  clip-path: polygon(
    50% 0%, 61% 35%, 98% 35%, 68% 57%,
    79% 91%, 50% 70%, 21% 91%, 32% 57%,
    2% 35%, 39% 35%
  );
}

/* Animated clip-path */
@keyframes reveal {
  from {
    clip-path: circle(0% at 50% 50%);
  }
  to {
    clip-path: circle(100% at 50% 50%);
  }
}

.clip-reveal {
  animation: reveal 1s ease forwards;
}

/* Morphing shapes */
@keyframes morph {
  0%, 100% {
    clip-path: circle(50% at 50% 50%);
  }
  50% {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }
}

.clip-morph {
  animation: morph 3s ease infinite;
}

/* Wave effect */
.clip-wave {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 85%,
    75% 90%, 50% 85%, 25% 90%,
    0% 85%
  );
}
```

### CSS Masks

```css
/* Gradient mask */
.mask-gradient {
  mask-image: linear-gradient(to bottom, black, transparent);
  -webkit-mask-image: linear-gradient(to bottom, black, transparent);
}

/* Radial mask */
.mask-radial {
  mask-image: radial-gradient(circle, black 50%, transparent 70%);
  -webkit-mask-image: radial-gradient(circle, black 50%, transparent 70%);
}

/* Image mask with SVG */
.mask-svg {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='black'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='black'/%3E%3C/svg%3E");
  mask-size: cover;
  -webkit-mask-size: cover;
}

/* Text mask */
.text-mask {
  background: linear-gradient(45deg, #00d4ff, #a855f7);
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='60' font-weight='bold' text-anchor='middle' dominant-baseline='middle'%3EMASK%3C/text%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='50%25' y='50%25' font-size='60' font-weight='bold' text-anchor='middle' dominant-baseline='middle'%3EMASK%3C/text%3E%3C/svg%3E");
  mask-size: cover;
  -webkit-mask-size: cover;
}

/* Animated mask */
@keyframes maskReveal {
  from {
    mask-position: -100% 0;
  }
  to {
    mask-position: 100% 0;
  }
}

.mask-animated {
  mask-image: linear-gradient(90deg, transparent, black 50%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, black 50%, transparent);
  mask-size: 200% 100%;
  -webkit-mask-size: 200% 100%;
  animation: maskReveal 2s linear infinite;
}
```

### Blend Modes

```css
/* Multiply blend */
.blend-multiply {
  background: linear-gradient(45deg, #00d4ff, #a855f7);
  mix-blend-mode: multiply;
}

/* Screen blend */
.blend-screen {
  background: linear-gradient(45deg, #00d4ff, #a855f7);
  mix-blend-mode: screen;
}

/* Overlay blend */
.blend-overlay {
  mix-blend-mode: overlay;
}

/* Color dodge (neon effect) */
.blend-color-dodge {
  mix-blend-mode: color-dodge;
}

/* Difference (invert colors) */
.blend-difference {
  mix-blend-mode: difference;
}

/* Background blend modes */
.background-blend {
  background-image:
    linear-gradient(45deg, rgba(0, 212, 255, 0.5), rgba(168, 85, 247, 0.5)),
    url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="50" height="50" fill="%23000"/%3E%3Crect x="50" y="50" width="50" height="50" fill="%23000"/%3E%3C/svg%3E');
  background-blend-mode: multiply;
  background-size: cover, 20px 20px;
}

/* Practical example: Glowing text */
.glow-text {
  color: #00d4ff;
  text-shadow: 0 0 10px #00d4ff;
}

.glow-text::before {
  content: attr(data-text);
  position: absolute;
  mix-blend-mode: screen;
  filter: blur(10px);
  color: #00d4ff;
}
```

### CSS Filters

```css
/* Basic filters */
.filter-blur { filter: blur(5px); }
.filter-brightness { filter: brightness(150%); }
.filter-contrast { filter: contrast(200%); }
.filter-grayscale { filter: grayscale(100%); }
.filter-hue-rotate { filter: hue-rotate(180deg); }
.filter-invert { filter: invert(100%); }
.filter-opacity { filter: opacity(50%); }
.filter-saturate { filter: saturate(200%); }
.filter-sepia { filter: sepia(100%); }

/* Combined filters */
.filter-combined {
  filter: contrast(120%) brightness(110%) saturate(130%);
}

/* Drop shadow */
.filter-drop-shadow {
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
}

/* Glowing effect with filter */
.filter-glow {
  filter:
    brightness(1.2)
    drop-shadow(0 0 10px currentColor)
    drop-shadow(0 0 20px currentColor);
}

/* Animated filter */
@keyframes filterAnimation {
  0%, 100% {
    filter: hue-rotate(0deg) saturate(100%);
  }
  50% {
    filter: hue-rotate(180deg) saturate(200%);
  }
}

.filter-animated {
  animation: filterAnimation 5s ease infinite;
}
```

### CSS Variables for Dynamic Effects

```css
:root {
  --color-primary: #00d4ff;
  --color-secondary: #a855f7;
  --glow-intensity: 20px;
  --animation-speed: 2s;
}

/* Using CSS variables */
.dynamic-element {
  color: var(--color-primary);
  box-shadow: 0 0 var(--glow-intensity) var(--color-primary);
  animation-duration: var(--animation-speed);
}

/* Update variables with JavaScript */
/* document.documentElement.style.setProperty('--glow-intensity', '40px'); */

/* Dynamic gradient with variables */
.dynamic-gradient {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
}

/* Mouse tracking with CSS variables */
.mouse-tracker {
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(0, 212, 255, 0.2),
    transparent 50%
  );
}
```

---

## Particle Effects and Visual Effects

### CSS-Only Particle Effect

```html
<style>
  .particle-container {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #00d4ff;
    border-radius: 50%;
    box-shadow: 0 0 10px #00d4ff;
    animation: float linear infinite;
  }

  @keyframes float {
    0% {
      transform: translateY(100vh) translateX(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) translateX(var(--drift, 0));
      opacity: 0;
    }
  }

  /* Generate particles with different properties */
  .particle:nth-child(1) { left: 10%; animation-duration: 8s; animation-delay: 0s; --drift: 50px; }
  .particle:nth-child(2) { left: 20%; animation-duration: 6s; animation-delay: 0.5s; --drift: -30px; }
  .particle:nth-child(3) { left: 30%; animation-duration: 10s; animation-delay: 1s; --drift: 70px; }
  .particle:nth-child(4) { left: 40%; animation-duration: 7s; animation-delay: 1.5s; --drift: -50px; }
  .particle:nth-child(5) { left: 50%; animation-duration: 9s; animation-delay: 2s; --drift: 40px; }
  .particle:nth-child(6) { left: 60%; animation-duration: 8s; animation-delay: 0.8s; --drift: -60px; }
  .particle:nth-child(7) { left: 70%; animation-duration: 7s; animation-delay: 1.2s; --drift: 80px; }
  .particle:nth-child(8) { left: 80%; animation-duration: 10s; animation-delay: 0.3s; --drift: -40px; }
  .particle:nth-child(9) { left: 90%; animation-duration: 6s; animation-delay: 1.8s; --drift: 60px; }
  .particle:nth-child(10) { left: 95%; animation-duration: 9s; animation-delay: 0.9s; --drift: -70px; }
</style>

<div class="particle-container">
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
  <div class="particle"></div>
</div>
```

### JavaScript Particle System

```javascript
class ParticleEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.createParticles(this.mouse.x, this.mouse.y, 5);
    });

    this.animate();
  }

  createParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.01,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 180}, 100%, 60%)`
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Usage
const canvas = document.getElementById('particleCanvas');
const effect = new ParticleEffect(canvas);
```

### Starfield Effect

```javascript
class Starfield {
  constructor(canvas, starCount = 200) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        size: Math.random() * 2
      });
    }

    this.animate();
  }

  update() {
    for (const star of this.stars) {
      star.z -= 2;

      if (star.z <= 0) {
        star.x = Math.random() * this.canvas.width;
        star.y = Math.random() * this.canvas.height;
        star.z = this.canvas.width;
      }
    }
  }

  draw() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    for (const star of this.stars) {
      const x = (star.x - cx) * (this.canvas.width / star.z) + cx;
      const y = (star.y - cy) * (this.canvas.width / star.z) + cy;
      const size = (1 - star.z / this.canvas.width) * star.size * 3;

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Usage
const canvas = document.getElementById('starfield');
const starfield = new Starfield(canvas);
```

### Ripple Effect

```javascript
class RippleEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ripples = [];

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.createRipple(x, y);
    });

    this.animate();
  }

  createRipple(x, y) {
    this.ripples.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: 150,
      speed: 3,
      opacity: 1
    });
  }

  update() {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const ripple = this.ripples[i];
      ripple.radius += ripple.speed;
      ripple.opacity = 1 - (ripple.radius / ripple.maxRadius);

      if (ripple.radius >= ripple.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const ripple of this.ripples) {
      this.ctx.save();
      this.ctx.globalAlpha = ripple.opacity;
      this.ctx.strokeStyle = '#00d4ff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Usage
const canvas = document.getElementById('ripple');
const rippleEffect = new RippleEffect(canvas);
```

---

## Modern Design Trends

### Glassmorphism

```html
<style>
  .glass-background {
    position: relative;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 40px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    max-width: 400px;
  }

  .glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
  }

  .glass-button {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 12px 24px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .glass-button:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
</style>

<div class="glass-background">
  <div class="glass-card">
    <h2>Glassmorphism</h2>
    <p>Modern frosted glass effect</p>
    <button class="glass-button">Click Me</button>
  </div>
</div>
```

### Neumorphism

```html
<style>
  .neuro-background {
    background: #e0e5ec;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .neuro-card {
    background: #e0e5ec;
    border-radius: 20px;
    padding: 40px;
    box-shadow:
      9px 9px 16px rgba(163, 177, 198, 0.6),
      -9px -9px 16px rgba(255, 255, 255, 0.5);
    max-width: 400px;
  }

  .neuro-card-inset {
    background: #e0e5ec;
    border-radius: 20px;
    padding: 40px;
    box-shadow:
      inset 9px 9px 16px rgba(163, 177, 198, 0.6),
      inset -9px -9px 16px rgba(255, 255, 255, 0.5);
  }

  .neuro-button {
    background: #e0e5ec;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    color: #4f5b67;
    font-weight: 600;
    cursor: pointer;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
  }

  .neuro-button:hover {
    box-shadow:
      4px 4px 8px rgba(163, 177, 198, 0.6),
      -4px -4px 8px rgba(255, 255, 255, 0.5);
  }

  .neuro-button:active {
    box-shadow:
      inset 4px 4px 8px rgba(163, 177, 198, 0.6),
      inset -4px -4px 8px rgba(255, 255, 255, 0.5);
  }

  .neuro-input {
    background: #e0e5ec;
    border: none;
    border-radius: 12px;
    padding: 12px 20px;
    color: #4f5b67;
    box-shadow:
      inset 6px 6px 12px rgba(163, 177, 198, 0.6),
      inset -6px -6px 12px rgba(255, 255, 255, 0.5);
    outline: none;
    width: 100%;
  }

  .neuro-toggle {
    width: 60px;
    height: 30px;
    background: #e0e5ec;
    border-radius: 30px;
    box-shadow:
      inset 4px 4px 8px rgba(163, 177, 198, 0.6),
      inset -4px -4px 8px rgba(255, 255, 255, 0.5);
    position: relative;
    cursor: pointer;
  }

  .neuro-toggle::before {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #e0e5ec;
    top: 3px;
    left: 3px;
    box-shadow:
      4px 4px 8px rgba(163, 177, 198, 0.6),
      -4px -4px 8px rgba(255, 255, 255, 0.5);
    transition: transform 0.3s ease;
  }

  .neuro-toggle.active::before {
    transform: translateX(30px);
  }
</style>

<div class="neuro-background">
  <div class="neuro-card">
    <h2 style="color: #4f5b67;">Neumorphism</h2>
    <p style="color: #6b7781;">Soft UI design</p>
    <input class="neuro-input" type="text" placeholder="Enter text...">
    <br><br>
    <button class="neuro-button">Click Me</button>
    <br><br>
    <div class="neuro-toggle"></div>
  </div>
</div>
```

### Gradient Borders

```css
/* Gradient border with pseudo-element */
.gradient-border {
  position: relative;
  background: #000;
  border-radius: 16px;
  padding: 32px;
}

.gradient-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Animated gradient border */
@keyframes rotateBorder {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.gradient-border-animated {
  position: relative;
  background: #000;
  border-radius: 16px;
  padding: 32px;
}

.gradient-border-animated::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 3px;
  background: linear-gradient(
    270deg,
    #00d4ff,
    #a855f7,
    #ec4899,
    #00d4ff
  );
  background-size: 400% 400%;
  animation: rotateBorder 8s ease infinite;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### Holographic Effects

```css
/* Holographic gradient */
.holographic {
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #00f2fe 100%
  );
  background-size: 400% 400%;
  animation: holographic 10s ease infinite;
}

@keyframes holographic {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Holographic text */
.holographic-text {
  background: linear-gradient(
    45deg,
    #405de6,
    #5851db,
    #833ab4,
    #c13584,
    #e1306c,
    #fd1d1d,
    #f56040,
    #f77737,
    #fcaf45,
    #ffdc80
  );
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: holographic 8s ease infinite;
  font-size: 4rem;
  font-weight: bold;
}

/* Holographic card */
.holographic-card {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1),
    rgba(118, 75, 162, 0.1)
  );
  border-radius: 20px;
  padding: 40px;
  overflow: hidden;
}

.holographic-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: rotate(45deg);
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}
```

### Neon Effects

```css
/* Neon text */
.neon-text {
  color: #00d4ff;
  font-size: 4rem;
  font-weight: bold;
  text-shadow:
    0 0 5px #00d4ff,
    0 0 10px #00d4ff,
    0 0 20px #00d4ff,
    0 0 40px #00d4ff,
    0 0 80px #00d4ff;
  animation: neonFlicker 3s ease-in-out infinite;
}

@keyframes neonFlicker {
  0%, 100% { opacity: 1; }
  41%, 43% { opacity: 0.8; }
  44% { opacity: 1; }
  61%, 63% { opacity: 0.9; }
  64% { opacity: 1; }
}

/* Neon border */
.neon-border {
  border: 3px solid #00d4ff;
  border-radius: 16px;
  padding: 32px;
  box-shadow:
    0 0 5px #00d4ff,
    0 0 10px #00d4ff,
    inset 0 0 5px #00d4ff,
    inset 0 0 10px #00d4ff;
}

/* Neon button */
.neon-button {
  background: transparent;
  border: 2px solid #00d4ff;
  color: #00d4ff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow:
    0 0 10px #00d4ff,
    inset 0 0 10px #00d4ff;
  transition: all 0.3s ease;
}

.neon-button:hover {
  background: #00d4ff;
  color: #000;
  box-shadow:
    0 0 20px #00d4ff,
    0 0 40px #00d4ff,
    inset 0 0 20px #00d4ff;
}
```

---

## Performance Optimization for Graphics

### Best Practices

```javascript
// 1. Use requestAnimationFrame for animations
function animate() {
  // Update logic
  updateParticles();

  // Draw
  render();

  requestAnimationFrame(animate);
}

// 2. Throttle expensive operations
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Usage
window.addEventListener('resize', throttle(() => {
  resizeCanvas();
}, 100));

// 3. Debounce user input
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 4. Object pooling for particles
class ParticlePool {
  constructor(size) {
    this.pool = [];
    this.active = [];

    for (let i = 0; i < size; i++) {
      this.pool.push(this.createParticle());
    }
  }

  createParticle() {
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      life: 1, size: 1, color: '#fff',
      active: false
    };
  }

  get() {
    let particle = this.pool.pop();
    if (!particle) {
      particle = this.createParticle();
    }
    particle.active = true;
    this.active.push(particle);
    return particle;
  }

  release(particle) {
    particle.active = false;
    const index = this.active.indexOf(particle);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(particle);
    }
  }
}

// 5. Canvas layering
// Use multiple canvases for static and dynamic content
const staticCanvas = document.getElementById('static');
const dynamicCanvas = document.getElementById('dynamic');
const staticCtx = staticCanvas.getContext('2d');
const dynamicCtx = dynamicCanvas.getContext('2d');

// Draw static elements once
function drawBackground() {
  staticCtx.fillStyle = '#000';
  staticCtx.fillRect(0, 0, staticCanvas.width, staticCanvas.height);
  // ... draw static elements
}

// Only redraw dynamic elements
function animate() {
  dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
  // ... draw moving elements
  requestAnimationFrame(animate);
}

// 6. Use CSS transforms for better performance
// CSS transforms are GPU-accelerated
.animated-element {
  /* Better performance */
  transform: translate(100px, 50px);

  /* Slower */
  /* left: 100px; top: 50px; */
}

// 7. Use will-change sparingly
.will-animate {
  will-change: transform, opacity;
}

// Remove after animation
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto';
});

// 8. Minimize repaints and reflows
// Batch DOM updates
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);

// 9. Use ImageBitmap for better canvas performance
async function loadOptimizedImage(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

// Usage
const bitmap = await loadOptimizedImage('image.jpg');
ctx.drawImage(bitmap, 0, 0);

// 10. Reduce canvas draw calls
// Bad: Multiple draw calls
for (const particle of particles) {
  ctx.fillStyle = particle.color;
  ctx.fillRect(particle.x, particle.y, 2, 2);
}

// Better: Batch similar operations
ctx.fillStyle = '#00d4ff';
ctx.beginPath();
for (const particle of particles) {
  ctx.rect(particle.x, particle.y, 2, 2);
}
ctx.fill();
```

### Memory Management

```javascript
// Clean up event listeners
class EffectManager {
  constructor() {
    this.handlers = [];
  }

  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.handlers.push({ element, event, handler });
  }

  cleanup() {
    for (const { element, event, handler } of this.handlers) {
      element.removeEventListener(event, handler);
    }
    this.handlers = [];
  }
}

// Remove references to avoid memory leaks
class Animation {
  constructor() {
    this.particles = [];
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    this.particles = []; // Clear references
  }

  animate() {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    requestAnimationFrame(() => this.animate());
  }
}

// Use WeakMap for DOM-related data
const elementData = new WeakMap();

function setElementData(element, data) {
  elementData.set(element, data);
}

// Data is automatically garbage collected when element is removed
```

### Optimizing for Mobile

```css
/* Reduce animations on mobile */
@media (max-width: 768px) {
  * {
    animation-duration: 0.5s !important;
  }
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

```javascript
// Detect touch devices and reduce effects
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
  // Reduce particle count
  particleCount = particleCount * 0.5;

  // Use simpler effects
  useSimpleEffects = true;
}

// Detect device performance
const isLowEndDevice = navigator.hardwareConcurrency <= 4;

if (isLowEndDevice) {
  // Reduce quality
  canvas.width = window.innerWidth * 0.75;
  canvas.height = window.innerHeight * 0.75;
}
```

### Code Size Optimization

```javascript
// Minify and compress
// Use tools like Terser for JavaScript
// Use cssnano for CSS

// Remove console.log in production
if (process.env.NODE_ENV !== 'development') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Use shorter variable names in production
// (done by minifiers automatically)

// Inline small assets as data URLs
const smallIcon = 'data:image/svg+xml,%3Csvg...%3C/svg%3E';

// Use CSS instead of JavaScript when possible
// CSS animations are smaller and faster
```

---

## Practical Examples

### Complete Single-File App with Modern Graphics

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Graphics Demo</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      overflow: hidden;
      position: relative;
    }

    /* Animated background */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
        radial-gradient(ellipse at 20% 30%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%);
      animation: backgroundShift 20s ease-in-out infinite;
      z-index: -1;
    }

    @keyframes backgroundShift {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }

    /* Glass card */
    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px) saturate(180%);
      -webkit-backdrop-filter: blur(10px) saturate(180%);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 48px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      text-align: center;
      position: relative;
      overflow: visible;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    }

    h1 {
      font-size: 3rem;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #00d4ff, #a855f7);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 8s ease infinite;
      background-size: 200% 200%;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .button {
      background: linear-gradient(135deg, #00d4ff, #a855f7);
      border: none;
      border-radius: 12px;
      padding: 16px 32px;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4);
    }

    .button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .button:hover::before {
      left: 100%;
    }

    /* Canvas for particle effect */
    #particles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    }
  </style>
</head>
<body>
  <canvas id="particles"></canvas>

  <div class="card">
    <h1>Modern Graphics</h1>
    <p>
      A showcase of modern web graphics techniques including CSS gradients,
      glassmorphism, animations, and Canvas API particle effects.
    </p>
    <button class="button" onclick="createExplosion()">
      Create Particle Effect
    </button>
  </div>

  <script>
    // Canvas setup
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle system
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1.0;
        this.decay = Math.random() * 0.015 + 0.01;
        this.size = Math.random() * 4 + 2;
        const hue = Math.random() * 60 + 180;
        this.color = `hsl(${hue}, 100%, 60%)`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // gravity
        this.vx *= 0.99;
        this.life -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      isDead() {
        return this.life <= 0;
      }
    }

    const particles = [];

    function createExplosion() {
      const x = canvas.width / 2;
      const y = canvas.height / 2;

      for (let i = 0; i < 100; i++) {
        particles.push(new Particle(x, y));
      }
    }

    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();

        if (particle.isDead()) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    // Click to create particles
    canvas.addEventListener('click', (e) => {
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(e.clientX, e.clientY));
      }
    });
  </script>
</body>
</html>
```

---

## Additional Resources

### Useful Data URLs for Common Patterns

```css
/* Checkerboard pattern */
background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23000'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23000'/%3E%3C/svg%3E");

/* Dots pattern */
background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23000'/%3E%3C/svg%3E");

/* Lines pattern */
background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='0' x2='20' y2='20' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E");

/* Grid pattern */
background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='%23ccc' stroke-width='1'/%3E%3C/svg%3E");
```

### Performance Monitoring

```javascript
// FPS counter
let lastTime = performance.now();
let frames = 0;
let fps = 0;

function measureFPS() {
  frames++;
  const now = performance.now();

  if (now >= lastTime + 1000) {
    fps = Math.round((frames * 1000) / (now - lastTime));
    frames = 0;
    lastTime = now;
    console.log(`FPS: ${fps}`);
  }

  requestAnimationFrame(measureFPS);
}

measureFPS();

// Memory usage (Chrome only)
if (performance.memory) {
  setInterval(() => {
    const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
    const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
    console.log(`Memory: ${used}MB / ${total}MB`);
  }, 5000);
}
```

---

## Conclusion

This guide covers modern graphics and visual design techniques optimized for single-file web applications. All techniques are:

- **Lightweight**: No external dependencies required
- **Performance-optimized**: Efficient rendering and animation
- **Cross-browser compatible**: Works in modern browsers
- **Mobile-friendly**: Responsive and touch-enabled
- **Size-efficient**: Easily fits under 1MB

### Key Takeaways

1. **CSS is powerful**: Modern CSS can handle most visual effects without JavaScript
2. **Layer your canvas**: Separate static and dynamic content for better performance
3. **Use CSS transforms**: GPU-accelerated for smooth animations
4. **Object pooling**: Reuse particle objects to reduce garbage collection
5. **Batch operations**: Minimize draw calls and DOM updates
6. **Monitor performance**: Track FPS and memory usage
7. **Respect user preferences**: Honor `prefers-reduced-motion`
8. **Progressive enhancement**: Start with CSS, add Canvas/WebGL for advanced effects

Use this guide as a reference when building visually stunning single-file web applications!
