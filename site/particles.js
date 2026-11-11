// IRIS homepage · 입자 군무(Particle Swarm) · © 2026 Sejun Ham (함세준) · MIT
/* 하는 일: 화면 뒤에 고정된 three.js 입자 무대 하나를 두고, 스크롤 위치에 따라 입자가 장면마다 다른 모양으로 모인다.
   ① IRIS 글자 → ② 상자 → ③ 폴더 지도(폴더 나무 → 규칙의 폭포, 두 컷) → ④ 두 성운과 창틀 → ⑤ 장비 이름 컷(3) → ⑥ 다시 IRIS.
   톤(2026-11-11 사용자 결정): ② 상자만 원래 밝기·크기, 나머지 장면은 입자 밝기 ×TONE_B · 입자 글자 ×TONE_T(차분한 문서형).
   모양은 화면 밖 캔버스에 글자·도형을 그려 픽셀을 뽑아 목표 위치로 쓴다.
   안전장치: WebGL 이 없으면 html.nogl(평범한 문서), 움직임 줄이기면 html.rm(모양만 정지 상태로), 탭이 숨으면 멈춤,
   느린 PC 는 프레임 시간을 재서 입자 수를 줄인다(초당 45장 목표). 다운로드 단추·글은 모두 HTML 이라 입자와 무관하게 동작한다.
   검수용 주소 꼬리표(평소에는 쓰이지 않음): #review-scene=N (그 장면으로 이동) · &hold=초 (장면에 들어간 뒤 그 시점에서 멈춤). */
(() => {
'use strict';
const root = document.documentElement;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rnd = Math.random;
const TONE_B = .38, TONE_T = .52; // ② 상자 밖 장면의 입자 밝기·입자 글자 크기 배율
const FAM = '"Pretendard Variable", "Pretendard", "Malgun Gothic", sans-serif';

/* ---------- 모드 결정: WebGL 이 되는지 먼저 본다 ---------- */
function glOK() {
  if (!window.THREE) return false;
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
if (!glOK()) { root.classList.add('nogl'); return; }
root.classList.add('motion');
if (RM) root.classList.add('rm');

/* ---------- 필름 입자 ---------- */
const grainEl = $('.grain');
(() => {
  const c = document.createElement('canvas'); c.width = c.height = 160;
  const x = c.getContext('2d'); const d = x.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = rnd() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); if (grainEl) grainEl.style.backgroundImage = 'url(' + c.toDataURL() + ')';
})();

/* ---------- 입자로 그릴 짧은 글 (두 언어) ---------- */
let LANG = root.lang === 'en' ? 'en' : 'ko';
const FEATS = {
  ko: ['한글 · 엑셀 · PDF', '쌓이는 규칙', '계정 자동 전환'],
  en: ['HWP · Excel · PDF', 'Rules that grow', 'Auto account switch']
};

/* ---------- 크기·입자 수 ---------- */
let W = innerWidth, H = innerHeight;
const SMALL = () => W < 760;
const MOBILE = innerWidth < 760 || matchMedia('(pointer: coarse)').matches;
const N = MOBILE ? 10000 : 24000;              // 최대(버퍼 크기)
const NMIN = MOBILE ? 3000 : 6000;             // 느린 기기에서 줄여 갈 하한
let nA = N;                                    // 지금 쓰는 수
let DPR = Math.min(window.devicePixelRatio || 1, 1.5);

const P = new Float32Array(N * 3), V = new Float32Array(N * 3), HOME = new Float32Array(N * 3);
const SPD = new Float32Array(N), TINT = new Float32Array(N), SIZE = new Float32Array(N), SEED = new Float32Array(N);
const sizeK = MOBILE ? 1.05 : 1.15; // 입자가 적은 만큼 조금 크게
for (let i = 0; i < N; i++) { SIZE[i] = (rnd() < .82 ? 2.3 + rnd() * 1.6 : 1.2 + Math.pow(rnd(), 2) * 5.5) * sizeK; SEED[i] = rnd(); }
function makeHome() {
  for (let i = 0; i < N; i++) {
    HOME[i * 3] = (rnd() - .5) * W * 1.25;
    HOME[i * 3 + 1] = (rnd() - .5) * H * 1.25;
    HOME[i * 3 + 2] = -620 + rnd() * 820;
  }
}
makeHome();
P.set(HOME);
for (let i = 0; i < N; i++) P[i * 3 + 1] -= H * .35 * rnd();

/* ---------- 화면 밖 캔버스에서 모양 뽑기 ---------- */
const SC = document.createElement('canvas');
const sx = SC.getContext('2d', { willReadFrequently: true });
function sample(draw) {
  const s = SMALL() ? .8 : .5;
  const cw = Math.ceil(W * s), ch = Math.ceil(H * s);
  SC.width = cw; SC.height = ch;
  sx.setTransform(s, 0, 0, s, 0, 0); sx.clearRect(0, 0, W, H);
  sx.fillStyle = '#fff'; sx.strokeStyle = '#fff'; sx.lineCap = 'round'; sx.lineJoin = 'round';
  draw(sx);
  const d = sx.getImageData(0, 0, cw, ch).data;
  const on = (x, y) => x >= 0 && y >= 0 && x < cw && y < ch && d[(y * cw + x) * 4 + 3] > 110;
  const xs = [], ys = [], ts = [];
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const k = (y * cw + x) * 4;
    if (d[k + 3] > 110) {
      // 가장자리는 여러 번 넣어 윤곽이 빛나게
      const edge = !on(x - 2, y) || !on(x + 2, y) || !on(x, y - 2) || !on(x, y + 2);
      const rep = edge ? 4 : 1;
      for (let r = 0; r < rep; r++) { xs.push(x / s - W / 2); ys.push(H / 2 - y / s); ts.push(d[k + 1] < 120 ? 1 : 0); }
    }
  }
  return { xs, ys, ts, px: 1 / s };
}
function fitText(c, str, maxW, maxH, cx, cy, weight, ls, k) {
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const LS = 'letterSpacing' in c;
  c.font = weight + ' 200px ' + FAM;
  if (LS) c.letterSpacing = (200 * (ls || 0)).toFixed(1) + 'px';
  let m = c.measureText(str);
  let w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  // 휴대폰은 화면이 좁아 입자 글자가 원래도 작으므로 덜 줄인다(.8)
  const size = 200 * Math.min(maxW / w, maxH / h) * (k == null ? (SMALL() ? .8 : TONE_T) : k);
  c.font = weight + ' ' + size.toFixed(1) + 'px ' + FAM;
  if (LS) c.letterSpacing = (size * (ls || 0)).toFixed(1) + 'px';
  m = c.measureText(str);
  w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  c.fillText(str, cx - w / 2 + m.actualBoundingBoxLeft, cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
  if (LS) c.letterSpacing = '0px';
  return { w, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, size };
}
function blank() {
  const sh = { T: new Float32Array(N * 3), mode: new Uint8Array(N).fill(1), tint: new Float32Array(N), delay: new Float32Array(N),
    pa: null, pb: null, pc: null, k: .08, damp: .82, flow: .1, pre: .3, rise: 0, fade: .22, c: [0, 0], bright: 1 };
  sh.T.set(HOME);
  return sh;
}
function place(sh, smp, from, count, o) {
  o = o || {};
  const M = smp.xs.length; if (!M) return;
  const idx = new Uint32Array(M); for (let i = 0; i < M; i++) idx[i] = i;
  const xs = smp.xs; idx.sort((a, b) => xs[a] - xs[b]);
  const jit = smp.px * 1.15, z = o.z || 12;
  for (let j = 0; j < count; j++) {
    const i = from + j; if (i >= nA) break;
    const k = idx[Math.min(M - 1, Math.floor((j + rnd()) * M / count))];
    const x = xs[k] + (rnd() - .5) * jit, y = smp.ys[k] + (rnd() - .5) * jit;
    sh.T[i * 3] = x; sh.T[i * 3 + 1] = y; sh.T[i * 3 + 2] = (rnd() - .5) * z;
    sh.mode[i] = 0; sh.tint[i] = smp.ts[k];
    sh.delay[i] = o.delay ? o.delay(x, y) : 0;
  }
}
/* 장면이 차지할 화면 영역(화면 좌표). 글은 데스크톱 왼쪽·휴대폰 아래에 있으므로 모양은 그 반대편에 둔다 */
function area() {
  if (SMALL()) return { x: W * .05, y: H * .13, w: W * .9, h: H * .42 };
  return { x: W * .41, y: H * .15, w: W * .51, h: H * .72 };
}

/* ---------- 장면별 모양 ---------- */
const LAYOUT = {};
const SHAPES = {
  // 시작 전: 연기처럼 흐르는 상태
  smoke() { const sh = blank(); sh.flow = .5; sh.pre = .5; sh.rise = .05; sh.fade = .1; return sh; },
  // 장면 ⑥·⑦ 의 움직임 줄이기 모드: 글 목록이 보이므로 입자는 배경 먼지만
  dust() { const sh = blank(); sh.flow = .05; return sh; },
  // ① 거대한 IRIS
  hero(o) {
    const sh = blank(), s = SMALL();
    const smp = sample((c) => fitText(c, 'IRIS', W * (s ? .9 : .94), H * (s ? .24 : .62), W / 2, H * (s ? .33 : .44), 900, -.045));
    place(sh, smp, 0, Math.floor(nA * .9), { z: 16, delay: o.intro ? () => .45 + rnd() * .8 : () => rnd() * .22 });
    sh.k = .075; sh.damp = .82; sh.flow = .06; sh.pre = o.intro ? .5 : .25; sh.rise = o.intro ? .05 : 0; sh.fade = .24; sh.bright = 1.6;
    return sh;
  },
  // ② 한 상자 (돌아가는 정육면체)
  box() {
    const sh = blank(), s = SMALL(), a = area();
    const L = s ? Math.min(W * .56, H * .3) : Math.min(W * .26, H * .46), h = L / 2;
    sh.c = [a.x + a.w / 2 - W / 2 + (s ? 0 : W * .02), H / 2 - (a.y + a.h / 2)];
    const C = []; for (let i = 0; i < 8; i++) C.push([(i & 1 ? 1 : -1) * h, (i & 2 ? 1 : -1) * h, (i & 4 ? 1 : -1) * h]);
    const E = []; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const d = i ^ j; if (d === 1 || d === 2 || d === 4) E.push([i, j]); }
    const cnt = Math.floor(nA * .9);
    for (let i = 0; i < cnt; i++) {
      let x, y, z, t = 0;
      if (i < cnt * .62) {
        const e = E[i % 12], u = rnd(), A = C[e[0]], B = C[e[1]], j = 1.6;
        x = lerp(A[0], B[0], u) + (rnd() - .5) * j; y = lerp(A[1], B[1], u) + (rnd() - .5) * j; z = lerp(A[2], B[2], u) + (rnd() - .5) * j;
        t = (i % 12 === 3) ? 1 : 0;
      } else if (i < cnt * .9) {
        const f = (rnd() * 6) | 0, u = (rnd() - .5) * 2 * h, v = (rnd() - .5) * 2 * h, w = (f & 1 ? 1 : -1) * h;
        if (f < 2) { x = w; y = u; z = v; } else if (f < 4) { x = u; y = w; z = v; } else { x = u; y = v; z = w; }
      } else {
        const r = h * .22 * Math.cbrt(rnd()), th = rnd() * 6.283, ph = Math.acos(rnd() * 2 - 1);
        x = r * Math.sin(ph) * Math.cos(th); y = r * Math.sin(ph) * Math.sin(th); z = r * Math.cos(ph); t = 1;
      }
      sh.T[i * 3] = x; sh.T[i * 3 + 1] = y; sh.T[i * 3 + 2] = z; sh.mode[i] = 5; sh.tint[i] = t;
    }
    sh.k = .085; sh.flow = .04; sh.fade = .2;
    return sh;
  },
  // ③ 층층이 생기는 폴더 나무
  tree() {
    const sh = blank(), s = SMALL(), a = area();
    const rows = [1, 3, 5], ys = [.1, .48, .86].map((v) => a.y + a.h * v), spans = [0, .64, .98];
    const fw = Math.min(a.w / (s ? 5.8 : 6.4), s ? 64 : 120), fh = fw * .74;
    const here = [0, 1, 3];
    const pos = rows.map((n, r) => Array.from({ length: n }, (_, k) => a.x + a.w / 2 + (n === 1 ? 0 : (k / (n - 1) - .5) * a.w * spans[r])));
    LAYOUT.tree = { ys, x: a.x, fh, pos };
    const folder = (c, x, y, fill) => {
      const l = x - fw / 2, t = y - fh / 2, tb = fh * .17;
      c.beginPath(); c.moveTo(l, t + tb); c.lineTo(l, t); c.lineTo(l + fw * .38, t); c.lineTo(l + fw * .47, t + tb);
      c.lineTo(l + fw, t + tb); c.lineTo(l + fw, t + fh); c.lineTo(l, t + fh); c.closePath();
      c.lineWidth = s ? 2.4 : 3; c.stroke();
      if (fill) { c.beginPath(); c.moveTo(l, t + tb + fh * .1); c.lineTo(l + fw, t + tb + fh * .1); c.lineWidth = 2; c.stroke(); c.fillRect(l + fw * .12, t + fh * .5, fw * .76, fh * .3); }
    };
    const smp = sample((c) => {
      for (let r = 0; r < 2; r++) {
        const px = pos[r][here[r]], py = ys[r] + fh / 2, ny = ys[r + 1] - fh / 2, my = (py + ny) / 2;
        pos[r + 1].forEach((cx, k) => {
          c.strokeStyle = k === here[r + 1] ? '#f00' : '#fff'; c.lineWidth = k === here[r + 1] ? 2.2 : 1.4;
          c.beginPath(); c.moveTo(px, py); c.lineTo(px, my); c.lineTo(cx, my); c.lineTo(cx, ny); c.stroke();
        });
        pos[r].forEach((qx, k) => { if (k === here[r]) return; c.strokeStyle = '#fff'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(qx, ys[r] + fh / 2); c.lineTo(qx, ys[r] + fh / 2 + (ny - py) * .32); c.stroke(); });
      }
      pos.forEach((row, r) => row.forEach((x, k) => { const h = k === here[r]; c.strokeStyle = h ? '#f00' : '#fff'; c.fillStyle = h ? '#f00' : '#fff'; folder(c, x, ys[r], h); }));
    });
    place(sh, smp, 0, Math.floor(nA * .88), { z: 10, delay: (x, y) => clamp(((H / 2 - y) - a.y) / a.h, 0, 1) * 1.05 });
    sh.k = .1; sh.damp = .8; sh.flow = .05; sh.pre = .22; sh.fade = .22;
    return sh;
  },
  // ④ 규칙의 폭포
  rules() {
    const sh = blank(), s = SMALL(), a = area();
    const ys = [.13, .5, .87].map((v) => a.y + a.h * v), xs = [0, .12, .24].map((v) => a.x + a.w * v);
    const tw = a.w * .72, th = a.h * (s ? .14 : .16);
    const smp = sample((c) => {
      ys.forEach((y, r) => {
        c.fillStyle = r === 2 ? '#f00' : '#fff';
        // 톤: 글자는 줄이되(폭 .66) 왼쪽 끝은 물줄기 자리(xs)에 붙여 둔다 — 가운데 정렬로 줄이면 물줄기와 떨어져 보인다
        const m = fitText(c, 'AGENTS.md', tw * .66, th * .7, xs[r] + tw * .33, y, 700, -.03, 1);
        if (r < 2) { c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.setLineDash([2, 7]); c.beginPath(); c.moveTo(xs[r] + 6, y + m.h * .62); c.lineTo(xs[r] + 6, ys[r + 1] - m.h * .5); c.lineTo(xs[r + 1] - 4, ys[r + 1] - m.h * .5); c.stroke(); c.setLineDash([]); }
      });
    });
    const nt = Math.floor(nA * .68), nf = Math.floor(nA * .2);
    place(sh, smp, 0, nt, { z: 8, delay: (x, y) => clamp(((H / 2 - y) - a.y) / a.h, 0, 1) * .9 });
    sh.pa = new Float32Array(N); sh.pb = new Float32Array(N);
    // 가는 물줄기: 각 층의 왼쪽 끝에서 아래 층으로 쏟아짐 + 넓게 흩뿌려지는 빗줄기
    const cols = [xs[0] + 6, xs[1] + 6, xs[2] + 6, a.x + a.w * .5, a.x + a.w * .8, a.x + a.w * .97];
    for (let j = 0; j < nf; j++) {
      const i = nt + j, c = j % 9;
      sh.mode[i] = 2;
      const cx = c < 6 ? cols[c] : a.x + rnd() * a.w;
      sh.pa[i] = cx + (rnd() - .5) * (c < 6 ? 5 : 2) - W / 2;
      sh.pb[i] = (s ? 6 : 10) + rnd() * (s ? 10 : 18);
      sh.tint[i] = c < 3 ? 1 : (rnd() < .2 ? 1 : 0);
      sh.T[i * 3 + 2] = (rnd() - .5) * 30;
    }
    sh.k = .1; sh.damp = .8; sh.flow = .04; sh.fade = .1;
    return sh;
  },
  // ④ 서로 도는 두 성운 + 하나의 창틀
  agents() {
    const sh = blank(), s = SMALL(), a = area();
    const fw = Math.min(a.w * .98, a.h * 1.55), fh = Math.min(a.h * .94, fw * .66);
    const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
    LAYOUT.agents = { cx: cx - W / 2, cy: H / 2 - cy, fw, fh };
    const smp = sample((c) => {
      const l = cx - fw / 2, t = cy - fh / 2;
      const rr = (x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.stroke(); };
      c.lineWidth = s ? 2 : 2.4; rr(l, t, fw, fh, 16);
      c.lineWidth = 1.3; c.beginPath(); c.moveTo(l, t + 34); c.lineTo(l + fw, t + 34); c.stroke();
      for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(l + 22 + k * 16, t + 17, 4, 0, 6.283); c.fill(); }
      c.fillStyle = '#f00'; c.beginPath(); c.arc(l + 22, t + 17, 4, 0, 6.283); c.fill();
      c.lineWidth = 1.3; const bw = fw * .56; rr(cx - bw / 2, t + fh - 46, bw, 26, 13);
    });
    const nfm = Math.floor(nA * .3);
    place(sh, smp, 0, nfm, { z: 6, delay: () => .15 + rnd() * .3 });
    sh.pa = new Float32Array(N); sh.pb = new Float32Array(N); sh.pc = new Float32Array(N);
    const Rn = fh * .3, nn = Math.floor(nA * .31);
    for (let g = 0; g < 2; g++) for (let j = 0; j < nn; j++) {
      const i = nfm + g * nn + j; if (i >= nA) break;
      const u = Math.pow(rnd(), 1.7), r = Rn * (.03 + .97 * u);
      const arm = ((rnd() * 2) | 0) * Math.PI;
      sh.mode[i] = 3 + g; sh.pa[i] = r; sh.pb[i] = arm + u * 3.1 + (rnd() - .5) * (.25 + u * .5); sh.pc[i] = (rnd() - .5) * Rn * .16 * (1 - u * .6);
      sh.tint[i] = g === 0 ? (rnd() < .82 ? 1 : 0) : 0;
    }
    sh.Rn = Rn; sh.k = .09; sh.flow = .03; sh.fade = .14;
    return sh;
  },
  // ⑤ 장비 이름 컷
  feat(o) {
    if (RM) return SHAPES.dust();
    const sh = blank(), s = SMALL();
    const smp = sample((c) => fitText(c, FEATS[LANG][o.sub], W * (s ? .92 : .9), H * (s ? .09 : .32), W / 2, H * (s ? .4 : .42), 800, -.04));
    place(sh, smp, 0, Math.floor(nA * .9), { z: 10, delay: () => rnd() * .08 });
    sh.k = .16; sh.damp = .74; sh.flow = .04; sh.fade = .2; sh.bright = 1.15;
    return sh;
  },
  // ③ 폴더 지도 — 첫 컷은 폴더 나무, 둘째 컷은 규칙의 폭포
  map(o) {
    const sh = o.sub ? SHAPES.rules() : SHAPES.tree();
    LAYOUT.map = o.sub ? null : LAYOUT.tree;
    return sh;
  },
  // ⑥ 다시 IRIS — 폭발했다가 모임(구역 맨 위, 내려받기 글 위쪽)
  finale() {
    const sh = blank(), s = SMALL();
    const smp = sample((c) => fitText(c, 'IRIS', W * (s ? .86 : .62), H * (s ? .17 : .3), W / 2, s ? 116 + H * .17 : 140 + H * .19, 900, -.045));
    // 2026-11-11 사용자: 마지막 장 IRIS 가 너무 밝음 → 작은 글자에 입자가 몰려 겹쳐 빛나므로 입자 수(.92→.42)와 밝기(1.45→.9)를 함께 낮춘다
    place(sh, smp, 0, Math.floor(nA * .42), { z: 16, delay: () => .42 + rnd() * .16 });
    sh.k = .15; sh.damp = .78; sh.flow = .05; sh.pre = .02; sh.fade = .16; sh.bright = .9;
    return sh;
  }
};
const ORDER = ['hero', 'box', 'map', 'agents', 'feat', 'finale'];
const cache = new Map();
function getShape(si, sub, intro) {
  const key = si + ':' + sub + ':' + LANG + ':' + W + 'x' + H + ':' + nA + ':' + (intro ? 1 : 0);
  let sh = cache.get(key);
  if (!sh) { sh = SHAPES[ORDER[si]]({ sub, intro }); sh.L = LAYOUT[ORDER[si]]; if (ORDER[si] !== 'box') sh.bright = (sh.bright || 1) * TONE_B; cache.set(key, sh); }
  return sh;
}

/* ---------- three.js 무대 ---------- */
const canvas = $('#gl');
let R = null, camera, scene, points, geo, fadeScene, fadeMat, postScene, postMat, ortho, rt, rtS, downMat, downScene, dist = 1000;
try {
  R = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  R.autoClear = false; R.setPixelRatio(DPR);
  camera = new THREE.PerspectiveCamera(40, W / H, 1, 20000);
  scene = new THREE.Scene();
  geo = new THREE.BufferGeometry();
  const pa = new THREE.BufferAttribute(P, 3); pa.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('position', pa);
  const sa = new THREE.BufferAttribute(SPD, 1); sa.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aSpd', sa);
  const ta = new THREE.BufferAttribute(TINT, 1); ta.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aTint', ta);
  geo.setAttribute('aSize', new THREE.BufferAttribute(SIZE, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(SEED, 1));
  geo.setDrawRange(0, nA);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uPR: { value: DPR }, uDist: { value: 1000 }, uBright: { value: 1 }, uT: { value: 0 } },
    vertexShader: `attribute float aSpd;attribute float aTint;attribute float aSize;attribute float aSeed;
      uniform float uPR;uniform float uDist;uniform float uBright;uniform float uT;
      varying float vA;varying float vT;
      void main(){
        vec4 mv=modelViewMatrix*vec4(position,1.);
        gl_Position=projectionMatrix*mv;
        float z=-mv.z;
        float sp=min(aSpd,40.);
        gl_PointSize=clamp(aSize*uPR*(uDist/z)*(1.+sp*.025),.8,48.);
        float tw=.8+.2*sin(uT*2.3+aSeed*40.);
        float df=clamp(1.-(z-uDist)/1500.,.22,1.15);
        vec2 p=position.xy;
        float n=sin(p.x*.0055+uT*.45)*sin(p.y*.0072-uT*.33)+.6*sin((p.x+p.y)*.0026+uT*.21)+.35*sin(p.x*.013-p.y*.009+uT*.8);
        float sm=smoothstep(-.75,1.5,n);
        float smoke=.2+2.2*sm*sm;
        vA=uBright*(.62+min(sp*.08,1.4))*tw*df*smoke;
        vT=aTint;
      }`,
    fragmentShader: `varying float vA;varying float vT;
      void main(){
        vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;
        if(d>1.)discard;
        float a=exp(-d*3.2)-.04;
        vec3 col=mix(vec3(.93,.92,.97),vec3(.66,.62,1.),vT);
        gl_FragColor=vec4(col*a*vA,1.);
      }`,
    blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true
  });
  points = new THREE.Points(geo, mat); points.frustumCulled = false; scene.add(points);
  ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.PlaneGeometry(2, 2);
  const VSQ = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const halfOK = R.extensions.has('EXT_color_buffer_float') || R.extensions.has('EXT_color_buffer_half_float');
  // 움직임 흔적: 매 장면 앞에 화면을 조금씩만 지운다
  fadeMat = new THREE.ShaderMaterial({
    uniforms: { uA: { value: .2 }, uSub: { value: halfOK ? 0 : 1.6 / 255 } },
    vertexShader: VSQ, fragmentShader: 'uniform float uA;uniform float uSub;void main(){gl_FragColor=vec4(vec3(uSub),uA);}',
    blending: THREE.CustomBlending, blendEquation: THREE.ReverseSubtractEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
    depthTest: false, depthWrite: false
  });
  fadeScene = new THREE.Scene(); fadeScene.add(new THREE.Mesh(quad, fadeMat));
  const rtOpt = { type: halfOK ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  rt = new THREE.WebGLRenderTarget(4, 4, rtOpt);
  rtS = new THREE.WebGLRenderTarget(4, 4, rtOpt); // 빛 번짐용 1/4 사본
  downMat = new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: rt.texture }, uPx: { value: new THREE.Vector2(1, 1) } },
    vertexShader: VSQ,
    fragmentShader: `varying vec2 vUv;uniform sampler2D tSrc;uniform vec2 uPx;
      void main(){vec2 o=uPx;
        vec3 c=texture2D(tSrc,vUv+vec2(-o.x,-o.y)).rgb+texture2D(tSrc,vUv+vec2(o.x,-o.y)).rgb+texture2D(tSrc,vUv+vec2(-o.x,o.y)).rgb+texture2D(tSrc,vUv+vec2(o.x,o.y)).rgb;
        gl_FragColor=vec4(c*.25,1.);}`,
    depthTest: false, depthWrite: false
  });
  downScene = new THREE.Scene(); downScene.add(new THREE.Mesh(quad, downMat));
  postMat = new THREE.ShaderMaterial({
    uniforms: { tAcc: { value: rt.texture }, tS: { value: rtS.texture }, uResS: { value: new THREE.Vector2(1, 1) }, uRes: { value: new THREE.Vector2(4, 4) }, uFlash: { value: 0 }, uAb: { value: 0 }, uT: { value: 0 } },
    vertexShader: VSQ,
    fragmentShader: `precision highp float;varying vec2 vUv;uniform sampler2D tAcc;uniform sampler2D tS;uniform vec2 uResS;uniform vec2 uRes;uniform float uFlash;uniform float uAb;uniform float uT;
      vec3 tp(vec2 u){return texture2D(tAcc,u).rgb;}
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      void main(){
        vec2 uv=vUv;vec2 d=uv-.5;
        float ab=.0012+uAb*.016;
        vec3 c=vec3(tp(uv-d*ab).r,tp(uv).g,tp(uv+d*ab).b);
        vec2 sp=1./uResS;
        vec3 g=texture2D(tS,uv).rgb*.2;
        g+=(texture2D(tS,uv+vec2(sp.x*1.5,0.)).rgb+texture2D(tS,uv-vec2(sp.x*1.5,0.)).rgb+texture2D(tS,uv+vec2(0.,sp.y*1.5)).rgb+texture2D(tS,uv-vec2(0.,sp.y*1.5)).rgb)*.12;
        g+=(texture2D(tS,uv+sp*2.6).rgb+texture2D(tS,uv-sp*2.6).rgb+texture2D(tS,uv+vec2(sp.x,-sp.y)*2.6).rgb+texture2D(tS,uv+vec2(-sp.x,sp.y)*2.6).rgb)*.08;
        c+=g*.95;
        c=1.-exp(-c*1.2);
        vec2 b=(uv-vec2(.6,.64));b.x*=uRes.x/uRes.y;
        vec3 bg=vec3(0.); // 2026-11-11 사용자: 뒷배경 완전 까맣게(옛 보랏빛 번짐 없앰)
        vec3 col=bg+c*(1.-bg);
        col+=uFlash*(.14+c*.85)*vec3(.95,.94,1.);
        col+=max(hash(gl_FragCoord.xy+fract(uT))-.5,0.)*c.g/255.; // 띠 줄이기 잡음은 입자 위에만(검은 바탕은 0 그대로)
        gl_FragColor=vec4(col,1.);
      }`,
    depthTest: false, depthWrite: false
  });
  postScene = new THREE.Scene(); postScene.add(new THREE.Mesh(quad, postMat));
} catch (e) {
  R = null;
}
if (!R) { root.classList.remove('motion', 'rm'); root.classList.add('nogl'); return; }

function resizeGL() {
  W = innerWidth; H = innerHeight;
  R.setPixelRatio(DPR);
  R.setSize(W, H, false);
  camera.aspect = W / H;
  dist = (H / 2) / Math.tan(THREE.MathUtils.degToRad(20));
  camera.near = 1; camera.far = dist * 6; camera.updateProjectionMatrix();
  points.material.uniforms.uDist.value = dist;
  points.material.uniforms.uPR.value = DPR;
  const bw = Math.round(W * DPR), bh = Math.round(H * DPR);
  rt.setSize(bw, bh); postMat.uniforms.uRes.value.set(bw, bh);
  const sw = Math.max(2, Math.round(bw / 4)), shh = Math.max(2, Math.round(bh / 4));
  rtS.setSize(sw, shh); postMat.uniforms.uResS.value.set(sw, shh); downMat.uniforms.uPx.value.set(1 / bw, 1 / bh);
  R.setRenderTarget(rt); R.setClearColor(0x000000, 1); R.clear(); R.setRenderTarget(null);
}

/* ---------- 연출 상태 ---------- */
let ACT = RM ? SHAPES.dust() : SHAPES.smoke(), actKey = 'smoke', curScene = -1, curSub = -1;
let dissolve = 0, camY = 0;
let clock = 0, t0 = 0, flash = 0, shake = 0, aberr = 0, dolly = 0, fadeKick = 0, svPush = 0, introDone = RM;
const sched = [];
const after = (s, fn) => sched.push({ at: clock + s, fn });
function impact(a) { flash = Math.max(flash, a); shake = Math.max(shake, a); aberr = Math.max(aberr, a); }
function burst(s, cx, cy, radial) {
  for (let i = 0; i < nA; i++) {
    const i3 = i * 3;
    if (radial) {
      const dx = P[i3] - cx, dy = P[i3 + 1] - cy, d = Math.hypot(dx, dy) + 1;
      const k = s * (.5 + rnd());
      V[i3] += dx / d * k; V[i3 + 1] += dy / d * k; V[i3 + 2] += (rnd() - .5) * k * 1.4;
    } else {
      const a = rnd() * 6.283, k = s * rnd();
      V[i3] += Math.cos(a) * k; V[i3 + 1] += Math.sin(a) * k; V[i3 + 2] += (rnd() - .5) * k;
    }
  }
}
function go(si, sub, force) {
  const intro = si === 0 && !introDone;
  const key = si + ':' + sub;
  if (key === actKey && !force) return;
  const prev = curScene;
  actKey = key; curScene = si; curSub = sub;
  ACT = getShape(si, sub, intro);
  t0 = clock;
  if (force || RM) return;
  if (intro) { introDone = true; after(2.05, () => { impact(.85); dolly = .05; }); return; }
  if (si !== prev) {
    // 장면이 바뀜 — 확대해 들어가는 컷
    dolly = -.26; fadeKick = .75; burst(si === 5 ? 0 : 5);
    impact(.32);
    if (si === 5) { burst(26, 0, H / 2 - (SMALL() ? 116 + H * .17 : 140 + H * .19), true); impact(.45); dolly = .18; after(1.05, () => { impact(.5); dolly = -.06; }); }
    if (si === 2) after(.95, () => impact(.35));
  } else {
    // 같은 장면 안의 컷 (③ 폴더 지도 2컷, ⑤ 장비 3컷)
    fadeKick = .6;
    if (si === 4) { burst(9, 0, 0, true); impact(.8); dolly = -.12; }
    else { burst(7, 0, 0, true); impact(.45); dolly = -.08; }
  }
}

/* ---------- 포인터 ---------- */
const ptr = { x: -9999, y: -9999, cx: -9999, cy: -9999, vx: 0, vy: 0, sx: W / 2, sy: H / 2, rx: W / 2, ry: H / 2, nx: 0, ny: 0, on: false };
const ring = $('#ring');
window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return; // 휴대폰에서는 손가락 스크롤이 입자를 흩뜨리지 않게
  const x = e.clientX - W / 2, y = H / 2 - e.clientY;
  if (ptr.on) { ptr.vx += (x - ptr.cx) * .5; ptr.vy += (y - ptr.cy) * .5; }
  ptr.cx = x; ptr.cy = y; ptr.on = true;
  ptr.sx = e.clientX; ptr.sy = e.clientY; if (ring) ring.classList.add('on');
}, { passive: true });
document.addEventListener('pointerleave', () => { if (ring) ring.classList.remove('on'); ptr.on = false; ptr.cx = ptr.cy = -9999; });
document.addEventListener('pointerover', (e) => { if (ring) ring.classList.toggle('big', !!e.target.closest('a,button,summary')); });

/* ---------- 시뮬레이션 ---------- */
const NEB = [0, 0, 0, 0];
function simulate(dt) {
  const f = Math.min(dt * 60, 4);
  const sh = ACT, T = sh.T, MODE = sh.mode, DL = sh.delay;
  const damp = Math.pow(sh.damp, f), dampA = Math.pow(.9, f);
  const el = clock - t0, t = clock;
  // 첫 화면에서 스크롤하면 IRIS 가 연기처럼 풀려 올라간다
  const dis = curScene === 0 ? dissolve : 0;
  const k0 = sh.k * (1 - dis * .85), flow = sh.flow + dis * .55, pre = sh.pre, rise = sh.rise + dis * .09;
  const Rr = SMALL() ? 90 : 165, R2 = Rr * Rr, rep = SMALL() ? 4 : 6.5;
  const mx = ptr.cx, my = ptr.cy === -9999 ? -9999 : ptr.cy + camY, mvx = ptr.vx, mvy = ptr.vy;
  const ry = t * .42 + ptr.nx * .6, rx = -.48 + ptr.ny * .35;
  const cy_ = Math.cos(ry), sy_ = Math.sin(ry), cx_ = Math.cos(rx), sx_ = Math.sin(rx);
  let ax = 0, ay = 0, bx = 0, by = 0, Rn = 1;
  if (sh.L && sh.Rn) {
    const L = sh.L, th = t * .62;
    ax = L.cx + Math.cos(th) * L.fw * .2; ay = L.cy + Math.sin(th) * L.fh * .16;
    bx = L.cx - Math.cos(th) * L.fw * .2; by = L.cy - Math.sin(th) * L.fh * .16; Rn = sh.Rn;
    NEB[0] = ax; NEB[1] = ay; NEB[2] = bx; NEB[3] = by;
  }
  const hH = H / 2;
  for (let i = 0; i < nA; i++) {
    const i3 = i * 3, m = MODE[i];
    let px = P[i3], py = P[i3 + 1], pz = P[i3 + 2], vx = V[i3], vy = V[i3 + 1], vz = V[i3 + 2];
    if (m === 2) {
      // 폭포: 위에서 아래로 쏟아짐
      vx = (vx + (sh.pa[i] - px) * .03 * f) * damp; vz *= damp;
      const sp = sh.pb[i];
      vy = lerp(vy, -sp, 1 - Math.pow(.86, f));
      px += vx * f; py += vy * f; pz += vz * f;
      if (py < -hH - 30) { py = hH + 20 + rnd() * 160; px = sh.pa[i] + (rnd() - .5) * 4; vx = 0; vy = -sp * .5; }
      if (RM) px = sh.pa[i];
    } else {
      let tx, ty, tz, k = k0, fl = flow;
      if (m === 0) { tx = T[i3]; ty = T[i3 + 1]; tz = T[i3 + 2]; }
      else if (m === 5) {
        const lx = T[i3], ly = T[i3 + 1], lz = T[i3 + 2];
        const x1 = lx * cy_ + lz * sy_, z1 = -lx * sy_ + lz * cy_;
        const y2 = ly * cx_ - z1 * sx_, z2 = ly * sx_ + z1 * cx_;
        tx = sh.c[0] + x1; ty = sh.c[1] + y2; tz = z2;
      } else if (m === 3 || m === 4) {
        const r = sh.pa[i], an = sh.pb[i] + t * (.9 / (.18 + r / Rn)) * (m === 3 ? 1 : -1);
        const ox = m === 3 ? ax : bx, oy = m === 3 ? ay : by, tilt = m === 3 ? .5 : -.42;
        const c = Math.cos(an) * r, s = Math.sin(an) * r * .5;
        tx = ox + c * Math.cos(tilt) - s * Math.sin(tilt); ty = oy + c * Math.sin(tilt) + s * Math.cos(tilt); tz = sh.pc[i] + Math.sin(an) * r * .3;
        k = k0 * 1.1;
      } else { tx = T[i3] + Math.sin(t * .13 + i) * 40; ty = T[i3 + 1] + Math.cos(t * .11 + i * 1.7) * 40; tz = T[i3 + 2]; k = .0035; fl = Math.max(flow, .12); }
      if (m !== 1 && el < DL[i]) { k = 0; fl = pre; }
      if (RM) { px = tx; py = ty; pz = tz; vx = vy = vz = 0; }
      else {
        let fx = (tx - px) * k, fy = (ty - py) * k, fz = (tz - pz) * k;
        fx += Math.sin(py * .0043 + t * .7 + i * .37) * fl;
        fy += Math.cos(px * .0037 - t * .55 + i * .11) * fl + (k === 0 || dis > 0 ? rise : 0) + svPush;
        fz += Math.sin(px * .002 + py * .003 + t * .4) * fl * .6;
        const dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + .001, s = 1 - d / Rr, s2 = s * s;
          fx += dx / d * s2 * rep + mvx * s2 * .06 - dy / d * s2 * 1.6;
          fy += dy / d * s2 * rep + mvy * s2 * .06 + dx / d * s2 * 1.6;
          fz += s2 * 3;
        }
        const dd = m === 1 ? dampA : damp;
        vx = (vx + fx * f) * dd; vy = (vy + fy * f) * dd; vz = (vz + fz * f) * dd;
        px += vx * f; py += vy * f; pz += vz * f;
      }
    }
    P[i3] = px; P[i3 + 1] = py; P[i3 + 2] = pz; V[i3] = vx; V[i3 + 1] = vy; V[i3 + 2] = vz;
    SPD[i] = m === 2 ? 5 + Math.abs(vx) : Math.abs(vx) + Math.abs(vy) + Math.abs(vz) * .5;
    TINT[i] += (sh.tint[i] - TINT[i]) * (RM ? 1 : .12);
  }
}

/* ---------- 스크롤 → 장면 ---------- */
const secs = $$('main .sc');
let tops = [], hs = [];
function measure() { tops = secs.map((s) => s.getBoundingClientRect().top + scrollY); hs = secs.map((s) => s.offsetHeight); }
function scrollState() {
  const y = scrollY + innerHeight * .5;
  let a = 0; for (let i = 0; i < secs.length; i++) if (tops[i] <= y) a = i;
  const p = clamp((scrollY - tops[a]) / Math.max(1, hs[a] - innerHeight), 0, 1);
  let sub = 0;
  if (!RM && a === 2) sub = Math.min(1, Math.floor(p * 2));
  if (!RM && a === 4) sub = Math.min(2, Math.floor(p * 3));
  return { a, p, sub };
}

/* ---------- 글 상자 갱신 ---------- */
const chap = $('#chap'), chapBox = $('.chap'), cnt = $('#cnt'), bar = $('#bar');
const n6 = $('#n6'), cap6 = $('#cap6'), ticks6 = $$('#ticks6 b'), feats = $$('#featList li');
const tags3 = $$('#tags3 .tag'), tags5 = $$('#tags5 .tag'), tagsBox3 = $('#tags3');
const heroSec = secs[0];
let domScene = -1, domSub = -1;
const rebump = (el) => { if (!el || RM) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };
function syncDom(a, sub) {
  if (a !== domScene) {
    secs.forEach((s, i) => s.classList.toggle('on', i === a));
    if (chapBox && chap) { chapBox.classList.add('swap'); chap.textContent = secs[a].dataset.chap || ''; requestAnimationFrame(() => chapBox.classList.remove('swap')); }
    if (cnt) cnt.textContent = String(a + 1).padStart(2, '0');
    document.body.dataset.s = a;
    if (a !== 0 && introDone) heroSec.classList.add('seen');
  }
  if (a !== domScene || sub !== domSub) {
    if (tagsBox3) tagsBox3.classList.toggle('off', !(a === 2 && sub === 0));
    if (a === 4 && !RM) {
      if (n6) n6.textContent = String(sub + 1).padStart(2, '0');
      if (cap6 && feats[sub]) cap6.textContent = feats[sub].textContent;
      ticks6.forEach((b, i) => b.classList.toggle('a', i <= sub)); rebump(cap6); rebump(n6);
    }
  }
  domScene = a; domSub = sub;
}
function placeTags() {
  const sh = ACT;
  if (curScene === 2 && sh.L) {
    const L = sh.L;
    tags3.forEach((el, r) => { const x = Math.max(12, L.pos[r][0] - (L.pos[r].length === 1 ? L.fh * .7 : L.fh * .68)); el.style.transform = 'translate(' + x.toFixed(0) + 'px,' + (L.ys[r] - L.fh / 2 - 26).toFixed(0) + 'px)'; });
  }
  if (curScene === 3 && sh.L) {
    const L = sh.L, Rn = sh.Rn || 100;
    const toS = (x, y) => [x + W / 2, H / 2 - y];
    const A = toS(NEB[0], NEB[1]), B = toS(NEB[2], NEB[3]);
    // 이름표는 두 성운을 잇는 선의 바깥쪽에 둔다
    let dx = A[0] - B[0], dy = A[1] - B[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const off = Rn * .72;
    const put = (el, x, y, sgn) => { const w = el._w || (el._w = el.offsetWidth); el.style.transform = 'translate(' + clamp(sgn > 0 ? x + 8 : x - w - 8, 8, W - w - 8).toFixed(0) + 'px,' + (y - 8).toFixed(0) + 'px)'; };
    put(tags5[0], A[0] + dx * off, A[1] + dy * off * .6, dx);
    put(tags5[1], B[0] - dx * off, B[1] - dy * off * .6, -dx);
    const F = toS(L.cx - L.fw / 2, L.cy + L.fh / 2);
    tags5[2].style.transform = 'translate(' + F[0].toFixed(0) + 'px,' + (F[1] - 30).toFixed(0) + 'px)';
  }
}

/* ---------- 느린 PC 대응: 프레임 시간을 재서 입자 수·해상도를 줄인다 ---------- */
const perf = { sum: 0, n: 0, wait: 2.5 };
function adapt(dtRaw) {
  if (RM) return;
  if (perf.wait > 0) { perf.wait -= dtRaw; return; }
  perf.sum += dtRaw; perf.n++;
  if (perf.n < 60) return;
  const avg = perf.sum / perf.n; perf.sum = 0; perf.n = 0;
  if (avg <= 1 / 45) return;
  if (nA > NMIN) {
    nA = Math.max(NMIN, Math.floor(nA * .72));
    geo.setDrawRange(0, nA); cache.clear();
    if (curScene >= 0) go(curScene, curSub, true);
    perf.wait = 1.2;
  } else if (DPR > 1) {
    DPR = 1; resizeGL(); perf.wait = 1.2;
  }
}

/* ---------- 그리기 루프 ---------- */
let raf = 0, last = performance.now(), lastScroll = scrollY, sv = 0, frame = 0, started = false;
function render(dt) {
  const f = Math.min(dt * 60, 4);
  ptr.nx = lerp(ptr.nx, ptr.on ? (ptr.sx / W - .5) * 2 : 0, .05);
  ptr.ny = lerp(ptr.ny, ptr.on ? (ptr.sy / H - .5) * 2 : 0, .05);
  const sk = shake * shake * (SMALL() ? 14 : 26);
  camera.position.set((rnd() - .5) * sk, camY + (rnd() - .5) * sk, dist * (1 + dolly));
  points.rotation.y = ptr.nx * .06; points.rotation.x = ptr.ny * .04;
  const u = points.material.uniforms;
  u.uT.value = clock;
  u.uBright.value = RM ? (ACT.bright || 1) : lerp(u.uBright.value, ACT.bright || 1, 1 - Math.pow(.9, f));
  geo.attributes.position.needsUpdate = true; geo.attributes.aSpd.needsUpdate = true; geo.attributes.aTint.needsUpdate = true;
  let a = ACT.fade * (1 - fadeKick * .7) - Math.min(Math.abs(sv) * .003, .08);
  a = RM ? 1 : clamp(a, .04, .6);
  fadeMat.uniforms.uA.value = RM ? 1 : 1 - Math.pow(1 - a, f);
  R.setRenderTarget(rt); R.render(fadeScene, ortho); R.render(scene, camera);
  R.setRenderTarget(rtS); R.render(downScene, ortho);
  R.setRenderTarget(null);
  postMat.uniforms.uFlash.value = flash; postMat.uniforms.uAb.value = aberr; postMat.uniforms.uT.value = clock;
  R.render(postScene, ortho);
}
function tick(now) {
  raf = 0;
  if (dead) return;
  const dtRaw = Math.max(0, (now - last) / 1000); last = now;
  const dt = Math.min(dtRaw, .2);
  const f = Math.min(dt * 60, 6);
  if (HOLD > 0 && started && curScene === Math.max(0, JUMP - 1) && clock - t0 >= HOLD) { if (!document.hidden) raf = requestAnimationFrame(tick); return; }
  if (!RM) clock += dt;
  for (let i = sched.length - 1; i >= 0; i--) if (clock >= sched[i].at) { const s = sched.splice(i, 1)[0]; s.fn(); }
  const ds = scrollY - lastScroll; lastScroll = scrollY; sv = lerp(sv, ds, .2);
  svPush = RM ? 0 : clamp(sv * .03, -1.6, 1.6);
  dissolve = RM ? 0 : Math.pow(clamp((scrollY / (innerHeight * .85) - .08) / .92, 0, 1), 1.4);
  const st = scrollState();
  camY = st.a === 5 ? -(scrollY - tops[5]) : 0;
  if (started) { go(st.a, st.sub); syncDom(st.a, st.sub); }
  flash *= Math.pow(.86, f); aberr *= Math.pow(.9, f); shake *= Math.pow(.88, f); fadeKick *= Math.pow(.93, f);
  dolly *= Math.pow(.9, f); ptr.vx *= Math.pow(.8, f); ptr.vy *= Math.pow(.8, f);
  const steps_ = RM ? 1 : Math.min(4, Math.max(1, Math.ceil(dt / .05)));
  for (let s = 0; s < steps_; s++) simulate(dt / steps_);
  placeTags();
  render(dt);
  if (started && frame > 5) adapt(dtRaw);
  const maxS = document.documentElement.scrollHeight - innerHeight;
  if (bar) bar.style.transform = 'scaleY(' + (maxS > 0 ? scrollY / maxS : 0).toFixed(4) + ')';
  if (ring && !RM) {
    ptr.rx = lerp(ptr.rx, ptr.sx, .18); ptr.ry = lerp(ptr.ry, ptr.sy, .18);
    ring.style.transform = 'translate3d(' + ptr.rx.toFixed(1) + 'px,' + ptr.ry.toFixed(1) + 'px,0)';
  }
  if (frame++ % 3 === 0 && !RM && grainEl) grainEl.style.transform = 'translate(' + (rnd() * 10 - 5).toFixed(1) + '%,' + (rnd() * 10 - 5).toFixed(1) + '%)';
  if (!RM && !document.hidden) raf = requestAnimationFrame(tick);
}
// 코덱스 검토 4: WebGL 을 잃으면(드라이버 문제 등) 문서 모드로 바꾸고 엔진을 완전히 멈춘다 — 탭 복귀·창 크기 변경으로 다시 돌지 않게
let dead = false;
function kick() { if (!dead && !raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }
document.addEventListener('visibilitychange', () => { if (!document.hidden) { perf.sum = 0; perf.n = 0; perf.wait = 1; kick(); } });
// 움직임 줄이기 모드는 매 프레임 돌지 않고 스크롤할 때만 한 장씩 그린다
window.addEventListener('scroll', () => { if (RM) kick(); }, { passive: true });
let rzT = 0, lastW = innerWidth, lastH = innerHeight;
window.addEventListener('resize', () => {
  clearTimeout(rzT);
  rzT = setTimeout(() => {
    if (dead) return;
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 140) { measure(); kick(); return; } // 휴대폰 주소창 높이 변화는 무시
    lastW = innerWidth; lastH = innerHeight;
    resizeGL(); makeHome(); cache.clear(); measure();
    if (curScene >= 0) go(curScene, curSub, true);
    kick();
  }, 180);
});
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); dead = true; cancelAnimationFrame(raf); raf = 0; root.classList.remove('motion', 'rm'); root.classList.add('nogl'); });

/* ---------- 언어: site.js 가 <html lang> 을 바꾸면 입자 글자도 다시 만든다 ---------- */
new MutationObserver(() => {
  const l = root.lang === 'en' ? 'en' : 'ko';
  if (l === LANG) return;
  LANG = l; cache.clear(); domScene = -1; domSub = -1;
  for (const t of tags5) t._w = 0;
  requestAnimationFrame(() => { measure(); if (curScene >= 0) go(curScene, curSub, true); kick(); });
}).observe(root, { attributes: true, attributeFilter: ['lang'] });

/* ---------- 시작 ---------- */
const hm = location.hash.match(/review-scene=(\d)/);
const JUMP = hm ? clamp(+hm[1], 1, 6) : 0;
const hh = hm ? location.hash.match(/hold=([\d.]+)/) : null;
const HOLD = hh ? +hh[1] : 0;
resizeGL(); measure(); kick();
const begin = () => {
  measure();
  if (JUMP > 1) {
    introDone = true;
    const i = JUMP - 1, y = tops[i] + Math.max(0, hs[i] - innerHeight) * .5;
    window.scrollTo({ top: y, behavior: 'instant' });
    lastScroll = scrollY;
  } else if (scrollY > innerHeight * .5) introDone = true; // 새로 고침으로 중간에서 시작하면 첫 화면 연출은 건너뜀
  started = true; kick();
};
const fontReady = document.fonts && document.fonts.load
  ? Promise.race([document.fonts.load('900 100px "Pretendard Variable"').then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 1500))])
  : Promise.resolve();
// 코덱스 검토 2: 글꼴을 못 받아도(실패·차단) 반드시 시작한다 — 대체 글꼴로라도 장면·글·단추가 보여야 한다
let begun = false;
const beginOnce = () => { if (begun) return; begun = true; setTimeout(begin, 60); };
fontReady.then(beginOnce, beginOnce);
setTimeout(beginOnce, 3000);
if (document.fonts) document.fonts.addEventListener('loadingdone', () => { measure(); });
})();
