'use strict';
/**
 * settings.js — Persistent local config store
 * Reads/writes ~/.config/pixel-pet/settings.json
 * No cloud, no accounts — just a plain JSON file.
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CONFIG_DIR  = path.join(os.homedir(), '.config', 'pixel-pet');
const CONFIG_FILE = path.join(CONFIG_DIR, 'settings.json');

const DEFAULTS = {
  name:        '',
  variant:     'pepperino',
  pinnedNote:  '',
  agentTool:   'claude-code',

  pomodoro: {
    focusMinutes: 25,
    breakMinutes: 5,
  },

  reminders: {
    stretch: {
      enabled:       true,
      intervalMins:  45,
    },
    water: {
      enabled:       true,
      intervalMins:  60,
    },
    messages: [],  // [{ text, intervalMins, enabled, lastFired }]
  },
};

let _cache = null;

function load() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    if (!fs.existsSync(CONFIG_FILE)) {
      _cache = structuredClone(DEFAULTS);
      save();
      return _cache;
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    _cache = deepMerge(structuredClone(DEFAULTS), JSON.parse(raw));
    return _cache;
  } catch (e) {
    console.warn('[settings] Failed to load config, using defaults:', e.message);
    _cache = structuredClone(DEFAULTS);
    return _cache;
  }
}

function save() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(_cache, null, 2), 'utf8');
  } catch (e) {
    console.warn('[settings] Failed to save config:', e.message);
  }
}

function get() {
  if (!_cache) load();
  return _cache;
}

function set(key, value) {
  if (!_cache) load();
  _cache[key] = value;
  save();
}

function setNested(path_, value) {
  if (!_cache) load();
  const parts = path_.split('.');
  let obj = _cache;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;
  save();
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = { load, save, get, set, setNested };
