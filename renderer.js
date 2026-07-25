'use strict';
/**
 * renderer.js — Boot & main loop
 * All logic lives in src/renderer/ modules.
 * This file only: initializes modules, wires IPC, runs the rAF loop.
 */

// ─── Canvas & image refs ──────────────────────────────────────
const catCanvas  = document.getElementById('catCanvas');
const fxCanvas   = document.getElementById('fxCanvas');
const _pepImgEl  = document.getElementById('pepImg');

const SW = window.innerWidth;
const SH = window.innerHeight;

// ─── Module init ──────────────────────────────────────────────
// state.js already ran: window.CAT_STATE exists
const cat = window.CAT_STATE;
cat.x = SW * 0.45;
cat.y = SH - window.CAT_H - 12;  // CAT_H set by sprite.js

// Init sprite (sets window._catCanvas, window._ctx, window._fxCtx)
window.sprite.init(catCanvas, fxCanvas, _pepImgEl);

// Init bubbles
window.bubbles.init({
  bubble:        'bubble',
  pinned:        'pinnedBubble',
  timer:         'timerBubble',
  agent:         'agentBubble',
  reminder:      'reminderBubble',
});

// Default click-through
window.deskpet.setIgnoreMouseEvents(true, { forward: true });

// Init interactions
window.interactions.initInteractions(cat, window.deskpet);

// ─── IPC handlers ────────────────────────────────────────────
window.deskpet.onInitSettings((cfg) => {
  // Apply stored variant
  if (cfg.variant) window.setVariant(cfg.variant);
  // Apply stored pinned note
  if (cfg.pinnedNote) window.bubbles.setPinnedNote(cfg.pinnedNote);
  // Apply stored name
  cat.settings = cfg;
  // Init reminders with settings
  window.reminders.initReminders(cfg);
});

window.deskpet.onSettingsUpdate((cfg) => {
  cat.settings = cfg;
  if (cfg.variant)    window.setVariant(cfg.variant);
  if ('pinnedNote' in cfg) window.bubbles.setPinnedNote(cfg.pinnedNote);
  window.reminders.updateSettings(cfg);
});

window.deskpet.onActivityTick(({ cursorX, cursorY, mouseSpeed, idleSeconds, likelyTyping }) => {
  cat.idleSeconds   = idleSeconds;
  cat.mouseSpeed    = mouseSpeed;
  cat.likelyTyping  = likelyTyping;
  if (likelyTyping) cat.typingTimer = 3500;

  const lc = window.interactions.lastCursor;
  lc.x = cursorX;
  lc.y = cursorY;
});

window.deskpet.onTypingUpdate(({ isTyping, cps, isFast, heatLevel }) => {
  cat.isTypingMode  = isTyping;
  cat.typingCPS     = cps;
  cat.typingIsFast  = isFast;
  cat.heatLevel     = heatLevel ?? 0;

  // Update heat palette in real time
  window.updateHeatPalette(cat.heatLevel);

  if (isTyping && cat.action !== 'sleep' && cat.action !== 'drag') {
    cat.typingTimer = 1800;
  }

  // Spawn steam particles when overheating
  if (isFast && Math.random() < 0.25) {
    window.particles.spawnSteam();
  }
  if (isTyping && Math.random() < 0.15) {
    window.particles.spawnSparks();
  }
});

window.deskpet.onAppContextUpdate(({ appName, category }) => {
  cat.currentApp  = appName;
  cat.appCategory = category;
});

window.deskpet.onSetVariant((variant) => {
  window.setVariant(variant);
});

window.deskpet.onSetPinnedNote((text) => {
  window.bubbles.setPinnedNote(text);
  if (text) window.bubbles.showBubble('Note pinned! 📌', 1500);
  else      window.bubbles.showBubble('Note cleared',    1200);
});

window.deskpet.onStartTimer((minutes) => {
  window.bubbles.startTimer(minutes);
});

window.deskpet.onPauseTimer(() => {
  window.bubbles.pauseTimer();
});

window.deskpet.onCancelTimer(() => {
  window.bubbles.cancelTimer();
});

window.deskpet.onAgentStatus((data) => {
  window.agentDisplay.handleAgentStatus(cat, data);
});

window.deskpet.onFullscreenChange((isFullscreen) => {
  cat.isPeekMode = isFullscreen;
  if (!isFullscreen) {
    // Return to ground position
    cat.y = SH - window.CAT_H - 12;
  }
});

// ─── Main loop ────────────────────────────────────────────────
let lastT = performance.now();

function loop(t) {
  const dt = Math.min(t - lastT, 80);
  lastT = t;

  const lastCursor = window.interactions.lastCursor;

  // Behavior state machine
  window.behavior.updateBehavior(cat, lastCursor, dt, SW);

  // Per-frame interaction updates (hover purr, drag physics)
  window.interactions.updateInteractions(cat, dt);

  // Check reminders
  window.reminders.checkReminders(cat);

  // Particles
  window.particles.update(dt);

  // Canvas positioning
  window.sprite.positionCanvas(cat);

  // Draw cat
  window.sprite.draw(cat, lastCursor);

  // Draw particles
  window.particles.draw();

  // Update bubbles
  window.bubbles.update(cat);

  requestAnimationFrame(loop);
}

// ─── Boot ────────────────────────────────────────────────────
window.behavior.enterAction(cat, 'idle');
requestAnimationFrame(loop);
