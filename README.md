# 🐱 Pixel Deskpet

A living pixel-art cat that sits at the bottom of your Mac screen — always on top, click-through everywhere except its own body. Fully original art and code.

---

## Quick Start

```bash
npm install
npm start
```

> **macOS Accessibility permission** is required for keyboard-speed reactions (overheat mode, kneading paws). Without it, everything else works fine.
> 
> **Setup:** System Settings → Privacy & Security → Accessibility → toggle on **Pixel Deskpet**

---

## Feature Overview

### 1. Core Cat & Movement
The cat wanders the bottom of your screen through a randomized behavior loop: **idle → walk → sit → idle**. It breathes (subtle vertical bob), blinks periodically, and twitches its ears. It never looks static.

- **States:** `idle`, `walk`, `sit`, `run`, `excited`, `sleep`, `wakeup`, `drag`, `pet`, `purr`, `hunt`, `scroll`, `agent-thinking`, `agent-done`, `peek`
- Click-through via `setIgnoreMouseEvents` — toggled dynamically based on pixel hit-testing

### 2. Color Patterns
Six palette presets — palette swap, no separate art needed:

| Preset | Description |
|--------|-------------|
| ⬛ Tuxedo (default) | Black with white chest |
| 🟠 Orange Tabby | Warm orange with cream belly |
| 🖤 Black Cat | Deep black with gold eyes |
| 🩶 Grey Mackerel | Cool grey |
| 🤍 Siamese | Cream with cool blue eyes |
| 🌸 Calico | Patchwork orange/cream |

Switch from the **tray menu → Cat Pattern**.

### 3. Cursor Interactions
- **Eye Follow** — pupils binary-snap to track the cursor (authentic pixel-art style)
- **Mochi Drag** — click-drag squashes/stretches the cat toward cursor. Shake the mouse → wobble animation. Release → gravity drop + landing squash with dust particles
- **Mouse Hunt** — fast cursor nearby triggers a pounce-and-chase for ~2s
- **Purring Pets** — hover slowly over the cat's head for ~1s → happy closed-eye purr animation (distinct from click-pet "mew!")

### 4. Keyboard Reactions
Requires macOS Accessibility permission.

- **Kneading** — while typing, cat sits and alternating paws knead a keyboard overlay
- **Overheat Mode** — typing speed (keystrokes/sec) shifts the palette toward red-orange. Steam particle puffs appear above head. Cools 2s after typing slows down.

### 5. Scroll Reaction
Scroll events on the transparent overlay are captured and forwarded. While scrolling: cat sits and "unrolls" a tiny paper scroll with its paws. After 1s of no scrolling, the scroll rolls back up.

### 6. Reminders & Timers

#### Pomodoro Timer
Start from **Tray → Pomodoro**. On focus end: celebration animation → auto-starts break timer → on break end: prompts next focus.

#### Stretch Reminder (default: every 45min)
Cat grows to 1.4× scale performing a stretch, then shrinks back. Bubble: `"Hey {name}! Time to stretch! 🧘"`

#### Drink Water Reminder (default: every 60min)
Water-drop particle burst + bubble: `"Hey {name}! Drink some water! 💧"`

#### Custom Message Reminders
Schedule one-off or recurring messages via **Tray → Reminders → Schedule Message Reminder**. Use `{name}` in the message text for personalization.

#### Pinned Note
**Tray → Pinned Note** — a persistent note above the cat's head until you clear it.

#### Your Name
**Tray → Set Your Name** — stored locally, used in all reminder messages.

### 7. AI Agent Awareness (Claude Code)
Detects when Claude Code CLI (`claude` process) is running:

- **Thinking** — high CPU → cat shows spiral `⊙_⊙` expression + `"thinking..."` bubble
- **Done** — CPU drops → cat does a happy hop + `"mew! ✓"` + hearts

**Pluggable module** — see `src/main/agentWatcher.js` for the plugin interface. To add a new agent: add a plugin object to `PLUGINS` with `detect()` and `getStatus()` methods. No rendering code changes needed.

Switch agents from **Tray → AI Agent**.

### 8. System Awareness
- **Sleep** — after 60s idle (`powerMonitor.getSystemIdleTime()`), cat falls asleep with Zzz particles. Wakes on any input.
- **Peek Mode** — when any app goes full-screen, cat slides to the screen edge showing just ears. Reminders still fire. Returns to normal when full-screen ends.

---

## macOS Permissions

| Permission | Feature | Required? |
|-----------|---------|-----------|
| **Accessibility** | Global keyboard listener (typing speed / overheat) | Strongly recommended |
| **Automation** | App-context polling via AppleScript | Granted on first run prompt |
| None | Mouse position, idle time, sleep detection | ✅ Built into Electron |

---

## Project Structure

```
pixel-pet/
├── main.js                    # Entry point — thin orchestrator
├── preload.js                 # IPC bridge (renderer ↔ main)
├── renderer.js                # Boot + main rAF loop
├── index.html                 # DOM skeleton
│
├── src/
│   ├── main/
│   │   ├── settings.js        # Persistent config (~/.config/pixel-pet/settings.json)
│   │   ├── polling.js         # Mouse/idle polling (powerMonitor)
│   │   ├── keyboard.js        # Global keyboard listener (defensive wrapper)
│   │   ├── tray.js            # Tray icon + full context menu
│   │   ├── agentWatcher.js    # AI agent process watcher (pluggable)
│   │   └── fullscreenWatcher.js  # Full-screen / peek mode detection
│   │
│   └── renderer/
│       ├── state.js           # Shared cat state object (window.CAT_STATE)
│       ├── variants.js        # Color palettes + real-time heat tinting
│       ├── particles.js       # Hearts, Zzz, sparks, steam, water, dust
│       ├── bubbles.js         # All bubble DOM management (speech/timer/agent/reminder)
│       ├── sprite.js          # drawCat() + kneading paws + paper scroll + hit-test
│       ├── behavior.js        # State machine (enterAction, updateBehavior)
│       ├── interactions.js    # Mochi drag, hunt, purr, scroll, click-through
│       ├── reminders.js       # Pomodoro, stretch, water, message timers
│       └── agentDisplay.js    # Bridges agent IPC events → behavior states
│
└── assets/
    └── pepperino_cropped.png  # Base sprite (original pixel art)
```

### Adding a New AI Agent Plugin

1. Open `src/main/agentWatcher.js`
2. Add a new entry to the `PLUGINS` object:
```js
'my-agent': {
  name: 'my-agent',
  detect() {
    return new Promise(resolve => {
      exec("pgrep -l my-agent-binary", (err, stdout) => {
        resolve(!err && stdout.trim().length > 0);
      });
    });
  },
  getStatus() {
    return new Promise(resolve => {
      exec("ps -eo comm,pcpu | grep my-agent | awk '{sum+=$2} END{print sum+0}'",
        (err, stdout) => {
          resolve((parseFloat(stdout)||0) > 3.0 ? 'thinking' : 'done');
        });
    });
  }
},
```
3. Select it from **Tray → AI Agent**. No other changes needed.

---

## Settings File

Located at `~/.config/pixel-pet/settings.json`. Safe to edit manually.

```json
{
  "name": "Your Name",
  "variant": "tabby",
  "pinnedNote": "",
  "agentTool": "claude-code",
  "pomodoro": { "focusMinutes": 25, "breakMinutes": 5 },
  "reminders": {
    "stretch":  { "enabled": true, "intervalMins": 45 },
    "water":    { "enabled": true, "intervalMins": 60 },
    "messages": []
  }
}
```

---

## Tray Menu Reference

| Item | Action |
|------|--------|
| Hide / Show Cat | Toggle visibility |
| Cat Pattern | Switch color preset |
| Set Your Name | Opens name input (stored locally) |
| Pinned Note | Set or clear persistent note |
| Pomodoro | Start/pause/cancel focus timer |
| Reminders | Toggle stretch/water, schedule messages |
| AI Agent | Switch which CLI tool to watch |
| Quit | Exit app |

---

*Original app — all art and code created for this project.*
