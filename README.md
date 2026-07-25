# Pixel Deskpet 🐱

A tiny pixel-art cat that lives at the bottom of your Mac screen — walks around, sits, blinks,
watches your cursor, and can be picked up and dragged.

## Setup (Mac, one-time)

You need [Node.js](https://nodejs.org) installed. If you don't have it:

```bash
brew install node
```

Then, in this project folder:

```bash
npm install
npm start
```

The cat should appear walking along the bottom of your screen, on top of everything else.

## What it does right now

- Walks left/right along the bottom of your screen, pauses to idle or sit
- Blinks, sways its tail, has a little walk-cycle
- Eyes track your cursor when you're nearby
- Click it → heart eyes + a "mew!" speech bubble
- Click-and-drag it → pick it up and move it anywhere along the bottom strip
- Lives in your menu bar (tray icon) with a Quit option
- Fully click-through everywhere except the cat itself, so it never blocks your work

## Ideas for what to add next

- A real walk-cycle sprite sheet instead of procedural pixel art
- Pomodoro / focus timer bubble like Comnyang's
- Reacting to typing speed or specific apps in focus
- Multiple color patterns (orange tabby / black / siamese / grey) picked from a settings menu
- Sound effects (meows) on click
- Auto-launch on login

## Packaging as a real .app (later)

Once you're happy with it, `electron-builder` or `electron-forge` can package this into a
double-clickable `.app` you can drag into Applications, instead of running it via `npm start`
every time. Ask me when you're ready and I'll set that up.

## Project structure

```
main.js       — Electron main process (window, tray, click-through logic)
preload.js    — safe bridge between main process and the page
index.html    — the transparent page that hosts the cat
renderer.js   — the cat itself: pixel art drawing, animation, AI/behavior, drag handling
assets/       — tray icon
```
