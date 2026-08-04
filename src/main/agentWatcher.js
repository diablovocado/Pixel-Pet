'use strict';
/**
 * agentWatcher.js — Pluggable AI coding agent status detector
 *
 * Interface contract for agent plugins:
 *   { name: string, detect(): boolean, getStatus(): 'thinking'|'done'|'idle' }
 *
 * Currently ships with:
 *   - claude-code  (Claude Code CLI, process name "claude")
 *
 * To add another agent: create a plugin object below and add it to PLUGINS.
 */

const { exec } = require('child_process');

// ─── Agent Plugins ──────────────────────────────────────────────────────────

const PLUGINS = {

  'claude-code': {
    name: 'claude-code',
    _lastCpu: 0,
    _consecutiveLow: 0,
    detect() {
      return new Promise(resolve => {
        exec("pgrep -l claude 2>/dev/null | head -5", (err, stdout) => {
          resolve(!err && stdout.trim().length > 0);
        });
      });
    },
    getStatus() {
      return new Promise(resolve => {
        // Get CPU usage of claude processes
        exec(
          "ps -eo comm,pcpu 2>/dev/null | grep -i claude | awk '{sum += $2} END {print sum+0}'",
          (err, stdout) => {
            if (err) { resolve('idle'); return; }
            const cpu = parseFloat(stdout.trim()) || 0;
            this._lastCpu = cpu;
            if (cpu > 3.0) resolve('thinking');
            else resolve('done');
          }
        );
      });
    }
  },

  'gemini-cli': {
    name: 'gemini-cli',
    detect() {
      return new Promise(resolve => {
        exec("pgrep -l gemini 2>/dev/null | head -5", (err, stdout) => {
          resolve(!err && stdout.trim().length > 0);
        });
      });
    },
    getStatus() {
      return new Promise(resolve => {
        exec(
          "ps -eo comm,pcpu 2>/dev/null | grep -i gemini | awk '{sum += $2} END {print sum+0}'",
          (err, stdout) => {
            const cpu = parseFloat(stdout?.trim()) || 0;
            resolve(cpu > 3.0 ? 'thinking' : 'done');
          }
        );
      });
    }
  },

  'aider': {
    name: 'aider',
    detect() {
      return new Promise(resolve => {
        exec("pgrep -f aider 2>/dev/null | head -5", (err, stdout) => {
          resolve(!err && stdout.trim().length > 0);
        });
      });
    },
    getStatus() {
      return new Promise(resolve => {
        exec(
          "ps -eo args,pcpu 2>/dev/null | grep aider | grep -v grep | awk '{sum += $NF} END {print sum+0}'",
          (err, stdout) => {
            const cpu = parseFloat(stdout?.trim()) || 0;
            resolve(cpu > 3.0 ? 'thinking' : 'done');
          }
        );
      });
    }
  },
};

// ─── Watcher State ───────────────────────────────────────────────────────────

let watchInterval  = null;
let currentPlugin  = null;
let lastStatus     = 'idle';
let wasPresent     = false;

/**
 * Start watching. Calls onStatus({ status, tool }) on each state transition.
 * @param {string}   toolName  key from PLUGINS (or 'claude-code' by default)
 * @param {function} onStatus
 */
function start(toolName, onStatus) {
  currentPlugin = PLUGINS[toolName] || PLUGINS['claude-code'];
  if (!currentPlugin) {
    console.warn(`[agentWatcher] Unknown agent tool: ${toolName}. Defaulting to claude-code.`);
    currentPlugin = PLUGINS['claude-code'];
  }

  console.log(`[agentWatcher] Watching agent: ${currentPlugin.name}`);

  if (watchInterval) clearInterval(watchInterval);

  watchInterval = setInterval(async () => {
    try {
      const present = await currentPlugin.detect();

      if (!present) {
        if (wasPresent) {
          // Agent just exited
          wasPresent = false;
          lastStatus = 'idle';
          onStatus({ status: 'idle', tool: currentPlugin.name });
        }
        return;
      }

      wasPresent = true;
      const status = await currentPlugin.getStatus();

      if (status !== lastStatus) {
        lastStatus = status;
        onStatus({ status, tool: currentPlugin.name });
      }
    } catch (e) {
      // Silently ignore errors — agent detection is best-effort
    }
  }, 1200);
}

function stop() {
  if (watchInterval) { clearInterval(watchInterval); watchInterval = null; }
}

function getAvailableTools() {
  return Object.keys(PLUGINS);
}

module.exports = { start, stop, getAvailableTools };
