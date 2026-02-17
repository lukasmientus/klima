'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const chart = document.getElementById('chart');
const cctx = chart.getContext('2d');

const ui = {
  btnNudge: document.getElementById('btnNudge'),
  btnRecord: document.getElementById('btnRecord'),
  btnUndo: document.getElementById('btnUndo'),
  btnReset: document.getElementById('btnReset'),
  countL: document.getElementById('countL'),
  countR: document.getElementById('countR'),
  net: document.getElementById('net'),
  disp: document.getElementById('disp'),
  feedback: document.getElementById('feedback'),
  fullscreenBtn: document.getElementById('fullscreen-btn'),
};

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function lerp(a,b,t){ return a + (b-a)*t; }

function getPointerPos(ev){
  const rect = canvas.getBoundingClientRect();
  const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
  const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function insideCircle(p, c, r){
  const dx = p.x - c.x, dy = p.y - c.y;
  return dx*dx + dy*dy <= r*r;
}
function insideRect(p, r){
  return p.x >= r.x && p.x <= r.x+r.w && p.y >= r.y && p.y <= r.y+r.h;
}

// =========================================================
// Assets (Form)
// =========================================================
const formImg = new Image();
formImg.src = 'img/Form.png';
let formReady = false;
formImg.onload = () => { formReady = true; };

// =========================================================
// Geometry
// =========================================================
const W = canvas.width;
const H = canvas.height;

// Area where the original-form silhouette is drawn
const formBox = {
  x: 110,
  y: 90,
  w: 1180,
  h: 420,
};

// Rotation pivot for the whole wippe/form
const rotPivot = {
  x: formBox.x + formBox.w*0.50,
  y: formBox.y + formBox.h*0.56,
};

function rotPoint(p, theta){
  const s = Math.sin(theta), c = Math.cos(theta);
  const dx = p.x - rotPivot.x;
  const dy = p.y - rotPivot.y;
  return {
    x: rotPivot.x + dx*c - dy*s,
    y: rotPivot.y + dx*s + dy*c,
  };
}

// Curve (track) in normalized coords inside formBox (0..1)
// Approximates the inner curved rail from the photo.
const curve = {
  p0: {x: 0.15, y: 0.40},
  c1: {x: 0.32, y: 0.52},
  c2: {x: 0.43, y: 0.10},
  p1: {x: 0.50, y: 0.12},
  c3: {x: 0.57, y: 0.10},
  c4: {x: 0.68, y: 0.52},
  p2: {x: 0.85, y: 0.40},
};

function toWorld(n){
  return {
    x: formBox.x + n.x * formBox.w,
    y: formBox.y + n.y * formBox.h,
  };
}

function cubic(p0,c1,c2,p1,t){
  const u = 1-t;
  const tt = t*t;
  const uu = u*u;
  const uuu = uu*u;
  const ttt = tt*t;
  return {
    x: uuu*p0.x + 3*uu*t*c1.x + 3*u*tt*c2.x + ttt*p1.x,
    y: uuu*p0.y + 3*uu*t*c1.y + 3*u*tt*c2.y + ttt*p1.y,
  };
}

// Piecewise (two cubics)
function curvePoint(t){
  if(t <= 0.5){
    const tt = t/0.5;
    return cubic(curve.p0, curve.c1, curve.c2, curve.p1, tt);
  }
  const tt = (t-0.5)/0.5;
  return cubic(curve.p1, curve.c3, curve.c4, curve.p2, tt);
}

// Build arc-length LUT for mapping s -> t
const LUT_N = 800;
let lut = null;
function buildLUT(){
  const pts = [];
  let len = 0;
  let prev = toWorld(curvePoint(0));
  pts.push({t:0, s:0, x:prev.x, y:prev.y});
  for(let i=1;i<=LUT_N;i++){
    const t = i/LUT_N;
    const p = toWorld(curvePoint(t));
    len += Math.hypot(p.x-prev.x, p.y-prev.y);
    pts.push({t, s:len, x:p.x, y:p.y});
    prev = p;
  }
  for(const q of pts){ q.s /= len; }
  lut = pts;
}

function tFromS(s){
  s = clamp(s, 0, 1);
  if(!lut) buildLUT();
  let lo = 0, hi = lut.length - 1;
  while(hi - lo > 1){
    const mid = (lo + hi) >> 1;
    if(lut[mid].s < s) lo = mid; else hi = mid;
  }
  const a = lut[lo], b = lut[hi];
  const span = (b.s - a.s) || 1e-9;
  const u = (s - a.s) / span;
  return lerp(a.t, b.t, u);
}

function posFromS(s){
  const t = tFromS(s);
  return toWorld(curvePoint(t));
}

// Buckets (left/right) hanging under ends, will be rotated with the wippe
function bucketPos(side, theta){
  const endS = side === 'left' ? 0.02 : 0.98;
  const end = rotPoint(posFromS(endS), theta);
  return {
    x: end.x,
    y: end.y + 120,
    w: 130,
    h: 112,
  };
}

// Infinite nuts pile (fixed in screen coords)
const pile = {
  x: formBox.x + formBox.w*0.50,
  y: formBox.y + formBox.h + 200,
  r: 46,
};

// =========================================================
// Model Physics (double-well with tipping)
// u in [-1..1] maps to s in [0..1]
// =========================================================
const KIP = 10; // fixed kipppunkt target (between 5 and 13)
const bCrit = 0.3849001794597505; // 2/(3*sqrt(3))

const model = {
  u: -1.0,
  v: 0.0,
  gamma: 2.15,     // a bit more damping (bigger ball)
  massScale: 0.72, // slower acceleration
  k: bCrit / KIP,  // tipping around net ~KIP
};

const state = {
  left: 0,
  right: 0,
  get net(){ return this.right - this.left; },
};

function forceU(u, net){
  // V = u^4/4 - u^2/2 - k*net*u
  // u'' = -dV/du - gamma u'
  // dV/du = u^3 - u - k*net
  return (-u*u*u + u + model.k*net);
}

function stableNow(){
  const f = forceU(model.u, state.net);
  return Math.abs(model.v) < 0.02 && Math.abs(f) < 0.05;
}

function stepModel(dt){
  const f = forceU(model.u, state.net) * model.massScale;
  const a = f - model.gamma * model.v;
  model.v += a * dt;
  model.u += model.v * dt;

  if(model.u < -1.15){ model.u = -1.15; model.v *= -0.2; }
  if(model.u >  1.15){ model.u =  1.15; model.v *= -0.2; }
}

function nudge(){
  const dir = state.net >= 0 ? 1 : -1;
  model.v += dir * 0.65;
}

function displacementMm(){
  // map u from [-1..1] relative to initial -1 -> 0..60
  const d = clamp((model.u - (-1)) / 2, 0, 1);
  return d * 60;
}

// =========================================================
// Wippe tilt with inertia (depends on net)
// =========================================================
const tilt = {
  theta: 0,
  omega: 0,
  thetaPerNut: 0.035,  // rad per nut
  thetaMax: 0.36,
  kP: 26,              // spring
  kD: 9,               // damping
};

function stepTilt(dt){
  const target = clamp(state.net * tilt.thetaPerNut, -tilt.thetaMax, tilt.thetaMax);
  // PD controller
  const a = tilt.kP * (target - tilt.theta) - tilt.kD * tilt.omega;
  tilt.omega += a * dt;
  tilt.theta += tilt.omega * dt;
}

// =========================================================
// Data / Chart (two colors)
// =========================================================
const data = {
  add: [],
  remove: [],
  lastX: null,
};

const XMIN = -12;
const XMAX = 12;
const YMAX = 60;

function recordPoint(){
  if(!stableNow()){
    ui.feedback.innerHTML = '<b>Hinweis:</b> Warte kurz, bis der Ball zur Ruhe gekommen ist (oder stoße ihn leicht an).';
    return;
  }
  const x = clamp(state.net, XMIN, XMAX);
  const y = displacementMm();
  const p = {x, y};

  if(data.lastX === null || x >= data.lastX) data.add.push(p);
  else data.remove.push(p);

  data.lastX = x;
  updateUI();
  drawChart();
}

function undoPoint(){
  if(data.remove.length>0) data.remove.pop();
  else if(data.add.length>0) data.add.pop();
  const all = data.add.concat(data.remove);
  data.lastX = all.length ? all[all.length-1].x : null;
  updateUI();
  drawChart();
}

function resetAll(){
  state.left = 0;
  state.right = 0;
  model.u = -1;
  model.v = 0;
  data.add = [];
  data.remove = [];
  data.lastX = null;
  drag.active = null;
  falling.length = 0;
  tilt.theta = 0;
  tilt.omega = 0;
  updateUI();
  drawChart();
}

function updateUI(){
  ui.countL.textContent = String(state.left);
  ui.countR.textContent = String(state.right);
  ui.net.textContent = String(state.net);
  ui.disp.textContent = String(displacementMm().toFixed(0));

  const near = Math.abs(state.net) >= (KIP-1) && Math.abs(state.net) <= KIP;
  const hint = near ? ` <span style="color:#b00020; font-weight:900;">(nahe Kipppunkt ~${KIP})</span>` : '';

  const msg = `<b>Status:</b> Netto (R−L) = <b>${state.net}</b>${hint}. ` +
    (stableNow() ? '<span style="color:#277d52; font-weight:900;">(stabil)</span>' : '<span style="color:#b00020; font-weight:900;">(in Bewegung)</span>') +
    `<br><b>Messpunkte:</b> ${data.add.length} (Farbe 1) / ${data.remove.length} (Farbe 2).`;

  ui.feedback.innerHTML = msg;
}

function drawChart(){
  const w = chart.width;
  const h = chart.height;
  cctx.clearRect(0,0,w,h);

  const pad = {l:55, r:15, t:15, b:45};
  const x0 = pad.l, y0 = h-pad.b;
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  cctx.fillStyle = '#ffffff';
  cctx.fillRect(0,0,w,h);

  function px(x){ return x0 + pw*((x - XMIN)/(XMAX - XMIN)); }
  function py(y){ return y0 - ph*(clamp(y,0,YMAX)/YMAX); }

  cctx.strokeStyle = 'rgba(0,0,0,0.35)';
  cctx.lineWidth = 2;
  cctx.beginPath();
  cctx.moveTo(x0, y0);
  cctx.lineTo(x0+pw, y0);
  cctx.moveTo(x0, y0);
  cctx.lineTo(x0, y0-ph);
  cctx.stroke();

  cctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  cctx.fillStyle = 'rgba(0,0,0,0.8)';

  for(let x = XMIN; x <= XMAX; x += 2){
    const X = px(x);
    cctx.strokeStyle = 'rgba(0,0,0,0.08)';
    cctx.lineWidth = 1;
    cctx.beginPath();
    cctx.moveTo(X, y0);
    cctx.lineTo(X, y0-ph);
    cctx.stroke();
    if(x % 4 === 0) cctx.fillText(String(x), X-8, y0+18);
  }
  for(let y=0;y<=YMAX;y+=10){
    const Y = py(y);
    cctx.strokeStyle = 'rgba(0,0,0,0.08)';
    cctx.beginPath();
    cctx.moveTo(x0, Y);
    cctx.lineTo(x0+pw, Y);
    cctx.stroke();
    cctx.fillText(String(y), 12, Y+4);
  }

  cctx.fillStyle = 'rgba(0,0,0,0.75)';
  cctx.font = '700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  cctx.fillText('Netto-Muttern (rechts − links)', x0+70, h-12);
  cctx.save();
  cctx.translate(14, y0-20);
  cctx.rotate(-Math.PI/2);
  cctx.fillText('Auslenkung in mm / Temperaturerhöhung', 0, 0);
  cctx.restore();

  cctx.strokeStyle = 'rgba(0,0,0,0.22)';
  cctx.lineWidth = 2;
  cctx.beginPath();
  cctx.moveTo(px(0), y0);
  cctx.lineTo(px(0), y0-ph);
  cctx.stroke();

  function drawSeries(points, color, square){
    if(points.length === 0) return;
    const pts = [...points].sort((a,b)=>a.x-b.x);
    cctx.strokeStyle = color;
    cctx.lineWidth = 3;
    cctx.beginPath();
    cctx.moveTo(px(pts[0].x), py(pts[0].y));
    for(const p of pts.slice(1)) cctx.lineTo(px(p.x), py(p.y));
    cctx.stroke();

    for(const p of pts){
      const X = px(p.x), Y = py(p.y);
      cctx.fillStyle = color;
      cctx.beginPath();
      if(square) cctx.rect(X-5, Y-5, 10, 10);
      else cctx.arc(X, Y, 5, 0, Math.PI*2);
      cctx.fill();
    }
  }

  drawSeries(data.add, '#ff7a00', false);
  drawSeries(data.remove, '#2c8f6a', true);

  cctx.fillStyle = 'rgba(0,0,0,0.55)';
  cctx.beginPath();
  cctx.arc(px(state.net), py(displacementMm()), 4.5, 0, Math.PI*2);
  cctx.fill();
}

// =========================================================
// Drag & Drop with falling nuts
// - Drag from pile -> create nut
// - Drag from bucket lip -> take 1 nut (decrement count) and drag it
// - Drop into bucket -> increment
// - Drop into pile -> remove (if from bucket) or cancel (if from pile)
// - Drop elsewhere -> nut falls out (accelerated)
// =========================================================
const drag = {
  active: null, // {x,y, origin:'pile'|'left'|'right'}
};

const falling = []; // {x,y,vx,vy,rot,omega}

function startDrag(origin, p){
  drag.active = { x: p.x, y: p.y, origin };
}

function onPointerDown(ev){
  ev.preventDefault();
  const p = getPointerPos(ev);

  const bL = bucketPos('left', tilt.theta);
  const bR = bucketPos('right', tilt.theta);

  // remove from bucket via lip area
  const lipH = 28;
  const lipL = {x: bL.x - bL.w/2, y: bL.y - bL.h/2, w: bL.w, h: lipH};
  const lipR = {x: bR.x - bR.w/2, y: bR.y - bR.h/2, w: bR.w, h: lipH};

  if(state.left > 0 && insideRect(p, lipL)){
    state.left -= 1;
    startDrag('left', p);
    updateUI();
    return;
  }
  if(state.right > 0 && insideRect(p, lipR)){
    state.right -= 1;
    startDrag('right', p);
    updateUI();
    return;
  }

  // start from pile
  if(insideCircle(p, pile, pile.r + 12)){
    startDrag('pile', p);
  }
}

function onPointerMove(ev){
  if(!drag.active) return;
  ev.preventDefault();
  const p = getPointerPos(ev);
  drag.active.x = p.x;
  drag.active.y = p.y;
}

function spawnFalling(x,y){
  falling.push({
    x, y,
    vx: (Math.random()*2-1) * 60,
    vy: 40,
    rot: Math.random()*Math.PI*2,
    omega: (Math.random()*2-1) * 6,
  });
}

function onPointerUp(ev){
  if(!drag.active) return;
  ev.preventDefault();

  const p = {x: drag.active.x, y: drag.active.y};
  const bL = bucketPos('left', tilt.theta);
  const bR = bucketPos('right', tilt.theta);
  const rectL = {x: bL.x - bL.w/2, y: bL.y - bL.h/2, w: bL.w, h: bL.h};
  const rectR = {x: bR.x - bR.w/2, y: bR.y - bR.h/2, w: bR.w, h: bR.h};

  const inPile = insideCircle(p, pile, pile.r + 18);

  if(insideRect(p, rectL)){
    state.left += 1;
  } else if(insideRect(p, rectR)){
    state.right += 1;
  } else if(inPile) {
    // dropping onto pile: if nut originated from pile -> cancel; if from bucket -> remove (already decremented)
  } else {
    // drop elsewhere: fall out
    spawnFalling(p.x, p.y);
  }

  drag.active = null;
  updateUI();
}

canvas.addEventListener('pointerdown', onPointerDown, {passive:false});
canvas.addEventListener('pointermove', onPointerMove, {passive:false});
canvas.addEventListener('pointerup', onPointerUp, {passive:false});
canvas.addEventListener('pointercancel', onPointerUp, {passive:false});

// =========================================================
// Drawing
// =========================================================
function roundRect(c, x,y,w,h,r){
  const rr = Math.min(r, w/2, h/2);
  c.beginPath();
  c.moveTo(x+rr, y);
  c.arcTo(x+w, y, x+w, y+h, rr);
  c.arcTo(x+w, y+h, x, y+h, rr);
  c.arcTo(x, y+h, x, y, rr);
  c.arcTo(x, y, x+w, y, rr);
  c.closePath();
}

function drawNut(x,y,scale=1, rot=0){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.arc(0,0,18,0,Math.PI*2);
  ctx.fillStyle = '#c7c7c7';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#8b8b8b';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0,0,7,0,Math.PI*2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#b3b3b3';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-6,-7,5,0,Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fill();

  ctx.restore();
}

function drawForm(theta){
  ctx.save();
  ctx.translate(rotPivot.x, rotPivot.y);
  ctx.rotate(theta);
  ctx.translate(-rotPivot.x, -rotPivot.y);

  if(formReady){
    ctx.drawImage(formImg, formBox.x, formBox.y, formBox.w, formBox.h);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    roundRect(ctx, formBox.x, formBox.y, formBox.w, formBox.h, 24);
    ctx.fill();
  }

  ctx.restore();
}

function drawTrack(theta){
  ctx.strokeStyle = '#277d52';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const p0 = rotPoint(posFromS(0), theta);
  ctx.moveTo(p0.x, p0.y);
  const N = 120;
  for(let i=1;i<=N;i++){
    const s = i/N;
    const p = rotPoint(posFromS(s), theta);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // tick marks
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for(let i=0;i<=12;i++){
    const s = i/12;
    const p = rotPoint(posFromS(s), theta);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y-8);
    ctx.lineTo(p.x, p.y+8);
    ctx.stroke();
  }
}

function drawBall(theta){
  const s = clamp((model.u + 1)/2, 0, 1);
  const base = posFromS(s);
  const p = rotPoint(base, theta);

  // BIGGER ball (≈2x)
  const R = 44;

  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.beginPath();
  ctx.ellipse(p.x+14, p.y+34, 38, 16, 0, 0, Math.PI*2);
  ctx.fill();

  const grad = ctx.createRadialGradient(p.x-14, p.y-18, 10, p.x, p.y, R);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#e6e6e6');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, R, 0, Math.PI*2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#cfcfcf';
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0,0,0,0.11)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, R*0.80, -0.3, Math.PI+0.3);
  ctx.stroke();
}

function drawPile(){
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pile.x, pile.y, pile.r+18, 0, Math.PI*2);
  ctx.fill();
  ctx.stroke();

  for(let i=0;i<7;i++){
    const angle = (i/7)*Math.PI*2;
    const x = pile.x + Math.cos(angle)*18;
    const y = pile.y + Math.sin(angle)*13;
    drawNut(x,y, 0.92);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.font = '800 14px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText('Muttern-Haufen', pile.x - 58, pile.y + pile.r + 34);
  ctx.font = '700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillText('Ziehe eine Mutter', pile.x - 52, pile.y + pile.r + 52);
}

function drawBucket(side, theta){
  const b = bucketPos(side, theta);
  const x = b.x, y = b.y;
  const w = b.w, h = b.h;

  // string to end
  const end = rotPoint(posFromS(side==='left' ? 0.02 : 0.98), theta);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(end.x, end.y + 10);
  ctx.lineTo(x, y - h/2);
  ctx.stroke();

  // bucket body
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  roundRect(ctx, x - w/2, y - h/2, w, h, 16);
  ctx.fill();
  ctx.stroke();

  // lip (grab area)
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  roundRect(ctx, x - w/2, y - h/2, w, 28, 16);
  ctx.fill();

  const count = side==='left' ? state.left : state.right;

  // label
  ctx.fillStyle = 'rgba(0,0,0,0.80)';
  ctx.font = '800 14px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  const label = side==='left' ? `Links: ${count}` : `Rechts: ${count}`;
  ctx.fillText(label, x - w/2 + 12, y - h/2 + 19);

  if(count > 0){
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.font = '700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('Zieh oben, um 1 zu nehmen', x - w/2 + 12, y - h/2 + 44);
  }

  // visible nut stack/grid inside bucket
  const maxDraw = 18;
  const shown = Math.min(count, maxDraw);
  const cols = 6;
  const cell = 18;
  const startX = x - w/2 + 18;
  const startY = y - h/2 + 64;

  for(let i=0;i<shown;i++){
    const cx = startX + (i%cols)*cell;
    const cy = startY + Math.floor(i/cols)*cell;
    drawNut(cx, cy, 0.55);
  }

  if(count > maxDraw){
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.font = '800 12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText(`+${count-maxDraw}`, x + w/2 - 44, y + h/2 - 16);
  }
}

function drawDragNut(){
  if(!drag.active) return;
  drawNut(drag.active.x, drag.active.y, 1.0);
}

function drawFalling(){
  for(const n of falling){
    drawNut(n.x, n.y, 0.95, n.rot);
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);

  // subtle floor
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, formBox.y + formBox.h + 95);
  ctx.lineTo(1340, formBox.y + formBox.h + 95);
  ctx.stroke();

  // rotated form and track
  drawForm(tilt.theta);
  drawTrack(tilt.theta);

  // ball
  drawBall(tilt.theta);

  // buckets (rotated)
  drawBucket('left', tilt.theta);
  drawBucket('right', tilt.theta);

  // pile (fixed)
  drawPile();

  // falling nuts
  drawFalling();

  // dragged nut on top
  drawDragNut();

  // net hint
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.font = '800 16px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText(`Netto (R−L): ${state.net}`, formBox.x + 12, formBox.y + formBox.h + 50);
}

// =========================================================
// Falling physics
// =========================================================
function stepFalling(dt){
  const g = 1600; // accelerated fall
  for(const n of falling){
    n.vy += g*dt;
    n.x += n.vx*dt;
    n.y += n.vy*dt;
    n.rot += n.omega*dt;
  }
  // remove out of view
  for(let i=falling.length-1;i>=0;i--){
    if(falling[i].y > H + 120) falling.splice(i,1);
  }
}

// =========================================================
// Fullscreen + Buttons
// =========================================================
function toggleFullscreen(){
  const el = document.documentElement;
  if(!document.fullscreenElement){ el.requestFullscreen?.(); }
  else { document.exitFullscreen?.(); }
}
ui.fullscreenBtn.addEventListener('click', toggleFullscreen);

ui.btnNudge.addEventListener('click', ()=>{ nudge(); updateUI(); });
ui.btnRecord.addEventListener('click', ()=> recordPoint());
ui.btnUndo.addEventListener('click', ()=> undoPoint());
ui.btnReset.addEventListener('click', ()=> resetAll());

// =========================================================
// Loop
// =========================================================
function loop(){
  const dt = 1/60;

  // tilt inertia
  stepTilt(dt);

  // model dynamics
  const sub = 2;
  for(let i=0;i<sub;i++) stepModel(dt/sub);

  // falling nuts
  stepFalling(dt);

  draw();
  requestAnimationFrame(loop);
}

// init
buildLUT();
updateUI();
drawChart();
requestAnimationFrame(loop);
