// IRIS homepage · 첫 화면 입자 IRIS · © 2026 Sejun Ham (함세준) · MIT
/* 하는 일: 첫 화면(#hero) 안의 three.js 입자들이 모여 IRIS 글자를 만든다. 아래로 스크롤하면 연기처럼 풀려 올라가고,
   첫 화면이 화면 밖으로 나가면 그리기를 멈춘다(배터리·CPU 아낌).
   2026-11-11 사용자 결정: 입자 연출은 첫 화면 하나만, 그 아래는 정보를 정리해 보여 주는 평범한 문서(옛 홈페이지 방식).
   배경은 완전한 검정이고, IRIS 모양에 들지 않은 입자(떠도는 점)는 보이지 않는다.
   안전장치: WebGL 이 없으면 html.nogl(입자 없이 글만), 움직임 줄이기면 정지한 IRIS 한 장, 탭이 숨으면 멈춤,
   느린 PC 는 프레임 시간을 재서 입자 수를 줄인다(초당 45장 목표). 내려받기 단추·글은 모두 HTML 이라 입자와 무관하다. */
(() => {
'use strict';
const root = document.documentElement;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rnd = Math.random;
const FAM = '"Pretendard Variable", "Pretendard", "Malgun Gothic", sans-serif';
const hero = document.getElementById('hero'), canvas = document.getElementById('gl');
if (!hero || !canvas) return;

/* ---------- 모드 결정: WebGL 이 되는지 먼저 본다 ---------- */
function glOK() {
  if (!window.THREE) return false;
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
if (!glOK()) { root.classList.add('nogl'); return; }
root.classList.add('gl');

/* ---------- 크기·입자 수 ---------- */
let W = hero.clientWidth || innerWidth, H = hero.clientHeight || innerHeight;
const SMALL = () => W < 760;
const MOBILE = innerWidth < 760 || matchMedia('(pointer: coarse)').matches;
const N = MOBILE ? 9000 : 20000;               // 최대(버퍼 크기)
const NMIN = MOBILE ? 3000 : 6000;             // 느린 기기에서 줄여 갈 하한
let nA = N;
let DPR = Math.min(window.devicePixelRatio || 1, 1.5);

const P = new Float32Array(N * 3), V = new Float32Array(N * 3), HOME = new Float32Array(N * 3);
const SPD = new Float32Array(N), TINT = new Float32Array(N), SIZE = new Float32Array(N), SEED = new Float32Array(N);
const ON = new Float32Array(N); // 0~1: IRIS 모양에 든 입자만 보인다
const sizeK = MOBILE ? 1.05 : 1.15;
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

/* ---------- 화면 밖 캔버스에서 글자 모양 뽑기 ---------- */
const SC = document.createElement('canvas');
const sx = SC.getContext('2d', { willReadFrequently: true });
function sample(draw) {
  const s = SMALL() ? .8 : .5;
  const cw = Math.ceil(W * s), ch = Math.ceil(H * s);
  SC.width = cw; SC.height = ch;
  sx.setTransform(s, 0, 0, s, 0, 0); sx.clearRect(0, 0, W, H);
  sx.fillStyle = '#fff';
  draw(sx);
  const d = sx.getImageData(0, 0, cw, ch).data;
  const on = (x, y) => x >= 0 && y >= 0 && x < cw && y < ch && d[(y * cw + x) * 4 + 3] > 110;
  const xs = [], ys = [];
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (d[(y * cw + x) * 4 + 3] > 110) {
      // 가장자리는 여러 번 넣어 윤곽이 빛나게
      const edge = !on(x - 2, y) || !on(x + 2, y) || !on(x, y - 2) || !on(x, y + 2);
      for (let r = 0, rep = edge ? 4 : 1; r < rep; r++) { xs.push(x / s - W / 2); ys.push(H / 2 - y / s); }
    }
  }
  return { xs, ys, px: 1 / s };
}
function fitText(c, str, maxW, maxH, cx, cy, weight, ls) {
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const LS = 'letterSpacing' in c;
  c.font = weight + ' 200px ' + FAM;
  if (LS) c.letterSpacing = (200 * (ls || 0)).toFixed(1) + 'px';
  let m = c.measureText(str);
  const w0 = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, h0 = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const size = 200 * Math.min(maxW / w0, maxH / h0);
  c.font = weight + ' ' + size.toFixed(1) + 'px ' + FAM;
  if (LS) c.letterSpacing = (size * (ls || 0)).toFixed(1) + 'px';
  m = c.measureText(str);
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  c.fillText(str, cx - w / 2 + m.actualBoundingBoxLeft, cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
  if (LS) c.letterSpacing = '0px';
}
function blank() {
  const sh = { T: new Float32Array(N * 3), mode: new Uint8Array(N).fill(1), delay: new Float32Array(N),
    k: .08, damp: .82, flow: .1, pre: .3, rise: 0, fade: .22, bright: 1 };
  sh.T.set(HOME);
  return sh;
}
function place(sh, smp, count, o) {
  const M = smp.xs.length; if (!M) return;
  const idx = new Uint32Array(M); for (let i = 0; i < M; i++) idx[i] = i;
  const xs = smp.xs; idx.sort((a, b) => xs[a] - xs[b]);
  const jit = smp.px * 1.15, z = o.z || 12;
  for (let j = 0; j < count && j < nA; j++) {
    const k = idx[Math.min(M - 1, Math.floor((j + rnd()) * M / count))];
    sh.T[j * 3] = xs[k] + (rnd() - .5) * jit; sh.T[j * 3 + 1] = smp.ys[k] + (rnd() - .5) * jit; sh.T[j * 3 + 2] = (rnd() - .5) * z;
    sh.mode[j] = 0; sh.delay[j] = o.delay();
  }
}
/* 시작 전: 연기처럼 흐르는 상태(보이지 않음) */
function smoke() { const sh = blank(); sh.flow = .5; sh.pre = .5; sh.rise = .05; sh.fade = .1; return sh; }
/* IRIS 글자 — 첫 화면 위쪽(글·단추는 아래쪽). 차분한 밝기 */
function irisShape(intro) {
  const sh = blank(), s = SMALL();
  const smp = sample((c) => fitText(c, 'IRIS', W * (s ? .78 : .5), H * (s ? .17 : .3), W / 2, H * (s ? .3 : .34), 900, -.045));
  place(sh, smp, Math.floor(nA * .62), { z: 16, delay: intro ? () => .45 + rnd() * .8 : () => rnd() * .22 });
  sh.k = .075; sh.damp = .82; sh.flow = .06; sh.pre = intro ? .5 : .25; sh.rise = intro ? .05 : 0; sh.fade = .24; sh.bright = s ? .42 : .62; // 휴대폰은 좁은 자리에 입자가 몰려 더 밝아 보이므로 낮춘다
  return sh;
}
const cache = new Map();
function getShape(intro) {
  const key = W + 'x' + H + ':' + nA + ':' + (intro ? 1 : 0);
  let sh = cache.get(key);
  if (!sh) { sh = irisShape(intro); cache.set(key, sh); }
  return sh;
}

/* ---------- three.js 무대 ---------- */
let R = null, camera, scene, points, geo, fadeScene, fadeMat, postScene, postMat, ortho, rt, rtS, downMat, downScene, dist = 1000;
try {
  R = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  R.autoClear = false; R.setPixelRatio(DPR);
  camera = new THREE.PerspectiveCamera(40, W / H, 1, 20000);
  scene = new THREE.Scene();
  geo = new THREE.BufferGeometry();
  const dyn = (arr, n) => { const a = new THREE.BufferAttribute(arr, n); a.setUsage(THREE.DynamicDrawUsage); return a; };
  geo.setAttribute('position', dyn(P, 3));
  geo.setAttribute('aSpd', dyn(SPD, 1));
  geo.setAttribute('aTint', dyn(TINT, 1));
  geo.setAttribute('aOn', dyn(ON, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(SIZE, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(SEED, 1));
  geo.setDrawRange(0, nA);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uPR: { value: DPR }, uDist: { value: 1000 }, uBright: { value: 1 }, uT: { value: 0 } },
    vertexShader: `attribute float aSpd;attribute float aTint;attribute float aSize;attribute float aSeed;attribute float aOn;
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
        vA=uBright*(.62+min(sp*.08,1.4))*tw*df*smoke*aOn;
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
    uniforms: { tAcc: { value: rt.texture }, tS: { value: rtS.texture }, uResS: { value: new THREE.Vector2(1, 1) }, uFlash: { value: 0 }, uAb: { value: 0 }, uT: { value: 0 } },
    vertexShader: VSQ,
    fragmentShader: `precision highp float;varying vec2 vUv;uniform sampler2D tAcc;uniform sampler2D tS;uniform vec2 uResS;uniform float uFlash;uniform float uAb;uniform float uT;
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
        vec3 col=c+uFlash*(.14+c*.85)*vec3(.95,.94,1.); // 바탕은 완전한 검정
        col+=max(hash(gl_FragCoord.xy+fract(uT))-.5,0.)*c.g/255.; // 띠 줄이기 잡음은 입자 위에만
        gl_FragColor=vec4(col,1.);
      }`,
    depthTest: false, depthWrite: false
  });
  postScene = new THREE.Scene(); postScene.add(new THREE.Mesh(quad, postMat));
} catch (e) {
  R = null;
}
if (!R) { root.classList.remove('gl'); root.classList.add('nogl'); return; }

function resizeGL() {
  W = hero.clientWidth || innerWidth; H = hero.clientHeight || innerHeight;
  R.setPixelRatio(DPR);
  R.setSize(W, H, false);
  camera.aspect = W / H;
  dist = (H / 2) / Math.tan(THREE.MathUtils.degToRad(20));
  camera.near = 1; camera.far = dist * 6; camera.updateProjectionMatrix();
  points.material.uniforms.uDist.value = dist;
  points.material.uniforms.uPR.value = DPR;
  const bw = Math.round(W * DPR), bh = Math.round(H * DPR);
  rt.setSize(bw, bh);
  const sw = Math.max(2, Math.round(bw / 4)), shh = Math.max(2, Math.round(bh / 4));
  rtS.setSize(sw, shh); postMat.uniforms.uResS.value.set(sw, shh); downMat.uniforms.uPx.value.set(1 / bw, 1 / bh);
  R.setRenderTarget(rt); R.setClearColor(0x000000, 1); R.clear(); R.setRenderTarget(null);
}

/* ---------- 연출 상태 ---------- */
let ACT = smoke(), dissolve = 0, started = false, introDone = RM;
let clock = 0, t0 = 0, flash = 0, shake = 0, aberr = 0, dolly = 0, svPush = 0;
const sched = [];
const after = (s, fn) => sched.push({ at: clock + s, fn });
function impact(a) { flash = Math.max(flash, a); shake = Math.max(shake, a); aberr = Math.max(aberr, a); }
function show(force) {
  const intro = !introDone;
  ACT = getShape(intro); t0 = clock;
  if (intro && !RM && !force) { introDone = true; after(2.05, () => { impact(.6); dolly = .05; }); }
  introDone = true;
}

/* ---------- 포인터: 가까이 가면 입자가 살짝 비켜난다 ---------- */
const ptr = { cx: -9999, cy: -9999, vx: 0, vy: 0, nx: 0, ny: 0, sx: 0, sy: 0, on: false };
hero.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left - W / 2, y = H / 2 - (e.clientY - r.top);
  if (ptr.on) { ptr.vx += (x - ptr.cx) * .5; ptr.vy += (y - ptr.cy) * .5; }
  ptr.cx = x; ptr.cy = y; ptr.on = true; ptr.sx = e.clientX - r.left; ptr.sy = e.clientY - r.top;
}, { passive: true });
hero.addEventListener('pointerleave', () => { ptr.on = false; ptr.cx = ptr.cy = -9999; });

/* ---------- 시뮬레이션 ---------- */
function simulate(dt) {
  const f = Math.min(dt * 60, 4);
  const sh = ACT, T = sh.T, MODE = sh.mode, DL = sh.delay;
  const damp = Math.pow(sh.damp, f), dampA = Math.pow(.9, f);
  const el = clock - t0, t = clock, dis = dissolve;
  const k0 = sh.k * (1 - dis * .85), flow = sh.flow + dis * .55, pre = sh.pre, rise = sh.rise + dis * .09;
  const Rr = SMALL() ? 90 : 165, R2 = Rr * Rr, rep = SMALL() ? 4 : 6.5;
  const mx = ptr.cx, my = ptr.cy, mvx = ptr.vx, mvy = ptr.vy;
  for (let i = 0; i < nA; i++) {
    const i3 = i * 3, m = MODE[i];
    let px = P[i3], py = P[i3 + 1], pz = P[i3 + 2], vx = V[i3], vy = V[i3 + 1], vz = V[i3 + 2];
    let tx, ty, tz, k = k0, fl = flow;
    if (m === 0) { tx = T[i3]; ty = T[i3 + 1]; tz = T[i3 + 2]; }
    else { tx = T[i3] + Math.sin(t * .13 + i) * 40; ty = T[i3 + 1] + Math.cos(t * .11 + i * 1.7) * 40; tz = T[i3 + 2]; k = .0035; fl = Math.max(flow, .12); }
    if (m === 0 && el < DL[i]) { k = 0; fl = pre; }
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
    P[i3] = px; P[i3 + 1] = py; P[i3 + 2] = pz; V[i3] = vx; V[i3 + 1] = vy; V[i3 + 2] = vz;
    SPD[i] = Math.abs(vx) + Math.abs(vy) + Math.abs(vz) * .5;
    ON[i] += ((m === 1 ? 0 : 1) - ON[i]) * (RM ? 1 : (m === 1 ? .06 : .14));
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
    if (started) show(true);
    perf.wait = 1.2;
  } else if (DPR > 1) {
    DPR = 1; resizeGL(); perf.wait = 1.2;
  }
}

/* ---------- 그리기 루프 ---------- */
let raf = 0, last = performance.now(), lastScroll = scrollY, sv = 0, frame = 0, dead = false;
function render(dt) {
  const f = Math.min(dt * 60, 4);
  ptr.nx = lerp(ptr.nx, ptr.on ? (ptr.sx / W - .5) * 2 : 0, .05);
  ptr.ny = lerp(ptr.ny, ptr.on ? (ptr.sy / H - .5) * 2 : 0, .05);
  const sk = shake * shake * (SMALL() ? 14 : 26);
  camera.position.set((rnd() - .5) * sk, (rnd() - .5) * sk, dist * (1 + dolly));
  points.rotation.y = ptr.nx * .06; points.rotation.x = ptr.ny * .04;
  const u = points.material.uniforms;
  u.uT.value = clock;
  u.uBright.value = RM ? ACT.bright : lerp(u.uBright.value, ACT.bright, 1 - Math.pow(.9, f));
  geo.attributes.position.needsUpdate = true; geo.attributes.aSpd.needsUpdate = true; geo.attributes.aOn.needsUpdate = true;
  let a = ACT.fade - Math.min(Math.abs(sv) * .003, .08);
  a = RM ? 1 : clamp(a, .04, .6);
  fadeMat.uniforms.uA.value = RM ? 1 : 1 - Math.pow(1 - a, f);
  R.setRenderTarget(rt); R.render(fadeScene, ortho); R.render(scene, camera);
  R.setRenderTarget(rtS); R.render(downScene, ortho);
  R.setRenderTarget(null);
  postMat.uniforms.uFlash.value = flash; postMat.uniforms.uAb.value = aberr; postMat.uniforms.uT.value = clock;
  R.render(postScene, ortho);
}
const offscreen = () => hero.getBoundingClientRect().bottom <= 0;
function tick(now) {
  raf = 0;
  if (dead) return;
  const dtRaw = Math.max(0, (now - last) / 1000); last = now;
  const dt = Math.min(dtRaw, .2), f = Math.min(dt * 60, 6);
  if (!RM) clock += dt;
  for (let i = sched.length - 1; i >= 0; i--) if (clock >= sched[i].at) { const s = sched.splice(i, 1)[0]; s.fn(); }
  const ds = scrollY - lastScroll; lastScroll = scrollY; sv = lerp(sv, ds, .2);
  svPush = RM ? 0 : clamp(sv * .03, -1.6, 1.6);
  dissolve = RM ? 0 : Math.pow(clamp((scrollY / (H * .85) - .08) / .92, 0, 1), 1.4);
  flash *= Math.pow(.86, f); aberr *= Math.pow(.9, f); shake *= Math.pow(.88, f);
  dolly *= Math.pow(.9, f); ptr.vx *= Math.pow(.8, f); ptr.vy *= Math.pow(.8, f);
  const steps = RM ? 1 : Math.min(4, Math.max(1, Math.ceil(dt / .05)));
  for (let s = 0; s < steps; s++) simulate(dt / steps);
  render(dt);
  if (started && frame > 5) adapt(dtRaw);
  frame++;
  // 첫 화면이 화면 밖이면 멈춘다 — 다시 보이면 스크롤 신호로 깨운다
  if (!RM && !document.hidden && !offscreen()) raf = requestAnimationFrame(tick);
}
function kick() { if (!dead && !raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }
document.addEventListener('visibilitychange', () => { if (!document.hidden) { perf.sum = 0; perf.n = 0; perf.wait = 1; kick(); } });
window.addEventListener('scroll', () => { if (!offscreen()) kick(); }, { passive: true });
let rzT = 0, lastW = innerWidth, lastH = innerHeight;
window.addEventListener('resize', () => {
  clearTimeout(rzT);
  rzT = setTimeout(() => {
    if (dead) return;
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 140) { kick(); return; } // 휴대폰 주소창 높이 변화는 무시
    lastW = innerWidth; lastH = innerHeight;
    resizeGL(); makeHome(); cache.clear();
    if (started) show(true);
    kick();
  }, 180);
});
// WebGL 을 잃으면(드라이버 문제 등) 입자 없이 글만 보이게 하고 엔진을 완전히 멈춘다
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); dead = true; cancelAnimationFrame(raf); raf = 0; root.classList.remove('gl'); root.classList.add('nogl'); });

/* ---------- 시작: 글꼴이 오면(못 받아도 3초 안에) IRIS 를 모은다 ---------- */
resizeGL(); kick();
const begin = () => { if (scrollY > H * .5) introDone = true; show(false); started = true; kick(); };
const fontReady = document.fonts && document.fonts.load
  ? Promise.race([document.fonts.load('900 100px "Pretendard Variable"').then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 1500))])
  : Promise.resolve();
let begun = false;
const beginOnce = () => { if (begun) return; begun = true; setTimeout(begin, 60); };
fontReady.then(beginOnce, beginOnce);
setTimeout(beginOnce, 3000);
})();
