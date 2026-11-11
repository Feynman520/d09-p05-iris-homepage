// 두 갈래 배포(2026-11-09) 홈페이지 검사 — 안정판 단추 + 최신판 상자.
// site/ 를 127.0.0.1 임시 서버로 내주고(파일 주소는 브라우저 자동화가 막는다), headless 크로미엄으로 연다.
// GitHub API 는 가짜로 돌려준다(바깥 연결 0). site.js 의 CONFIG.preview 는 응답에서 바꿔 끼운다(원본 파일은 건드리지 않음).
//   node scripts/check-channels.mjs        (playwright 가 없으면 SKIP 하고 0 으로 끝)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
let pass = 0, fail = 0;
const ok = (c, n) => { if (c) { pass++; console.log(`PASS ${n}`); } else { fail++; console.log(`FAIL ${n}`); } };

const req = createRequire(import.meta.url);
let pw = null;
for (const c of ['playwright', path.join(process.env.APPDATA || '', 'npm/node_modules/playwright')]) { try { pw = req(c); break; } catch {} }
if (!pw) { console.log('SKIP: playwright 없음'); process.exit(0); }

const siteJs = fs.readFileSync(path.join(SITE, 'site.js'), 'utf8');
const stable = /installer: \{ version: '(v[\d.]+)'/.exec(siteJs)[1];
const stableAsset = /asset: '(IRIS-Setup_[^']+)'/.exec(siteJs)[1];
// 시험용 최신판 = 안정판보다 패치 번호 하나 높은 판(안정판이 올라가도 깨지지 않게 — 2026-11-11 v2.0.59 승격 때 고정값 v2.0.56 이 깨진 일)
const NV = stable.replace(/(\d+)$/, (d) => String(+d + 1));
const NA = `IRIS-Setup_${NV}_2099-01-01.zip`;
// 2026-11-10: 최신판을 낼 때마다 릴리스 도구가 preview.installer 를 채우므로 "기본값 null" 이 아니라 "null 또는 판 객체" 를 본다
// (예전엔 null 만 맞다고 보아, 2.0.57 이후 실제 배포본에서 이 검사 전체가 바꿔 끼우기에 실패했다).
const PREVIEW_RE = /preview:\s*\{\s*installer:\s*(null|\{[^{}]*\}),/;
ok(PREVIEW_RE.test(siteJs) && /installer:\s*(null|\{ version: 'v\d+\.\d+\.\d+')/.test(siteJs.match(PREVIEW_RE)[0]), 'site.js: preview.installer = null 또는 X.Y.Z 판 객체(릴리스 도구 형식)');

let previewLiteral = 'null';   // 경우마다 바꿔 끼울 CONFIG.preview.installer
let mirrorExtra = [];          // 미러 목록에 덧붙일 이름
const server = http.createServer((q, s) => {
  const u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  let f = path.join(SITE, u === '/' ? 'index.html' : u);
  if (!f.startsWith(SITE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  let body = fs.readFileSync(f);
  if (u === '/site.js') {
    let t = body.toString('utf8').replace(PREVIEW_RE, `preview: {\n      installer: ${previewLiteral},`);
    if (mirrorExtra.length) t = t.replace(/(assets: \[)/, `$1${mirrorExtra.map((n) => `'${n}', `).join('')}`);
    body = Buffer.from(t, 'utf8');
  }
  const type = f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
  s.writeHead(200, { 'content-type': type }); s.end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await pw.chromium.launch();
const PRE = (v, asset) => `{ version: '${v}', bytes: 557000000, date: '2026-11-10', asset: '${asset}', url: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/download/iris-installer--${v}/${asset}', page: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/tag/iris-installer--${v}', sha: 'abc123' }`;

async function open({ api = 'blocked', stableApi = null } = {}) {
  const page = await browser.newPage();
  await page.route('https://api.github.com/**', (route) => {
    if (api === 'blocked') return route.abort();
    const u = route.request().url();
    if (/d09-p03-iris-installer\/releases\/latest$/.test(u) && stableApi) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tag_name: `iris-installer--${stableApi.v}`, published_at: '2026-11-11T00:00:00Z', body: 'x', html_url: 'https://github.com/x', assets: [{ name: stableApi.asset, size: 1, browser_download_url: `https://github.com/dl/${stableApi.asset}` }] }) });
    }
    return route.fulfill({ status: 403, body: '{}' });
  });
  await page.route(/https:\/\/(?!127\.0\.0\.1).*/, (route) => (route.request().url().startsWith('https://api.github.com') ? route.fallback() : route.abort()));
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  return page;
}
const state = (page) => page.evaluate(() => ({
  hidden: document.getElementById('dl-pre').hidden,
  off: document.getElementById('dl-pre').classList.contains('off'), // 2026-11-11: 최신판 카드는 늘 보이고, 없으면 비활성(.off)
  preHref: document.getElementById('dl-pre-btn').getAttribute('href'),
  preVer: document.getElementById('dl-pre-ver').textContent,
  preSha: document.getElementById('dl-pre-sha').textContent,
  stableHref: document.getElementById('dl-btn').getAttribute('href'),
  dockHref: document.getElementById('dock-dl').getAttribute('href'),
  bytes: document.getElementById('dl-bytes').textContent,
}));

try {
  // ① 최신판 없음
  previewLiteral = 'null'; mirrorExtra = [];
  let p = await open(); let s = await state(p);
  ok(s.hidden === false && s.off === true && s.preHref === null, '① 최신판 없음 → 최신판 카드는 보이되 비활성(단추 주소 없음)');
  ok(s.stableHref.endsWith(stableAsset) && s.dockHref === s.stableHref, '① 안정판 단추(본문·아래 띠) = 안정판 미러 주소');
  ok(/^[\d,]+ bytes$/.test(s.bytes) && !s.bytes.includes('541,021,818'), '① 정확한 크기 = 안정판 값(옛 541,021,818 아님)');
  await p.close();

  // ② 최신판 있음 + 미러에 있음
  previewLiteral = PRE(NV, NA); mirrorExtra = [NA];
  p = await open(); s = await state(p);
  ok(s.hidden === false && s.off === false && s.preVer === NV, '② 최신판(안정판보다 높음) → 상자 보임 · 판 표시');
  ok(s.preHref === `https://iris-workspace-dl.pages.dev/${NA}`, '② 최신판 단추 = 빠른 미러 주소');
  ok(s.stableHref.endsWith(stableAsset), '② 안정판 단추는 그대로 안정판');
  ok(s.preSha === 'abc123', '② 최신판 SHA-256 = 그 판 값');
  await p.close();

  // ③ 최신판이 미러에 아직 없음 → GitHub 첨부
  mirrorExtra = [];
  p = await open(); s = await state(p);
  ok(s.hidden === false && s.off === false && s.preHref.startsWith('https://github.com/') && s.preHref.endsWith(NA), '③ 미러에 없으면 최신판 단추 = GitHub 첨부');
  await p.close();

  // ④ 최신판 판 = 안정판 판 → 숨김
  previewLiteral = PRE(stable, stableAsset);
  p = await open(); s = await state(p);
  ok(s.hidden === false && s.off === true && s.preHref === null, '④ 최신판이 안정판보다 높지 않으면 비활성');
  await p.close();

  // ⑤ 그 최신판이 안정판으로 승격돼 API 가 새 안정판을 주면 → 상자 숨김
  previewLiteral = PRE(NV, NA); mirrorExtra = [NA];
  p = await open({ api: 'ok', stableApi: { v: NV, asset: NA } }); s = await state(p);
  ok(s.off === true && s.stableHref.endsWith(NA), '⑤ API 의 안정판이 따라잡으면 최신판 카드 비활성 · 안정판 단추가 새 판');
  await p.close();

  // ⑥ 형식이 아닌 판(사전 공개 꼬리표) → 숨김
  previewLiteral = PRE(`${NV}-rc.1`, NA);
  p = await open(); s = await state(p);
  ok(s.off === true && s.preHref === null, '⑥ X.Y.Z 가 아닌 판은 켜지 않음(비활성)');
  await p.close();
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
