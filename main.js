'use strict';
/**
 * main.js — Pixel Deskpet entry point
 * Thin orchestrator: creates window, delegates to src/main/ modules.
 */

// Polyfill for node-global-key-listener (uses removed Node.util legacy methods)
const _util = require('util');
if (!_util.isObject)   _util.isObject   = (v) => v !== null && typeof v === 'object';
if (!_util.isFunction) _util.isFunction = (v) => typeof v === 'function';
if (!_util.isString)   _util.isString   = (v) => typeof v === 'string';
if (!_util.isNumber)   _util.isNumber   = (v) => typeof v === 'number';
if (!_util.isBoolean)  _util.isBoolean  = (v) => typeof v === 'boolean';

const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

const settings          = require('./src/main/settings');
const polling           = require('./src/main/polling');
const keyboard          = require('./src/main/keyboard');
const tray              = require('./src/main/tray');
const agentWatcher      = require('./src/main/agentWatcher');
const fullscreenWatcher = require('./src/main/fullscreenWatcher');

const { exec } = require('child_process');

let win;

// ─── Window ──────────────────────────────────────────────────
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x: wx, y: wy, width, height } = primaryDisplay.bounds;

  win = new BrowserWindow({
    x: wx, y: wy,
    width, height,
    transparent:     true,
    frame:           false,
    resizable:       false,
    movable:         false,
    hasShadow:       false,
    skipTaskbar:     true,
    focusable:       false,
    fullscreenable:  false,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.setBounds({ x: wx, y: wy, width, height });
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile('index.html');
  win.show();
  win.showInactive();

  function getMetrics() {
    const primary = screen.getPrimaryDisplay();
    const bounds = primary.bounds;
    const workArea = primary.workArea;
    const bottomInset = Math.max(0, bounds.height - (workArea.y + workArea.height));
    return { bounds, workArea, bottomInset };
  }

  win.webContents.on('did-finish-load', () => {
    const cfg = settings.load();

    win.webContents.send('init-settings', cfg);
    win.webContents.send('display-metrics', getMetrics());

    // Start activity polling
    polling.start(win, (data) => {
      if (win && !win.isDestroyed()) win.webContents.send('activity-tick', data);
    });

    // Start global keyboard listener
    keyboard.start(
      (data) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('typing-update', data);
          win.webContents.send('keystroke', data);
          win.webContents.send('global-keydown');
          win.webContents.send('kps-update', data.cps);
        }
      },
      (data) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('typing-update', data);
          win.webContents.send('kps-update', 0);
        }
      }
    );

    // Start app context polling
    startAppPolling();

    // Start AI agent watcher
    const agentTool = cfg.agentTool || 'claude-code';
    if (agentTool !== 'none') {
      agentWatcher.start(agentTool, (statusData) => {
        if (win && !win.isDestroyed()) win.webContents.send('agent-status', statusData);
      });
    }

    // Start fullscreen watcher
    fullscreenWatcher.start(win, (isFullscreen) => {
      if (win && !win.isDestroyed()) win.webContents.send('fullscreen-change', isFullscreen);
    });
  });

  screen.on('display-metrics-changed', () => {
    if (!win || win.isDestroyed()) return;
    const m = getMetrics();
    win.setBounds(m.bounds);
    win.webContents.send('display-metrics', m);
  });
}

// ─── App Context Polling ──────────────────────────────────────
const APP_CATEGORIES = {
  coding:  ['code', 'vscode', 'visual studio code', 'cursor', 'xcode', 'terminal',
             'iterm', 'iterm2', 'antigravity', 'webstorm', 'pycharm', 'sublime text',
             'intellij idea', 'ghostty', 'warp', 'neovim', 'vim', 'electron'],
  browser: ['safari', 'google chrome', 'chrome', 'firefox', 'arc', 'brave browser',
             'orion', 'opera', 'edge', 'microsoft edge'],
  design:  ['figma', 'adobe photoshop', 'photoshop', 'illustrator', 'sketch', 'canva', 'blender'],
  chat:    ['slack', 'discord', 'telegram', 'whatsapp', 'messages', 'signal'],
};

function getCategoryForApp(name) {
  if (!name) return 'default';
  const n = name.toLowerCase();
  for (const [cat, list] of Object.entries(APP_CATEGORIES)) {
    if (list.some(k => n.includes(k))) return cat;
  }
  return 'default';
}

let appPollInterval = null;
let lastAppName     = '', lastCategory = '';

function startAppPolling() {
  if (appPollInterval) clearInterval(appPollInterval);
  appPollInterval = setInterval(() => {
    if (!win || win.isDestroyed()) return;
    exec(`osascript -e 'tell application "System Events" to get name of first process whose frontmost is true'`,
      { timeout: 1500, maxBuffer: 1024 * 64 }, (err, stdout) => {
        if (!err && stdout) {
          const appName  = stdout.trim();
          const category = getCategoryForApp(appName);
          if (appName !== lastAppName || category !== lastCategory) {
            lastAppName = appName; lastCategory = category;
            win.webContents.send('app-context-update', { appName, category });
          }
        }
      });
  }, 5000);
}

// ─── IPC ─────────────────────────────────────────────────────
ipcMain.on('set-ignore-mouse-events', (_, ignore, opts) => {
  if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(ignore, opts);
});

ipcMain.on('save-settings', (_, data) => {
  settings.load();
  Object.assign(settings.get(), data);
  settings.save();
});

ipcMain.on('restart-agent-watcher', (_, toolName) => {
  agentWatcher.stop();
  if (toolName !== 'none') {
    agentWatcher.start(toolName, (statusData) => {
      if (win && !win.isDestroyed()) win.webContents.send('agent-status', statusData);
    });
  }
});

// ─── Tray ────────────────────────────────────────────────────
function initTray() {
  tray.init(win, {
    onAgentToolChange: (toolName) => {
      ipcMain.emit('restart-agent-watcher', {}, toolName);
    }
  });
}

// ─── Lifecycle ───────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  initTray();
  app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) createWindow();
  });
});

app.on('window-all-closed', () => {
  polling.stop();
  keyboard.stop();
  agentWatcher.stop();
  fullscreenWatcher.stop();
  if (appPollInterval) clearInterval(appPollInterval);
  app.quit();
});

process.on('unhandledRejection', (reason) => {
  console.warn('[main] Unhandled rejection:', reason?.message || reason);
});
