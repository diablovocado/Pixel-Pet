'use strict';
/**
 * reminders.js — Pomodoro, Stretch, Water, and Message reminder system
 * All intervals are driven by settings loaded from main process.
 * Sends reminder notifications via bubbles.js animations.
 */

let settings = {
  name: '',
  pomodoro:  { focusMinutes: 25, breakMinutes: 5 },
  reminders: {
    stretch:  { enabled: true,  intervalMins: 45 },
    water:    { enabled: true,  intervalMins: 60 },
    messages: [],
  },
};

// Reminder state (ms tracking)
let stretchNext = 0;
let waterNext   = 0;
let messageTimers = [];  // [{ text, intervalMins, nextFireMs, recurring }]

function nowMs() { return Date.now(); }
function minsToMs(m) { return m * 60 * 1000; }

// ─── Init ────────────────────────────────────────────────────
function initReminders(cfg) {
  settings = cfg;
  const now = nowMs();

  // Schedule stretch and water from now
  if (settings.reminders.stretch.enabled) {
    stretchNext = now + minsToMs(settings.reminders.stretch.intervalMins);
  }
  if (settings.reminders.water.enabled) {
    waterNext = now + minsToMs(settings.reminders.water.intervalMins);
  }

  // Custom message reminders
  messageTimers = (settings.reminders.messages || []).map(msg => ({
    text:         msg.text,
    intervalMins: msg.intervalMins,
    recurring:    msg.intervalMins > 0,
    nextFireMs:   now + minsToMs(msg.intervalMins || 60),
  }));
}

// Called when settings change from tray
function updateSettings(cfg) {
  const wasStretch = settings.reminders.stretch.enabled;
  const wasWater   = settings.reminders.water.enabled;
  settings = cfg;
  const now = nowMs();

  if (settings.reminders.stretch.enabled && !wasStretch) {
    stretchNext = now + minsToMs(settings.reminders.stretch.intervalMins);
  } else if (!settings.reminders.stretch.enabled) {
    stretchNext = 0;
  }

  if (settings.reminders.water.enabled && !wasWater) {
    waterNext = now + minsToMs(settings.reminders.water.intervalMins);
  } else if (!settings.reminders.water.enabled) {
    waterNext = 0;
  }

  // Rebuild message timers
  messageTimers = (settings.reminders.messages || []).map(msg => ({
    text:         msg.text,
    intervalMins: msg.intervalMins,
    recurring:    msg.intervalMins > 0,
    nextFireMs:   now + minsToMs(msg.intervalMins || 60),
  }));
}

// ─── Pomodoro done handler ─────────────────────────────────────
// Called by bubbles.js when timer hits 0
window.onTimerDone = function(phase) {
  const cat = window.CAT_STATE;
  const B   = window.bubbles;
  const P   = window.particles;

  if (phase === 'focus') {
    // Focus done → celebration + auto-start break
    window.behavior?.enterAction(cat, 'excited');
    B?.showBubble('Focus done! 🎉 Break time!', 4000);
    P?.spawnHearts(12);
    // Auto-start break after 4s
    setTimeout(() => {
      B?.startBreak(settings.pomodoro.breakMinutes);
    }, 4000);
  } else if (phase === 'break') {
    // Break done → prompt for next focus
    B?.showReminderBubble(`Break over! Start another focus? 🚀`, 6000);
    P?.spawnHearts(4);
  }
};

// ─── Per-frame check (call from main loop) ────────────────────
function checkReminders(cat) {
  const now = nowMs();
  const B   = window.bubbles;
  const P   = window.particles;
  const name = settings.name ? ` ${settings.name}` : '';

  // Skip if cat is sleeping or dragging
  if (cat.action === 'sleep' || cat.action === 'drag') return;

  // ── Stretch reminder ──────────────────────────────────────
  if (stretchNext > 0 && now >= stretchNext) {
    stretchNext = settings.reminders.stretch.enabled
      ? now + minsToMs(settings.reminders.stretch.intervalMins)
      : 0;
    // Trigger stretch animation
    cat.stretchTimer = 4000;
    cat.stretchScale = 1;
    B?.showReminderBubble(`Hey${name}! Time to stretch! 🧘`, 6000);
  }

  // ── Water reminder ────────────────────────────────────────
  if (waterNext > 0 && now >= waterNext) {
    waterNext = settings.reminders.water.enabled
      ? now + minsToMs(settings.reminders.water.intervalMins)
      : 0;
    P?.spawnWaterDrop?.();
    B?.showReminderBubble(`Hey${name}! Drink some water! 💧`, 6000);
    B?.showBubble('💧', 2000);
  }

  // ── Custom message reminders ───────────────────────────────
  for (const mt of messageTimers) {
    if (now >= mt.nextFireMs) {
      const text = mt.text.includes('{name}')
        ? mt.text.replace('{name}', settings.name || 'there')
        : mt.text;
      B?.showReminderBubble(`${text}`, 7000);
      B?.showBubble('📢 mew!', 1800);

      if (mt.recurring && mt.intervalMins > 0) {
        mt.nextFireMs = now + minsToMs(mt.intervalMins);
      } else {
        mt.nextFireMs = Infinity; // one-off fired, disable
      }
    }
  }
}

window.reminders = { initReminders, updateSettings, checkReminders };
