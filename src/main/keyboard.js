'use strict';
/**
 * keyboard.js — Global keyboard listener wrapper
 * Wraps node-global-key-listener defensively.
 * App runs fine without Accessibility permission — just without this feature.
 *
 * macOS Setup (required for this feature):
 *   System Settings → Privacy & Security → Accessibility → enable Pixel Deskpet
 */

let keyListener      = null;
let keyTimestamps    = [];
let typingCooldown   = null;

/**
 * Start listening. Calls onKey({ isTyping, cps, isFast, heatLevel }) on each stroke.
 * @param {function} onKey
 * @param {function} onStop  called when typing stops (isTyping:false)
 */
function start(onKey, onStop) {
  try {
    const { GlobalKeyboardListener } = require('node-global-key-listener');
    keyListener = new GlobalKeyboardListener();

    keyListener.addListener((e) => {
      // Defensive: only proceed for actual keyboard DOWN events
      if (e.state !== 'DOWN' || (typeof e.name === 'undefined' && typeof e.rawKey === 'undefined')) return;

      const now = Date.now();
      keyTimestamps.push(now);
      // Rolling 1-second window
      keyTimestamps = keyTimestamps.filter(t => now - t <= 1000);
      const cps       = keyTimestamps.length;
      const isFast    = cps >= 5;           // 5+ keys/s = fast typing
      const heatLevel = Math.min(1, (cps - 3) / 7); // 0 at ≤3 cps, 1 at 10+ cps

      onKey({ isTyping: true, cps, isFast, heatLevel: Math.max(0, heatLevel) });

      clearTimeout(typingCooldown);
      typingCooldown = setTimeout(() => {
        keyTimestamps = [];
        onStop?.({ isTyping: false, cps: 0, isFast: false, heatLevel: 0 });
      }, 1400);
    });

    console.log('[keyboard] Global key listener active');
  } catch (err) {
    console.log(
      '[keyboard] Global key listener unavailable — typing reactions disabled.\n' +
      '           To enable: System Settings → Privacy & Security → Accessibility → add Pixel Deskpet\n' +
      '           Error:', err.message
    );
  }
}

function stop() {
  try {
    if (keyListener) { keyListener.kill?.(); keyListener = null; }
  } catch { /* ignore */ }
}

module.exports = { start, stop };
