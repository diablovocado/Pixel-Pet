'use strict';
/**
 * tray.js — Tray icon + context menu builder
 * Separates tray management from main.js entirely.
 */

const { Menu, Tray, nativeImage, dialog, ipcMain } = require('electron');
const path     = require('path');
const settings = require('./settings');

let tray           = null;
let win            = null;
let isCatVisible   = true;
let callbacks      = {};

// ─── Tray Icon (programmatic, no external file needed) ─────────────────────
function buildTrayIcon() {
  const S   = 44;
  const buf = Buffer.alloc(S * S * 4, 0);

  const sp = (x, y, r, g, b, a = 255) => {
    if (x < 0 || x >= S || y < 0 || y >= S) return;
    const i = (y * S + x) * 4;
    buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = a;
  };
  const fr = (x, y, w, h, r, g, b, a = 255) => {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        sp(x+dx, y+dy, r, g, b, a);
  };

  const cx = 22, cy = 24, R = 17;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d < R)          { const i=(y*S+x)*4; buf[i]=224;buf[i+1]=120;buf[i+2]=48; buf[i+3]=255; }
      else if (d < R+1.8) { const i=(y*S+x)*4; buf[i]=29; buf[i+1]=18; buf[i+2]=12; buf[i+3]=200; }
    }

  fr(8, 3, 10, 13, 29, 18, 12);  fr(10, 5,  6, 10, 224, 120, 48); fr(11, 6, 4, 8, 224, 112, 128);
  fr(26, 3, 10, 13, 29, 18, 12); fr(28, 5,  6, 10, 224, 120, 48); fr(29, 6, 4, 8, 224, 112, 128);
  fr(13, 20, 6, 5, 58, 112, 64); fr(25, 20, 6, 5, 58, 112, 64);
  fr(14, 21, 4, 3, 29, 18, 12);  fr(26, 21, 4, 3, 29, 18, 12);
  fr(13, 20, 2, 2, 255, 255, 255); fr(25, 20, 2, 2, 255, 255, 255);
  fr(19, 28, 6, 4, 224, 112, 128);

  return nativeImage.createFromBuffer(buf, { width: S, height: S, scaleFactor: 2 });
}

// ─── Name Prompt ────────────────────────────────────────────────────────────
async function promptName() {
  const cfg  = settings.get();
  // Use an input dialog via a small HTML window (Electron dialog doesn't support text input)
  // We use showMessageBox with field simulation via prompt in renderer instead.
  // Simple approach: use child BrowserWindow with a form.
  const { BrowserWindow } = require('electron');
  const inputWin = new BrowserWindow({
    width: 380, height: 200,
    resizable: false,
    title: 'Set Your Name',
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    alwaysOnTop: true,
    modal: false,
  });

  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body { font-family: monospace; background: #1a0e09; color: #fdf6ec;
             display: flex; flex-direction: column; align-items: center;
             justify-content: center; height: 100vh; margin: 0; gap: 14px; }
      h3   { margin: 0; font-size: 14px; }
      input { background: #2a1e14; color: #fdf6ec; border: 2px solid #a06800;
              padding: 8px 12px; font-size: 14px; border-radius: 4px; width: 240px; }
      button { background: #a06800; color: #fff; border: none; padding: 8px 20px;
               font-size: 13px; border-radius: 4px; cursor: pointer; }
      button:hover { background: #c08010; }
    </style></head><body>
    <h3>🐱 What's your name?</h3>
    <input id="n" type="text" placeholder="Enter your name..." value="${cfg.name || ''}" maxlength="30" autofocus/>
    <button onclick="save()">Save</button>
    <script>
      const { ipcRenderer } = require('electron');
      document.getElementById('n').focus();
      document.getElementById('n').addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
      function save() {
        ipcRenderer.send('name-input-result', document.getElementById('n').value.trim());
        window.close();
      }
    </script></body></html>`;

  inputWin.loadURL(`data:text/html,${encodeURIComponent(html)}`);
  inputWin.setMenuBarVisibility(false);

  ipcMain.once('name-input-result', (_e, name) => {
    settings.set('name', name);
    win?.webContents.send('settings-update', settings.get());
    buildMenu();
  });
}

// ─── Quick Note Prompt ───────────────────────────────────────────────────────
async function promptCustomNote() {
  const presets = ['Drink water! 💧', 'Focus mode! 🚀', 'Take a break! 🧘', 'Ship it! 🚢', 'Cancel'];
  const { response } = await dialog.showMessageBox({
    type: 'question',
    buttons: presets,
    title: 'Pinned Note',
    message: 'Pin a note above your cat:',
  });
  if (response < presets.length - 1) {
    const note = presets[response];
    settings.set('pinnedNote', note);
    win?.webContents.send('set-pinned-note', note);
  }
}

async function promptCustomMessage() {
  const { BrowserWindow } = require('electron');
  const inputWin = new BrowserWindow({
    width: 420, height: 260,
    resizable: false, title: 'Schedule Reminder',
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    alwaysOnTop: true,
  });

  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body { font-family: monospace; background: #1a0e09; color: #fdf6ec;
             display: flex; flex-direction: column; align-items: center;
             justify-content: center; height: 100vh; margin: 0; gap: 10px; padding: 20px; box-sizing: border-box; }
      h3 { margin: 0; font-size: 13px; }
      input, select { background: #2a1e14; color: #fdf6ec; border: 2px solid #a06800;
              padding: 6px 10px; font-size: 13px; border-radius: 4px; width: 280px; }
      label { font-size: 11px; align-self: flex-start; margin-left: calc(50% - 140px); }
      button { background: #a06800; color: #fff; border: none; padding: 8px 20px;
               font-size: 13px; border-radius: 4px; cursor: pointer; margin-top: 6px; }
    </style></head><body>
    <h3>⏰ Schedule a Reminder</h3>
    <label>Message text:</label>
    <input id="msg" type="text" placeholder="Time to stretch!" maxlength="60"/>
    <label>Repeat every (minutes, 0 = one-off):</label>
    <input id="mins" type="number" value="60" min="0" max="1440"/>
    <button onclick="save()">Schedule</button>
    <script>
      const { ipcRenderer } = require('electron');
      document.getElementById('msg').focus();
      function save() {
        const text = document.getElementById('msg').value.trim();
        const mins = parseInt(document.getElementById('mins').value) || 0;
        if (!text) return;
        ipcRenderer.send('schedule-reminder-result', { text, intervalMins: mins });
        window.close();
      }
    </script></body></html>`;

  inputWin.loadURL(`data:text/html,${encodeURIComponent(html)}`);
  inputWin.setMenuBarVisibility(false);

  ipcMain.once('schedule-reminder-result', (_e, data) => {
    const cfg = settings.get();
    cfg.reminders.messages.push({ ...data, enabled: true, lastFired: 0 });
    settings.save();
    win?.webContents.send('settings-update', cfg);
  });
}

// ─── Menu Builder ────────────────────────────────────────────────────────────
function buildMenu() {
  if (!tray) return;
  const cfg  = settings.get();
  const name = cfg.name ? ` (${cfg.name})` : '';

  const VARIANTS = ['pepperino', 'tabby', 'black', 'grey', 'siamese', 'calico'];

  const menu = Menu.buildFromTemplate([
    { label: `🐱 Pixel Deskpet${name}`, enabled: false },
    { type: 'separator' },

    {
      label: isCatVisible ? 'Hide Cat' : 'Show Cat',
      click: () => {
        isCatVisible = !isCatVisible;
        if (win && !win.isDestroyed()) isCatVisible ? win.show() : win.hide();
        buildMenu();
      }
    },

    { type: 'separator' },
    { label: '🎨 Cat Pattern', submenu: VARIANTS.map(v => ({
      label: { pepperino:'⬛ Tuxedo', tabby:'🟠 Orange Tabby', black:'🖤 Black Cat',
               grey:'🩶 Grey Mackerel', siamese:'🤍 Siamese', calico:'🌸 Calico' }[v] || v,
      type: 'radio',
      checked: cfg.variant === v,
      click: () => {
        settings.set('variant', v);
        win?.webContents.send('set-variant', v);
        buildMenu();
      }
    }))},

    { type: 'separator' },
    { label: '👤 Set Your Name...', click: () => promptName() },

    { type: 'separator' },
    { label: '📌 Pinned Note', submenu: [
      { label: 'Set Quick Note...', click: () => promptCustomNote() },
      { label: 'Clear Note',        click: () => {
        settings.set('pinnedNote', '');
        win?.webContents.send('set-pinned-note', '');
      }},
    ]},

    { type: 'separator' },
    { label: '⏱ Pomodoro', submenu: [
      { label: `Start ${cfg.pomodoro.focusMinutes}m Focus`,  click: () => win?.webContents.send('start-timer', cfg.pomodoro.focusMinutes) },
      { label: 'Start 15m Quick Focus',  click: () => win?.webContents.send('start-timer', 15) },
      { label: 'Start 50m Deep Work',    click: () => win?.webContents.send('start-timer', 50) },
      { type: 'separator' },
      { label: 'Pause / Resume',  click: () => win?.webContents.send('pause-timer') },
      { label: 'Cancel Timer',    click: () => win?.webContents.send('cancel-timer') },
    ]},

    { type: 'separator' },
    { label: '🔔 Reminders', submenu: [
      {
        label: `Stretch every ${cfg.reminders.stretch.intervalMins}m`,
        type: 'checkbox', checked: cfg.reminders.stretch.enabled,
        click: (mi) => {
          settings.setNested('reminders.stretch.enabled', mi.checked);
          win?.webContents.send('settings-update', settings.get());
        }
      },
      {
        label: `Drink Water every ${cfg.reminders.water.intervalMins}m`,
        type: 'checkbox', checked: cfg.reminders.water.enabled,
        click: (mi) => {
          settings.setNested('reminders.water.enabled', mi.checked);
          win?.webContents.send('settings-update', settings.get());
        }
      },
      { type: 'separator' },
      { label: 'Schedule Message Reminder...', click: () => promptCustomMessage() },
      { label: 'Clear All Message Reminders', click: () => {
        settings.setNested('reminders.messages', []);
        win?.webContents.send('settings-update', settings.get());
      }},
    ]},

    { type: 'separator' },
    { label: '🤖 AI Agent', submenu: [
      { label: 'Claude Code',  type: 'radio', checked: cfg.agentTool === 'claude-code',  click: () => { settings.set('agentTool', 'claude-code');  win?.webContents.send('settings-update', settings.get()); callbacks.onAgentToolChange?.('claude-code'); } },
      { label: 'Gemini CLI',   type: 'radio', checked: cfg.agentTool === 'gemini-cli',   click: () => { settings.set('agentTool', 'gemini-cli');   win?.webContents.send('settings-update', settings.get()); callbacks.onAgentToolChange?.('gemini-cli'); } },
      { label: 'Aider',        type: 'radio', checked: cfg.agentTool === 'aider',         click: () => { settings.set('agentTool', 'aider');        win?.webContents.send('settings-update', settings.get()); callbacks.onAgentToolChange?.('aider'); } },
      { label: 'Disabled',     type: 'radio', checked: cfg.agentTool === 'none',          click: () => { settings.set('agentTool', 'none');         win?.webContents.send('settings-update', settings.get()); callbacks.onAgentToolChange?.('none'); } },
    ]},

    { type: 'separator' },
    { label: 'Quit', accelerator: 'Cmd+Q', click: () => require('electron').app.quit() },
  ]);

  tray.setContextMenu(menu);
}

// ─── Init ────────────────────────────────────────────────────────────────────
function init(browserWin, cbs = {}) {
  win       = browserWin;
  callbacks = cbs;

  let icon;
  try   { icon = buildTrayIcon(); }
  catch { icon = nativeImage.createFromPath(path.join(__dirname, '../../assets/tray-icon.png')); }

  tray = new Tray(icon);
  tray.setToolTip('Pixel Deskpet 🐱');
  buildMenu();
}

module.exports = { init, buildMenu };
