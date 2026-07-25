'use strict';
/**
 * sprite.js — Core cat sprite drawing
 * Draws the complete cat sprite for any action state.
 * Uses pepperino_cropped.png as the base, with Canvas overlays for all expressions.
 * Palette is read from window.P (set by variants.js).
 *
 * Coordinate system:
 *   - Each "grid unit" = SCALE screen pixels
 *   - All coordinates are snapped to integer grid before scaling → true pixel-art look
 */

/* global SCALE, GW, GH, CAT_W, CAT_H, P */

const SCALE = 7;
const GW    = 24;
const GH    = 20;
const CAT_W = GW * SCALE;   // 168px
const CAT_H = GH * SCALE;   // 140px

// Expose for other modules
window.SCALE = SCALE;
window.GW    = GW;
window.GH    = GH;
window.CAT_W = CAT_W;
window.CAT_H = CAT_H;

// Canvas references (set during init)
let ctx;
let pepImg;

// Walk / kneading paw phase
let _pawPhase = 0;

// ─── Pixel-art primitive ─────────────────────────────────────
function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x) * SCALE,
    Math.round(y) * SCALE,
    Math.round(w) * SCALE,
    Math.round(h) * SCALE,
  );
}

// ─── Helpers ─────────────────────────────────────────────────
const iround = v => Math.round(v);

// ─── Eye helpers ─────────────────────────────────────────────
function getPupilShift(cat, lastCursor) {
  const center = cat.x + CAT_W / 2;
  const dx     = lastCursor.x - center;
  return dx > 90 ? 1 : (dx < -90 ? -1 : 0);
}

function drawMiniHeart(gx, gy) {
  const HR = '#e83060';
  px(gx,     gy,     1, 1, HR);
  px(gx + 2, gy,     1, 1, HR);
  px(gx - 1, gy + 1, 4, 1, HR);
  px(gx,     gy + 2, 2, 1, HR);
  px(gx + 1, gy + 3, 1, 1, HR);
}

function drawEyes(cat, lastCursor) {
  const P  = window.P;
  const a  = cat.action;
  const hx = 2;  // head offset in canvas (left-right: 1 grid + facing)
  const hy = 2;
  const eL = hx + 1;
  const eR = hx + 5;
  const eY = hy + 2;

  if (a === 'sleep') {
    px(eL, eY + 1, 2, 1, P.K);
    px(eR, eY + 1, 2, 1, P.K);

  } else if (a === 'wakeup') {
    px(eL, eY + 1, 2, 1, P.EY);
    px(eR, eY + 1, 2, 1, P.EY);

  } else if (cat.blinkFrame === 2) {
    px(eL, eY + 1, 2, 1, P.K);
    px(eR, eY + 1, 2, 1, P.K);

  } else if (cat.blinkFrame === 1) {
    px(eL, eY,     2, 1, P.EY);
    px(eL, eY + 1, 2, 1, P.K);
    px(eR, eY,     2, 1, P.EY);
    px(eR, eY + 1, 2, 1, P.K);

  } else if (a === 'drag') {
    // Surprised O_O
    px(eL-1, eY-1, 4, 4, P.EY);  px(eL, eY, 2, 2, P.K);  px(eL-1, eY-1, 1, 1, P.EW);
    px(eR-1, eY-1, 4, 4, P.EY);  px(eR, eY, 2, 2, P.K);  px(eR-1, eY-1, 1, 1, P.EW);

  } else if (a === 'pet' || a === 'purr' || cat.petTimer > 400) {
    drawMiniHeart(eL, eY - 1);
    drawMiniHeart(eR, eY - 1);

  } else if (a === 'agent-thinking') {
    // Spiral/confused eyes ⊙
    px(eL,   eY,   3, 3, P.EY);
    px(eL+1, eY+1, 1, 1, P.K);
    px(eL,   eY,   1, 1, P.EW);
    px(eL+2, eY,   1, 1, P.K);  // extra corner = spiral hint
    px(eR,   eY,   3, 3, P.EY);
    px(eR+1, eY+1, 1, 1, P.K);
    px(eR,   eY,   1, 1, P.EW);
    px(eR+2, eY,   1, 1, P.K);

  } else if (cat.typingIsFast || (cat.isTypingMode && cat.typingCPS >= 5)) {
    // Determined ò_ó
    px(eL, eY,     2, 2, P.EY);  px(eL+1, eY+1, 1, 1, P.K);
    px(eL, eY - 1, 3, 1, P.K);  // angled brow
    px(eR, eY,     2, 2, P.EY);  px(eR, eY+1, 1, 1, P.K);
    px(eR - 1, eY - 1, 3, 1, P.K);

  } else if (a === 'excited' || a === 'agent-done') {
    // ^ω^
    px(eL, eY, 3, 2, P.EY);   px(eL+1, eY+1, 1, 1, P.K);  px(eL, eY, 1, 1, P.EW);
    px(eR, eY, 3, 2, P.EY);   px(eR+1, eY+1, 1, 1, P.K);  px(eR, eY, 1, 1, P.EW);

  } else {
    // Normal + binary pupil tracking
    const s = getPupilShift(cat, lastCursor);
    px(eL, eY, 2, 2, P.EY);   px(eL+1+s, eY+1, 1, 1, P.K);  px(eL, eY, 1, 1, P.EW);
    px(eR, eY, 2, 2, P.EY);   px(eR+1+s, eY+1, 1, 1, P.K);  px(eR, eY, 1, 1, P.EW);
  }
}

// ─── Paper scroll drawing ─────────────────────────────────────
function drawPaperScroll(cat, unroll) {
  if (unroll <= 0) return;
  const P  = window.P;
  const sw = Math.round(unroll * 6);  // scroll width 0→6 grid units
  const sh = 4;

  // Scroll body (to the left of the cat)
  const sx = -1;
  const sy = GH - 7;
  px(sx, sy, sw, sh, '#fdf6ec');
  px(sx, sy, sw, 1, P.K);         // top line
  px(sx, sy + sh - 1, sw, 1, P.K); // bottom line
  if (sw > 1) {
    px(sx + sw - 1, sy, 1, sh, P.K); // right edge
    // scroll lines (text lines on paper)
    if (sw > 2) { px(sx + 1, sy + 1, sw - 2, 1, '#c8b8a0'); }
    if (sw > 3) { px(sx + 1, sy + 2, sw - 3, 1, '#c8b8a0'); }
  }
  // Roll handle (left end)
  px(sx - 1, sy - 1, 2, sh + 2, P.FD);
}

// ─── Paw kneading animation ───────────────────────────────────
function drawKneadingPaws(pX, pY) {
  const P = window.P;
  _pawPhase += 0.012;
  const t = Math.sin(_pawPhase * Math.PI * 2);

  // Left paw raises when t > 0, right paw when t < 0
  const liftL = t > 0 ? Math.round(t * 2) : 0;
  const liftR = t < 0 ? Math.round(-t * 2) : 0;

  // Left paw
  ctx.fillStyle = P.F;
  ctx.fillRect(pX + 28,        pY + 90 - liftL * SCALE, 14, 10);
  ctx.fillStyle = P.N;
  ctx.fillRect(pX + 30,        pY + 93 - liftL * SCALE, 4, 4);

  // Right paw
  ctx.fillStyle = P.F;
  ctx.fillRect(pX + 80,        pY + 90 - liftR * SCALE, 14, 10);
  ctx.fillStyle = P.N;
  ctx.fillRect(pX + 82,        pY + 93 - liftR * SCALE, 4, 4);
}

// ─── Typing Keypad State & Event Listener ───────────────────────
let leftKeyPressed = false;
let rightKeyPressed = false;
let activeKey = 'left'; // Toggle between 'left' and 'right'
let keyPressTimeout = null;

function handleKeystroke() {
  if (window.CAT_STATE) {
    window.CAT_STATE.isTypingMode = true;
    window.CAT_STATE.typingTimer = 1800;
  }

  // 1. Instantly switch sides on every single key press
  activeKey = (activeKey === 'left') ? 'right' : 'left';

  // 2. Set active depressed key
  if (activeKey === 'left') {
    leftKeyPressed = true;
    rightKeyPressed = false;
  } else {
    leftKeyPressed = false;
    rightKeyPressed = true;
  }

  // 3. Reset paw/keycap back to rest state after 120ms
  if (keyPressTimeout) clearTimeout(keyPressTimeout);
  keyPressTimeout = setTimeout(() => {
    leftKeyPressed = false;
    rightKeyPressed = false;
  }, 120);
}

// Listen to single keystrokes from IPC contextBridge AND window keydown fallback
if (typeof window !== 'undefined') {
  const initKeystrokeListeners = () => {
    const api = window.catAPI || window.deskpet;
    if (api && api.onKeystroke) {
      api.onKeystroke(handleKeystroke);
    }
    if (api && api.onTypingUpdate) {
      api.onTypingUpdate((d) => {
        if (d && d.isTyping) handleKeystroke();
      });
    }
    window.addEventListener('keydown', handleKeystroke);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeystrokeListeners);
  } else {
    initKeystrokeListeners();
  }
}

function drawTypingKeypad(ctx, catX, catY) {
  // Key Dimensions
  const keyWidth = 24;
  const keyHeight = 16;
  
  const leftKeyX = catX - 12;
  const rightKeyX = catX + 14;
  const baseY = catY + 28;

  // Key Y-offsets (pressed state shifts down by 4px)
  const leftOffsetY = leftKeyPressed ? 4 : 0;
  const rightOffsetY = rightKeyPressed ? 4 : 0;

  // --- DRAW LEFT KEYCAP ---
  // Key base / shadow
  ctx.fillStyle = '#6e6e78';
  ctx.fillRect(leftKeyX, baseY + 6, keyWidth, keyHeight);
  // Key top cap
  ctx.fillStyle = leftKeyPressed ? '#a0a0aa' : '#e0e0e8';
  ctx.fillRect(leftKeyX, baseY + leftOffsetY, keyWidth, keyHeight - 2);

  // --- DRAW RIGHT KEYCAP ---
  // Key base / shadow
  ctx.fillStyle = '#6e6e78';
  ctx.fillRect(rightKeyX, baseY + 6, keyWidth, keyHeight);
  // Key top cap
  ctx.fillStyle = rightKeyPressed ? '#a0a0aa' : '#e0e0e8';
  ctx.fillRect(rightKeyX, baseY + rightOffsetY, keyWidth, keyHeight - 2);
}

function renderCatPaws(ctx, catX, catY, state) {
  if (state === 'TYPING') {
    const pawWidth = 8;
    const pawHeight = 8;

    // Left paw follows left key offset
    const leftPawY = catY + 22 + (leftKeyPressed ? 4 : 0);
    // Right paw follows right key offset
    const rightPawY = catY + 22 + (rightKeyPressed ? 4 : 0);

    ctx.fillStyle = '#ffffff'; // White paw color
    ctx.fillRect(catX - 6, leftPawY, pawWidth, pawHeight);
    ctx.fillRect(catX + 18, rightPawY, pawWidth, pawHeight);
  }
}

// ─── Main draw function ───────────────────────────────────────
function drawCat(cat, lastCursor) {
  const canvas = window._catCanvas;
  if (!canvas) return;
  ctx = window._ctx;

  ctx.clearRect(0, 0, CAT_W, CAT_H);
  ctx.save();

  // Handle stretch reminder scale
  const scale = cat.stretchScale || 1;
  if (scale !== 1) {
    ctx.translate(CAT_W / 2, CAT_H);
    ctx.scale(scale, scale);
    ctx.translate(-CAT_W / 2, -CAT_H);
  }

  // Mochi drag squash/stretch via canvas scaleX/scaleY transforms
  const sx = cat.dragStretchX || 1;
  const sy = cat.dragStretchY || 1;
  if (sx !== 1 || sy !== 1) {
    ctx.translate(CAT_W / 2, CAT_H);
    ctx.scale(sx, sy);
    ctx.translate(-CAT_W / 2, -CAT_H);
  }

  // Flip for left-facing
  if (cat.facing === -1) {
    ctx.translate(CAT_W, 0);
    ctx.scale(-1, 1);
  }

  const a       = cat.action;
  const sitting = a === 'sit' || a === 'sleep' || a === 'wakeup' || a === 'scroll' || a === 'purr';
  const running  = a === 'run' || a === 'hunt';
  const walking  = a === 'walk';
  const excited  = a === 'excited' || a === 'agent-done';

  // Vertical bob
  let bob = 0;
  if (excited) {
    cat.bounce += 0.020;
    bob = iround(-Math.abs(Math.sin(cat.bounce * Math.PI)) * 2);
  } else if (!sitting) {
    cat.breath += 0.0008;
    bob = iround(Math.sin(cat.breath * Math.PI * 2) * 0.4);
  }

  // ── Draw base sprite image ──
  if (pepImg && pepImg.complete && pepImg.naturalWidth > 0) {
    const pW = 126, pH = 128;
    const pX = (CAT_W - pW) / 2;
    const pY = (CAT_H - pH) / 2 + bob * SCALE * 0.4;

    ctx.save();
    if (walking || running) {
      cat.walk += (running ? 0.025 : 0.014);
      const tilt = Math.sin(cat.walk * Math.PI * 2) * 0.08;
      ctx.translate(pX + pW/2, pY + pH/2);
      ctx.rotate(tilt);
      ctx.drawImage(pepImg, -pW/2, -pH/2, pW, pH);
    } else {
      ctx.drawImage(pepImg, pX, pY, pW, pH);
    }
    ctx.restore();

    // ── Expression overlays ──
    if (a === 'sleep') {
      ctx.fillStyle = '#141414';
      ctx.fillRect(pX + 42, pY + 44, 12, 3);
      ctx.fillRect(pX + 72, pY + 44, 12, 3);
    } else if (a === 'drag') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pX + 40, pY + 38, 16, 16);
      ctx.fillRect(pX + 70, pY + 38, 16, 16);
      ctx.fillStyle = '#141414';
      ctx.fillRect(pX + 44, pY + 42,  8,  8);
      ctx.fillRect(pX + 74, pY + 42,  8,  8);
    } else if (a === 'purr') {
      // Happy closed eyes — curved lines (UwU)
      ctx.fillStyle = '#141414';
      // Left eye — upward arc (3 segments)
      ctx.fillRect(pX + 42, pY + 48,  4, 2);
      ctx.fillRect(pX + 46, pY + 46,  4, 2);
      ctx.fillRect(pX + 50, pY + 48,  4, 2);
      // Right eye
      ctx.fillRect(pX + 70, pY + 48,  4, 2);
      ctx.fillRect(pX + 74, pY + 46,  4, 2);
      ctx.fillRect(pX + 78, pY + 48,  4, 2);
    } else if (a === 'agent-thinking') {
      // Spiral eyes ⊙ — concentric squares
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pX + 40, pY + 38, 16, 16); ctx.fillRect(pX + 70, pY + 38, 16, 16);
      ctx.fillStyle = '#141414';
      ctx.fillRect(pX + 44, pY + 42,  8,  8); ctx.fillRect(pX + 74, pY + 42,  8,  8);
      ctx.fillStyle = '#7090d8';
      ctx.fillRect(pX + 47, pY + 45,  2,  2); ctx.fillRect(pX + 77, pY + 45,  2,  2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pX + 44, pY + 42,  2,  2); ctx.fillRect(pX + 74, pY + 42,  2,  2);
    }

    // ── Pixel keyboard graphic + alternating paw Y-positions (TYPING state) ──
    const isTypingState = cat.isTypingMode || cat.typingTimer > 0 || a === 'typing' || leftKeyPressed || rightKeyPressed;
    if (isTypingState && a !== 'sleep' && a !== 'drag') {
      cat.typingTick = (cat.typingTick || 0) + 1;

      ctx.save();

      // Render keycaps via drawTypingKeypad and paws via renderCatPaws
      const catCenterX = pX + 63;
      const catPawBaseY = pY + 54;
      drawTypingKeypad(ctx, catCenterX, catPawBaseY);
      renderCatPaws(ctx, catCenterX, catPawBaseY, 'TYPING');

      ctx.restore();
    }

    // ── Scroll paper (during scroll reaction) ──
    if (a === 'scroll' || cat.scrollTimer > 0) {
      ctx.save();
      drawPaperScroll(cat, cat.paperUnroll || 0);
      ctx.restore();
    }
  } else {
    // ── Fallback Procedural Pixel Cat (guarantees cat is NEVER invisible) ──
    const P = window.P;
    const hy = 2 + bob;
    const by = 8 + bob;

    // Ears
    px(4, hy, 4, 4, P.K);    px(5, hy+1, 2, 2, P.N);
    px(14, hy, 4, 4, P.K);   px(15, hy+1, 2, 2, P.N);

    // Head
    px(4, hy+3, 14, 7, P.F);
    px(4, hy+3, 14, 1, P.K);
    px(3, hy+4, 1, 5, P.K);
    px(18, hy+4, 1, 5, P.K);

    // Eyes
    drawEyes(cat, lastCursor);

    // Nose
    px(10, hy+7, 2, 1, P.N);

    // Body
    px(6, by+2, 10, 8, P.F);
    px(7, by+3, 8, 6, P.B);
    px(5, by+2, 1, 7, P.K);
    px(16, by+2, 1, 7, P.K);
    px(6, by+9, 10, 1, P.K);

    // Paws
    px(6, by+8, 4, 2, P.B);
    px(12, by+8, 4, 2, P.B);

    // Tail
    const tailSway = iround(Math.sin(Date.now() * 0.003) * 2);
    px(17 + tailSway, by+4, 4, 2, P.F);
    px(19 + tailSway, by+2, 2, 3, P.F);
  }

  ctx.restore();
}

// ─── Blink ───────────────────────────────────────────────────
const BLINK_SEQ   = [0, 1, 2, 1, 0];
const BLINK_TIMES = [0.08, 0.08, 0.10, 0.08];

function updateBlink(cat, dt) {
  if (cat.action === 'sleep') { cat.blinkFrame = 2; return; }
  if (cat.action === 'drag')  { cat.blinkFrame = 0; return; }

  cat.blinkTimer -= dt / 1000;
  if (cat.blinkTimer <= 0) {
    cat.blinkStep = (cat.blinkStep + 1) % BLINK_SEQ.length;
    cat.blinkFrame = BLINK_SEQ[cat.blinkStep];
    if (cat.blinkStep === 0) {
      cat.blinkTimer = 2.5 + Math.random() * 4;
    } else {
      cat.blinkTimer = BLINK_TIMES[cat.blinkStep - 1] || 0.08;
    }
  }
}

function updateEars(cat, dt) {
  if (cat.action === 'idle' || cat.action === 'sit') {
    cat.earTwitchTimer -= dt / 1000;
    if (cat.earTwitchTimer <= 0) {
      if (cat.earTwitchSide === 0) {
        cat.earTwitchSide  = Math.random() < 0.5 ? 1 : 2;
        cat.earTwitchTimer = 0.15;
      } else {
        cat.earTwitchSide  = 0;
        cat.earTwitchTimer = 2.5 + Math.random() * 4;
      }
    }
  } else {
    cat.earTwitchSide = 0;
  }
}

// ─── Canvas positioning ───────────────────────────────────────
function positionCanvas(cat) {
  const canvas = window._catCanvas;
  if (!canvas) return;
  canvas.style.left = `${Math.round(cat.x)}px`;
  canvas.style.top  = `${Math.round(cat.y)}px`;
}

// ─── Hit testing ─────────────────────────────────────────────
function isOnCat(mx, my) {
  const canvas = window._catCanvas;
  if (!canvas) return false;
  const r = canvas.getBoundingClientRect();
  if (mx < r.left || mx > r.right || my < r.top || my > r.bottom) return false;
  const cx = Math.floor((mx - r.left) * (canvas.width  / r.width));
  const cy = Math.floor((my - r.top)  * (canvas.height / r.height));
  try   { return window._ctx.getImageData(cx, cy, 1, 1).data[3] > 10; }
  catch { return true; }
}

// ─── Init ────────────────────────────────────────────────────
function initSprite(canvasEl, fxCanvasEl, imgEl) {
  window._catCanvas = canvasEl;
  window._fxCtx     = fxCanvasEl.getContext('2d');
  window._ctx       = canvasEl.getContext('2d');

  pepImg = imgEl || new Image();
  if (!pepImg.complete || pepImg.naturalWidth === 0) {
    pepImg = new Image();
    pepImg.src = 'assets/pepperino_cropped.png';
  }

  canvasEl.width  = CAT_W;
  canvasEl.height = CAT_H;
  canvasEl.style.width  = `${CAT_W}px`;
  canvasEl.style.height = `${CAT_H}px`;
  window._ctx.imageSmoothingEnabled = false;
  window._ctx['webkitImageSmoothingEnabled'] = false;

  fxCanvasEl.width  = window.innerWidth;
  fxCanvasEl.height = window.innerHeight;
  window._fxCtx.imageSmoothingEnabled = false;
}

window.sprite = {
  init:            initSprite,
  draw:            drawCat,
  updateBlink,
  updateEars,
  positionCanvas,
  isOnCat,
  get CAT_W()  { return CAT_W; },
  get CAT_H()  { return CAT_H; },
};
