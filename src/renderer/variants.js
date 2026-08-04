'use strict';
/**
 * variants.js — Color palettes + heat tinting
 * All drawing uses the active palette P via window.P.
 * Palette swap = instant, no new art needed.
 *
 * Palette keys:
 *   K  = outline / darkest
 *   F  = main fur
 *   FD = fur dark / stripe
 *   FL = fur highlight / light
 *   B  = belly / chest
 *   N  = nose + ear-inner pink
 *   EY = iris color
 *   EW = eye shine
 */

const VARIANTS = {
  pepperino: {
    label: '⬛ Tuxedo',
    K:  '#141414', F:  '#242424', FD: '#101010', FL: '#505050',
    B:  '#ffffff', N:  '#e07080', EY: '#3a7848', EW: '#ffffff',
  },
  tabby: {
    label: '🟠 Orange Tabby',
    K:  '#1d120c', F:  '#e07830', FD: '#a04c12', FL: '#f2a05a',
    B:  '#fdf0e0', N:  '#e07080', EY: '#3a7848', EW: '#ffffff',
  },
  black: {
    label: '🖤 Black Cat',
    K:  '#080808', F:  '#282828', FD: '#101010', FL: '#404040',
    B:  '#464646', N:  '#784858', EY: '#c8a010', EW: '#ffe090',
  },
  grey: {
    label: '🩶 Grey Mackerel',
    K:  '#181818', F:  '#909090', FD: '#505050', FL: '#c0c0c0',
    B:  '#e8e8e8', N:  '#d07080', EY: '#3a7848', EW: '#ffffff',
  },
  siamese: {
    label: '🤍 Siamese',
    K:  '#4a3020', F:  '#f5ede0', FD: '#c8a080', FL: '#faf5ee',
    B:  '#fdfaf6', N:  '#e07080', EY: '#4090b8', EW: '#ffffff',
  },
  calico: {
    label: '🌸 Calico',
    K:  '#1d120c', F:  '#f0d0a0', FD: '#e07030', FL: '#f8e8c0',
    B:  '#fdfaf6', N:  '#e07080', EY: '#3a7848', EW: '#ffffff',
  },
};

// Active palette (mutable — modified for heat tinting)
let _baseVariant = 'pepperino';
let P = { ...VARIANTS.pepperino };

/** Linearly interpolate two hex colors */
function lerpColor(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1,3),16), g1 = parseInt(hex1.slice(3,5),16), b1 = parseInt(hex1.slice(5,7),16);
  const r2 = parseInt(hex2.slice(1,3),16), g2 = parseInt(hex2.slice(3,5),16), b2 = parseInt(hex2.slice(5,7),16);
  const r = Math.round(r1 + (r2-r1)*t);
  const g = Math.round(g1 + (g2-g1)*t);
  const b = Math.round(b1 + (b2-b1)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

/** Apply heat tint: lerps fur toward red-orange based on heatLevel (0..1) */
function applyHeatTint(base, heat) {
  if (heat <= 0) return { ...base };
  return {
    ...base,
    F:  lerpColor(base.F,  '#cc3300', heat * 0.75),
    FD: lerpColor(base.FD, '#991100', heat * 0.75),
    FL: lerpColor(base.FL, '#ff5500', heat * 0.60),
    N:  lerpColor(base.N,  '#ff6060', heat * 0.4),
  };
}

function setVariant(name) {
  if (!VARIANTS[name]) return;
  _baseVariant = name;
  P = applyHeatTint({ ...VARIANTS[name] }, window.CAT_STATE?.heatLevel || 0);
  window.P = P;
}

function updateHeatPalette(heatLevel) {
  const base = VARIANTS[_baseVariant] || VARIANTS.pepperino;
  P = applyHeatTint({ ...base }, heatLevel);
  window.P = P;
}

function getVariants() { return VARIANTS; }
function getActiveVariant() { return _baseVariant; }

// Initialize
setVariant('pepperino');

window.setVariant         = setVariant;
window.updateHeatPalette  = updateHeatPalette;
window.getVariants        = getVariants;
window.getActiveVariant   = getActiveVariant;
