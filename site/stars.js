// IRIS homepage · © 2026 Sejun Ham (함세준) · MIT · https://feynman520.github.io/card/#home
/* 별의 구 / 별의 홍채 — IRIS-Face app/stars.js 의 웹판.
   그대로 가져온 것: 피보나치 구·차등 회전 홍채, 처음 1.2초 모임 연출, 마우스 기울임, 색 캐시, 1.3R 빛무리, 숨기면 정지, 포커스 잃으면 10fps,
   prefers-reduced-motion 이면 정지 화면, 별 서명(글자 모양으로 모였다 흩어짐).
   뺀 것: Electron 지표로 하는 자동 측정, 설정 저장(localStorage), 세션 energy/dim, 무대 9종 중 sphere·iris 외. */
(function () {
  'use strict';
  function makeStarEngine() {
    let canvas, ctx, W = 0, H = 0, dpr = 1, raf = 0, pts = [], t0 = 0, mouse = { x: 0.5, y: 0.5 }, ro = null, onMove = null, onVis = null, onFocus = null, onBlur = null;
    let style = 'sphere', density = 1, fpsCap = 60, lastDraw = 0, focused = true, fadeOut = 0;
    const colors = { a: '232,236,255', b: '160,178,255', c: '206,190,255', glow: '122,140,255' };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const colCache = new Map();
    const col = (p, al) => {
      const a = Math.round(Math.max(0, Math.min(1, al)) * 100), key = (p.hue < 0.7 ? 0 : p.hue < 0.9 ? 1 : 2) * 128 + a;
      let s = colCache.get(key);
      if (s === undefined) { s = `rgba(${p.hue < 0.7 ? colors.a : p.hue < 0.9 ? colors.b : colors.c},${a / 100})`; colCache.set(key, s); }
      return s;
    };
    // ---- 서명: 별이 글자 모양으로 모였다가 제자리로 ----
    const SIG = { in: 1.6, hold: 2.5, out: 1.2 };
    let sig = null, sigK = 0; const maskCache = new Map();
    function sigMetrics() { const size = Math.max(24, Math.min(W * 0.115, H * 0.28)), cy = H / 2 - Math.min(56, H * 0.08); return { size, cx: W / 2 + size * 0.09, cy, bottom: cy + size * 0.4 }; }
    function maskPoints(text) {
      const key = `${text}|${W}|${H}`; if (maskCache.has(key)) return maskCache.get(key);
      const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      const { size, cx, cy } = sigMetrics();
      g.font = `600 ${size}px "Pretendard Variable","Segoe UI Variable Display","Segoe UI","Malgun Gothic",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      try { g.letterSpacing = `${Math.round(size * 0.18)}px`; } catch {}
      g.fillStyle = '#fff'; g.fillText(text, cx, cy);
      const d = g.getImageData(0, 0, W, H).data, out = []; const step = Math.max(2, Math.round(size / 26));
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 128) out.push([x, y]);
      maskCache.set(key, out); return out;
    }
    function signature(text) {
      if (reduce || !pts.length || !W || !H) return false;
      const m = maskPoints(text); if (m.length < 40) return false;
      for (let i = m.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [m[i], m[j]] = [m[j], m[i]]; }
      pts.forEach((p, i) => { const [x, y] = m[i % m.length]; p.tx = x + (Math.random() - 0.5) * 2.2; p.ty = y + (Math.random() - 0.5) * 2.2; });
      sig = { t: performance.now() }; kick();
      return { in: SIG.in * 1000, hold: SIG.hold * 1000, out: SIG.out * 1000, bottom: sigMetrics().bottom };
    }
    const bl = (p, x, y) => (sigK && p.tx != null) ? [x + (p.tx - x) * sigK, y + (p.ty - y) * sigK] : [x, y];

    function make() {
      pts = [];
      const base = Math.floor((W * H) / 380);
      const n = Math.round(Math.min(3200, Math.max(900, base)) * density);
      const golden = Math.PI * (3 - Math.sqrt(5));
      if (style === 'sphere') for (let i = 0; i < n; i++) {
        const k = Math.random(); const rr = k < 0.70 ? 0.96 + Math.random() * 0.06 : k < 0.95 ? 0.35 + Math.random() * 0.6 : 1.2 + Math.random() * 0.5;
        const y = 1 - (i / (n - 1)) * 2; const rad = Math.sqrt(1 - y * y); const th = golden * i + Math.random() * 0.3; const band = Math.abs(y) < 0.18 && Math.random() < 0.5;
        pts.push({ x: Math.cos(th) * rad * rr, y: y * rr, z: Math.sin(th) * rad * rr, size: band ? 1.4 + Math.random() * 1.2 : (Math.random() < 0.1 ? 1.6 + Math.random() : 0.5 + Math.random() * 0.9), ph: Math.random() * 6.283, tw: 0.5 + Math.random() * 1.5, hue: Math.random(), band, sx: (Math.random() - 0.5) * 2, sy: (Math.random() - 0.5) * 2 });
      }
      else for (let i = 0; i < n; i++) {
        let r = 0.34 + Math.pow(Math.random(), 0.65) * 0.66; if (Math.random() < 0.06) r = 1.05 + Math.random() * 0.5;
        pts.push({ a: Math.random() * 6.283, r, size: Math.random() < 0.08 ? 1.6 + Math.random() * 1.2 : 0.5 + Math.random() * 0.9, ph: Math.random() * 6.283, tw: 0.4 + Math.random() * 1.2, hue: Math.random(), sx: (Math.random() - 0.5) * 2, sy: (Math.random() - 0.5) * 2 });
      }
      for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    }
    function resize() {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      make();
    }
    function glow(cx, cy, R, k) {
      const g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.3);
      g.addColorStop(0, `rgba(${colors.glow},${0.09 * k})`); g.addColorStop(0.6, `rgba(${colors.glow},${0.03 * k})`); g.addColorStop(1, `rgba(${colors.glow},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, 6.283); ctx.fill();
    }
    function frame(now) {
      if (fpsCap < 60 && now - lastDraw < 1000 / fpsCap - 2) { raf = requestAnimationFrame(frame); return; }
      lastDraw = now;
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      const gather = reduce ? 1 : ease(Math.min(1, t / 1.2));
      if (sig) { const e = (now - sig.t) / 1000; sigK = e < SIG.in ? ease(e / SIG.in) : e < SIG.in + SIG.hold ? 1 : e < SIG.in + SIG.hold + SIG.out ? 1 - ease((e - SIG.in - SIG.hold) / SIG.out) : 0; if (e >= SIG.in + SIG.hold + SIG.out) sig = null; } else sigK = 0;
      const cx = W / 2, cy = H / 2 - Math.min(56, H * 0.08), R = Math.min(W, H) * 0.30, k = 1 - fadeOut * 0.8, alphaMul = 1 - fadeOut * 0.72;
      ctx.clearRect(0, 0, W, H);
      if (style === 'sphere') {
        glow(cx, cy, R, k);
        const speed = reduce ? 0 : 0.22, ay = t * speed, ax = 0.42 + (mouse.y - 0.5) * 0.5 + Math.sin(t * 0.17) * 0.08, az = (mouse.x - 0.5) * 0.35;
        const cy1 = Math.cos(ay), sy1 = Math.sin(ay), cx1 = Math.cos(ax), sx1 = Math.sin(ax), cz1 = Math.cos(az), sz1 = Math.sin(az), fov = 2.6;
        const drawn = [];
        for (const p of pts) {
          const extra = p.band ? t * 0.35 : 0, c2 = Math.cos(extra), s2 = Math.sin(extra);
          const x = p.x * c2 - p.z * s2, z = p.x * s2 + p.z * c2, y = p.y;
          const x1 = x * cy1 - z * sy1, z1 = x * sy1 + z * cy1, y2 = y * cx1 - z1 * sx1, z2 = y * sx1 + z1 * cx1, x3 = x1 * cz1 - y2 * sz1, y3 = x1 * sz1 + y2 * cz1;
          const depth = fov / (fov - z2); drawn.push([p, cx + x3 * R * depth, cy + y3 * R * depth, depth, z2]);
        }
        drawn.sort((a, b) => a[4] - b[4]);
        for (const [p, ix, iy, depth, z2] of drawn) {
          const [x, y] = bl(p, gather === 1 ? ix : ix + p.sx * W * 0.5 * (1 - gather), gather === 1 ? iy : iy + p.sy * H * 0.5 * (1 - gather));
          const near = (z2 + 1.2) / 2.4, tw = reduce ? 0.85 : 0.65 + 0.35 * Math.sin(t * p.tw + p.ph);
          ctx.fillStyle = col(p, Math.max((0.12 + 0.75 * near) * tw, 0.8 * sigK) * alphaMul * (0.5 + 0.5 * gather));
          ctx.beginPath(); ctx.arc(x, y, p.size * (0.55 + 0.75 * depth), 0, 6.283); ctx.fill();
        }
      } else {
        const Ri = Math.min(W, H) * 0.27; glow(cx, cy, Ri, k);
        const dx = mouse.x * W - cx, dy = mouse.y * H - cy, md = Math.hypot(dx, dy); const dilate = md < Ri * 1.3 ? 0.06 * (1 - md / (Ri * 1.3)) : 0;
        const speed = reduce ? 0 : 0.035;
        for (const p of pts) {
          const rr = p.r < 1.02 ? p.r + dilate * (1 - p.r) : p.r, a = p.a + t * speed * (1.6 - Math.min(1, rr)) + Math.sin(t * 0.25 + p.ph) * 0.012;
          const ix = cx + Math.cos(a) * rr * Ri, iy = cy + Math.sin(a) * rr * Ri;
          const [x, y] = bl(p, gather === 1 ? ix : ix + p.sx * W * 0.5 * (1 - gather), gather === 1 ? iy : iy + p.sy * H * 0.5 * (1 - gather));
          const tw = reduce ? 0.8 : 0.62 + 0.38 * Math.sin(t * p.tw + p.ph);
          ctx.fillStyle = col(p, Math.max((0.32 + 0.55 * tw) * (rr < 1.02 ? 1 : 0.55), 0.85 * sigK) * alphaMul * (0.55 + 0.45 * gather));
          ctx.beginPath(); ctx.arc(x, y, p.size, 0, 6.283); ctx.fill();
        }
      }
      if (reduce) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };
    function updateFps() { fpsCap = focused ? 60 : 10; }
    function mount(el, opts = {}) {
      canvas = el; ctx = canvas.getContext('2d', { alpha: true });
      if (opts.style) style = opts.style; if (opts.density) density = opts.density;
      resize(); ro = new ResizeObserver(() => { resize(); kick(); }); ro.observe(canvas);
      onMove = (e) => { const b = canvas.getBoundingClientRect(); mouse.x = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)); mouse.y = Math.max(0, Math.min(1, (e.clientY - b.top) / b.height)); };
      window.addEventListener('pointermove', onMove, { passive: true });
      onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); }; document.addEventListener('visibilitychange', onVis);
      focused = document.hasFocus ? document.hasFocus() : true;
      onFocus = () => { focused = true; updateFps(); kick(); }; onBlur = () => { focused = false; updateFps(); };
      window.addEventListener('focus', onFocus); window.addEventListener('blur', onBlur); updateFps();
      // 히어로가 화면 밖으로 나가면 그리지 않는다(스크롤해 내려간 뒤 GPU 합성 0)
      if ('IntersectionObserver' in window) new IntersectionObserver((es) => { for (const e of es) { if (e.isIntersecting) kick(); else { cancelAnimationFrame(raf); raf = 0; } } }, { threshold: 0.01 }).observe(canvas);
      kick();
    }
    function destroy() {
      cancelAnimationFrame(raf); raf = 0; ro?.disconnect(); if (onMove) window.removeEventListener('pointermove', onMove); if (onVis) document.removeEventListener('visibilitychange', onVis);
      if (onFocus) window.removeEventListener('focus', onFocus); if (onBlur) window.removeEventListener('blur', onBlur); pts = [];
    }
    function configure(o = {}) {
      if (o.style && o.style !== style) { style = o.style; make(); t0 = 0; }
      if (o.density && o.density !== density) { density = o.density; make(); }
      kick();
    }
    return { mount, destroy, configure, signature, setFade: (v) => { fadeOut = Math.max(0, Math.min(1, v)); kick(); } };
  }
  window.IrisStars = makeStarEngine();
})();
