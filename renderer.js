'use strict';

// --- SINGLE CANVAS ENGINE ---
const canvas = document.getElementById('catCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- STATE MANAGEMENT ---
let currentState = 'IDLE'; // 'IDLE' | 'TYPING' | 'PETTED' | 'DRAGGING'
let activeKey = 'left';
let keyTimeout = null;
let petTimeout = null;

let catX = window.innerWidth / 2 - 40;
let catY = window.innerHeight / 2 - 40;
const catWidth = 80;
const catHeight = 80;

let scaleX = 1;
let scaleY = 1;

let dragStartY = 0;
let isDragging = false;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let kps = 0;
let heatLevel = 0;
let particles = [];

// Load Cat Image Asset
const catImg = new Image();
catImg.src = './assets/cat.png';

// Check hit bounding box
function isOverCat(mx, my) {
  return (
    mx >= catX &&
    mx <= catX + catWidth &&
    my >= catY &&
    my <= catY + catHeight
  );
}

// Mouse passthrough throttling
let lastPassthroughTime = 0;
let isIgnoringMouse = true;

function updateMousePassthrough(mx, my) {
  const now = Date.now();
  if (now - lastPassthroughTime < 30) return;
  lastPassthroughTime = now;

  const over = isOverCat(mx, my);
  if (over && isIgnoringMouse) {
    isIgnoringMouse = false;
    if (window.deskpet && window.deskpet.setIgnoreMouseEvents) {
      window.deskpet.setIgnoreMouseEvents(false, { forward: true });
    }
  } else if (!over && !isIgnoringMouse && !isDragging) {
    isIgnoringMouse = true;
    if (window.deskpet && window.deskpet.setIgnoreMouseEvents) {
      window.deskpet.setIgnoreMouseEvents(true, { forward: true });
    }
  }
}

// --- 1. KEYBOARD LISTENER ---
if (window.catAPI && window.catAPI.onKeystroke) {
  window.catAPI.onKeystroke(() => {
    // Ignore keyboard input if petted or dragging
    if (currentState === 'PETTED' || currentState === 'DRAGGING') return;

    currentState = 'TYPING';
    activeKey = (activeKey === 'left') ? 'right' : 'left';

    if (keyTimeout) clearTimeout(keyTimeout);
    keyTimeout = setTimeout(() => {
      if (currentState === 'TYPING') {
        currentState = 'IDLE';
      }
    }, 150);
  });
}

if (window.catAPI && window.catAPI.onKpsUpdate) {
  window.catAPI.onKpsUpdate((currentKps) => {
    kps = currentKps || 0;
  });
}

// --- 2. MOUSE / TOUCHPAD LISTENERS ---
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  updateMousePassthrough(e.clientX, e.clientY);

  if (isDragging) {
    currentState = 'DRAGGING';
    catX = Math.max(0, Math.min(window.innerWidth - catWidth, e.clientX - catWidth / 2));
    catY = Math.max(0, Math.min(window.innerHeight - catHeight, e.clientY - catHeight / 2));

    // Vertical Mochi stretch physics
    const stretch = Math.max(0, dragStartY - e.clientY);
    scaleY = 1 + Math.min(stretch / 100, 0.7);
    scaleX = 1 / scaleY; // Area volume preservation
  }
});

window.addEventListener('mousedown', (e) => {
  if (isOverCat(e.clientX, e.clientY)) {
    e.stopPropagation();

    isDragging = true;
    dragStartY = e.clientY;
    currentState = 'PETTED';

    // Spawn heart particle
    particles.push({
      x: catX + catWidth / 2 + (Math.random() * 20 - 10),
      y: catY - 10,
      opacity: 1,
      size: Math.random() * 6 + 4,
      type: 'heart'
    });

    if (petTimeout) clearTimeout(petTimeout);
    petTimeout = setTimeout(() => {
      if (currentState === 'PETTED' && !isDragging) {
        currentState = 'IDLE';
      }
    }, 600);
  }
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    scaleX = 1;
    scaleY = 1;
    currentState = 'IDLE';
  }
});

// --- PARTICLES ---
function updateAndDrawParticles() {
  if (kps >= 5 && Math.random() < 0.25) {
    particles.push({
      x: catX + catWidth / 2 + (Math.random() * 20 - 10),
      y: catY - 5,
      opacity: 1,
      size: Math.random() * 4 + 2,
      type: 'steam'
    });
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (p.type === 'steam') {
      ctx.fillStyle = `rgba(255, 90, 110, ${p.opacity})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y -= 1.2;
    } else {
      ctx.fillStyle = `rgba(255, 60, 120, ${p.opacity})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y -= 0.8;
    }
    p.opacity -= 0.025;
    if (p.opacity <= 0) particles.splice(i, 1);
  }
}

// --- KEYPAD RENDER (LAYER 1) ---
function drawKeypad() {
  const keyWidth = 24;
  const keyHeight = 14;
  const baseY = catY + catHeight - 10;
  const leftX = catX + 6;
  const rightX = catX + 38;

  const leftKeyY = (activeKey === 'left') ? baseY + 4 : baseY;
  const rightKeyY = (activeKey === 'right') ? baseY + 4 : baseY;

  // Left Keycap
  ctx.fillStyle = '#4a4a52';
  ctx.fillRect(leftX, baseY + 4, keyWidth, keyHeight);
  ctx.fillStyle = (activeKey === 'left') ? '#8e8e99' : '#d0d0d8';
  ctx.fillRect(leftX, leftKeyY, keyWidth, keyHeight - 2);

  // Right Keycap
  ctx.fillStyle = '#4a4a52';
  ctx.fillRect(rightX, baseY + 4, keyWidth, keyHeight);
  ctx.fillStyle = (activeKey === 'right') ? '#8e8e99' : '#d0d0d8';
  ctx.fillRect(rightX, rightKeyY, keyWidth, keyHeight - 2);
}

// --- SELF-HEALING RENDER LOOP ---
function render() {
  try {
    if (!ctx) return;

    // Layer 0: Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Prop Keypad (ONLY during TYPING)
    if (currentState === 'TYPING') {
      drawKeypad();
    }

    // Layer 2: Character Cat PNG with Transforms
    ctx.save();
    ctx.translate(catX + catWidth / 2, catY + catHeight / 2);
    ctx.scale(scaleX, scaleY);

    if (catImg.complete && catImg.naturalWidth !== 0) {
      ctx.drawImage(catImg, -catWidth / 2, -catHeight / 2, catWidth, catHeight);
    }

    ctx.restore();

    // Layer 4: Particles
    updateAndDrawParticles();

  } catch (err) {
    console.error('[PixelPet] Render error:', err);
  } finally {
    requestAnimationFrame(render);
  }
}

// Start animation loop
requestAnimationFrame(render);
