
'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const ui = {
  power: document.getElementById('power'),
  powerVal: document.getElementById('powerVal'),
  btnHeat: document.getElementById('btnHeat'),
  btnReset: document.getElementById('btnReset'),
  time: document.getElementById('time'),
  fullscreenBtn: document.getElementById('fullscreen-btn'),
};

const ASSETS = {
  beaker: 'img/beaker.svg',
  ice: 'img/ice.svg',
  rock: 'img/rock.svg',
  ice_machine: 'img/ice_machine.svg',
};

function loadImage(src){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

function formatTime(ms){
  const cs = Math.floor((ms % 1000) / 10);
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor(ms / 60000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

function getPointerPos(ev){
  const rect = canvas.getBoundingClientRect();
  const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
  const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  return {x, y};
}
function pointInRect(px, py, r){
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

const state = {
  assets: {},
  heating: false,
  power: 40,
  elapsed: 0,
  timerRunning: false,
  t0: 0,
  draggingId: null,
  dragDX: 0,
  dragDY: 0,
};

const layout = {
  beakerA: {x: 120, y: 170, w: 360, h: 440},
  beakerB: {x: 560, y: 170, w: 360, h: 440},
  iceMachine: {x: 1010, y: 210, w: 260, h: 360},
};

function innerRectForBeaker(beakerRect){
  return {
    x: beakerRect.x + beakerRect.w*0.18,
    y: beakerRect.y + beakerRect.h*0.10,
    w: beakerRect.w*0.64,
    h: beakerRect.h*0.82,
  };
}
function lmToInnerY(inner, lm){
  const t = clamp(lm / 120, 0, 1);
  return inner.y + (1 - t) * inner.h;
}

function trapezoidPath(inner, insetBottomFrac=0.14){
  const inset = inner.w * insetBottomFrac;
  const x1 = inner.x;
  const y1 = inner.y;
  const x2 = inner.x + inner.w;
  const y2 = inner.y;
  const x3 = inner.x + inner.w - inset;
  const y3 = inner.y + inner.h;
  const x4 = inner.x + inset;
  const y4 = inner.y + inner.h;

  const path = new Path2D();
  path.moveTo(x1, y1);
  path.lineTo(x2, y2);
  path.lineTo(x3, y3);
  path.lineTo(x4, y4);
  path.closePath();
  return path;
}

function expSmoothFactor(dt, tauMs){
  // dt in ms, tauMs ~ time constant
  return 1 - Math.exp(-dt / Math.max(1, tauMs));
}

function updateCubeDrawDims(c){
  // Keep physics and rendering consistent (do not depend on draw() order)
  const s = Math.sqrt(c.mg / c.m0g);
  const w = c.w * clamp(s, 0.25, 1);
  const h = c.h * clamp(s, 0.25, 1);
  c._drawW = w;
  c._drawH = h;
}

/** --------- Physical-ish beaker model (volume reading = measuring scale) ---------
 * We treat:
 * - melted ice: 1g -> 1ml water (adds to waterMl)
 * - floating condition: ice floats when waterline reaches 2/3 of its current height (top 1/3 above)
 * - if floating: displaced volume = mg (ml) (Archimedes), and because we enforce 2/3 submergence:
 *              ice volume is 1.5*mg so that mg/ (1.5*mg)=2/3
 * - if NOT floating (on bottom/stone): we ignore displacement for the scale reading (per user requirement),
 *   but melting still adds waterMl -> level rises until floating starts.
 * - stones in A: below rockTopLm the needed water is 40% compared to B for the same reading.
 *   Implemented as piecewise mapping between waterMl and baseLevelLm (reading without ice displacement).
 */

const PHI_A_WATER_FRACTION = 0.40;  // "eher nur 40% der Wassermenge benötigt" below rock top
const START_WATER_ML = 3.0;

function makeBeakerModel(kind){
  return {
    kind,               // 'land'|'sea'
    waterMl: START_WATER_ML, // actual liquid water in ml
    levelLm: START_WATER_ML, // displayed reading (smoothed)
    startLm: START_WATER_ML, // blue marker
    rimLm: 112,
    rockTopLm: 60,      // new: stones end around 60
    _inner: null,
    _waterY: null,
    overflowParticles: [],
  };
}

const model = {
  A: makeBeakerModel('land'),
  B: makeBeakerModel('sea'),
};

function baseLevelFromWater(beaker, waterMl){
  // reading (without floating-ice displacement) from actual water
  if (beaker.kind !== 'land') return waterMl;
  const rockTop = beaker.rockTopLm;
  const wNeededToRockTop = rockTop * PHI_A_WATER_FRACTION;
  if (waterMl <= wNeededToRockTop){
    return waterMl / PHI_A_WATER_FRACTION;
  }
  // above rocks: 1:1
  return rockTop + (waterMl - wNeededToRockTop);
}

function waterFromBaseLevel(beaker, baseLevelLm){
  // inverse of baseLevelFromWater
  if (beaker.kind !== 'land') return baseLevelLm;
  const rockTop = beaker.rockTopLm;
  const wNeededToRockTop = rockTop * PHI_A_WATER_FRACTION;
  if (baseLevelLm <= rockTop){
    return baseLevelLm * PHI_A_WATER_FRACTION;
  }
  return wNeededToRockTop + (baseLevelLm - rockTop);
}

function waterYFromLevel(beaker, levelLm){
  const inner = beaker._inner;
  if (!inner) return null;
  return lmToInnerY(inner, levelLm);
}

/** Ice cubes */
let cubeCounter = 0;
const cubes = [];

function machineSlot(){
  const m = layout.iceMachine;
  return { x: m.x + m.w*0.50 - 70, y: m.y + 160, w: 140, h: 105 };
}

function newCubeAt(x, y){
  const c = {
    id: `cube_${cubeCounter++}`,
    x, y,
    w: 140, h: 105,
    m0g: 25,
    mg: 25,
    vy: 0,
    placed: false,
    container: null, // 'A'|'B'
    phase: 'free',   // 'free'|'air'|'stone'|'bottom'|'water' (water == floating/being buoyant)
    home: 'machine', // 'machine'|'free'
    fallingOut: false,
    _drawW: 140,
    _drawH: 105,
    _floating: false, // solved each frame for displacement + buoyancy
  };
  cubes.push(c);
  return c;
}

function spawnCubeFromMachine(){
  const s = machineSlot();
  const dx = (Math.random()*18 - 9);
  const dy = (Math.random()*14 - 7);
  const c = newCubeAt(s.x + dx, s.y + dy);
  c.home = 'machine';
  c.fallingOut = false;
  return c;
}

/** Timer */
function startTimerIfNeeded(){
  if (state.timerRunning) return;
  state.timerRunning = true;
  state.t0 = performance.now() - state.elapsed;
}
function stopTimerIfNeeded(){ state.timerRunning = false; }
function updateTimer(){
  if (state.timerRunning){
    state.elapsed = performance.now() - state.t0;
  }
  ui.time.textContent = formatTime(state.elapsed);
}

/** Overflow particles */
function emitOverflow(beaker, x, y, strength){
  const n = Math.min(60, Math.floor(10 + strength*14));
  for (let i=0;i<n;i++){
    beaker.overflowParticles.push({
      x: x + (Math.random()*10 - 5),
      y: y + (Math.random()*6 - 3),
      vx: (Math.random()*80 + 120) * (Math.random() < 0.5 ? -1 : 1),
      vy: -40 + Math.random()*80,
      life: 0.9 + Math.random()*0.5,
      age: 0,
      r: 2 + Math.random()*2.5
    });
  }
}
function stepOverflowParticles(beaker, dt){
  const g = 480;
  for (let i=beaker.overflowParticles.length-1;i>=0;i--){
    const p = beaker.overflowParticles[i];
    p.age += dt/1000;
    p.vy += g * (dt/1000);
    p.x += p.vx * (dt/1000);
    p.y += p.vy * (dt/1000);
    if (p.age >= p.life) beaker.overflowParticles.splice(i,1);
  }
}
function drawOverflowParticles(beaker){
  ctx.save();
  ctx.fillStyle = 'rgba(60,140,230,0.75)';
  for (const p of beaker.overflowParticles){
    const a = 1 - (p.age / p.life);
    ctx.globalAlpha = 0.9 * a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

/** --------- Core: melting -> water, then solve levels (smooth) ---------- */

function restTopYForCube(which, beaker, c){
  const inner = beaker._inner;
  if (!inner) return c.y;

  const h = c._drawH ?? c.h;
  const floorY = inner.y + inner.h;

  if (which === 'A'){
    // Always rests on the top stone when not floating.
    const stoneTopY = lmToInnerY(inner, beaker.rockTopLm);
    return stoneTopY - h*0.05;
  }

  // B: rests on glass bottom
  return floorY - h;
}

function solveFloatingFlagsForBeaker(which, beaker, levelGuessLm){
  // decides _floating per cube for displacement and buoyancy, based on a given levelGuessLm
  // IMPORTANT: use rest position (bottom/stone), not current animated y, to avoid feedback wobble.
  const inner = beaker._inner;
  if (!inner) return;

  const waterY = lmToInnerY(inner, levelGuessLm);

  for (const c of cubes){
    if (!c.placed || c.container !== which) continue;
    const h = c._drawH ?? c.h;

    // Cube floats when only the top 1/3 is above water.
    // With rest top y0, the waterline must be at y0 + h/3 (because 2/3 submerged).
    const y0 = restTopYForCube(which, beaker, c);
    const floatThresholdY = y0 + h/3;

    // Small hysteresis avoids rapid toggling when the surface is right at the threshold.
    const prev = !!c._floating;
    const margin = Math.max(1.5, h * 0.02);

    // Requirement: while grounded, the beaker reading must NOT increase just because ice is added.
    // Therefore we count displacement only once floating starts.
    if (prev){
      c._floating = (waterY <= floatThresholdY + margin);
    } else {
      c._floating = (waterY <= floatThresholdY - margin);
    }
  }
}

function displacementFromFloating(which){
  let disp = 0;
  for (const c of cubes){
    if (!c.placed || c.container !== which) continue;
    if (!c._floating) continue;
    // displaced volume = mg (ml) (Archimedes)
    disp += c.mg;
  }
  return disp;
}

function updateLevels(dt){
  // compute target level per beaker (surface reading), then smooth toward it
  for (const c of cubes){
    updateCubeDrawDims(c);
  }
  for (const which of ['A','B']){
    const b = (which === 'A') ? model.A : model.B;

    // base (water only, stones handled in mapping for A)
    const base = baseLevelFromWater(b, b.waterMl);

    // iterate to resolve floating<->displacement circularity
    // (now stable because floating depends on restTopY, not the animated cube y)
    let level = base;
    for (let iter=0; iter<4; iter++){
      solveFloatingFlagsForBeaker(which, b, level);
      const disp = displacementFromFloating(which);
      level = base + disp;
    }

    // store target for motion code
    b._targetLevelLm = level;

    // overflow handling: enforce rim with splash and spill water accordingly
    if (level > b.rimLm){
      const overshoot = level - b.rimLm;
      // compute displacement at this moment (with last flags)
      const disp = displacementFromFloating(which);
      const desiredBase = Math.max(0, b.rimLm - disp);
      // spill water so base matches desiredBase
      b.waterMl = Math.max(0, waterFromBaseLevel(b, desiredBase));

      level = b.rimLm;

      if (b._inner){
        const rimY = lmToInnerY(b._inner, b.rimLm);
        const leftX  = b._inner.x - 6;
        const rightX = b._inner.x + b._inner.w + 6;
        const strength = clamp(overshoot/4, 0.3, 2.0);
        emitOverflow(b, leftX, rimY, strength);
        emitOverflow(b, rightX, rimY, strength);
      }
    }

    // smooth displayed level (stronger damping to eliminate jitter)
    const a = expSmoothFactor(dt, 420); // ~0.42s time constant
    b.levelLm += (level - b.levelLm) * a;

    stepOverflowParticles(b, dt);
  }
}

function updateMelting(dt){
  const power = state.heating ? state.power / 100 : 0;
  const meltRate_g_s = 2.0 * power;
  const dm_g = meltRate_g_s * (dt/1000);

  let anyMelting = false;

  for (const c of cubes){
    if (!c.placed || c.mg <= 0) continue;
    if (power <= 0) continue;

    const old = c.mg;
    c.mg = Math.max(0, c.mg - dm_g);
    const melted = old - c.mg;
    if (melted > 0) anyMelting = true;

    // convert to water in the corresponding beaker
    if (c.container === 'A'){
      model.A.waterMl += melted;
    } else if (c.container === 'B'){
      model.B.waterMl += melted;
    }
  }

  // remove fully melted cubes
  for (let i=cubes.length-1;i>=0;i--){
    if (cubes[i].mg <= 0) cubes.splice(i,1);
  }

  if (anyMelting) startTimerIfNeeded();
  if (!state.heating) stopTimerIfNeeded();
}

/** ---------- Motion ---------- */

function stepCubeMotion(dt){
  const g = 2400;             // accelerated fall (stronger than before)
  const buoyK = 28;
  const damp = 0.86;

  // fall-out cubes
  for (let i=cubes.length-1; i>=0; i--){
    const c = cubes[i];
    if (state.draggingId === c.id) continue;
    if (!c.placed && c.fallingOut){
      const gOut = 3200;
      c.vy += gOut * (dt/1000);
      c.y += c.vy * (dt/1000);
      if (c.y > canvas.height + 240){
        cubes.splice(i, 1);
      }
    }
  }

  // beaker cubes
  for (const c of cubes){
    if (!c.placed) continue;
    if (state.draggingId === c.id) continue;

    const b = (c.container === 'A') ? model.A : model.B;
    const inner = b._inner;
    if (!inner) continue;

    const h = c._drawH ?? c.h;
    const waterY = waterYFromLevel(b, b.levelLm) ?? lmToInnerY(inner, b.levelLm);

    const floorY = inner.y + inner.h;
    const bottomRestY = floorY - h;

    const rocksExposed = (c.container === 'A') ? (b.levelLm < b.rockTopLm) : false;
    const stoneTopY = lmToInnerY(inner, b.rockTopLm);
    const stoneRestY = stoneTopY - h*0.05;

    // If rocks exposed, cube should land on stone (A) no matter what, but may float once water rises
    if (c.container === 'A' && rocksExposed){
      c.phase = 'air';
      c.vy += g * (dt/1000);
      c.vy *= damp;
      c.y += c.vy * (dt/1000);
      if (c.y >= stoneRestY){
        c.y = stoneRestY;
        c.vy = 0;
        c.phase = 'stone';
      }

      // if it should float now, start buoyancy lift
      if (c._floating){
        c.phase = 'water';
      } else {
        continue;
      }
      // fall through to buoyancy block
    }

    // In B: if not floating yet, land on bottom (even if water exists)
    if (c.container === 'B' && !c._floating){
      c.phase = 'air';
      c.vy += g * (dt/1000);
      c.vy *= damp;
      c.y += c.vy * (dt/1000);
      if (c.y >= bottomRestY){
        c.y = bottomRestY;
        c.vy = 0;
        c.phase = 'bottom';
      }
      continue;
    }

    // General air-fall until it reaches water surface region
    const inWater = (c.y + h*0.5) >= waterY;

    if (!inWater && !c._floating){
      c.phase = 'air';
      c.vy += g * (dt/1000);
      c.vy *= damp;
      c.y += c.vy * (dt/1000);
      // if it crosses into water, keep going; floating decision handled by c._floating
      continue;
    }

    // Buoyancy / floating
    c.phase = 'water';
    const targetY = waterY - h/3; // top 1/3 above water
    const dy = targetY - c.y;
    c.vy += (dy * buoyK) * (dt/1000);
    c.vy *= damp;
    c.y += c.vy * (dt/1000);

    if (Math.abs(targetY - c.y) < 0.8 && Math.abs(c.vy) < 15){
      c.y = targetY;
      c.vy = 0;
    }

    // Keep within glass vertically
    c.y = clamp(c.y, inner.y - h*0.6, floorY - h*0.05);
  }
}

/** ---------- Drawing ---------- */

function drawWater(beakerRect, b){
  const inner = innerRectForBeaker(beakerRect);
  b._inner = inner;

  const fill = clamp(b.levelLm / 120, 0, 1);
  const waterH = inner.h * fill;
  const waterY = inner.y + (inner.h - waterH);
  b._waterY = waterY;

  ctx.save();
  const clipPath = trapezoidPath(inner, 0.14);
  ctx.clip(clipPath);

  const grad = ctx.createLinearGradient(0, inner.y, 0, inner.y + inner.h);
  grad.addColorStop(0, 'rgba(90,170,255,0.85)');
  grad.addColorStop(1, 'rgba(40,110,210,0.75)');
  ctx.fillStyle = grad;
  ctx.fillRect(inner.x, waterY, inner.w, waterH);

  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(inner.x, waterY + 1);
  ctx.lineTo(inner.x + inner.w, waterY + 1);
  ctx.stroke();

  ctx.restore();

  // rim marker
  const rimY = lmToInnerY(inner, b.rimLm);
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6,6]);
  ctx.beginPath();
  ctx.moveTo(inner.x, rimY);
  ctx.lineTo(inner.x + inner.w, rimY);
  ctx.stroke();
  ctx.restore();
}

function drawRulerWithPointers(x, y, h, startLm, currentLm){
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.90)';
  ctx.fillRect(x, y, 36, h);
  ctx.strokeStyle = '#1f1f1f';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 36, h);

  ctx.strokeStyle = '#1f1f1f';
  ctx.lineWidth = 2;
  for (let lm=0; lm<=120; lm+=10){
    const yy = y + (1 - (lm/120)) * h;
    const len = (lm % 20 === 0) ? 18 : 12;
    ctx.beginPath();
    ctx.moveTo(x + 36, yy);
    ctx.lineTo(x + 36 - len, yy);
    ctx.stroke();

    if (lm % 20 === 0){
      ctx.fillStyle = '#1f1f1f';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(lm), x + 4, yy);
    }
  }

  if (startLm !== null){
    const ys = y + (1 - (startLm/120)) * h;
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, ys);
    ctx.lineTo(x+36, ys);
    ctx.stroke();
  }

  const yc = y + (1 - (currentLm/120)) * h;
  ctx.strokeStyle = '#ff3b30';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, yc);
  ctx.lineTo(x+36, yc);
  ctx.stroke();

  ctx.restore();
}

/** Rock stack A: now 4 rocks, top near rockTopLm (~60) */
function drawRockStackA(beakerRect, b){
  const inner = b._inner;
  if (!inner) return;

  const floorY = inner.y + inner.h;
  const targetTopY = lmToInnerY(inner, b.rockTopLm);

  const N = 4;
  const rocks = [];

  const W = beakerRect.w * 0.68;
  const H = beakerRect.h * 0.28;

  const xFracs = [0.50, 0.60, 0.42, 0.58];
  const rots   = [0.02, -0.20, 0.18, -0.16];

  const footF = 0.50;
  const topF  = 0.18;

  const x0 = inner.x + inner.w * xFracs[0] - W/2;
  const y0 = floorY - H*footF;
  rocks.push({x:x0,y:y0,w:W,h:H,rot:rots[0]});

  for (let i=1;i<N;i++){
    const x = inner.x + inner.w * xFracs[i] - W/2;
    const prev = rocks[i-1];
    const prevTop = prev.y + prev.h*topF;
    const y = prevTop - H*footF;
    rocks.push({x, y, w:W, h:H, rot:rots[i]});
  }

  // align top to rockTopLm
  const last = rocks[N-1];
  const lastTop = last.y + last.h*topF;
  let dy = targetTopY - lastTop;

  // keep bottom on floor
  const bottom = rocks[0];
  const bottomFoot = bottom.y + bottom.h*footF;
  const maxUp = floorY - bottomFoot;
  if (dy < maxUp) dy = maxUp;
  for (const r of rocks){ r.y += dy; }

  // clamp x to keep inside
  for (const r of rocks){
    const minX = inner.x - W*0.06;
    const maxX = (inner.x + inner.w) - W*0.94;
    r.x = clamp(r.x, minX, maxX);
  }

  // shadows
  for (const r of rocks){
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.translate(r.x + r.w/2 + 7, r.y + r.h/2 + 10);
    ctx.rotate(r.rot);
    ctx.drawImage(state.assets.rock, -r.w/2, -r.h/2, r.w, r.h);
    ctx.restore();
  }

  // draw
  for (const r of rocks){
    ctx.save();
    ctx.translate(r.x + r.w/2, r.y + r.h/2);
    ctx.rotate(r.rot);
    ctx.drawImage(state.assets.rock, -r.w/2, -r.h/2, r.w, r.h);
    ctx.restore();
  }
}

/** Cubes draw */
function drawCube(c){
  const s = Math.sqrt(c.mg / c.m0g);
  const w = c.w * clamp(s, 0.25, 1);
  const h = c.h * clamp(s, 0.25, 1);
  c._drawW = w; c._drawH = h;

  ctx.drawImage(state.assets.ice, c.x, c.y, w, h);

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`Eis: ${c.mg.toFixed(0)} g`, c.x + w/2, c.y + h + 4);
  ctx.restore();
}
function drawAllCubes(){
  const dragging = state.draggingId;
  for (const c of cubes){
    if (c.id === dragging) continue;
    drawCube(c);
  }
  if (dragging){
    const c = cubes.find(x => x.id === dragging);
    if (c) drawCube(c);
  }
}
function cubeHitRect(c){
  return {x: c.x, y: c.y, w: c._drawW ?? c.w, h: c._drawH ?? c.h};
}
function cubeFromPoint(p){
  for (let i=cubes.length-1;i>=0;i--){
    const c = cubes[i];
    if (pointInRect(p.x, p.y, cubeHitRect(c))) return c;
  }
  return null;
}

/** Placement */
function placeCube(c){
  const hit = cubeHitRect(c);
  const cx = hit.x + hit.w/2;
  const cy = hit.y + hit.h/2;

  c.placed = false;
  c.container = null;
  c.vy = 0;
  c.phase = 'free';
  c.fallingOut = false;
  c._floating = false;

  const Ainner = model.A._inner;
  const Binner = model.B._inner;

  const slot = machineSlot();
  if (pointInRect(cx, cy, slot) || pointInRect(cx, cy, layout.iceMachine)){
    c.home = 'machine';
    c.fallingOut = false;
    return;
  }

  function dropInto(which, inner){
    c.placed = true;
    c.container = which;
    c.phase = 'air';
    c.home = 'free';

    c.x = clamp(c.x, inner.x + 2, inner.x + inner.w - hit.w - 2);

    const inside = (cy >= inner.y && cy <= inner.y + inner.h);
    const above  = (cy < inner.y);

    if (above){
      c.y = inner.y - hit.h;
    } else if (inside){
      c.y = clamp(c.y, inner.y - hit.h*0.4, inner.y + inner.h - hit.h*0.6);
    }

    // Blue line should not auto-reset here (user didn't request now). Keep startLm as is.
  }

  if (Ainner){
    const overA = (cx >= Ainner.x && cx <= Ainner.x + Ainner.w);
    if (overA){ dropInto('A', Ainner); return; }
  }
  if (Binner){
    const overB = (cx >= Binner.x && cx <= Binner.x + Binner.w);
    if (overB){ dropInto('B', Binner); return; }
  }

  // elsewhere: fall out
  c.fallingOut = true;
  c.home = 'free';
}

/** Draw beaker */
function drawBeaker(beakerRect, b, label){
  ctx.save();
  ctx.fillStyle = '#1f1f1f';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, beakerRect.x + beakerRect.w/2, beakerRect.y - 10);
  ctx.restore();

  drawWater(beakerRect, b);

  if (label.startsWith('A')){
    const inner = b._inner;
    if (inner){
      ctx.save();
      const clipPath = trapezoidPath(inner, 0.14);
      ctx.clip(clipPath);
      drawRockStackA(beakerRect, b);
      ctx.restore();
    } else {
      drawRockStackA(beakerRect, b);
    }
  }

  ctx.drawImage(state.assets.beaker, beakerRect.x, beakerRect.y, beakerRect.w, beakerRect.h);

  const rulerTopY = beakerRect.y + beakerRect.h*0.10;
  const rulerH = beakerRect.h*0.82;
  const rulerX = beakerRect.x + beakerRect.w + 16;
  drawRulerWithPointers(rulerX, rulerTopY, rulerH, b.startLm, b.levelLm);

  drawOverflowParticles(b);

  const yText = beakerRect.y + beakerRect.h + 16;
  const fillTxt = `Füllmenge: ${b.levelLm.toFixed(1)} ml`;
  const dTxt = (b.startLm !== null) ? `Δh: ${(b.levelLm - b.startLm).toFixed(1)} ml` : `Δh: –`;
  ctx.save();
  ctx.fillStyle = '#1f1f1f';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(fillTxt, beakerRect.x + beakerRect.w/2, yText);
  ctx.fillText(dTxt, beakerRect.x + beakerRect.w/2, yText + 20);
  ctx.restore();
}

/** Ice machine */
function drawIceMachine(){
  const m = layout.iceMachine;

  ctx.save();
  ctx.fillStyle = '#1f1f1f';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Eiswürfelmaschine', m.x + m.w/2, m.y - 10);
  ctx.restore();

  ctx.drawImage(state.assets.ice_machine, m.x, m.y, m.w, m.h);

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.70)';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Klick: neuer Eiswürfel', m.x + m.w/2, m.y + 120);
  ctx.restore();
}

/** Render */
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBeaker(layout.beakerA, model.A, 'A: Eis auf Landmassen');
  drawBeaker(layout.beakerB, model.B, 'B: Eis auf dem Meer');
  drawIceMachine();
  drawAllCubes();
}

/** Interaction */
function onDown(ev){
  const p = getPointerPos(ev);

  if (pointInRect(p.x, p.y, layout.iceMachine)){
    const hitCube = cubeFromPoint(p);
    if (!hitCube){
      spawnCubeFromMachine();
      ev.preventDefault();
      return;
    }
  }

  const c = cubeFromPoint(p);
  if (c){
    state.draggingId = c.id;
    state.dragDX = p.x - c.x;
    state.dragDY = p.y - c.y;
    c.vy = 0;
    c.home = 'free';
    c.fallingOut = false;

    const idx = cubes.findIndex(x => x.id === c.id);
    if (idx >= 0){ cubes.splice(idx,1); cubes.push(c); }

    ev.preventDefault();
  }
}
function onMove(ev){
  if (!state.draggingId) return;
  const p = getPointerPos(ev);
  const c = cubes.find(x => x.id === state.draggingId);
  if (!c) return;

  c.x = p.x - state.dragDX;
  c.y = p.y - state.dragDY;
  ev.preventDefault();
}
function onUp(ev){
  // IMPORTANT for mobile/tablet:
  // PreventDefault on 'touchend' suppresses the synthetic 'click' event on many browsers (e.g. iOS Safari).
  // Therefore only preventDefault when we actually handled a drag-drop interaction.
  const wasDragging = !!state.draggingId;

  if (state.draggingId){
    const c = cubes.find(x => x.id === state.draggingId);
    state.draggingId = null;
    if (c) placeCube(c);
  }

  if (wasDragging){
    ev.preventDefault();
  }
}

/** UI */
function setHeatUI(){
  ui.btnHeat.textContent = `Erwärmen: ${state.heating ? 'AN' : 'AUS'}`;
  ui.btnHeat.classList.toggle('on', state.heating);
}
function setPower(v){
  state.power = v;
  ui.powerVal.textContent = `${v}%`;
}

// Add optional "Reset Linien" button dynamically (doesn't require HTML edit)
function ensureLineResetButton(){
  const bar = document.getElementById('controlsBar');
  if (!bar) return;
  if (document.getElementById('btnResetLines')) return;

  const group = bar.querySelector('.group') || bar;
  const btn = document.createElement('button');
  btn.id = 'btnResetLines';
  btn.type = 'button';
  btn.textContent = 'Linien-Reset';
  btn.addEventListener('click', () => {
    model.A.startLm = model.A.levelLm;
    model.B.startLm = model.B.levelLm;
  });
  group.appendChild(btn);
}

ui.power.addEventListener('input', (e) => setPower(Number(e.target.value)));
ui.btnHeat.addEventListener('click', () => {
  state.heating = !state.heating;
  setHeatUI();
  if (state.heating) startTimerIfNeeded();
});
ui.btnReset.addEventListener('click', () => resetAll());

ui.fullscreenBtn.addEventListener('click', () => {
  if (canvas.requestFullscreen) canvas.requestFullscreen();
});

function resetAll(){
  state.heating = false;
  setHeatUI();
  state.elapsed = 0;
  state.timerRunning = false;
  state.t0 = performance.now();

  model.A = makeBeakerModel('land');
  model.B = makeBeakerModel('sea');

  cubes.length = 0;
  cubeCounter = 0;
  spawnCubeFromMachine();
}

/** Loop */
let last = performance.now();
function loop(now){
  const dt = now - last;
  last = now;
  updateTimer();

  updateMelting(dt);
  // solve levels after melting
  updateLevels(dt);
  // motion uses the solved/smoothed levels
  stepCubeMotion(dt);

  render();
  requestAnimationFrame(loop);
}

/** Init */
async function main(){
  const entries = await Promise.all(Object.entries(ASSETS).map(async ([k, src]) => {
    const img = await loadImage(src);
    return [k, img];
  }));
  state.assets = Object.fromEntries(entries);

  setPower(state.power);
  setHeatUI();
  ensureLineResetButton();
  resetAll();

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);

  canvas.addEventListener('touchstart', onDown, {passive:false});
  canvas.addEventListener('touchmove', onMove, {passive:false});
  window.addEventListener('touchend', onUp, {passive:false});

  requestAnimationFrame(loop);
}
main().catch(console.error);
