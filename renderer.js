// ---------- Setup ----------
const canvas = document.getElementById('catCanvas');
const ctx = canvas.getContext('2d');
const bubble = document.getElementById('bubble');

const SCALE = 6;              // how many screen px per pixel-art pixel
const GRID_W = 26;            // low-res canvas width in "pixels"
const GRID_H = 20;            // low-res canvas height in "pixels"
canvas.width = GRID_W * SCALE;
canvas.height = GRID_H * SCALE;
ctx.imageSmoothingEnabled = false;

const stripWidth = window.innerWidth;
const stripHeight = window.innerHeight;

// ---------- Palette ----------
const COLOR = {
  outline: '#241914',
  fur: '#e0913f',
  furDark: '#c46f27',
  belly: '#fbeedd',
  pink: '#e8a3ac',
  eye: '#241914',
  eyeShine: '#fbeedd',
};

// ---------- Cat state ----------
const cat = {
  x: stripWidth * 0.4,     // left edge of cat sprite, in screen px
  facing: 1,               // 1 = right, -1 = left
  action: 'idle',          // idle | walk | sit | drag
  targetX: null,
  actionTimer: 0,
  blinkTimer: randRange(2, 5),
  blinking: false,
  tailPhase: 0,
  walkPhase: 0,
  heartEyes: 0,            // >0 while showing heart eyes after a click/pet
};

let dragging = false;
let dragOffsetX = 0;
let dragMoved = false;
let mouseDownAt = null;
let isIgnoringMouse = true;
let lastCursor = { x: -9999, y: -9999 };

const GROUND_Y = stripHeight - 24; // the "floor" the cat stands on, in screen coords (from top)

function randRange(a, b) { return a + Math.random() * (b - a); }

// ---------- Draw a single low-res frame ----------
function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x) * SCALE, Math.round(y) * SCALE, w * SCALE, h * SCALE);
}

function drawCat(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  if (cat.facing === -1) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  const sit = cat.action === 'sit';
  const dragMode = cat.action === 'drag';
  const walking = cat.action === 'walk';

  // gentle idle/breathing bob
  const bob = sit ? 0 : Math.sin(t / 420) * 0.4;

  // tail sway
  cat.tailPhase += 0.05;
  const tailWag = Math.sin(cat.tailPhase) * 2;

  // body base position (in grid units)
  const bx = 6, by = 9 + bob;

  // --- tail ---
  px(bx - 4, by - 1 + tailWag * 0.3, 2, 1, COLOR.outline);
  px(bx - 5, by - 2 + tailWag, 2, 2, COLOR.fur);
  px(bx - 6, by - 3 + tailWag, 1, 2, COLOR.furDark);

  // --- body ---
  px(bx, by, 10, 6, COLOR.outline);
  px(bx + 1, by + 1, 8, 5, COLOR.fur);
  px(bx + 2, by + 3, 5, 2, COLOR.belly);
  // tabby stripes
  px(bx + 2, by + 1, 1, 2, COLOR.furDark);
  px(bx + 5, by + 1, 1, 2, COLOR.furDark);

  // --- legs ---
  if (walking) {
    cat.walkPhase += 0.18;
    const l1 = Math.sin(cat.walkPhase) * 1.4;
    const l2 = Math.sin(cat.walkPhase + Math.PI) * 1.4;
    px(bx + 1, by + 6, 2, 2 + Math.max(0, l1), COLOR.outline);
    px(bx + 6, by + 6, 2, 2 + Math.max(0, l2), COLOR.outline);
  } else if (sit || dragMode) {
    px(bx + 1, by + 6, 2, 1, COLOR.outline);
    px(bx + 6, by + 6, 2, 1, COLOR.outline);
  } else {
    px(bx + 1, by + 6, 2, 2, COLOR.outline);
    px(bx + 6, by + 6, 2, 2, COLOR.outline);
  }

  // --- head ---
  const hx = bx + 8, hy = by - 5 + bob;
  // ears
  px(hx, hy - 2, 2, 2, COLOR.outline);
  px(hx + 5, hy - 2, 2, 2, COLOR.outline);
  px(hx + 1, hy - 1, 1, 1, COLOR.pink);
  px(hx + 6, hy - 1, 1, 1, COLOR.pink);
  // head block
  px(hx, hy, 8, 6, COLOR.outline);
  px(hx + 1, hy + 1, 6, 5, COLOR.fur);

  // eyes: pupils track the cursor a little, unless dragging (wide/surprised) or blinking
  const eyeBaseY = hy + 2;
  if (dragMode) {
    // surprised wide eyes
    px(hx + 1.5, eyeBaseY, 1.5, 1.5, COLOR.eye);
    px(hx + 4.5, eyeBaseY, 1.5, 1.5, COLOR.eye);
  } else if (cat.blinking) {
    px(hx + 1.5, eyeBaseY + 0.6, 1.5, 0.4, COLOR.eye);
    px(hx + 4.5, eyeBaseY + 0.6, 1.5, 0.4, COLOR.eye);
  } else if (cat.heartEyes > 0) {
    px(hx + 1.5, eyeBaseY, 1, 1, COLOR.pink);
    px(hx + 4.7, eyeBaseY, 1, 1, COLOR.pink);
  } else {
    const shift = getPupilShift();
    px(hx + 1.7 + shift, eyeBaseY, 1, 1, COLOR.eye);
    px(hx + 4.7 + shift, eyeBaseY, 1, 1, COLOR.eye);
  }
  // nose
  px(hx + 3.3, hy + 4, 1, 0.6, COLOR.pink);

  ctx.restore();
}

// how far the pupils shift toward the on-screen cursor (in grid units, small range)
function getPupilShift() {
  const catCenterX = cat.x + (GRID_W * SCALE) / 2;
  const dx = lastCursor.x - catCenterX;
  return Math.max(-0.6, Math.min(0.6, dx / 300));
}

// ---------- Behavior state machine ----------
function pickNextAction() {
  const roll = Math.random();
  if (roll < 0.5) {
    cat.action = 'walk';
    cat.targetX = randRange(20, stripWidth - GRID_W * SCALE - 20);
    cat.actionTimer = 0;
  } else if (roll < 0.75) {
    cat.action = 'sit';
    cat.actionTimer = randRange(3000, 7000);
  } else {
    cat.action = 'idle';
    cat.actionTimer = randRange(2000, 5000);
  }
}

function updateBehavior(dt) {
  if (cat.action === 'drag') return; // driven by mouse events instead

  if (cat.action === 'walk') {
    const dir = cat.targetX > cat.x ? 1 : -1;
    cat.facing = dir;
    cat.x += dir * 0.06 * dt;
    if (Math.abs(cat.x - cat.targetX) < 4) {
      pickNextAction();
    }
  } else {
    cat.actionTimer -= dt;
    if (cat.actionTimer <= 0) pickNextAction();
  }

  // blinking
  cat.blinkTimer -= dt / 1000;
  if (cat.blinkTimer <= 0) {
    cat.blinking = !cat.blinking;
    cat.blinkTimer = cat.blinking ? 0.12 : randRange(2, 5);
  }

  if (cat.heartEyes > 0) cat.heartEyes -= dt;

  // keep cat within screen bounds
  cat.x = Math.max(4, Math.min(stripWidth - GRID_W * SCALE - 4, cat.x));
}

// ---------- Position canvas each frame ----------
function positionCanvas() {
  canvas.style.left = `${cat.x}px`;
}

// ---------- Main loop ----------
let lastT = performance.now();
function loop(t) {
  const dt = t - lastT;
  lastT = t;
  updateBehavior(dt);
  positionCanvas();
  drawCat(t);
  updateBubblePosition();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------- Mouse tracking / click-through ----------
function catBounds() {
  const rect = canvas.getBoundingClientRect();
  return rect;
}

function isPointOnCat(x, y) {
  const r = catBounds();
  if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
  // sample alpha at that pixel to allow the transparent parts of the canvas box to pass clicks through
  const cx = Math.floor((x - r.left) / (r.width / canvas.width));
  const cy = Math.floor((y - r.top) / (r.height / canvas.height));
  try {
    const data = ctx.getImageData(cx, cy, 1, 1).data;
    return data[3] > 10;
  } catch (e) {
    return true;
  }
}

document.addEventListener('mousemove', (e) => {
  lastCursor.x = e.clientX;
  lastCursor.y = e.clientY;

  if (dragging) {
    cat.x = e.clientX - dragOffsetX;
    cat.x = Math.max(4, Math.min(stripWidth - GRID_W * SCALE - 4, cat.x));
    if (mouseDownAt && (Math.abs(e.clientX - mouseDownAt.x) > 4 || Math.abs(e.clientY - mouseDownAt.y) > 4)) {
      dragMoved = true;
    }
    return;
  }

  const onCat = isPointOnCat(e.clientX, e.clientY);
  if (onCat === isIgnoringMouse) {
    isIgnoringMouse = !onCat;
    window.deskpet.setIgnoreMouseEvents(!onCat, { forward: true });
  }
});

document.addEventListener('mousedown', (e) => {
  if (!isPointOnCat(e.clientX, e.clientY)) return;
  dragging = true;
  dragMoved = false;
  mouseDownAt = { x: e.clientX, y: e.clientY };
  dragOffsetX = e.clientX - cat.x;
  cat.action = 'drag';
});

document.addEventListener('mouseup', (e) => {
  if (!dragging) return;
  dragging = false;
  if (!dragMoved) {
    // it was a click/pet, not a drag
    cat.heartEyes = 1200;
    showBubble('mew!');
  }
  cat.action = 'idle';
  cat.actionTimer = randRange(800, 2000);
});

// ---------- Speech bubble ----------
let bubbleTimeout = null;
function showBubble(text) {
  bubble.textContent = text;
  bubble.style.opacity = '1';
  clearTimeout(bubbleTimeout);
  bubbleTimeout = setTimeout(() => { bubble.style.opacity = '0'; }, 1200);
}

function updateBubblePosition() {
  const r = catBounds();
  bubble.style.left = `${r.left + r.width / 2}px`;
  bubble.style.top = `${r.top - 26}px`;
}

// start ignoring mouse events so the desktop underneath stays fully usable
window.deskpet.setIgnoreMouseEvents(true, { forward: true });
