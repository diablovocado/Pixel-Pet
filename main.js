const { app, BrowserWindow, screen, ipcMain, Menu, Tray } = require('electron');
const path = require('path');

let win;
let tray;

const PET_HEIGHT = 220; // height of the transparent strip along the bottom of the screen

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const { x: dx, y: dy } = primaryDisplay.workArea;

  win = new BrowserWindow({
    width,
    height: PET_HEIGHT,
    x: dx,
    y: dy + height - PET_HEIGHT,
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

  // Keep pinned to the bottom of the screen if the display changes
  screen.on('display-metrics-changed', repositionWindow);
}

function repositionWindow() {
  if (!win) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const { x: dx, y: dy } = primaryDisplay.workArea;
  win.setBounds({ width, height: PET_HEIGHT, x: dx, y: dy + height - PET_HEIGHT });
}

// Renderer tells us whether the mouse is currently over an opaque (cat) pixel.
// When it is, we accept mouse events (so dragging/clicking works).
// When it isn't, we forward events through to whatever is beneath the window.
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  if (!win) return;
  win.setIgnoreMouseEvents(ignore, options);
});

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'));
  const menu = Menu.buildFromTemplate([
    { label: 'Pixel Deskpet', enabled: false },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setToolTip('Pixel Deskpet');
  tray.setContextMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
