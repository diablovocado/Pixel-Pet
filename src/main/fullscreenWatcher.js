'use strict';
/**
 * fullscreenWatcher.js — Detect system full-screen / video mode (Peek Mode)
 * Polls every 2s using AppleScript to check if the frontmost app is full-screen.
 * When detected, sends 'fullscreen-change' IPC event.
 */

const { exec } = require('child_process');

let interval = null;
let lastState = false;

// AppleScript: returns "true" if any space has a full-screen window
const SCRIPT = `
  tell application "System Events"
    set fsList to {}
    repeat with p in (every process whose background only is false)
      try
        repeat with w in (every window of p)
          if value of attribute "AXFullScreen" of w is true then
            return "true"
          end if
        end repeat
      end try
    end repeat
    return "false"
  end tell
`;

function start(win, onChange) {
  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    if (!win || win.isDestroyed()) return;

    exec(`osascript -e '${SCRIPT.replace(/'/g, "'\\''")}'`, { timeout: 2000 }, (err, stdout) => {
      if (err) return; // fail silently
      const isFullscreen = stdout.trim() === 'true';
      if (isFullscreen !== lastState) {
        lastState = isFullscreen;
        onChange(isFullscreen);
      }
    });
  }, 2500);
}

function stop() {
  if (interval) { clearInterval(interval); interval = null; }
}

module.exports = { start, stop };
