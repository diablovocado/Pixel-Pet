'use strict';
/* ═══════════════════════════════════════════════════════════
   Pixel Deskpet — renderer.js
   States: idle · walk · sit · run · excited · sleep · wakeup · drag · pet
   Activity tracking: global cursor speed + powerMonitor idle via IPC
   ═══════════════════════════════════════════════════════════ */

// ─── Canvas Setup ──────────────────────────────────────────
const canvas   = document.getElementById('catCanvas');
const ctx      = canvas.getContext('2d');
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx    = fxCanvas.getContext('2d');
const bubble   = document.getElementById('bubble');

const SCALE = 6;          // screen pixels per "pixel-art pixel"
const GW    = 30;         // sprite grid width
const GH    = 22;         // sprite grid height
const CAT_W = GW * SCALE; // 180 px
const CAT_H = GH * SCALE; // 132 px

canvas.width  = CAT_W;
canvas.height = CAT_H;
ctx.imageSmoothingEnabled = false;

const SW = window.innerWidth;
const SH = window.innerHeight;

// fxCanvas covers the whole window for screen-space particles
fxCanvas.width  = SW;
fxCanvas.height = SH;
fxCtx.imageSmoothingEnabled = false;

// ─── Colour Palette ────────────────────────────────────────
const C = {
  K:  '#1d120c', // dark outline
  F:  '#e07830', // fur orange
  FD: '#b05018', // fur dark tabby
  FL: '#f4a868', // fur light highlight
  B:  '#fdf2e0', // belly cream
  PK: '#e07080', // pink (ears, nose, tongue)
  EY: '#3a7848', // iris green
  EW: '#ffffff', // eye shine
  ZZ: '#7090d8', // zzz blue
  HT: '#e83060', // heart red
  HI: '#ff6090', // heart inner highlight
};

// ─── Helpers ───────────────────────────────────────────────
const rand = (a, b) => a + Math.random() * (b - a);

/** Draw one pixel-art "texel" at grid position (x, y) of size (w × h). */
const px = (x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x * SCALE), Math.round(y * SCALE),
    Math.ceil(w  * SCALE), Math.ceil(h  * SCALE)
  );
};

// ─── Cat State ─────────────────────────────────────────────
const cat = {
  // Position in window client coords
  x: SW * 0.45,
  y: SH - CAT_H - 12,

  facing:  1,        // 1 = right, -1 = left
  action:  'idle',
  prevAction: 'idle',
  timer:   0,
  targetX: null,

  // Animation phase accumulators
  tail:   0,
  walk:   0,
  breath: 0,
  bounce: 0,

  // Blink
  blink:      false,
  blinkTimer: rand(3, 7),

  // Activity data from main process (via IPC)
  idleSeconds:  0,
  mouseSpeed:   0,
  likelyTyping: false,
  typingTimer:  0,    // ms remaining of "typing excited" period

  // Special timers
  petTimer:   0,
  sleepTimer: 0,
  zzzTimer:   0,
};

let dragging    = false;
let dragMoved   = false;
let dragOffX    = 0;
let dragOffY    = 0;
let mouseDownAt = null;
let ignoring    = true;
let lastCursor  = { x: SW / 2, y: SH - 80 };

const SLEEP_THRESH  = 35;    // seconds idle before sleeping
const RUN_THRESH    = 270;   // px/s mouse speed before running
const TYPING_WINDOW = 3500;  // ms cat stays excited after typing detected

// ─── Particle System ───────────────────────────────────────
const parts = [];

function spawnHearts(n = 5) {
  for (let i = 0; i < n; i++) {
    parts.push({
      type: 'heart',
      x:  cat.x + CAT_W * 0.65 + rand(-18, 18),
      y:  cat.y + CAT_H * 0.15,
      vx: rand(-0.65, 0.65),
      vy: rand(-1.3, -0.55),
      life: 1,
      decay: rand(0.003, 0.006),
      sz:   rand(5, 9),
    });
  }
}

function spawnZzz() {
  parts.push({
    type: 'zzz',
    x:  cat.x + CAT_W * 0.82,
    y:  cat.y + CAT_H * 0.08,
    vx: rand(0.08, 0.20),
    vy: -0.35,
    life: 1,
    decay: 0.0016,
    sz: rand(10, 15),
  });
}

function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const pt = parts[i];
    pt.x += pt.vx * dt * 0.055;
    pt.y += pt.vy * dt * 0.055;
    pt.life -= pt.decay * dt;
    if (pt.life <= 0) parts.splice(i, 1);
  }
}

function drawParts() {
  fxCtx.clearRect(0, 0, SW, SH);
  for (const pt of parts) {
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, pt.life);

    if (pt.type === 'heart') {
      drawPixelHeart(fxCtx, pt.x, pt.y, pt.sz);
    } else if (pt.type === 'zzz') {
      const fs = Math.round(pt.sz);
      fxCtx.font         = `bold ${fs}px monospace`;
      fxCtx.lineWidth    = 2.5;
      fxCtx.strokeStyle  = C.K;
      fxCtx.fillStyle    = C.ZZ;
      fxCtx.strokeText('z', pt.x, pt.y);
      fxCtx.fillText('z',   pt.x, pt.y);
    }

    fxCtx.restore();
  }
}

/** Pixel-art heart at (x, y) with size s in screen coords. */
function drawPixelHeart(c, x, y, s) {
  const u = s / 6;
  c.fillStyle = C.HT;
  // 7×6 pixel heart shape
  const shape = [
    [1,0],[2,0],[4,0],[5,0],
    [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],
    [2,4],[3,4],[4,4],
    [3,5],
  ];
  for (const [px_, py] of shape) {
    c.fillRect(x + (px_ - 3) * u, y + (py - 3) * u, u + 0.5, u + 0.5);
  }
  // Highlight on top-left bumps
  c.fillStyle = C.HI;
  c.fillRect(x + (1 - 3) * u, y + (0 - 3) * u, u * 0.5, u * 0.5);
  c.fillRect(x + (4 - 3) * u, y + (0 - 3) * u, u * 0.5, u * 0.5);
}

// ─── Eye Drawing ───────────────────────────────────────────
function drawEyes(hx, hy) {
  const eY  = hy + 2.4;
  const eL  = hx + 1.2;
  const eR  = hx + 5.0;
  const ew  = 2.2, eh = 1.8;
  const a   = cat.action;

  if (a === 'sleep') {
    // Sleeping — closed line
    px(eL, eY + 0.9, ew, 0.35, C.K);
    px(eR, eY + 0.9, ew, 0.35, C.K);

  } else if (a === 'wakeup') {
    // Half-open
    px(eL, eY + 0.55, ew, 0.7, C.EY);
    px(eL, eY + 0.7,  ew, 0.3, C.K);
    px(eR, eY + 0.55, ew, 0.7, C.EY);
    px(eR, eY + 0.7,  ew, 0.3, C.K);

  } else if (cat.blink) {
    // Blink squint
    px(eL, eY + 0.75, ew, 0.3, C.K);
    px(eR, eY + 0.75, ew, 0.3, C.K);

  } else if (a === 'drag') {
    // Wide surprise (O_O)
    px(eL - 0.3, eY - 0.3, ew + 0.6, eh + 0.7, C.EY);
    px(eL + 0.3, eY + 0.15, 1.5, 1.3, C.K);
    px(eL - 0.1, eY - 0.15, 0.6, 0.6, C.EW);
    px(eR - 0.3, eY - 0.3, ew + 0.6, eh + 0.7, C.EY);
    px(eR + 0.3, eY + 0.15, 1.5, 1.3, C.K);
    px(eR - 0.1, eY - 0.15, 0.6, 0.6, C.EW);

  } else if ((a === 'pet' || cat.petTimer > 0) && cat.petTimer > 300) {
    // Heart eyes ♥
    drawMiniHeart(eL - 0.2, eY - 0.2);
    drawMiniHeart(eR - 0.2, eY - 0.2);

  } else if (a === 'excited') {
    // Big sparkly happy eyes (^ω^)
    px(eL - 0.2, eY - 0.3, ew + 0.4, eh + 0.5, C.EY);
    px(eL + 0.5, eY + 0.25, 1.1, 1.0, C.K);
    px(eL - 0.05, eY - 0.2, 0.55, 0.5, C.EW);
    px(eR - 0.2, eY - 0.3, ew + 0.4, eh + 0.5, C.EY);
    px(eR + 0.5, eY + 0.25, 1.1, 1.0, C.K);
    px(eR - 0.05, eY - 0.2, 0.55, 0.5, C.EW);

  } else {
    // Normal — pupils track cursor left/right
    const shift = Math.max(-0.55, Math.min(0.55,
      (lastCursor.x - (cat.x + CAT_W / 2)) / 350));
    px(eL, eY, ew, eh, C.EY);
    px(eL + 0.5 + shift, eY + 0.3, 1.1, 1.0, C.K);
    px(eL - 0.1 + shift, eY + 0.05, 0.5, 0.45, C.EW);

    px(eR, eY, ew, eh, C.EY);
    px(eR + 0.5 + shift, eY + 0.3, 1.1, 1.0, C.K);
    px(eR - 0.1 + shift, eY + 0.05, 0.5, 0.45, C.EW);
  }
}

/** Tiny pixel heart for eye replacement (grid coords). */
function drawMiniHeart(gx, gy) {
  px(gx + 0.0, gy + 0.0, 0.8, 0.6, C.HT);
  px(gx + 1.1, gy + 0.0, 0.8, 0.6, C.HT);
  px(gx - 0.1, gy + 0.6, 2.2, 0.6, C.HT);
  px(gx + 0.2, gy + 1.2, 1.6, 0.6, C.HT);
  px(gx + 0.5, gy + 1.8, 1.0, 0.6, C.HT);
  px(gx + 0.8, gy + 2.4, 0.4, 0.5, C.HT);
}

// ─── Cat Sprite Draw ───────────────────────────────────────
function drawCat(t) {
  ctx.clearRect(0, 0, CAT_W, CAT_H);
  ctx.save();

  // Flip canvas for leftward facing
  if (cat.facing === -1) {
    ctx.translate(CAT_W, 0);
    ctx.scale(-1, 1);
  }

  const a       = cat.action;
  const sitting = a === 'sit' || a === 'sleep' || a === 'wakeup';
  const running = a === 'run';
  const walking = a === 'walk';
  const excited = a === 'excited';

  // Vertical bob
  let bob = 0;
  if (excited) {
    // Hop animation
    bob = -Math.abs(Math.sin(cat.bounce * Math.PI)) * 3.2;
  } else if (!sitting) {
    bob = Math.sin(cat.breath * Math.PI * 2) * 0.3;
  }

  // Phase updates
  cat.tail   += (excited ? 0.09 : 0.032);
  cat.breath += 0.00085;
  if (excited)          cat.bounce += 0.020;
  if (walking)          cat.walk   += 0.013;
  if (running)          cat.walk   += 0.022;

  const tailWag = Math.sin(cat.tail) * (sitting ? 1.3 : running ? 2.8 : 2.1);

  // Body base in grid coords
  const bx = 4, by = 10 + bob;

  // ══ TAIL ══════════════════════════════════════════
  if (sitting) {
    // Wrapped around front
    px(bx - 1, by + 3.5, 2,   2.0, C.K);
    px(bx,     by + 4.0, 1.2, 1.5, C.F);
    px(bx + 1, by + 5.0, 5,   1.3, C.FD);
    px(bx + 5, by + 5.0, 1.5, 1.3, C.FL);
  } else {
    px(bx - 2  + tailWag * 0.25, by + 3, 2.0, 1.0, C.K);
    px(bx - 3  + tailWag * 0.70, by + 2, 2.0, 2.0, C.F);
    px(bx - 4  + tailWag * 1.10, by + 1, 1.5, 2.0, C.FD);
    px(bx - 4.5 + tailWag * 1.3, by,     1.0, 1.0, C.FL);
  }

  // ══ BODY ══════════════════════════════════════════
  px(bx,       by,       13,   7.5, C.K);   // outline
  px(bx + 1,   by + 1,   11,   6.5, C.F);   // fur
  px(bx + 2.5, by + 3.5, 6.5,  3.0, C.B);   // belly patch
  // Tabby stripes
  px(bx + 2,   by + 1,   1.1, 3.0, C.FD);
  px(bx + 5,   by + 1,   1.1, 3.0, C.FD);
  px(bx + 8.2, by + 1,   1.1, 2.0, C.FD);

  // ══ LEGS ══════════════════════════════════════════
  if (sitting) {
    // Tucked paws
    px(bx + 1,   by + 8,   3.5, 1.8, C.K);
    px(bx + 7,   by + 8,   3.5, 1.8, C.K);
    px(bx + 1.5, by + 8.6, 2.2, 1.0, C.B);
    px(bx + 7.5, by + 8.6, 2.2, 1.0, C.B);
  } else {
    const spd  = running ? 2.7 : 1.7;
    const l1   = Math.sin(cat.walk           ) * spd;
    const l2   = Math.sin(cat.walk + Math.PI  ) * spd;
    const l3   = Math.sin(cat.walk + 0.45     ) * spd;
    const l4   = Math.sin(cat.walk + Math.PI + 0.45) * spd;
    px(bx + 1,    by + 7.8, 2.5, 2.0 + Math.max(0, l1), C.K);
    px(bx + 4.2,  by + 7.8, 2.5, 2.0 + Math.max(0, l2), C.K);
    px(bx + 7.5,  by + 7.8, 2.5, 2.0 + Math.max(0, l3), C.K);
    px(bx + 10.5, by + 7.8, 2.5, 2.0 + Math.max(0, l4), C.K);
  }

  // ══ HEAD ══════════════════════════════════════════
  const hx = bx + 9.5;
  const hy = by - 7.2 + bob;

  // Ears
  px(hx,       hy - 2.8, 2.2, 3.0, C.K);   // left ear outline
  px(hx + 0.4, hy - 2.2, 1.2, 2.0, C.PK);  // left ear inner
  px(hx + 5.6, hy - 2.8, 2.2, 3.0, C.K);   // right ear outline
  px(hx + 6.0, hy - 2.2, 1.2, 2.0, C.PK);  // right ear inner

  // Head block
  px(hx,     hy,     8.8, 7.8, C.K);
  px(hx + 1, hy + 1, 6.8, 6.8, C.F);

  // Forehead stripe
  px(hx + 3.4, hy + 1.0, 1.2, 2.8, C.FD);

  // Eyes
  drawEyes(hx, hy);

  // Nose
  px(hx + 3.4, hy + 4.7, 1.8, 0.9, C.PK);

  // Whiskers (faint)
  ctx.globalAlpha = 0.55;
  ctx.fillStyle   = C.K;
  // Left side
  ctx.fillRect((hx - 2.5) * SCALE, (hy + 5.0) * SCALE, 2.5 * SCALE, 0.2 * SCALE);
  ctx.fillRect((hx - 2.5) * SCALE, (hy + 5.7) * SCALE, 2.5 * SCALE, 0.2 * SCALE);
  // Right side
  ctx.fillRect((hx + 9.0) * SCALE, (hy + 5.0) * SCALE, 2.5 * SCALE, 0.2 * SCALE);
  ctx.fillRect((hx + 9.0) * SCALE, (hy + 5.7) * SCALE, 2.5 * SCALE, 0.2 * SCALE);
  ctx.globalAlpha = 1;

  // Mouth expression
  if (a === 'excited' || (cat.petTimer > 400 && a !== 'sleep')) {
    // Happy :3
    ctx.fillStyle = C.K;
    ctx.fillRect((hx + 2.6) * SCALE, (hy + 5.7) * SCALE, 0.45 * SCALE, 0.8 * SCALE);
    ctx.fillRect((hx + 5.4) * SCALE, (hy + 5.7) * SCALE, 0.45 * SCALE, 0.8 * SCALE);
    ctx.fillRect((hx + 3.0) * SCALE, (hy + 6.3) * SCALE, 2.4  * SCALE, 0.4 * SCALE);
  } else if (a === 'sleep') {
    // Neutral sleeping line
    px(hx + 2.8, hy + 5.8, 2.5, 0.3, C.K);
  }

  // Sleep Zzz overlay indicator on head (small)
  if (a === 'sleep' && Math.floor(t / 600) % 2 === 0) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle   = C.ZZ;
    ctx.font        = 'bold 9px monospace';
    ctx.fillText('z', (hx + 7) * SCALE, (hy - 0.5) * SCALE);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ─── State Machine ─────────────────────────────────────────
function nextAutoAction() {
  const r = Math.random();
  if (r < 0.45) return 'walk';
  if (r < 0.70) return 'sit';
  return 'idle';
}

const QUIPS_SIT      = ['...', 'mrrr', '(=^ω^=)', '  '];
const QUIPS_EXCITED  = ['!!', 'ooh~', '(owo)', 'mrrrow!', '*zoomies*'];
const QUIPS_PET      = ['purr~', 'mew!', 'nyaa~', '♥ mew ♥', '(≧∇≦)'];

function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

function enterAction(a) {
  cat.prevAction = cat.action;
  cat.action     = a;
  cat.timer      = 0;

  switch (a) {
    case 'idle':
      cat.timer = rand(2500, 7000);
      break;

    case 'walk':
      cat.targetX = rand(30, SW - CAT_W - 30);
      break;

    case 'sit':
      cat.timer = rand(3500, 9000);
      showBubble(pick(QUIPS_SIT), 1500);
      break;

    case 'run':
      cat.timer = 2200;
      break;

    case 'excited':
      cat.timer = 3200;
      showBubble(pick(QUIPS_EXCITED), 1800);
      spawnHearts(4);
      break;

    case 'sleep':
      cat.sleepTimer = 0;
      cat.zzzTimer   = 0;
      showBubble('zzz...', 2000);
      break;

    case 'wakeup':
      cat.timer = 900;
      showBubble('*yawn*', 1000);
      break;

    case 'drag':
      break;

    case 'pet':
      cat.petTimer = 1900;
      showBubble(pick(QUIPS_PET), 1700);
      spawnHearts(7);
      break;
  }
}

function updateBehavior(dt) {
  if (cat.action === 'drag') return;

  // Typing window decay
  if (cat.typingTimer > 0) cat.typingTimer -= dt;

  // Pet timer
  if (cat.petTimer > 0) {
    cat.petTimer -= dt;
    if (cat.petTimer <= 0 && cat.action === 'pet') enterAction('idle');
    return; // let pet animation play out
  }

  // ── Priority checks ──────────────────────────────
  // 1. Idle long enough → sleep
  if (cat.idleSeconds > SLEEP_THRESH &&
      cat.action !== 'sleep' && cat.action !== 'wakeup') {
    enterAction('sleep');
    return;
  }

  // 2. Woke up from sleep
  if (cat.action === 'sleep' && cat.idleSeconds < 2) {
    enterAction('wakeup');
    return;
  }

  // 3. Wakeup animation done
  if (cat.action === 'wakeup') {
    cat.timer -= dt;
    if (cat.timer <= 0) enterAction('idle');
    return;
  }

  // 4. Typing detected → excited
  if (cat.typingTimer > 0 &&
      cat.action !== 'excited' && cat.action !== 'sleep') {
    enterAction('excited');
    return;
  }

  // 5. Fast mouse → run
  if (cat.mouseSpeed > RUN_THRESH &&
      cat.action !== 'run' &&
      cat.action !== 'sleep' &&
      cat.action !== 'excited') {
    enterAction('run');
    return;
  }

  // ── Per-state updates ────────────────────────────
  switch (cat.action) {
    case 'idle':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction(nextAutoAction());
      break;

    case 'walk': {
      if (cat.targetX === null) { enterAction('idle'); break; }
      const dir  = cat.targetX > cat.x ? 1 : -1;
      cat.facing = dir;
      cat.x     += dir * 0.082 * dt;
      cat.x      = Math.max(0, Math.min(SW - CAT_W, cat.x));
      if (Math.abs(cat.x - cat.targetX) < 5)
        enterAction(Math.random() < 0.35 ? 'sit' : 'idle');
      break;
    }

    case 'sit':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction(nextAutoAction());
      break;

    case 'run': {
      // Sprint toward cursor
      const tx   = lastCursor.x - CAT_W * 0.5;
      const dir  = tx > cat.x ? 1 : -1;
      cat.facing = dir;
      const step = Math.min(0.26 * dt, Math.abs(tx - cat.x));
      cat.x     += dir * step;
      cat.x      = Math.max(0, Math.min(SW - CAT_W, cat.x));
      cat.timer -= dt;
      if (cat.mouseSpeed < RUN_THRESH * 0.42 && cat.timer <= 0)
        enterAction('idle');
      break;
    }

    case 'excited':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction('idle');
      break;

    case 'sleep':
      cat.sleepTimer += dt;
      cat.zzzTimer   += dt;
      if (cat.zzzTimer > 2300) {
        spawnZzz();
        cat.zzzTimer = 0;
      }
      break;
  }

  // ── Blinking (not while sleeping) ───────────────
  if (cat.action !== 'sleep') {
    cat.blinkTimer -= dt / 1000;
    if (cat.blinkTimer <= 0) {
      cat.blink      = !cat.blink;
      cat.blinkTimer = cat.blink ? 0.1 : rand(2.5, 6.5);
    }
  }

  // Keep horizontally in bounds
  cat.x = Math.max(0, Math.min(SW - CAT_W, cat.x));
}

// ─── Speech Bubble ─────────────────────────────────────────
let bubbleTO = null;
function showBubble(text, duration = 1600) {
  bubble.textContent = text;
  bubble.style.opacity = '1';
  clearTimeout(bubbleTO);
  bubbleTO = setTimeout(() => { bubble.style.opacity = '0'; }, duration);
}

function updateBubble() {
  bubble.style.left = `${cat.x + CAT_W * 0.5}px`;
  bubble.style.top  = `${cat.y - 40}px`;
}

// ─── Canvas Positioning ────────────────────────────────────
function positionCanvas() {
  canvas.style.left = `${Math.round(cat.x)}px`;
  canvas.style.top  = `${Math.round(cat.y)}px`;
}

// ─── Hit Testing ───────────────────────────────────────────
function isOnCat(mx, my) {
  const r = canvas.getBoundingClientRect();
  if (mx < r.left || mx > r.right || my < r.top || my > r.bottom) return false;
  const cx = Math.floor((mx - r.left) * (canvas.width  / r.width));
  const cy = Math.floor((my - r.top)  * (canvas.height / r.height));
  try {
    return ctx.getImageData(cx, cy, 1, 1).data[3] > 10;
  } catch {
    return true;
  }
}

// ─── IPC: Activity from Main Process ───────────────────────
window.deskpet.onActivityTick(({ cursorX, cursorY, mouseSpeed, idleSeconds, likelyTyping }) => {
  cat.idleSeconds  = idleSeconds;
  cat.mouseSpeed   = mouseSpeed;
  cat.likelyTyping = likelyTyping;

  // Extend typing excitement window
  if (likelyTyping) cat.typingTimer = TYPING_WINDOW;

  // Update cursor tracking from global coords (already converted in main.js)
  lastCursor.x = cursorX;
  lastCursor.y = cursorY;
});

// ─── Mouse Events ──────────────────────────────────────────
document.addEventListener('mousemove', e => {
  lastCursor.x = e.clientX;
  lastCursor.y = e.clientY;

  if (dragging) {
    cat.x = e.clientX - dragOffX;
    cat.y = e.clientY - dragOffY;
    cat.x = Math.max(0, Math.min(SW - CAT_W, cat.x));
    cat.y = Math.max(0, Math.min(SH - CAT_H, cat.y));
    if (mouseDownAt &&
        (Math.abs(e.clientX - mouseDownAt.x) > 5 ||
         Math.abs(e.clientY - mouseDownAt.y) > 5)) {
      dragMoved = true;
    }
    return;
  }

  const on = isOnCat(e.clientX, e.clientY);
  if (on === ignoring) {
    ignoring = !on;
    window.deskpet.setIgnoreMouseEvents(!on, { forward: true });
  }
});

document.addEventListener('mousedown', e => {
  if (!isOnCat(e.clientX, e.clientY)) return;
  dragging    = true;
  dragMoved   = false;
  mouseDownAt = { x: e.clientX, y: e.clientY };
  dragOffX    = e.clientX - cat.x;
  dragOffY    = e.clientY - cat.y;
  enterAction('drag');

  // Re-enable events while dragging
  ignoring = false;
  window.deskpet.setIgnoreMouseEvents(false, { forward: true });
});

document.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  if (!dragMoved) {
    // Quick tap = pet
    enterAction('pet');
  } else {
    enterAction('idle');
    cat.timer = rand(600, 1600);
  }
  // Return to transparent after a tick
  setTimeout(() => {
    if (!isOnCat(lastCursor.x, lastCursor.y)) {
      ignoring = true;
      window.deskpet.setIgnoreMouseEvents(true, { forward: true });
    }
  }, 80);
});

// ─── Main Loop ─────────────────────────────────────────────
let lastT = performance.now();
function loop(t) {
  const dt = Math.min(t - lastT, 80); // cap delta to avoid jumps on tab switch
  lastT = t;

  updateBehavior(dt);
  updateParts(dt);
  positionCanvas();
  drawCat(t);
  drawParts();
  updateBubble();

  requestAnimationFrame(loop);
}

// ─── Boot ──────────────────────────────────────────────────
window.deskpet.setIgnoreMouseEvents(true, { forward: true });
enterAction('idle');
requestAnimationFrame(loop);
