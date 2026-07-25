# Pixel Deskpet 🐱 (macOS Native Desktop Pet)

An interactive, responsive pixel-art desktop cat overlay built for macOS using Electron. It sits on top of all windows, reacts live to your typing, mouse speed, and active application context, and features a built-in Pomodoro timer, custom pinned notes, and selectable cat patterns.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher recommended)
```bash
brew install node
```

### Run Locally
```bash
# 1. Clone & enter project
cd /Users/maithilipawar/Project/Pixel-Pet

# 2. Install dependencies
npm install

# 3. Start the desktop pet
npm start
```

---

## 🔒 macOS Permissions & Privacy

Pixel Deskpet requests two macOS system permissions for its interactive features. **Privacy Notice:** All processing happens 100% locally in-memory on your Mac in real time. No keystrokes, window titles, or personal data are ever logged, saved, or transmitted.

### 1. Accessibility Permission (`System Settings > Privacy & Security > Accessibility`)
- **Required for**: Global Keyboard Activity Detection (`node-global-key-listener`).
- **Why**: Allows the deskpet to know when you are actively typing in *any* application (VS Code, browser, terminal) so it can switch to its typing laptop animation and heat up when typing in fast bursts.
- **Privacy Guarantee**: Does **never** log or record key names, characters, or text. Only measures keypress frequency (Keys Per Second / CPS).

### 2. System Events / Automation (`System Settings > Privacy & Security > Automation`)
- **Required for**: Task Awareness & Active App Category Detection.
- **Why**: Allows the deskpet to know whether your frontmost app is a coding tool, web browser, design software, or chat app to display context-aware quips and reactive moods.
- **Privacy Guarantee**: Checked in-memory only. No window contents or document data are inspected.

---

## ✨ Features

- **Crisp Pixel-Art Aesthetic (8-Bit/16-Bit)**: Built with zero anti-aliasing (`SCALE = 7`, hard integer grid pixel snapping).
- **3 Color Patterns / Variants**:
  - **Orange Tabby**: Classic orange fur, dark stripes, cream belly, green eyes.
  - **Black Cat**: Sleek midnight black fur, amber/gold eyes.
  - **Grey Mackerel**: Cool grey fur, dark grey stripes, green eyes.
  - Switchable live via macOS Menu Bar Tray -> `Cat Pattern / Color`.
- **9 Animation States**: `idle`, `walk`, `sit`, `run`, `excited`, `sleep`, `wakeup`, `drag`, `pet`.
- **Global Keyboard Typing Reaction**: Cat sits with a tiny pixel laptop and taps its paws rapidly. Burst typing (>4 CPS) triggers determined eyes `(ò_ó)`, screen heat glow, and spark particles!
- **Dynamic Mouse Speed Reaction**: Fast cursor movements (>270 px/s) trigger sprint/run animation.
- **60-Second Idle Sleep**: After 60 seconds of inactivity, cat lies down to sleep with floating Zzz text/particles. Wakes up immediately upon input.
- **Task Awareness Engine**: Detects active app category (`coding`, `browser`, `design`, `chat`) to display matching quips (*"ship it!"*, *"so many tabs!"*, *"pixel perfect!"*).
- **Pomodoro / Focus Timer**: Built-in 15m, 25m, and 50m timers with a live countdown badge and celebratory heart dance upon completion.
- **Pinned Note / Message Bubble**: Pin custom notes (*"Drink water! 💧"*, *"Focus mode! 🚀"*) above the cat.
- **Full macOS Overlay Window**:
  - `alwaysOnTop` at `'screen-saver'` level (stays on top of all windows and fullscreen apps).
  - Dynamic click-through (`setIgnoreMouseEvents`) everywhere except the cat's own pixel bounds.
  - Full drag-and-drop anywhere on screen.

---

## 💡 How to Extend Task Awareness Behavior Mapping

The Task Awareness Engine is designed to be modular and easy to customize.

### Step 1: Add App Keywords or Categories in [`main.js`](file:///Users/maithilipawar/Project/Pixel-Pet/main.js)
Locate the `APP_CATEGORIES` dictionary in `main.js`:

```javascript
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
  music: [  // 👈 Example: Add a new category!
    'spotify', 'apple music', 'music', 'tidal', 'soundcloud'
  ]
};
```

### Step 2: Add Custom Quips in [`renderer.js`](file:///Users/maithilipawar/Project/Pixel-Pet/renderer.js)
Locate `CONTEXT_QUIPS` in `renderer.js` and add matching quips for your new category:

```javascript
const CONTEXT_QUIPS = {
  coding:  ['coding time!', 'clean syntax!', 'ship it!', 'npm run dev', 'git push~', 'debugging...'],
  browser: ['browsing~', 'so many tabs!', 'finding tuna?', 'web surfing~'],
  design:  ['pixel perfect!', 'nice colors!', 'design time!'],
  chat:    ['meow back?', 'who typed?', 'new message!'],
  music:   ['vibing to beats~', 'groovy cat! 🎵', 'jamming out! 🎧'], // 👈 Add matching category quips!
};
```

---

## 🛠 Technical Architecture & Code Structure

The project is structured into distinct, decoupled modules:

```
Pixel-Pet/
├── main.js       — Electron Main Process
│                   • Window creation (transparent, screen-saver level, click-through)
│                   • System idle polling via powerMonitor.getSystemIdleTime()
│                   • Global cursor velocity tracking via screen.getCursorScreenPoint()
│                   • Global keyboard listener integration (node-global-key-listener)
│                   • macOS Active App Detection (osascript)
│                   • macOS Menu Bar Tray controller (generated pixel-art icon)
│
├── preload.js    — Safe Context Isolation IPC Bridge
│                   • Exposes secure event listeners: onActivityTick, onTypingUpdate,
│                     onAppContextUpdate, onSetVariant, onStartTimer, onSetPinnedNote.
│
├── index.html    — Transparent HTML Stage & Styling
│                   • Dual Canvas setup: catCanvas (sprite) + fxCanvas (particles)
│                   • Pixel font styling (Press Start 2P)
│                   • Speech, Pinned Note, and Timer Pixel Badges
│
└── renderer.js   — Animation, Rendering & Behavior Engine
                    • Canvas Rendering Engine (SCALE = 7, integer grid snapping)
                    • Color Palettes & Variant Engine (tabby, black, grey)
                    • Behavior State Machine (9 states + priority rules)
                    • Particle Engine (hearts, Zzz, sparks)
                    • Eye & Pupil Tracking (binary cursor tracking, 3-frame blinking)
                    • Ear Twitching Engine
```

---

## 📜 License

MIT License
