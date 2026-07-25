'use strict';
const { app, BrowserWindow, screen, ipcMain, Menu, Tray, powerMonitor, nativeImage } = require('electron');
const path = require('path');

let win, tray;
let pollInterval = null;
let lastCX = 0, lastCY = 0, lastPoll = Date.now(), lastIdle = 999;

// ─── Window ────────────────────────────────────────────
function createWindow() {
  const { x: wx, y: wy, width, height } = screen.getPrimaryDisplay().workArea;

  win = new BrowserWindow({
    x: wx, y: wy,
    width, height,          // full-screen transparent overlay
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    hasShadow: false,
    skipTaskbar: true,
    focusable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile('index.html');
  win.webContents.on('did-finish-load', () => {
    startPolling();
    initKeyboardListener();
    startAppPolling();
  });
  screen.on('display-metrics-changed', reposition);
}

function reposition() {
  if (!win || win.isDestroyed()) return;
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  win.setBounds({ x, y, width, height });
}

// ─── Task / App Awareness Engine (Modular Category Mapping) ───
const { exec } = require('child_process');

const APP_CATEGORIES = {
  coding: [
    'code', 'vscode', 'visual studio code', 'cursor', 'xcode', 'terminal',
    'iterm', 'iterm2', 'antigravity', 'webstorm', 'pycharm', 'sublime text',
    'intellij idea', 'ghostty', 'warp', 'neovim', 'vim', 'electron'
  ],
  browser: [
    'safari', 'google chrome', 'chrome', 'firefox', 'arc', 'brave browser',
    'orion', 'opera', 'edge', 'microsoft edge'
  ],
  design: [
    'figma', 'adobe photoshop', 'photoshop', 'illustrator', 'sketch', 'canva', 'blender'
  ],
  chat: [
    'slack', 'discord', 'telegram', 'whatsapp', 'messages', 'signal'
  ]
};

function getCategoryForApp(appName) {
  if (!appName) return 'default';
  const name = appName.toLowerCase();
  for (const [cat, list] of Object.entries(APP_CATEGORIES)) {
    if (list.some(keyword => name.includes(keyword))) {
      return cat;
    }
  }
  return 'default';
}

let appPollInterval = null;
let lastAppName = '';
let lastCategory = '';

function startAppPolling() {
  if (appPollInterval) clearInterval(appPollInterval);
  appPollInterval = setInterval(() => {
    if (!win || win.isDestroyed()) return;
    exec(`osascript -e 'tell application "System Events" to get name of first process whose frontmost is true'`, (err, stdout) => {
      if (!err && stdout) {
        const appName = stdout.trim();
        const category = getCategoryForApp(appName);
        if (appName !== lastAppName || category !== lastCategory) {
          lastAppName = appName;
          lastCategory = category;
          win.webContents.send('app-context-update', { appName, category });
        }
      }
    });
  }, 2500);
}

process.on('unhandledRejection', () => {
  // Graceful fallback: powerMonitor activity polling drives typing state if native hooks are restricted
});

function initKeyboardListener() {
  try {
    const { GlobalKeyboardListener } = require('node-global-key-listener');
    keyListener = new GlobalKeyboardListener();
    keyListener.addListener((e) => {
      if (e.state === 'DOWN') {
        const now = Date.now();
        keyTimestamps.push(now);
        // keep timestamps from the last 1000ms
        keyTimestamps = keyTimestamps.filter(t => now - t <= 1000);
        const cps = keyTimestamps.length;
        const isFast = cps >= 4;

        if (win && !win.isDestroyed()) {
          win.webContents.send('typing-update', { isTyping: true, cps, isFast });
        }

        clearTimeout(typingCooldownTimer);
        typingCooldownTimer = setTimeout(() => {
          keyTimestamps = [];
          if (win && !win.isDestroyed()) {
            win.webContents.send('typing-update', { isTyping: false, cps: 0, isFast: false });
          }
        }, 1400);
      }
    });
  } catch (err) {
    console.log('Global key listener initialized with fallback polling');
  }
}

// ─── Activity Polling ──────────────────────────────────
// Uses powerMonitor.getSystemIdleTime() for TRUE global idle/typing detection
// and screen.getCursorScreenPoint() for global mouse speed tracking.
// No native addons required.
function startPolling() {
  if (pollInterval) clearInterval(pollInterval);

  const { x: wx, y: wy } = screen.getPrimaryDisplay().workArea;

  pollInterval = setInterval(() => {
    if (!win || win.isDestroyed()) return;

    const now = Date.now();
    const cur = screen.getCursorScreenPoint();
    const dt  = Math.max(1, now - lastPoll);

    const dist = Math.hypot(cur.x - lastCX, cur.y - lastCY);
    const mouseSpeed = (dist / dt) * 1000; // px/s

    const idleSeconds = powerMonitor.getSystemIdleTime();

    // likelyTyping: idle time just dropped while cursor barely moved
    // = user pressed a key in another app
    const likelyTyping = lastIdle > 0.7 && idleSeconds < 0.4 && dist < 8;

    lastCX = cur.x; lastCY = cur.y;
    lastPoll = now;  lastIdle = idleSeconds;

    // Convert screen → window client coordinates
    win.webContents.send('activity-tick', {
      cursorX:      cur.x - wx,
      cursorY:      cur.y - wy,
      mouseSpeed,
      idleSeconds,
      likelyTyping,
    });
  }, 50);
}

// ─── IPC ───────────────────────────────────────────────
ipcMain.on('set-ignore-mouse-events', (_, ignore, opts) => {
  if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(ignore, opts);
});

// ─── Tray Icon (generated in-process, no extra deps) ───
function buildTrayIcon() {
  const S = 44; // 22pt @2x retina
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

  // Orange face circle
  const cx = 22, cy = 24, R = 17;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d < R)           { const i=(y*S+x)*4; buf[i]=224;buf[i+1]=120;buf[i+2]=48; buf[i+3]=255; }
      else if (d < R+1.8)  { const i=(y*S+x)*4; buf[i]=29; buf[i+1]=18; buf[i+2]=12; buf[i+3]=200; }
    }
  }

  // Left ear (outline + fill)
  fr(8, 3, 10, 13, 29, 18, 12);
  fr(10, 5, 6,  10, 224, 120, 48);
  fr(11, 6, 4,   8, 224, 112, 128); // pink inner

  // Right ear
  fr(26, 3, 10, 13, 29, 18, 12);
  fr(28, 5,  6, 10, 224, 120, 48);
  fr(29, 6,  4,  8, 224, 112, 128);

  // Eyes (green iris + dark pupil + shine)
  fr(13, 20, 6, 5, 58, 112, 64);
  fr(25, 20, 6, 5, 58, 112, 64);
  fr(14, 21, 4, 3, 29, 18, 12);
  fr(26, 21, 4, 3, 29, 18, 12);
  fr(13, 20, 2, 2, 255, 255, 255); // shine
  fr(25, 20, 2, 2, 255, 255, 255);

  // Nose
  fr(19, 28, 6, 4, 224, 112, 128);

  return nativeImage.createFromBuffer(buf, { width: S, height: S, scaleFactor: 2 });
}

let isCatVisible = true;
let activeVariantName = 'tabby';

function selectVariant(name) {
  activeVariantName = name;
  win?.webContents.send('set-variant', name);
  updateTrayMenu();
}

function promptCustomNote() {
  const options = ['Drink water! 💧', 'Focus mode! 🚀', 'Take a break! 🧘', 'Cancel'];
  const { dialog } = require('electron');
  dialog.showMessageBox({
    type: 'question',
    buttons: options,
    title: 'Pinned Note / Message',
    message: 'Select a pinned note to display above your deskpet:'
  }).then(res => {
    const idx = res.response;
    if (idx < 3) {
      win?.webContents.send('set-pinned-note', options[idx]);
    }
  });
}

function createTray() {
  let icon;
  try {
    icon = buildTrayIcon();
  } catch {
    icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray-icon.png'));
  }
  tray = new Tray(icon);
  tray.setToolTip('Pixel Deskpet');
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    { label: '🐱 Pixel Deskpet', enabled: false },
    { type: 'separator' },
    {
      label: isCatVisible ? 'Hide Deskpet' : 'Show Deskpet',
      click: () => {
        isCatVisible = !isCatVisible;
        if (win && !win.isDestroyed()) {
          isCatVisible ? win.show() : win.hide();
        }
        updateTrayMenu();
      }
    },
    { type: 'separator' },
    {
      label: 'Focus / Pomodoro Timer',
      submenu: [
        { label: 'Start 25m Focus', click: () => win?.webContents.send('start-timer', 25) },
        { label: 'Start 15m Short Focus', click: () => win?.webContents.send('start-timer', 15) },
        { label: 'Start 50m Deep Work', click: () => win?.webContents.send('start-timer', 50) },
        { type: 'separator' },
        { label: 'Cancel Timer', click: () => win?.webContents.send('cancel-timer') },
      ]
    },
    {
      label: 'Pinned Note / Message',
      submenu: [
        { label: 'Set Quick Note...', click: () => promptCustomNote() },
        { label: 'Clear Note', click: () => win?.webContents.send('set-pinned-note', '') }
      ]
    },
    {
      label: 'Cat Pattern / Color',
      submenu: [
        { label: 'Orange Tabby', type: 'radio', checked: activeVariantName === 'tabby', click: () => selectVariant('tabby') },
        { label: 'Black Cat', type: 'radio', checked: activeVariantName === 'black', click: () => selectVariant('black') },
        { label: 'Grey Mackerel', type: 'radio', checked: activeVariantName === 'grey', click: () => selectVariant('grey') },
      ]
    },
    { type: 'separator' },
    { label: 'Quit', accelerator: 'Cmd+Q', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

// ─── Lifecycle ─────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});

app.on('window-all-closed', () => {
  clearInterval(pollInterval);
  app.quit();
});
