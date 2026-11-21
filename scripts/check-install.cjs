// IRIS homepage · © 2026 Sejun Ham (함세준) · MIT · https://feynman520.github.io/card/#home
// /install(설치 안내) 과 모든 쪽의 고리·사전·그림 검사(2026-11-21 최신화 때 만듦). 바깥 연결 0 — https 요청은 모두 끊는다.
// 계기: 설치 안내 머리 메뉴의 「작동」(/#how)이 첫 쪽에서 없어진 자리를 가리키고 있었고, 작업 폴더 화면(④) 설명·그림이 두 달 묵어 있었다.
// 판 번호·파일 이름·지문 값은 여기 적지 않고 site.js 의 CONFIG.fallback 에서 읽어 견준다(안정판을 올려도 깨지지 않게).
//   node scripts/check-install.cjs [캡처 폴더]      (playwright 가 없으면 화면 검사는 SKIP 하고 파일 검사만 한다)
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const root = path.join(__dirname, '..', 'site');
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'iris-inst-'));
let pass = 0, fail = 0; const ok = (c, n, x = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' — ' + x : ''}`); };
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const dict = read('site.js'), home = read('index.html');
const ids = (s) => new Set([...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const homeIds = ids(home);

// ① 모든 쪽 — 사전 열쇠·그림 파일·고리
for (const f of pages) {
  const s = read(f), own = ids(s);
  const keys = [...new Set([...s.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]))];
  const noEn = keys.filter(k => !dict.includes(`'${k}':`));
  ok(noEn.length === 0, `${f}: data-i18n 열쇠가 모두 영어 사전에 있음`, noEn.join(','));
  const imgs = [...s.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]).filter(u => !/^(https?:|data:)/.test(u));
  const noFile = imgs.filter(u => !fs.existsSync(path.join(root, u)));
  ok(noFile.length === 0, `${f}: 그림 파일이 모두 있음`, noFile.join(','));
  const toHome = [...s.matchAll(/href="\/#([^"]+)"/g)].map(m => m[1]).filter(a => !homeIds.has(a));
  ok(toHome.length === 0, `${f}: 첫 쪽으로 가는 고리(/#…)가 모두 있는 자리`, toHome.join(','));
  const inPage = [...s.matchAll(/href="#([^"]+)"/g)].map(m => m[1]).filter(a => !own.has(a));
  ok(inPage.length === 0, `${f}: 쪽 안 고리(#…)가 모두 있는 자리`, inPage.join(','));
  const toPage = [...s.matchAll(/href="\/([a-z]+)(#[^"]*)?"/g)].filter(m => !fs.existsSync(path.join(root, m[1] + '.html'))).map(m => m[1]).filter(n => n !== 'download');
  ok(toPage.length === 0, `${f}: 다른 쪽으로 가는 고리(/이름)가 모두 있는 쪽`, toPage.join(','));
}

// ② 설치 안내 — 바깥(설치기·안내문)이 가리키는 자리와 꼭 있어야 할 것
const inst = read('install.html'), instIds = ids(inst);
ok(['blocked', 'sac', 'clean', 'upd1x', 'update', 'remove', 'first', 'screens', 'get', 'inst-hashcmd', 'inst-sha'].every(i => instIds.has(i)), 'install.html: 고리 자리(#blocked·#sac·#clean·#upd1x·#update·#remove …)와 지문 칸');
ok(/<!-- notice:begin -->[\s\S]{200,}<!-- notice:end -->/.test(inst), 'install.html: 안내문 구역(notice)이 채워져 있음');
ok(!/작업 폴더 구성|프리셋 7종|여덟 화면/.test(inst), 'install.html: 없어진 작업 폴더 고르기 화면을 지금 있는 것처럼 적지 않음');
ok(/IRIS-삭제\.cmd/.test(inst) && /내 작업은 남기기/.test(inst) && /전부 지우기/.test(inst), 'install.html: 지우기 방법(삭제 파일·두 가지 선택)');
ok(/안정판/.test(inst) && /최신판/.test(inst), 'install.html: 안정판·최신판 두 갈래 설명');
ok(!/install-\d-/.test(home + inst), '옛 그림 이름(install-N-…)을 쓰는 곳이 없음');
ok(!/여덟 화면|구독과 작업 폴더|설치할 때 직업을 고르면|설치기가 작업 폴더/.test(home) && !/eight screens|subscription and work folders|Pick your job during installation/.test(dict), '첫 쪽·영어 사전: 설치 때 작업 폴더를 고른다는 옛 설명이 없음');
try {
  cp.execFileSync(process.execPath, [path.join(__dirname, 'sync-notice.mjs'), '--check'], { stdio: 'pipe' });
  ok(true, '안내문 구역 = 설치 패키지의 install-notice.txt 와 같음');
} catch (e) {
  const msg = String((e.stdout || '') + (e.stderr || ''));
  if (/찾지 못|not found|ENOENT/i.test(msg)) console.log('SKIP 안내문 대조 — 설치 패키지 폴더가 옆에 없음');
  else ok(false, '안내문 구역 = 설치 패키지의 install-notice.txt 와 같음', msg.trim().slice(0, 200));
}

// ③ 화면 — 영어 전환·지문 칸·그림·넘침
let pw = null;
for (const c of ['playwright', path.join(process.env.APPDATA || '', 'npm/node_modules/playwright')]) { try { pw = require(c); break; } catch {} }
if (!pw) { console.log('SKIP 화면 검사: playwright 없음'); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); }
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const srv = http.createServer((q, r) => { const f = path.resolve(root, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
srv.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${srv.address().port}`; const b = await pw.chromium.launch(); const errs = [];
  const asset = (/asset: '(IRIS-Setup_[^']+)'/.exec(dict) || [])[1], sha = (/sha: '([0-9a-f]{64})'/.exec(dict) || [])[1];
  const open = async (w, h, lang) => { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); await p.route(/^https:/, r => r.abort()); await p.goto(`${base}/install.html?lang=${lang}`); await p.waitForTimeout(400); return p; };
  const flow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const p = await open(1280, 900, 'ko');
  ok((await p.textContent('#inst-hashcmd')).includes(asset) && (await p.textContent('#inst-sha')) === sha, '지문 확인 칸 = site.js 의 안정판 파일 이름·값');
  ok((await p.getAttribute('.nav a.cur', 'href')) === '/install' && await p.locator('.nav a').count() === 5, '머리 메뉴 다섯 칸, 설치 안내가 지금 쪽');
  await p.evaluate(async () => { for (const i of document.querySelectorAll('.win img')) { i.loading = 'eager'; i.scrollIntoView(); if (!i.complete) await new Promise(r => { i.onload = i.onerror = r; }); } });
  ok(await p.evaluate(() => { const a = [...document.querySelectorAll('.win img')]; return a.length === 5 && a.every(i => i.naturalWidth > 0); }), '설치 화면 그림 5장이 모두 뜸');
  ok(await p.locator('.pre-note').count() >= 2 && await p.locator('#remove ~ ol.flow > li').count() === 3, '최신판 주석 2곳 이상 + 지우기 세 걸음');
  ok(await p.evaluate(() => { const a = [...document.querySelectorAll('.flow > li > pre')]; return a.length >= 2 && a.every(e => e.getBoundingClientRect().width > 400); }), '순서 흐름 안의 명령어 상자가 좁은 번호 칸에 끼지 않음(폭 400 넘음)');
  ok(await flow(p) === 0, 'PC 폭 가로 넘침 0');
  await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: path.join(out, 'install-ko.png'), fullPage: true });
  await p.click('.lang button[data-lang="en"]'); await p.waitForTimeout(250);
  ok((await p.textContent('h1')) === 'Install guide' && (await p.textContent('#remove')) === 'Uninstall' && (await p.textContent('#first')).startsWith('The first conversation'), '영어: 제목·지우기·첫 대화');
  const koLeft = await p.evaluate(() => [...document.querySelectorAll('main [data-i18n]')].filter(e => e.dataset.i18n !== 'inst.sacbody').map(e => { const c = e.cloneNode(true); c.querySelectorAll('code').forEach(x => x.remove()); return [e.dataset.i18n, c.textContent]; }).filter(([, t]) => /[가-힣]/.test(t.replace(/설치가 안 되면\.txt|IRIS-[가-힣]+\.cmd/g, ''))).map(([k]) => k));
  ok(koLeft.length === 0, '영어로 바꾸면 본문에 한글 문장이 남지 않음(파일 이름 제외)', koLeft.join(','));
  ok(await p.locator('.pre-note').count() >= 2 && await flow(p) === 0, '영어: 최신판 주석 유지 + 가로 넘침 0');
  await p.screenshot({ path: path.join(out, 'install-en.png'), fullPage: true });
  const m = await open(390, 844, 'ko');
  ok(await flow(m) === 0, '휴대폰 폭 가로 넘침 0');
  await m.screenshot({ path: path.join(out, 'install-mobile.png'), fullPage: true });
  ok(errs.length === 0, '페이지 오류 0', errs.join('|'));
  await b.close(); srv.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
});
