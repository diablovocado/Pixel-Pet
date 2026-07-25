'use strict';
/**
 * polling.js — Global mouse/idle polling
 * Uses powerMonitor.getSystemIdleTime() and screen.getCursorScreenPoint().
 * No native addons required — works without Accessibility permission.
 */

const { screen, powerMonitor } = require('electron');

let pollInterval = null;
let lastCX = 0, lastCY = 0, lastPoll = Date.now(), lastIdle = 999;

/**
 * Start polling. Calls onTick(data) at ~50ms intervals.
 * @param {BrowserWindow} win
 * @param {function} onTick
 */
function start(win, onTick) {
  if (pollInterval) clearInterval(pollInterval);

  const { x: wx, y: wy } = screen.getPrimaryDisplay().workArea;

  pollInterval = setInterval(() => {
    if (!win || win.isDestroyed()) return;

    const now  = Date.now();
    const cur  = screen.getCursorScreenPoint();
    const dt   = Math.max(1, now - lastPoll);
    const dist = Math.hypot(cur.x - lastCX, cur.y - lastCY);
    const mouseSpeed    = (dist / dt) * 1000; // px/s
    const idleSeconds   = powerMonitor.getSystemIdleTime();
    const likelyTyping  = lastIdle > 0.7 && idleSeconds < 0.4 && dist < 8;

    lastCX = cur.x; lastCY = cur.y;
    lastPoll = now;  lastIdle = idleSeconds;

    // Convert screen → window client coordinates
    onTick({
      cursorX:    cur.x - wx,
      cursorY:    cur.y - wy,
      rawX:       cur.x,
      rawY:       cur.y,
      mouseSpeed,
      idleSeconds,
      likelyTyping,
    });
  }, 50);
}

function stop() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

module.exports = { start, stop };
