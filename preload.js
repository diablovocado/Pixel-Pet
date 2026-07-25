const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deskpet', {
  setIgnoreMouseEvents: (ignore, opts) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, opts),

  onActivityTick: (cb) =>
    ipcRenderer.on('activity-tick', (_e, data) => cb(data)),

  onSetVariant: (cb) =>
    ipcRenderer.on('set-variant', (_e, variant) => cb(variant)),
});
