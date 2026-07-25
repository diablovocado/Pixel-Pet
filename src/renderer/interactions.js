'use strict';
/**
 * interactions.js — All mouse/keyboard/scroll interactions
 *
 * Features:
 *   - Eye follow (cursor tracking)
 *   - Mochi Drag (squash/stretch + shake wobble + landing bounce)
 *   - Mouse Hunt trigger
 *   - Purring Pets (slow hover on head → purr)
 *   - Scroll → paper unroll animation
 *   - Click-through toggle (setIgnoreMouseEvents)
 */

/* global CAT_W, CAT_H, SH */

let dragging    = false;
let dragMoved   = false;
let dragOffX    = 0, dragOffY = 0;
let mouseDownAt = null;
let ignoring    = true;

// Mochi physics
let _dragVelX    = 0, _dragVelY = 0;
let _lastDragX   = 0, _lastDragY = 0;
let _dragDxHistory = [];  // last N dx values for shake detection

// Purr hover tracking
let _hoverOnHead = false;
let _hoverTimer  = 0;
const PURR_THRESH = 1000;  // ms of slow hover needed
const PURR_SPEED  = 45;    // px/s max to count as "slow"

// Exposed lastCursor for other modules
const lastCursor = { x: 0, y: 0 };

function isInHeadBox(cat, mx, my) {
  // Head box: upper ~40% of cat canvas
  const r = window._catCanvas?.getBoundingClientRect();
  if (!r) return false;
  const headLeft  = r.left + r.width  * 0.25;
  const headRight = r.left + r.width  * 0.75;
  const headTop   = r.top;
  const headBot   = r.top  + r.height * 0.45;
  return mx >= headLeft && mx <= headRight && my >= headTop && my <= headBot;
}

function _clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ─── Mochi squash/stretch physics ────────────────────────────
function updateDragPhysics(cat, e) {
  const dx = e.clientX - _lastDragX;
  const dy = e.clientY - _lastDragY;
  _lastDragX = e.clientX;
  _lastDragY = e.clientY;

  _dragVelX = _dragVelX * 0.7 + dx * 0.3;
  _dragVelY = _dragVelY * 0.7 + dy * 0.3;

  // Mochi stretch vertical physics (preserve area volume)
  const stretchAmount = Math.max(0, (cat.dragStartY || e.clientY) - e.clientY);
  const scaleY = 1 + Math.min(stretchAmount / 120, 0.8);
  const scaleX = 1 / scaleY; // Preserve area volume

  cat.dragStretchY = scaleY;
  cat.dragStretchX = scaleX;

  // Shake detection: track sign changes in dx
  _dragDxHistory.push(dx > 2 ? 1 : dx < -2 ? -1 : 0);
  if (_dragDxHistory.length > 10) _dragDxHistory.shift();

  let reversals = 0;
  for (let i = 1; i < _dragDxHistory.length; i++) {
    if (_dragDxHistory[i] !== 0 && _dragDxHistory[i] !== _dragDxHistory[i-1] && _dragDxHistory[i-1] !== 0)
      reversals++;
  }
  cat.dragWobble = reversals >= 3 ? Math.sin(Date.now() * 0.03) * 8 : 0;
}

function landingBounce(cat) {
  const startStretchX = cat.dragStretchX || 1;
  const startStretchY = cat.dragStretchY || 1;

  window.particles?.spawnBounce?.();

  const startT = performance.now();
  const duration = 500;

  const tick = (now) => {
    const elapsed = now - startT;
    const progress = Math.min(elapsed / duration, 1);

    // Damped harmonic oscillation curve for bounce snap-back
    const decay = Math.exp(-5.5 * progress);
    const oscillation = Math.cos(progress * Math.PI * 4.5);
    const factor = decay * oscillation;

    cat.dragStretchX = 1 + (startStretchX - 1) * factor;
    cat.dragStretchY = 1 + (startStretchY - 1) * factor;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      cat.dragStretchX = 1;
      cat.dragStretchY = 1;
    }
  };
  requestAnimationFrame(tick);
}

// ─── Hover / purr tracking ────────────────────────────────────
function updateHoverPurr(cat, e, dt) {
  const speed = cat.mouseSpeed || 0;
  const onHead = isInHeadBox(cat, e.clientX, e.clientY);

  if (onHead && speed < PURR_SPEED) {
    _hoverTimer += dt;
    if (_hoverTimer >= PURR_THRESH && cat.action !== 'purr' && cat.action !== 'drag') {
      window.behavior?.enterAction(cat, 'purr');
      _hoverTimer = 0;
    }
  } else {
    _hoverTimer = 0;
    if (cat.action === 'purr') {
      // Only exit purr via timer (purrTimer in behavior.js)
    }
  }
}

// ─── Mouse events ─────────────────────────────────────────────
function initInteractions(cat, deskpet) {
  document.addEventListener('mousemove', e => {
    lastCursor.x = e.clientX;
    lastCursor.y = e.clientY;

    if (dragging) {
      cat.x = e.clientX - dragOffX;
      cat.y = e.clientY - dragOffY;
      cat.x = clamp(cat.x, 0, window.innerWidth  - CAT_W);
      cat.y = clamp(cat.y, 0, window.innerHeight - CAT_H);
      if (mouseDownAt &&
          (Math.abs(e.clientX - mouseDownAt.x) > 5 ||
           Math.abs(e.clientY - mouseDownAt.y) > 5)) dragMoved = true;
      updateDragPhysics(cat, e);
      return;
    }

    const on = Boolean(window.sprite?.isOnCat(e.clientX, e.clientY));
    if (on !== !ignoring) {
      ignoring = !on;
      deskpet.setIgnoreMouseEvents(!on, { forward: true });
    }
  });

  document.addEventListener('mousedown', e => {
    if (!window.sprite?.isOnCat(e.clientX, e.clientY)) return;
    dragging    = true;
    dragMoved   = false;
    mouseDownAt = { x: e.clientX, y: e.clientY };
    cat.dragStartY = e.clientY;
    dragOffX    = e.clientX - cat.x;
    dragOffY    = e.clientY - cat.y;
    _lastDragX  = e.clientX;
    _lastDragY  = e.clientY;
    _dragVelX   = 0;
    _dragVelY   = 0;
    _dragDxHistory = [];
    window.behavior?.enterAction(cat, 'drag');
    ignoring = false;
    deskpet.setIgnoreMouseEvents(false, { forward: true });
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    if (!dragMoved) {
      // Tap → pet reaction
      window.behavior?.enterAction(cat, 'pet');
    } else {
      // Drop → bounce snap-back landing
      landingBounce(cat);
      window.behavior?.enterAction(cat, 'idle');
      cat.timer = 400 + Math.random() * 800;
    }
    setTimeout(() => {
      if (!window.sprite?.isOnCat(lastCursor.x, lastCursor.y)) {
        ignoring = true;
        deskpet.setIgnoreMouseEvents(true, { forward: true });
      }
    }, 80);
  });

  // ── Scroll reaction ──
  let scrollTO = null;
  document.addEventListener('wheel', () => {
    const cat = window.CAT_STATE;
    cat.scrollTimer = 1200;  // extend each scroll event
    if (cat.action === 'sleep') return;
    clearTimeout(scrollTO);
    scrollTO = setTimeout(() => {
      cat.scrollTimer = 0;
    }, 900);
  }, { passive: true });
}

// ─── Per-frame update (called from main loop) ─────────────────
function updateInteractions(cat, dt) {
  // Hover purr — needs mouse speed from activity-tick
  const e = { clientX: lastCursor.x, clientY: lastCursor.y };
  updateHoverPurr(cat, e, dt);

  // Drag physics decay (spring back to 1:1)
  if (!dragging && cat.action !== 'drag') {
    cat.dragStretchX += (1 - cat.dragStretchX) * 0.15;
    cat.dragStretchY += (1 - cat.dragStretchY) * 0.15;
    if (Math.abs(cat.dragStretchX - 1) < 0.01) cat.dragStretchX = 1;
    if (Math.abs(cat.dragStretchY - 1) < 0.01) cat.dragStretchY = 1;
  }
}

window.interactions = { initInteractions, updateInteractions, lastCursor };
