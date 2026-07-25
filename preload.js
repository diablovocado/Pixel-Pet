const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('catAPI', {
  onKeystroke: (cb) =>
    ipcRenderer.on('keystroke', (_e, d) => cb(d)),
});

contextBridge.exposeInMainWorld('deskpet', {
  // Mouse event pass-through
  setIgnoreMouseEvents: (ignore, opts) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, opts),

  // Settings
  saveSettings: (data) =>
    ipcRenderer.send('save-settings', data),

  // ── Incoming events (main → renderer) ──────────────────────
  onInitSettings: (cb) =>
    ipcRenderer.on('init-settings',     (_e, d) => cb(d)),

  onDisplayMetrics: (cb) =>
    ipcRenderer.on('display-metrics',   (_e, d) => cb(d)),

  onSettingsUpdate: (cb) =>
    ipcRenderer.on('settings-update',   (_e, d) => cb(d)),

  onActivityTick: (cb) =>
    ipcRenderer.on('activity-tick',     (_e, d) => cb(d)),

  onTypingUpdate: (cb) =>
    ipcRenderer.on('typing-update',     (_e, d) => cb(d)),

  onAppContextUpdate: (cb) =>
    ipcRenderer.on('app-context-update',(_e, d) => cb(d)),

  onSetVariant: (cb) =>
    ipcRenderer.on('set-variant',       (_e, v) => cb(v)),

  onSetPinnedNote: (cb) =>
    ipcRenderer.on('set-pinned-note',   (_e, t) => cb(t)),

  onStartTimer: (cb) =>
    ipcRenderer.on('start-timer',       (_e, m) => cb(m)),

  onPauseTimer: (cb) =>
    ipcRenderer.on('pause-timer',       ()      => cb()),

  onCancelTimer: (cb) =>
    ipcRenderer.on('cancel-timer',      ()      => cb()),

  onAgentStatus: (cb) =>
    ipcRenderer.on('agent-status',      (_e, d) => cb(d)),

  onFullscreenChange: (cb) =>
    ipcRenderer.on('fullscreen-change', (_e, b) => cb(b)),
});
