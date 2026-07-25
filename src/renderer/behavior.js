'use strict';
/**
 * behavior.js — Cat state machine
 * Manages all state transitions and per-frame behavior updates.
 * States: idle | walk | sit | run | excited | sleep | wakeup | drag |
 *         pet | purr | hunt | scroll | agent-thinking | agent-done | peek
 */

/* global CAT_W, CAT_H */

const SLEEP_THRESH  = 60;    // idle seconds before sleeping
const RUN_THRESH    = 270;   // mouse px/s for run reaction
const HUNT_THRESH   = 180;   // mouse px/s for hunt reaction
const HUNT_RANGE    = 320;   // px radius for hunt to trigger
const TYPING_WINDOW = 3500;  // ms typing state persists after last key

const rand  = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ─── Quip tables ─────────────────────────────────────────────
const QUIPS = {
  sit:         ['...', 'mrrr', '(=^ω^=)', '✨', '~'],
  excited:     ['!!', 'ooh~', '(owo)', 'mrrrow!', '*zoomies*'],
  pet:         ['purr~', 'mew!', 'nyaa~', '♥ mew ♥', '(≧∇≦)'],
  purr:        ['purrrr~', '(=^‿^=)', '♥', '~mrrr~'],
  hunt:        ['!!', 'got ur scent!', '≧◡≦', 'pounce~'],
  sleep:       ['zzz...', '💤', '~zzz'],
  agentDone:   ['mew! ✓', 'done! ♥', 'yay~', '🎉 mew!'],
};

const CONTEXT_QUIPS = {
  coding:  ['coding time!', 'clean syntax!', 'ship it!', 'npm run dev~', 'git push~'],
  browser: ['browsing~', 'so many tabs!', 'finding tuna?'],
  design:  ['pixel perfect!', 'nice colors!', 'design time!'],
  chat:    ['meow back?', 'who typed?', 'new message!'],
};

function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

// ─── Enter action ────────────────────────────────────────────
function enterAction(cat, action) {
  const prev = cat.action;
  cat.prevAction = prev;
  cat.action     = action;
  cat.timer      = 0;

  const B = window.bubbles;
  const P = window.particles;

  switch (action) {
    case 'idle':
      cat.timer = rand(2500, 7000);
      break;

    case 'walk':
      cat.targetX = rand(30, window.innerWidth - CAT_W - 30);
      break;

    case 'sit':
      cat.timer = rand(3500, 9000);
      if (B) {
        const catQuips = (cat.appCategory && CONTEXT_QUIPS[cat.appCategory] && Math.random() < 0.6)
          ? CONTEXT_QUIPS[cat.appCategory]
          : QUIPS.sit;
        B.showBubble(pick(catQuips), 1500);
      }
      break;

    case 'run':
      cat.timer = 2200;
      break;

    case 'excited':
      cat.timer  = 3200;
      cat.bounce = 0;
      if (B) B.showBubble(pick(QUIPS.excited), 1800);
      if (P) P.spawnHearts(4);
      break;

    case 'sleep':
      cat.sleepTimer = 0;
      cat.zzzTimer   = 0;
      if (B) B.showBubble(pick(QUIPS.sleep), 2200);
      break;

    case 'wakeup':
      cat.timer = 900;
      if (B) B.showBubble('*yawn*', 900);
      break;

    case 'drag':
      cat.dragStretchX = 1;
      cat.dragStretchY = 1;
      break;

    case 'pet':
      cat.petTimer = 1900;
      if (B) B.showBubble(pick(QUIPS.pet), 1700);
      if (P) P.spawnHearts(8);
      break;

    case 'purr':
      cat.purrTimer = 3000;
      if (B) B.showBubble(pick(QUIPS.purr), 2500);
      if (P) P.spawnHearts(3);
      break;

    case 'hunt':
      cat.huntTimer = 2200;
      if (B) B.showBubble(pick(QUIPS.hunt), 1200);
      break;

    case 'scroll':
      cat.scrollTimer  = 0;
      cat.paperUnroll  = 0;
      cat.paperRolling = false;
      break;

    case 'agent-thinking':
      if (B) B.showAgentBubble('...thinking 🤔');
      break;

    case 'agent-done':
      cat.timer  = 2000;
      cat.bounce = 0;
      if (B) { B.showBubble(pick(QUIPS.agentDone), 2000); B.hideAgentBubble(); }
      if (P) P.spawnHearts(6);
      break;

    case 'peek':
      cat.peekX = window.innerWidth - CAT_W * 0.25;  // show only 25% of cat
      break;
  }
}

// ─── Auto action picker ───────────────────────────────────────
function nextAutoAction() {
  const r = Math.random();
  if (r < 0.45) return 'walk';
  if (r < 0.70) return 'sit';
  return 'idle';
}

// ─── Main update ─────────────────────────────────────────────
function updateBehavior(cat, lastCursor, dt, SW) {
  // Timers
  if (cat.typingTimer > 0) cat.typingTimer -= dt;
  if (cat.petTimer    > 0) {
    cat.petTimer -= dt;
    if (cat.petTimer <= 0 && cat.action === 'pet') enterAction(cat, 'idle');
    return;
  }
  if (cat.purrTimer > 0) {
    cat.purrTimer -= dt;
    if (cat.purrTimer <= 0 && cat.action === 'purr') enterAction(cat, 'idle');
    return;
  }

  // Stretch reminder scale animation
  if (cat.stretchTimer > 0) {
    cat.stretchTimer -= dt;
    const t = 1 - (cat.stretchTimer / 4000);
    if (t < 0.3) {
      // Growing up
      cat.stretchScale = 1 + (t / 0.3) * 0.4;
    } else if (t < 0.7) {
      // Held at max
      cat.stretchScale = 1.4;
    } else {
      // Shrinking back
      cat.stretchScale = 1.4 - ((t - 0.7) / 0.3) * 0.4;
    }
    if (cat.stretchTimer <= 0) cat.stretchScale = 1;
  }

  // Drag — no auto state changes
  if (cat.action === 'drag') return;

  // ── Priority stack ────────────────────────────────────────

  // P1: Idle long enough → sleep
  if (cat.idleSeconds > SLEEP_THRESH &&
      cat.action !== 'sleep' && cat.action !== 'wakeup' &&
      cat.action !== 'agent-thinking') {
    enterAction(cat, 'sleep'); return;
  }

  // P2: Wake from sleep
  if (cat.action === 'sleep' && cat.idleSeconds < 2) {
    enterAction(cat, 'wakeup'); return;
  }

  // P3: Wakeup timer
  if (cat.action === 'wakeup') {
    cat.timer -= dt;
    if (cat.timer <= 0) enterAction(cat, 'idle');
    return;
  }

  // P4: Peek mode
  if (cat.isPeekMode && cat.action !== 'peek') {
    enterAction(cat, 'peek'); return;
  }
  if (!cat.isPeekMode && cat.action === 'peek') {
    enterAction(cat, 'idle'); return;
  }

  // P5: Agent thinking (don't interrupt with other behaviors)
  if (cat.action === 'agent-thinking') {
    if (cat.agentStatus !== 'thinking') enterAction(cat, 'agent-done');
    return;
  }
  if (cat.action === 'agent-done') {
    cat.timer -= dt;
    if (cat.timer <= 0) enterAction(cat, 'idle');
    return;
  }

  // P6: Agent starts thinking
  if (cat.agentStatus === 'thinking' && cat.action !== 'agent-thinking') {
    enterAction(cat, 'agent-thinking'); return;
  }

  // P7: Fast mouse → hunt (if cursor is close)
  if (cat.action !== 'hunt' && cat.action !== 'sleep' && cat.action !== 'excited') {
    const distToCursor = Math.hypot(lastCursor.x - (cat.x + CAT_W/2), lastCursor.y - (cat.y + CAT_H/2));
    if (cat.mouseSpeed > HUNT_THRESH && distToCursor < HUNT_RANGE && cat.idleSeconds < 3) {
      enterAction(cat, 'hunt'); return;
    }
  }

  // P8: Scroll reaction
  if (cat.scrollTimer > 0 && cat.action !== 'scroll') {
    enterAction(cat, 'scroll'); return;
  }

  // P9: Typing → excited (but NOT during agent-thinking)
  if (cat.typingTimer > 0 && cat.action !== 'excited' && cat.action !== 'sleep') {
    enterAction(cat, 'excited'); return;
  }

  // ── State tick ──────────────────────────────────────────────
  switch (cat.action) {
    case 'idle':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction(cat, nextAutoAction());
      break;

    case 'walk': {
      if (!cat.targetX) { enterAction(cat, 'idle'); break; }
      const dir  = cat.targetX > cat.x ? 1 : -1;
      cat.facing = dir;
      cat.x     += dir * 0.082 * dt;
      cat.x      = clamp(cat.x, 0, SW - CAT_W);
      if (Math.abs(cat.x - cat.targetX) < 5)
        enterAction(cat, Math.random() < 0.35 ? 'sit' : 'idle');
      break;
    }

    case 'sit':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction(cat, nextAutoAction());
      break;

    case 'run': {
      const tx   = lastCursor.x - CAT_W * 0.5;
      const dir  = tx > cat.x ? 1 : -1;
      cat.facing = dir;
      cat.x     += dir * Math.min(0.26 * dt, Math.abs(tx - cat.x));
      cat.x      = clamp(cat.x, 0, SW - CAT_W);
      cat.timer -= dt;
      if (cat.mouseSpeed < RUN_THRESH * 0.42 && cat.timer <= 0) enterAction(cat, 'idle');
      break;
    }

    case 'hunt': {
      // Chase cursor quickly
      cat.huntTimer -= dt;
      const tx   = lastCursor.x - CAT_W * 0.5;
      const dir  = tx > cat.x ? 1 : -1;
      cat.facing = dir;
      cat.x     += dir * Math.min(0.18 * dt, Math.abs(tx - cat.x));
      cat.x      = clamp(cat.x, 0, SW - CAT_W);
      if (cat.huntTimer <= 0) enterAction(cat, 'sit');
      break;
    }

    case 'excited':
      cat.timer -= dt;
      if (cat.timer <= 0) enterAction(cat, 'idle');
      break;

    case 'sleep':
      cat.sleepTimer += dt;
      cat.zzzTimer   += dt;
      if (cat.zzzTimer > 2400) {
        window.particles?.spawnZzz();
        cat.zzzTimer = 0;
      }
      break;

    case 'scroll': {
      cat.scrollTimer -= dt;
      // Animate unroll
      if (!cat.paperRolling) {
        cat.paperUnroll = Math.min(1, cat.paperUnroll + dt * 0.003);
      } else {
        cat.paperUnroll = Math.max(0, cat.paperUnroll - dt * 0.004);
        if (cat.paperUnroll <= 0) enterAction(cat, 'sit');
      }
      if (cat.scrollTimer <= 0 && !cat.paperRolling) {
        cat.paperRolling = true;  // start rolling back up
      }
      break;
    }

    case 'peek': {
      // Slide to edge
      if (cat.peekX !== null) {
        const dir = cat.peekX > cat.x ? 1 : -1;
        cat.x += dir * 0.12 * dt;
        cat.x  = clamp(cat.x, 0, SW - CAT_W * 0.25);
        cat.facing = -1; // always face inward (left when at right edge)
      }
      break;
    }
  }

  window.sprite?.updateBlink(cat, dt);
  window.sprite?.updateEars(cat, dt);
  cat.x = clamp(cat.x, 0, SW - CAT_W);
}

window.behavior = { enterAction, updateBehavior, pick, QUIPS, CONTEXT_QUIPS };
