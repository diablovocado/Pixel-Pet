'use strict';
/**
 * particles.js — Particle system
 * Manages and renders: hearts, Zzz, sparks, steam puffs, scroll paper
 * All drawn onto fxCanvas (full-screen overlay).
 */

/* global fxCtx, SW, SH, CAT_W, CAT_H, P */

const parts = [];

// ─── Helpers ────────────────────────────────────────────────
const _rand = (a, b) => a + Math.random() * (b - a);

// ─── Spawn Functions ─────────────────────────────────────────
function spawnHearts(n = 5) {
  const cat = window.CAT_STATE;
  for (let i = 0; i < n; i++) parts.push({
    type: 'heart',
    x:  cat.x + CAT_W * 0.65 + _rand(-14, 14),
    y:  cat.y + CAT_H * 0.15,
    vx: _rand(-0.7, 0.7), vy: _rand(-1.3, -0.5),
    life: 1, decay: _rand(0.003, 0.006), sz: _rand(5, 9),
  });
}

function spawnZzz() {
  const cat = window.CAT_STATE;
  parts.push({
    type: 'zzz',
    x:  cat.x + CAT_W * 0.82,
    y:  cat.y + CAT_H * 0.06,
    vx: _rand(0.08, 0.20), vy: -0.35,
    life: 1, decay: 0.0016, sz: _rand(10, 14),
  });
}

function spawnSparks() {
  const cat = window.CAT_STATE;
  for (let i = 0; i < 2; i++) parts.push({
    type: 'spark',
    x:  cat.x + CAT_W * 0.65 + _rand(-12, 12),
    y:  cat.y + CAT_H * 0.45,
    vx: _rand(-0.8, 0.8), vy: _rand(-1.2, -0.4),
    life: 1, decay: 0.02, sz: _rand(3, 5),
    color: Math.random() < 0.5 ? '#ff7700' : '#ffcc00',
  });
}

function spawnSteam() {
  const cat = window.CAT_STATE;
  // Puffs above head
  for (let i = 0; i < 2; i++) parts.push({
    type: 'steam',
    x:  cat.x + CAT_W * 0.5 + _rand(-18, 18),
    y:  cat.y + CAT_H * 0.0,
    vx: _rand(-0.15, 0.15), vy: _rand(-0.6, -0.3),
    life: 0.9, decay: 0.007, sz: _rand(6, 10),
  });
}

function spawnWaterDrop() {
  const cat = window.CAT_STATE;
  for (let i = 0; i < 6; i++) parts.push({
    type: 'water',
    x:  cat.x + CAT_W * 0.5 + _rand(-20, 20),
    y:  cat.y + _rand(-30, -10),
    vx: _rand(-0.5, 0.5), vy: _rand(-1.0, 0.2),
    life: 1, decay: 0.012, sz: _rand(4, 7),
  });
}

function spawnBounce() {
  const cat = window.CAT_STATE;
  // Dust puff at feet on landing
  for (let i = 0; i < 4; i++) parts.push({
    type: 'dust',
    x:  cat.x + CAT_W * 0.5 + _rand(-20, 20),
    y:  cat.y + CAT_H - 4,
    vx: _rand(-0.8, 0.8), vy: _rand(-0.4, 0.1),
    life: 0.8, decay: 0.018, sz: _rand(3, 6),
  });
}

// ─── Update ──────────────────────────────────────────────────
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const pt = parts[i];
    pt.x    += pt.vx * dt * 0.055;
    pt.y    += pt.vy * dt * 0.055;
    pt.life -= pt.decay * dt;
    if (pt.life <= 0) parts.splice(i, 1);
  }
}

// ─── Draw ────────────────────────────────────────────────────
function drawParts() {
  const fxCtx = window._fxCtx;
  if (!fxCtx) return;
  fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const pt of parts) {
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, pt.life);

    switch (pt.type) {
      case 'heart':
        drawPixelHeart(fxCtx, pt.x, pt.y, pt.sz);
        break;

      case 'spark':
        fxCtx.fillStyle = pt.color || '#ff7700';
        fxCtx.fillRect(pt.x, pt.y, pt.sz, pt.sz);
        break;

      case 'zzz': {
        const fs = Math.round(pt.sz);
        fxCtx.font        = `bold ${fs}px monospace`;
        fxCtx.lineWidth   = 2.5;
        fxCtx.strokeStyle = '#141414';
        fxCtx.fillStyle   = '#7090d8';
        fxCtx.strokeText('z', pt.x, pt.y);
        fxCtx.fillText  ('z', pt.x, pt.y);
        break;
      }

      case 'steam': {
        // Floating pink/red steam particle
        const alpha = Math.max(0, pt.life * 0.9);
        fxCtx.globalAlpha = alpha;
        fxCtx.fillStyle = `rgba(255, 90, 110, ${alpha})`;
        fxCtx.fillRect(pt.x, pt.y, pt.sz, pt.sz);
        fxCtx.fillStyle = `rgba(255, 180, 200, ${alpha * 0.6})`;
        fxCtx.fillRect(pt.x + 1, pt.y + 1, pt.sz * 0.5, pt.sz * 0.5);
        break;
      }

      case 'water': {
        // Blue pixel drop (diamond shape)
        const s = pt.sz;
        fxCtx.fillStyle = '#4090c0';
        fxCtx.fillRect(pt.x + s/3, pt.y,       s/3, s * 0.4);  // top tip
        fxCtx.fillRect(pt.x,       pt.y + s*0.4, s, s * 0.6);  // body
        fxCtx.fillStyle = '#a0d8f0';
        fxCtx.fillRect(pt.x + 2, pt.y + s * 0.5, s * 0.4, s * 0.3); // shine
        break;
      }

      case 'dust': {
        fxCtx.fillStyle = `rgba(180,160,120,0.5)`;
        fxCtx.fillRect(pt.x, pt.y, pt.sz, pt.sz);
        break;
      }
    }

    fxCtx.restore();
  }
}

// ─── Pixel-art heart ─────────────────────────────────────────
function drawPixelHeart(c, x, y, s) {
  const u = s / 6;
  c.fillStyle = '#e83060';
  const row = [
    [1,0],[2,0],[4,0],[5,0],
    [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],
    [2,4],[3,4],[4,4], [3,5],
  ];
  for (const [gx, gy] of row)
    c.fillRect(x + (gx-3)*u, y + (gy-3)*u, u+0.5, u+0.5);
  c.fillStyle = '#ff6090';
  c.fillRect(x + (1-3)*u, y + (0-3)*u, u*0.5, u*0.5);
  c.fillRect(x + (4-3)*u, y + (0-3)*u, u*0.5, u*0.5);
}

// ─── Export ──────────────────────────────────────────────────
window.particles = {
  spawnHearts, spawnZzz, spawnSparks, spawnSteam,
  spawnWaterDrop, spawnBounce,
  update: updateParts,
  draw:   drawParts,
};
