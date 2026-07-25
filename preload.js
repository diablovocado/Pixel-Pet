const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deskpet', {
  setIgnoreMouseEvents: (ignore, opts) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, opts),

  onActivityTick: (cb) =>
    ipcRenderer.on('activity-tick', (_e, data) => cb(data)),

  onSetVariant: (cb) =>
    ipcRenderer.on('set-variant', (_e, variant) => cb(variant)),

  onTypingUpdate: (cb) =>
    ipcRenderer.on('typing-update', (_e, data) => cb(data)),

  onAppContextUpdate: (cb) =>
    ipcRenderer.on('app-context-update', (_e, data) => cb(data)),
});
