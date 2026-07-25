'use strict';
/**
 * agentDisplay.js — AI agent status display handler
 * Reacts to agentStatus changes from the main process watcher.
 * Uses behavior.js state machine for animations — no direct rendering here.
 *
 * Status values: 'thinking' | 'done' | 'idle'
 */

let _lastStatus = 'idle';

function handleAgentStatus(cat, { status, tool }) {
  // Store on cat state for behavior.js to use
  cat.agentStatus = status;
  cat.agentTool   = tool || '';

  if (status === _lastStatus) return;
  _lastStatus = status;

  const B = window.bubbles;

  switch (status) {
    case 'thinking':
      // behavior.js will switch to 'agent-thinking' state on next frame
      if (B) {
        B.showAgentBubble(`⚙ ${tool || 'AI'} thinking...`);
      }
      break;

    case 'done':
      // behavior.js will switch to 'agent-done' (happy hop) on next frame
      if (B) B.hideAgentBubble();
      break;

    case 'idle':
      // Agent not running — clear display
      if (B) B.hideAgentBubble();
      if (cat.action === 'agent-thinking') {
        window.behavior?.enterAction(cat, 'idle');
      }
      break;
  }
}

window.agentDisplay = { handleAgentStatus };
