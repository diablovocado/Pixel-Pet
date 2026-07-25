'use strict';
/**
 * state.js — Shared cat state object
 * Single source of truth for position, animation phase, and all activity flags.
 * All renderer modules read/write this object directly.
 */

/* global SW, SH, CAT_W, CAT_H */

(function() {
const cat = {
  // Position (screen px)
  x: 0,
  y: 0,

  // Direction: 1=right, -1=left
  facing: 1,

  // Current animation state
  action:     'idle',
  prevAction: 'idle',
  timer:      0,
  targetX:    null,

  // Phase accumulators (float; rounded when used in pixel grid)
  tail:   0,
  walk:   0,
  breath: 0,
  bounce: 0,

  // Blink
  blinkFrame: 0,     // 0=open 1=half 2=closed
  blinkTimer: 4,
  blinkStep:  0,

  // Ear twitch
  earTwitchSide:  0,   // 0=none 1=left 2=right
  earTwitchTimer: 3,

  // Activity / input state (from main process via IPC)
  idleSeconds:  0,
  mouseSpeed:   0,
  likelyTyping: false,
  typingTimer:  0,

  // Keyboard / heat
  isTypingMode: false,
  typingCPS:    0,
  typingIsFast: false,
  heatLevel:    0,      // 0..1 — drives palette tint + steam particles
  typingTick:   0,

  // Mouse hover tracking for purr
  hoverSlowTimer: 0,    // ms cursor has been slowly on head
  lastCursorSpeed: 0,

  // Mochi drag physics
  dragStretchX: 1,
  dragStretchY: 1,
  dragStartY: 0,
  dragShakeHistory: [],
  dragWobble: 0,

  // Hunt state
  huntTimer: 0,

  // Pet / purr
  petTimer: 0,
  purrTimer: 0,

  // Sleep
  sleepTimer: 0,
  zzzTimer:   0,

  // Scroll paper-unroll
  scrollTimer:   0,
  paperUnroll:   0,    // 0=rolled up, 1=fully unrolled (animated)
  paperRolling:  false,

  // App context
  currentApp:  '',
  appCategory: 'default',

  // AI Agent
  agentStatus: 'idle',  // 'thinking' | 'done' | 'idle'
  agentTool:   '',

  // Screen insets (Dock height)
  bottomInset: 0,

  // Full-screen / peek mode
  isPeekMode:  false,
  peekX:       null,   // target X in peek mode

  // Stretch reminder animation
  stretchScale: 1,
  stretchTimer: 0,

  // Settings (loaded from main)
  settings: {
    name:    '',
    variant: 'pepperino',
  },
};

// Helper to reset cat to starting position
function resetPosition() {
  cat.x = (typeof SW !== 'undefined' ? SW : 1440) * 0.45;
  cat.y = (typeof SH !== 'undefined' ? SH : 900) - (typeof CAT_H !== 'undefined' ? CAT_H : 140) - 12;
}

// Export
window.CAT_STATE = cat;
window.catResetPosition = resetPosition;
})();

