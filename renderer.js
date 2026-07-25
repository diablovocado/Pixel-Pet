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

let isKeyPressed = false;
let keyDepressTimeout = null;

// --- 1. KEYBOARD LISTENER ---
if (window.catAPI && window.catAPI.onKeystroke) {
  window.catAPI.onKeystroke(() => {
    // Ensure mouse clicks, touchpad taps, or dragging NEVER trigger the keypad
    if (currentState === 'PETTED' || currentState === 'DRAGGING' || isDragging) return;

    currentState = 'TYPING';
    activeKey = (activeKey === 'left') ? 'right' : 'left';
    isKeyPressed = true;

    // Depress active keycap down by 4px for 120ms before raising back up
    if (keyDepressTimeout) clearTimeout(keyDepressTimeout);
    keyDepressTimeout = setTimeout(() => {
      isKeyPressed = false;
    }, 120);

    // Return to IDLE 150ms after typing pauses
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
let isMouseDownOnCat = false;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  updateMousePassthrough(e.clientX, e.clientY);

  if (isMouseDownOnCat) {
    isDragging = true;
    currentState = 'DRAGGING';
    catX = Math.max(0, Math.min(window.innerWidth - catWidth, e.clientX - catWidth / 2));
    catY = Math.max(0, Math.min(window.innerHeight - catHeight, e.clientY - catHeight / 2));

    // Vertical Mochi stretch physics (dragDistanceY when moved upwards)
    const dragDistanceY = Math.max(0, dragStartY - e.clientY);
    scaleY = 1 + Math.min(dragDistanceY / 100, 0.7);
    scaleX = 1 / scaleY; // Area volume preservation
  } else if (mouseY >= window.innerHeight - 80 && !isDragging) {
    // Move cursor down near dock -> Cat sleeps near dock and stops following cursor
    if (currentState !== 'SLEEPING') {
      currentState = 'SLEEPING';
      catY = window.innerHeight - catHeight - 12;
    }
  } else if (mouseY < window.innerHeight - 140 && currentState === 'SLEEPING') {
    // Wake up when cursor moves back up
    currentState = 'IDLE';
  }
});

// --- MOOD NOTES & SPEECH BUBBLES ---
const moodNotes = [
  "hi maith! 👋",
  "meow~ 💕",
  "let's code! 💻",
  "purrrrr... 🐱",
  "hard at work! ✨",
  "stay hydrated! 💧",
  "stretch time! 🧘",
  "you're doing great! 🌟",
  "need a tea break? ☕",
  "good job today! 🎉"
];

let currentBubble = {
  text: '',
  timer: 0,
  opacity: 1
};

function triggerRandomMoodNote() {
  const text = moodNotes[Math.floor(Math.random() * moodNotes.length)];
  currentBubble = {
    text: text,
    timer: 180, // 3 seconds
    opacity: 1
  };
}

function drawSpeechBubble() {
  if (!currentBubble.text || currentBubble.timer <= 0) return;

  currentBubble.timer--;
  if (currentBubble.timer < 30) {
    currentBubble.opacity = currentBubble.timer / 30;
  } else {
    currentBubble.opacity = 1;
  }

  ctx.save();
  ctx.font = 'bold 12px "Courier New", monospace';
  const textWidth = ctx.measureText(currentBubble.text).width;
  const padding = 10;
  const bw = textWidth + padding * 2;
  const bh = 24;

  const bx = catX + catWidth / 2 - bw / 2;
  const by = catY - bh - 16;

  ctx.globalAlpha = currentBubble.opacity;

  // Dark pixelated bubble background with pink accent border
  ctx.fillStyle = '#1e1e24';
  ctx.strokeStyle = '#ff79c6';
  ctx.lineWidth = 2;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bx, by, bw, bh, 6);
  } else {
    ctx.rect(bx, by, bw, bh);
  }
  ctx.fill();
  ctx.stroke();

  // Tail arrow
  ctx.fillStyle = '#ff79c6';
  ctx.beginPath();
  ctx.moveTo(catX + catWidth / 2 - 4, by + bh);
  ctx.lineTo(catX + catWidth / 2 + 4, by + bh);
  ctx.lineTo(catX + catWidth / 2, by + bh + 5);
  ctx.closePath();
  ctx.fill();

  // Bubble Text
  ctx.fillStyle = '#f8f8f2';
  ctx.fillText(currentBubble.text, bx + padding, by + 16);

  ctx.restore();
}

window.addEventListener('mousedown', (e) => {
  if (isOverCat(e.clientX, e.clientY)) {
    e.stopPropagation();

    isMouseDownOnCat = true;
    dragStartY = e.clientY;

    // Trigger mood reaction speech bubble ("hi maith!", "meow~", etc.)
    triggerRandomMoodNote();

    // Quick click/pet: spawn small heart particle floating up from above head
    particles.push({
      x: catX + catWidth / 2 + (Math.random() * 16 - 8),
      y: catY - 10,
      opacity: 1,
      size: Math.random() * 5 + 4,
      type: 'heart'
    });
  }
});

window.addEventListener('mouseup', () => {
  isMouseDownOnCat = false;
  isDragging = false;
  // Instant snap back to normal proportions
  scaleX = 1;
  scaleY = 1;
  currentState = 'IDLE';
});

// --- PARTICLES ---
function updateAndDrawParticles() {
  if (currentState === 'SLEEPING' && Math.random() < 0.04) {
    particles.push({
      x: catX + catWidth / 2 + (Math.random() * 12 - 6),
      y: catY - 5,
      opacity: 1,
      size: 11,
      type: 'zzz'
    });
  }

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
    if (p.type === 'zzz') {
      ctx.fillStyle = `rgba(180, 200, 255, ${p.opacity})`;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('z Z', p.x, p.y);
      p.y -= 0.6;
      p.x += Math.sin(Date.now() * 0.005) * 0.4;
    } else if (p.type === 'steam') {
      ctx.fillStyle = `rgba(255, 90, 110, ${p.opacity})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y -= 1.2;
    } else {
      ctx.fillStyle = `rgba(255, 60, 120, ${p.opacity})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y -= 0.8;
    }
    p.opacity -= 0.02;
    if (p.opacity <= 0) particles.splice(i, 1);
  }
}

// --- KEYPAD RENDER (LAYER 1) ---
function drawKeypad(ctx, x, y) {
  const keyWidth = 24;
  const keyHeight = 14;
  const baseY = y + catHeight - 12;
  const leftX = x + 12;
  const rightX = x + 44;

  const leftKeyY = (activeKey === 'left' && isKeyPressed) ? baseY + 4 : baseY;
  const rightKeyY = (activeKey === 'right' && isKeyPressed) ? baseY + 4 : baseY;

  // 3D Mechanical Keycaps (Base + Cap)
  // Left Keycap
  ctx.fillStyle = '#2d2d34';
  ctx.fillRect(leftX, baseY + 4, keyWidth, keyHeight);
  ctx.fillStyle = (activeKey === 'left' && isKeyPressed) ? '#90909a' : '#e0e0e8';
  ctx.fillRect(leftX, leftKeyY, keyWidth, keyHeight - 2);

  // Right Keycap
  ctx.fillStyle = '#2d2d34';
  ctx.fillRect(rightX, baseY + 4, keyWidth, keyHeight);
  ctx.fillStyle = (activeKey === 'right' && isKeyPressed) ? '#90909a' : '#e0e0e8';
  ctx.fillRect(rightX, rightKeyY, keyWidth, keyHeight - 2);
}

function safeScale(value, fallback = 1) {
  return Number.isFinite(value) && !isNaN(value) ? value : fallback;
}

let faceDir = 1; // 1 = facing right, -1 = facing left

// --- CURSOR PURSUIT / RUNNING MATH ---
function updateCursorPursuit() {
  if (isDragging || currentState === 'DRAGGING' || currentState === 'PETTED' || currentState === 'SLEEPING') return 0;

  const targetX = mouseX - catWidth / 2;
  const targetY = mouseY - catHeight / 2;

  const dx = targetX - catX;
  const dy = targetY - catY;
  const dist = Math.hypot(dx, dy);

  // If cursor is further than 45px, run towards it
  if (dist > 45) {
    const pursuitSpeed = Math.min(0.09, (dist - 40) * 0.0035 + 0.04);
    catX += dx * pursuitSpeed;
    catY += dy * pursuitSpeed;

    // Screen bounds safety
    catX = Math.max(0, Math.min(window.innerWidth - catWidth, catX));
    catY = Math.max(0, Math.min(window.innerHeight - catHeight, catY));

    // Flip face direction based on movement direction
    if (dx < -5) faceDir = -1;
    else if (dx > 5) faceDir = 1;

    // Running bounce stride
    return Math.sin(Date.now() * 0.018) * 3;
  }
  return 0;
}

// --- SELF-HEALING RENDER LOOP ---
function render() {
  try {
    if (!ctx) return;

    // Update cursor pursuit (cat runs behind cursor)
    const bounceY = updateCursorPursuit();

    // Layer 0: Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Prop Keypad (ONLY during TYPING)
    if (currentState === 'TYPING') {
      drawKeypad(ctx, catX, catY);
    }

    // Layer 2: Character Cat PNG with Safe Transforms & Direction Flip
    const sX = safeScale(scaleX * faceDir, 1);
    const sY = safeScale(scaleY, 1);

    ctx.save();
    ctx.translate(catX + catWidth / 2, catY + catHeight / 2 + bounceY);
    ctx.scale(sX, sY);

    if (catImg.complete && catImg.naturalWidth !== 0) {
      ctx.drawImage(catImg, -catWidth / 2, -catHeight / 2, catWidth, catHeight);
    }

    ctx.restore();

    // Layer 3: Speech Bubble / Mood Reactions ("hi maith!", "meow~", etc.)
    drawSpeechBubble();

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
