'use strict';
/* ═══════════════════════════════════════════════════════════
   Pixel Deskpet — renderer.js  v3
   TRUE pixel-art rendering:
     • SCALE=7 → 7×7 screen pixels per art pixel (chunky 8-bit look)
     • ALL coordinates snapped to integer grid before scaling
     • No sub-pixel / fractional positions anywhere
   3 colour variants: tabby · black · grey
   9 states: idle · walk · sit · run · excited · sleep · wakeup · drag · pet
   ═══════════════════════════════════════════════════════════ */

// ─── Canvas Setup ──────────────────────────────────────────
const canvas   = document.getElementById('catCanvas');
const ctx      = canvas.getContext('2d');
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx    = fxCanvas.getContext('2d');
const bubble   = document.getElementById('bubble');

// SCALE=7: each pixel-art "texel" = 7×7 screen pixels → authentic 8-bit crunch
const SCALE = 7;
const GW    = 24;   // grid width
const GH    = 20;   // grid height
const CAT_W = GW * SCALE;   // 168 px
const CAT_H = GH * SCALE;   // 140 px  (visible cat ~126 px tall ✓)

canvas.width  = CAT_W;
canvas.height = CAT_H;
ctx.imageSmoothingEnabled         = false;
ctx['webkitImageSmoothingEnabled']= false;

const SW = window.innerWidth;
const SH = window.innerHeight;

fxCanvas.width  = SW;
fxCanvas.height = SH;
fxCtx.imageSmoothingEnabled = false;

// ─── Sprite Layout (integer grid constants) ────────────────
//
//  Tail  │  Body (BX,BY)   │  Head (HX,HY) ─── Ears
//  ───── │ ─────────────── │ ──────────────────────
//  0 1 2 │ 5 6 7 8 9 10 ..│ 14 15 16 17 18 19 20 21 22
//
const BX = 5,  BY = 9;   // body top-left
const HX = 14, HY = 2;   // head top-left  (overlaps body right at col 14)

// ─── Colour Variants ───────────────────────────────────────
const VARIANTS = {
  tabby: {
    K:  '#1d120c',   // outline / black
    F:  '#e07830',   // main fur orange
    FD: '#a04c12',   // dark fur / tabby stripe
    FL: '#f2a05a',   // fur highlight
    B:  '#fdf0e0',   // belly cream
    N:  '#e07080',   // nose + ear-inner pink
    EY: '#3a7848',   // iris green
    EW: '#ffffff',   // eye shine
  },
  black: {
    K:  '#080808',
    F:  '#282828',
    FD: '#101010',
    FL: '#404040',
    B:  '#464646',
    N:  '#784858',
    EY: '#c8a010',   // amber / gold irises
    EW: '#ffe090',
  },
  grey: {
    K:  '#181818',
    F:  '#909090',
    FD: '#505050',
    FL: '#c0c0c0',
    B:  '#e8e8e8',
    N:  '#d07080',
    EY: '#3a7848',
    EW: '#ffffff',
  },
};

let P            = { ...VARIANTS.tabby };   // active palette
let activeVariant = 'tabby';

/** Switch the cat's colour variant. Call from console or tray menu. */
function setVariant(name) {
  if (!VARIANTS[name]) return;
  activeVariant = name;
  P = { ...VARIANTS[name] };
}
window.setCatVariant = setVariant;

// ─── Pixel-art Draw Primitive ──────────────────────────────
/**
 * Fill a rectangle defined in GRID units.
 * Coordinates are rounded to integer grid positions BEFORE multiplying
 * by SCALE, guaranteeing hard-edge, zero-anti-aliasing rendering.
 */
function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x) * SCALE,
    Math.round(y) * SCALE,
    Math.round(w) * SCALE,
    Math.round(h) * SCALE
  );
}

// ─── Helpers ───────────────────────────────────────────────
const rand    = (a, b) => a + Math.random() * (b - a);
const clamp   = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const iround  = v => Math.round(v);   // round to nearest integer

// ─── Cat State ─────────────────────────────────────────────
const cat = {
  x: SW * 0.45,
  y: SH - CAT_H - 12,
  facing:  1,        // 1=right, -1=left
  action:  'idle',
  prevAction: 'idle',
  timer:   0,
  targetX: null,

  // Phase accumulators (floating; rounded when used in px())
  tail:   0,
  walk:   0,
  breath: 0,
  bounce: 0,

  // Eye animation
  blinkFrame: 0,     // 0=open  1=half  2=closed
  blinkTimer: rand(3, 6),
  blinkStep:  0,

  // Activity (from main process via IPC)
  idleSeconds:  0,
  mouseSpeed:   0,
  likelyTyping: false,
  typingTimer:  0,

  // Timers
  petTimer:   0,
  sleepTimer: 0,
  zzzTimer:   0,
};

let dragging    = false, dragMoved = false;
let dragOffX    = 0,     dragOffY  = 0;
let mouseDownAt = null,  ignoring  = true;
let lastCursor  = { x: SW / 2, y: SH - 80 };

const SLEEP_THRESH  = 35;
const RUN_THRESH    = 270;
const TYPING_WINDOW = 3500;

// ─── Particles ─────────────────────────────────────────────
const parts = [];

function spawnHearts(n = 5) {
  for (let i = 0; i < n; i++) parts.push({
    type: 'heart',
    x:  cat.x + CAT_W * 0.65 + rand(-14, 14),
    y:  cat.y + CAT_H * 0.15,
    vx: rand(-0.7, 0.7), vy: rand(-1.3, -0.5),
    life: 1, decay: rand(0.003, 0.006), sz: rand(5, 9),
  });
}

function spawnZzz() {
  parts.push({
    type: 'zzz',
    x:  cat.x + CAT_W * 0.82,
    y:  cat.y + CAT_H * 0.06,
    vx: rand(0.08, 0.20), vy: -0.35,
    life: 1, decay: 0.0016, sz: rand(10, 14),
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

/** Render all active particles onto the full-screen fxCanvas. */
function drawParts() {
  fxCtx.clearRect(0, 0, SW, SH);
  for (const pt of parts) {
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, pt.life);
    if (pt.type === 'heart') {
      drawPixelHeart(fxCtx, pt.x, pt.y, pt.sz);
    } else {
      const fs = Math.round(pt.sz);
      fxCtx.font        = `bold ${fs}px monospace`;
      fxCtx.lineWidth   = 2.5;
      fxCtx.strokeStyle = P.K;
      fxCtx.fillStyle   = '#7090d8';
      fxCtx.strokeText('z', pt.x, pt.y);
      fxCtx.fillText  ('z', pt.x, pt.y);
    }
    fxCtx.restore();
  }
}

/** 7×6 grid pixel-art heart. */
function drawPixelHeart(c, x, y, s) {
  const u = s / 6;
  c.fillStyle = '#e83060';
  // Pixel-art heart shape (7 wide × 6 tall)
  const row = [
    [1,0],[2,0],[4,0],[5,0],
    [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],
    [2,4],[3,4],[4,4],
    [3,5],
  ];
  for (const [gx, gy] of row)
    c.fillRect(x + (gx - 3) * u, y + (gy - 3) * u, u + 0.5, u + 0.5);
  // Small shine pixels
  c.fillStyle = '#ff6090';
  c.fillRect(x + (1 - 3) * u, y + (0 - 3) * u, u * 0.5, u * 0.5);
  c.fillRect(x + (4 - 3) * u, y + (0 - 3) * u, u * 0.5, u * 0.5);
}

// ─── Eye States ────────────────────────────────────────────
/**
 * Pupil cursor-tracking: returns integer offset (−1, 0, or +1 grid unit).
 * Binary snapping = authentic pixel-art "looking" effect.
 */
function getPupilShift() {
  const center = cat.x + CAT_W / 2;
  const dx     = lastCursor.x - center;
  return dx > 90 ? 1 : (dx < -90 ? -1 : 0);
}

/** Draw the two eyes for a given action + bob offset. All integer coords. */
function drawEyes(hx, hy) {
  const a   = cat.action;
  // Left eye anchor (col, row in grid)
  const eL  = hx + 1;
  const eR  = hx + 5;
  const eY  = hy + 2;

  if (a === 'sleep') {
    // Closed: thin horizontal line
    px(eL, eY + 1, 2, 1, P.K);
    px(eR, eY + 1, 2, 1, P.K);

  } else if (a === 'wakeup') {
    // Half-open: 2×1 iris at bottom of eye slot
    px(eL, eY + 1, 2, 1, P.EY);
    px(eR, eY + 1, 2, 1, P.EY);

  } else if (cat.blinkFrame === 2) {
    // Fully closed blink
    px(eL, eY + 1, 2, 1, P.K);
    px(eR, eY + 1, 2, 1, P.K);

  } else if (cat.blinkFrame === 1) {
    // Half-blink
    px(eL, eY,     2, 1, P.EY);
    px(eL, eY + 1, 2, 1, P.K);
    px(eR, eY,     2, 1, P.EY);
    px(eR, eY + 1, 2, 1, P.K);

  } else if (a === 'drag') {
    // Surprised: wide 3×3 circles (O_O)
    px(eL - 1, eY - 1, 4, 4, P.EY);
    px(eL,     eY,     2, 2, P.K);
    px(eL - 1, eY - 1, 1, 1, P.EW);
    px(eR - 1, eY - 1, 4, 4, P.EY);
    px(eR,     eY,     2, 2, P.K);
    px(eR - 1, eY - 1, 1, 1, P.EW);

  } else if ((a === 'pet' || cat.petTimer > 400)) {
    // Heart eyes ♥
    drawMiniHeart(eL, eY - 1);
    drawMiniHeart(eR, eY - 1);

  } else if (a === 'excited') {
    // Big sparkly eyes (^ω^)
    px(eL, eY,     3, 2, P.EY);
    px(eL + 1, eY + 1, 1, 1, P.K);
    px(eL,     eY,     1, 1, P.EW);
    px(eR, eY,     3, 2, P.EY);
    px(eR + 1, eY + 1, 1, 1, P.K);
    px(eR,     eY,     1, 1, P.EW);

  } else {
    // Normal eyes with BINARY pupil tracking (−1 / 0 / +1)
    const s = getPupilShift();
    px(eL, eY, 2, 2, P.EY);
    px(eL + 1 + s, eY + 1, 1, 1, P.K);
    px(eL,         eY,     1, 1, P.EW);
    px(eR, eY, 2, 2, P.EY);
    px(eR + 1 + s, eY + 1, 1, 1, P.K);
    px(eR,         eY,     1, 1, P.EW);
  }
}

/** 4×5 pixel heart used inside eye socket. */
function drawMiniHeart(gx, gy) {
  // A tiny 4×4 pixel heart
  px(gx,     gy,     1, 1, P.N);
  px(gx + 2, gy,     1, 1, P.N);
  px(gx - 1, gy + 1, 4, 1, P.N); // actually, let me use heart red
  px(gx,     gy + 2, 2, 1, P.N);
  px(gx + 1, gy + 3, 1, 1, P.N);
  // Override with actual heart color
  const HR = '#e83060';
  px(gx,     gy,     1, 1, HR);
  px(gx + 2, gy,     1, 1, HR);
  px(gx - 1, gy + 1, 4, 1, HR);
  px(gx,     gy + 2, 2, 1, HR);
  px(gx + 1, gy + 3, 1, 1, HR);
}

// ─── Cat Sprite ────────────────────────────────────────────
/**
 * Draw the complete cat sprite.
 * bob:    integer vertical offset in grid units (breathing/bounce)
 * action: current animation state
 */
function drawCat(timestamp) {
  ctx.clearRect(0, 0, CAT_W, CAT_H);
  ctx.save();

  // Flip canvas for leftward-facing
  if (cat.facing === -1) {
    ctx.translate(CAT_W, 0);
    ctx.scale(-1, 1);
  }

  const a       = cat.action;
  const sitting = a === 'sit' || a === 'sleep' || a === 'wakeup';
  const running  = a === 'run';
  const walking  = a === 'walk';
  const excited  = a === 'excited';
  const sleeping = a === 'sleep';

  // ── VERTICAL BOB (rounded to integer grid unit) ───────────
  let bob = 0;
  if (excited) {
    // Hop: moves up by up to −2 grid units
    cat.bounce += 0.020;
    bob = iround(-Math.abs(Math.sin(cat.bounce * Math.PI)) * 2);
  } else if (!sitting) {
    // Gentle breathing: stays at 0 or −1
    cat.breath += 0.0008;
    bob = iround(Math.sin(cat.breath * Math.PI * 2) * 0.4);
  }

  // ── TAIL PHASE ────────────────────────────────────────────
  cat.tail += excited ? 0.09 : (sleeping ? 0.01 : 0.035);
  // Integer wag: −2 to +2 grid units
  const tw = iround(Math.sin(cat.tail) * (sitting ? 1 : running ? 3 : 2));

  // Offsets (all integer)
  const bx = BX, by = BY + bob;
  const hx = HX, hy = HY + bob;

  // ═══════════════════════════════════════
  //   TAIL
  // ═══════════════════════════════════════
  if (sitting) {
    // Tail wraps around to front-bottom of body
    px(bx,     by + 6, 2, 1, P.K);
    px(bx + 1, by + 7, 3, 1, P.FD);
    px(bx + 2, by + 8, 2, 1, P.FL);
  } else {
    // Flowing tail behind body (to the left when facing right)
    px(bx - 1, by + 4,      2, 1, P.K);
    px(bx - 2, by + 3 + tw, 2, 2, P.F);
    px(bx - 3, by + 2 + tw, 1, 2, P.FD);
    px(bx - 3, by + 1 + tw, 1, 1, P.FL);
  }

  // ═══════════════════════════════════════
  //   BODY
  // ═══════════════════════════════════════
  // Outline block
  px(bx,     by,     10, 8, P.K);
  // Main fur
  px(bx + 1, by + 1, 8,  7, P.F);
  // Belly patch
  px(bx + 3, by + 3, 4,  4, P.B);

  // Tabby stripes (tabby + grey variants only)
  if (activeVariant !== 'black') {
    px(bx + 2, by + 1, 1, 5, P.FD);   // left stripe
    px(bx + 6, by + 1, 1, 4, P.FD);   // center stripe
    px(bx + 8, by + 1, 1, 3, P.FD);   // right stripe
  } else {
    // Black cat: subtle sheen highlight
    px(bx + 3, by + 2, 3, 1, P.FL);
  }

  // ═══════════════════════════════════════
  //   LEGS
  // ═══════════════════════════════════════
  if (sitting) {
    // Tucked paws — two rectangular stubs
    px(bx + 1, by + 8, 3, 2, P.K);
    px(bx + 5, by + 8, 3, 2, P.K);
    px(bx + 2, by + 9, 1, 1, P.B);    // paw highlight
    px(bx + 6, by + 9, 1, 1, P.B);
  } else {
    // Animated walk/run cycle — 4 legs, offset phases
    const spd = running ? 0.025 : (walking ? 0.014 : 0.005);
    cat.walk += spd;
    // Each leg gets an integer offset (0 to +3 or 0)
    const l1 = iround(Math.sin(cat.walk             ) * (running ? 3 : 2));
    const l2 = iround(Math.sin(cat.walk + Math.PI   ) * (running ? 3 : 2));
    const l3 = iround(Math.sin(cat.walk + 0.5       ) * (running ? 3 : 2));
    const l4 = iround(Math.sin(cat.walk + Math.PI+0.5)* (running ? 3 : 2));
    const h1 = 2 + Math.max(0, l1);
    const h2 = 2 + Math.max(0, l2);
    const h3 = 2 + Math.max(0, l3);
    const h4 = 2 + Math.max(0, l4);
    px(bx + 1, by + 8, 2, h1, P.K);
    px(bx + 3, by + 8, 2, h2, P.K);
    px(bx + 6, by + 8, 2, h3, P.K);
    px(bx + 8, by + 8, 2, h4, P.K);
  }

  // ═══════════════════════════════════════
  //   HEAD
  // ═══════════════════════════════════════
  // Left ear
  px(hx,     hy - 2, 2, 3, P.K);    // ear outline
  px(hx + 1, hy - 1, 1, 2, P.N);   // ear inner pink

  // Right ear
  px(hx + 6, hy - 2, 2, 3, P.K);
  px(hx + 7, hy - 1, 1, 2, P.N);

  // Head block (9 wide × 8 tall)
  px(hx,     hy,     9, 8, P.K);   // outline
  px(hx + 1, hy + 1, 7, 7, P.F);  // fur fill

  // Forehead stripe (only tabby/grey)
  if (activeVariant !== 'black') {
    px(hx + 3, hy + 1, 1, 3, P.FD);
  } else {
    // Black: tiny gloss mark
    px(hx + 3, hy + 1, 2, 1, P.FL);
  }

  // Eyes
  drawEyes(hx, hy);

  // Nose (2×1 pixel block)
  px(hx + 3, hy + 5, 2, 1, P.N);

  // Whiskers — ultra-thin (ctx direct, not px(), so they're 1px lines)
  if (a !== 'sleep' && a !== 'wakeup') {
    ctx.fillStyle   = P.K;
    ctx.globalAlpha = 0.50;
    // Left whiskers
    ctx.fillRect((hx - 2) * SCALE, (hy + 5) * SCALE, 2 * SCALE, 1);
    ctx.fillRect((hx - 2) * SCALE, (hy + 6) * SCALE, 2 * SCALE, 1);
    // Right whiskers
    ctx.fillRect((hx + 9) * SCALE, (hy + 5) * SCALE, 2 * SCALE, 1);
    ctx.fillRect((hx + 9) * SCALE, (hy + 6) * SCALE, 2 * SCALE, 1);
    ctx.globalAlpha = 1;
  }

  // Mouth expression
  if (a === 'excited' || (cat.petTimer > 500)) {
    // Happy :3 — two small vertical dashes + horizontal join
    ctx.fillStyle = P.K;
    ctx.fillRect((hx + 2) * SCALE, (hy + 6) * SCALE, SCALE, SCALE);
    ctx.fillRect((hx + 5) * SCALE, (hy + 6) * SCALE, SCALE, SCALE);
    ctx.fillRect((hx + 3) * SCALE, (hy + 7) * SCALE, 2 * SCALE, SCALE);
  } else if (a === 'sleep') {
    // Sleeping pout
    px(hx + 3, hy + 6, 2, 1, P.K);
  }

  ctx.restore();
}

// ─── Blink Animation ───────────────────────────────────────
// 3-frame blink: open → half → closed → half → open
const BLINK_SEQ   = [0, 1, 2, 1, 0];   // blinkFrame values
const BLINK_TIMES = [0.08, 0.08, 0.10, 0.08]; // seconds each frame lasts

function updateBlink(dt) {
  if (cat.action === 'sleep') { cat.blinkFrame = 2; return; }
  if (cat.action === 'drag')  { cat.blinkFrame = 0; return; }

  cat.blinkTimer -= dt / 1000;
  if (cat.blinkTimer <= 0) {
    cat.blinkStep = (cat.blinkStep + 1) % BLINK_SEQ.length;
    cat.blinkFrame = BLINK_SEQ[cat.blinkStep];
    if (cat.blinkStep === 0) {
      // Full cycle done → wait random interval before next blink
      cat.blinkTimer = rand(2.5, 6.5);
    } else {
      cat.blinkTimer = BLINK_TIMES[cat.blinkStep - 1] || 0.08;
    }
  }
}

// ─── State Machine ─────────────────────────────────────────
function nextAutoAction() {
  const r = Math.random();
  if (r < 0.45) return 'walk';
  if (r < 0.70) return 'sit';
  return 'idle';
}

const QUIPS = {
  sit:     ['...', 'mrrr', '(=^ω^=)', '  '],
  excited: ['!!', 'ooh~', '(owo)', 'mrrrow!', '*zoomies*'],
  pet:     ['purr~', 'mew!', 'nyaa~', '♥ mew ♥', '(≧∇≦)'],
};
function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

function enterAction(a) {
  cat.prevAction = cat.action;
  cat.action     = a;
  cat.timer      = 0;

  switch (a) {
    case 'idle':    cat.timer = rand(2500, 7000); break;
    case 'walk':    cat.targetX = rand(30, SW - CAT_W - 30); break;
    case 'sit':
      cat.timer = rand(3500, 9000);
      showBubble(pick(QUIPS.sit), 1400);
      break;
    case 'run':     cat.timer = 2200; break;
    case 'excited':
      cat.timer = 3200;
      cat.bounce = 0;
      showBubble(pick(QUIPS.excited), 1800);
      spawnHearts(4);
      break;
    case 'sleep':
      cat.sleepTimer = 0;
      cat.zzzTimer   = 0;
      showBubble('zzz...', 2200);
      break;
    case 'wakeup':
      cat.timer = 900;
      showBubble('*yawn*', 900);
      break;
    case 'drag': break;
    case 'pet':
      cat.petTimer = 1900;
      showBubble(pick(QUIPS.pet), 1700);
      spawnHearts(8);
      break;
  }
}

function updateBehavior(dt) {
  if (cat.action === 'drag') return;

  if (cat.typingTimer > 0) cat.typingTimer -= dt;
  if (cat.petTimer > 0) {
    cat.petTimer -= dt;
    if (cat.petTimer <= 0 && cat.action === 'pet') enterAction('idle');
    return;
  }

  // Priority 1: idle long enough → sleep
  if (cat.idleSeconds > SLEEP_THRESH && cat.action !== 'sleep' && cat.action !== 'wakeup') {
    enterAction('sleep'); return;
  }
  // Priority 2: activity resumed from sleep → wakeup
  if (cat.action === 'sleep' && cat.idleSeconds < 2) {
    enterAction('wakeup'); return;
  }
  // Priority 3: wakeup animation done
  if (cat.action === 'wakeup') {
    cat.timer -= dt;
    if (cat.timer <= 0) enterAction('idle');
    return;
  }
  // Priority 4: typing → excited
  if (cat.typingTimer > 0 && cat.action !== 'excited' && cat.action !== 'sleep') {
    enterAction('excited'); return;
  }
  // Priority 5: fast mouse → run
  if (cat.mouseSpeed > RUN_THRESH && cat.action !== 'run' &&
      cat.action !== 'sleep' && cat.action !== 'excited') {
    enterAction('run'); return;
  }

  switch (cat.action) {
    case 'idle':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction(nextAutoAction());
      break;

    case 'walk': {
      if (!cat.targetX) { enterAction('idle'); break; }
      const dir  = cat.targetX > cat.x ? 1 : -1;
      cat.facing = dir;
      cat.x += dir * 0.082 * dt;
      cat.x  = clamp(cat.x, 0, SW - CAT_W);
      if (Math.abs(cat.x - cat.targetX) < 5)
        enterAction(Math.random() < 0.35 ? 'sit' : 'idle');
      break;
    }

    case 'sit':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction(nextAutoAction());
      break;

    case 'run': {
      const tx   = lastCursor.x - CAT_W * 0.5;
      const dir  = tx > cat.x ? 1 : -1;
      cat.facing = dir;
      cat.x += dir * Math.min(0.26 * dt, Math.abs(tx - cat.x));
      cat.x  = clamp(cat.x, 0, SW - CAT_W);
      cat.timer -= dt;
      if (cat.mouseSpeed < RUN_THRESH * 0.42 && cat.timer <= 0) enterAction('idle');
      break;
    }

    case 'excited':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction('idle');
      break;

    case 'sleep':
      cat.sleepTimer += dt;
      cat.zzzTimer   += dt;
      if (cat.zzzTimer > 2400) { spawnZzz(); cat.zzzTimer = 0; }
      break;
  }

  updateBlink(dt);
  cat.x = clamp(cat.x, 0, SW - CAT_W);
}

// ─── Speech Bubble ─────────────────────────────────────────
let bubbleTO = null;
function showBubble(text, duration = 1600) {
  bubble.textContent  = text;
  bubble.style.opacity = '1';
  clearTimeout(bubbleTO);
  bubbleTO = setTimeout(() => { bubble.style.opacity = '0'; }, duration);
}

function updateBubble() {
  bubble.style.left = `${cat.x + CAT_W * 0.5}px`;
  bubble.style.top  = `${cat.y - 42}px`;
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
  try { return ctx.getImageData(cx, cy, 1, 1).data[3] > 10; }
  catch { return true; }
}

// ─── IPC: Activity from Main Process ───────────────────────
window.deskpet.onActivityTick(({ cursorX, cursorY, mouseSpeed, idleSeconds, likelyTyping }) => {
  cat.idleSeconds  = idleSeconds;
  cat.mouseSpeed   = mouseSpeed;
  cat.likelyTyping = likelyTyping;
  if (likelyTyping) cat.typingTimer = TYPING_WINDOW;
  lastCursor.x = cursorX;
  lastCursor.y = cursorY;
});

window.deskpet.onSetVariant?.((variant) => {
  setVariant(variant);
});

// ─── Mouse Events ──────────────────────────────────────────
document.addEventListener('mousemove', e => {
  lastCursor.x = e.clientX;
  lastCursor.y = e.clientY;

  if (dragging) {
    cat.x = e.clientX - dragOffX;
    cat.y = e.clientY - dragOffY;
    cat.x = clamp(cat.x, 0, SW - CAT_W);
    cat.y = clamp(cat.y, 0, SH - CAT_H);
    if (mouseDownAt &&
        (Math.abs(e.clientX - mouseDownAt.x) > 5 ||
         Math.abs(e.clientY - mouseDownAt.y) > 5)) dragMoved = true;
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
  ignoring = false;
  window.deskpet.setIgnoreMouseEvents(false, { forward: true });
});

document.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  if (!dragMoved) {
    enterAction('pet');
  } else {
    enterAction('idle');
    cat.timer = rand(600, 1600);
  }
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
  const dt = Math.min(t - lastT, 80);
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
