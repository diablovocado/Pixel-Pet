'use strict';
/**
 * bubbles.js — Speech bubble, pinned note, timer, reminder, and agent bubble management
 * Manages DOM element positioning and visibility for all bubble types.
 */

/* global CAT_W, CAT_H */

// DOM element references (set on init)
let $bubble;     // transient speech bubble
let $pinned;     // pinned note
let $timer;      // pomodoro / focus timer
let $agent;      // AI agent status bubble
let $reminder;   // reminder notification bubble

let bubbleTO  = null;
let pinnedText = '';

// ─── Bubble Heights (stacked above cat head) ─────────────────
const BUBBLE_H = 32;  // px per bubble row

function stackY(cat, level) {
  return cat.y - BUBBLE_H * (level + 1) - 6;
}

// ─── Speech Bubble ────────────────────────────────────────────
function showBubble(text, duration = 1600) {
  if (!$bubble) return;
  $bubble.textContent  = text;
  $bubble.style.opacity = '1';
  clearTimeout(bubbleTO);
  bubbleTO = setTimeout(() => { $bubble.style.opacity = '0'; }, duration);
}

function hideBubble() {
  if ($bubble) $bubble.style.opacity = '0';
  clearTimeout(bubbleTO);
}

function isBubbleVisible() {
  return $bubble && $bubble.style.opacity === '1';
}

// ─── Pinned Note ──────────────────────────────────────────────
function setPinnedNote(text) {
  pinnedText = text || '';
  if (!$pinned) return;
  if (pinnedText) {
    $pinned.textContent  = pinnedText;
    $pinned.style.opacity = '1';
  } else {
    $pinned.style.opacity = '0';
  }
}

// ─── Pomodoro Timer Bubble ────────────────────────────────────
let timerEnd   = null;
let timerPaused = false;
let timerRemaining = 0;
let pomodoroPhase = 'focus'; // 'focus' | 'break'

function startTimer(minutes) {
  timerEnd   = Date.now() + minutes * 60_000;
  timerPaused = false;
  timerRemaining = minutes * 60_000;
  pomodoroPhase = 'focus';
  if ($timer) $timer.style.opacity = '1';
  showBubble(`Timer: ${minutes}m started! ⏱`, 2000);
}

function startBreak(minutes) {
  timerEnd   = Date.now() + minutes * 60_000;
  timerPaused = false;
  timerRemaining = minutes * 60_000;
  pomodoroPhase = 'break';
  if ($timer) $timer.style.opacity = '1';
  showBubble(`Break time! ${minutes}m 🌿`, 2500);
}

function pauseTimer() {
  if (!timerEnd) return;
  if (timerPaused) {
    // Resume
    timerEnd = Date.now() + timerRemaining;
    timerPaused = false;
    showBubble('Timer resumed ▶', 1500);
  } else {
    // Pause
    timerRemaining = Math.max(0, timerEnd - Date.now());
    timerPaused = true;
    showBubble('Timer paused ⏸', 1500);
  }
}

function cancelTimer() {
  timerEnd = null;
  timerPaused = false;
  if ($timer) $timer.style.opacity = '0';
  showBubble('Timer cancelled', 1500);
}

// ─── Agent Bubble ─────────────────────────────────────────────
let agentBubbleTO = null;
function showAgentBubble(text, duration = 0) {
  if (!$agent) return;
  $agent.textContent  = text;
  $agent.style.opacity = '1';
  clearTimeout(agentBubbleTO);
  if (duration > 0) {
    agentBubbleTO = setTimeout(() => {
      if ($agent) $agent.style.opacity = '0';
    }, duration);
  }
}
function hideAgentBubble() {
  if ($agent) $agent.style.opacity = '0';
  clearTimeout(agentBubbleTO);
}

// ─── Reminder Bubble ─────────────────────────────────────────
let reminderTO = null;
function showReminderBubble(text, duration = 5000) {
  if (!$reminder) return;
  $reminder.textContent  = text;
  $reminder.style.opacity = '1';
  clearTimeout(reminderTO);
  reminderTO = setTimeout(() => {
    if ($reminder) $reminder.style.opacity = '0';
  }, duration);
}

// ─── Update (called each frame) ───────────────────────────────
function update(cat) {
  const cx = cat.x + CAT_W * 0.5;

  // Count active stacked layers
  let level = 0;

  // Speech bubble (lowest — closest to head)
  if ($bubble) {
    $bubble.style.left = `${cx}px`;
    $bubble.style.top  = `${stackY(cat, level)}px`;
  }
  if (isBubbleVisible()) level++;

  // Pinned note
  if ($pinned && pinnedText) {
    $pinned.style.left = `${cx}px`;
    $pinned.style.top  = `${stackY(cat, level)}px`;
    level++;
  }

  // Timer bubble
  if ($timer && timerEnd !== null) {
    let remaining;
    if (timerPaused) {
      remaining = Math.max(0, Math.ceil(timerRemaining / 1000));
    } else {
      remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
    }

    if (remaining <= 0 && !timerPaused) {
      const onDone = window.onTimerDone;
      timerEnd = null;
      $timer.style.opacity = '0';
      if (onDone) onDone(pomodoroPhase);
    } else {
      const m = Math.floor(remaining / 60).toString().padStart(2, '0');
      const s = (remaining % 60).toString().padStart(2, '0');
      const icon = pomodoroPhase === 'break' ? '🌿' : '⏱';
      const pauseStr = timerPaused ? ' ⏸' : '';
      $timer.textContent  = `${icon} ${m}:${s}${pauseStr}`;
      $timer.style.left   = `${cx}px`;
      $timer.style.top    = `${stackY(cat, level)}px`;
      $timer.style.opacity = '1';
      level++;
    }
  }

  // Agent bubble
  if ($agent && $agent.style.opacity === '1') {
    $agent.style.left = `${cx}px`;
    $agent.style.top  = `${stackY(cat, level)}px`;
    level++;
  }

  // Reminder bubble (top-most)
  if ($reminder && $reminder.style.opacity === '1') {
    $reminder.style.left = `${cx}px`;
    $reminder.style.top  = `${stackY(cat, level)}px`;
  }
}

// ─── Init ────────────────────────────────────────────────────
function init(ids) {
  $bubble   = document.getElementById(ids.bubble   || 'bubble');
  $pinned   = document.getElementById(ids.pinned   || 'pinnedBubble');
  $timer    = document.getElementById(ids.timer    || 'timerBubble');
  $agent    = document.getElementById(ids.agent    || 'agentBubble');
  $reminder = document.getElementById(ids.reminder || 'reminderBubble');
}

window.bubbles = {
  init, update,
  showBubble, hideBubble, isBubbleVisible,
  setPinnedNote,
  startTimer, startBreak, pauseTimer, cancelTimer,
  showAgentBubble, hideAgentBubble,
  showReminderBubble,
  get timerActive() { return timerEnd !== null; },
  get pomodoroPhase() { return pomodoroPhase; },
};
