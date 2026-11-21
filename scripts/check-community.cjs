// IRIS homepage · © 2026 Sejun Ham (함세준) · MIT · https://feynman520.github.io/card/#home
// /community 동작 시험(2026-11-21, 설계 = D09 협업 이어하기 문서 8절). 바깥 연결 0 — https 요청은 모두 끊고, 판 목록은 가짜로 바꿔 끼운다.
// 빈 벽·명판 그리기·못 쓰는 항목 거르기·글자로만 넣기·큰 화면·영어·신청 주소·메뉴 링크·첫 쪽 본문에 구역 없음·머리 메뉴 안 겹침을 본다.
//   node scripts/check-community.cjs [캡처 폴더]      (playwright 가 없으면 SKIP 하고 0 으로 끝)
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
let pw = null;
for (const c of ['playwright', path.join(process.env.APPDATA || '', 'npm/node_modules/playwright')]) { try { pw = require(c); break; } catch {} }
if (!pw) { console.log('SKIP: playwright 없음'); process.exit(0); }
const { chromium } = pw;
const root = path.join(__dirname, '..', 'site');
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'iris-cm-'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const srv = http.createServer((q, r) => { const f = path.resolve(root, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
let pass = 0, fail = 0; const ok = (c, n, x = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' — ' + x : ''}`); };
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const count = (s, re) => (s.match(re) || []).length;

// 가짜 목록 — 쓸 수 있는 것 둘(번호 1·3, 2번은 내린 판이라 비어 있음) + 못 쓰는 것 셋
const FAKE = [
  { no: 3, name: '실험실', maker: 'maker-b', repo: 'https://example.org/b', img: 'img/face-home.png', listed: '2026-12-02', checked: '2026-12-02', updated: '2025-10-30', rest: true,
    one: { ko: '실험 기록 칸을 더한 판', en: 'Adds a lab notebook' }, changes: { ko: ['기록 양식'], en: ['Notebook form'] } },
  { no: 1, name: '<img src=x onerror="window.__x=1">매스', maker: 'maker-a', repo: 'https://example.org/a', img: 'img/community/001.png', listed: '2026-11-21', checked: '2026-11-21', updated: '2026-11-18',
    one: { ko: '수식 입력을 편하게 고친 판', en: 'Easier math input' }, changes: { ko: ['수식 막대', '<b>굵게</b>'], en: ['Math bar', 'Bold'] } },
  { no: 4, name: '나쁜 주소', maker: 'x', repo: 'javascript:alert(1)', one: { ko: 'x' } },
  { no: 5, name: '', maker: 'x', repo: 'https://example.org/c' },
  'not-an-object',
];

srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port, base = `http://127.0.0.1:${port}`; const b = await chromium.launch();
  const errs = [];
  async function page(w, h, fake) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => errs.push(e.message));
    await p.route(/^https:/, route => route.abort());
    if (fake) {
      await p.route('**/community-data.js', route => route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.IRIS_COMMUNITY = ' + JSON.stringify(fake) + ';' }));
      await p.route('**/img/community/001.png', route => route.fulfill({ status: 200, contentType: 'image/png', body: fs.readFileSync(path.join(root, 'img', 'face-home.png')) }));
    }
    return p;
  }
  const flow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  // ① 저장소에 든 실제 목록 — 항목마다 꼭 있어야 할 값
  const real = await page(1280, 860);
  await real.goto(`${base}/community.html?lang=ko`); await real.waitForTimeout(300);
  const data = await real.evaluate(() => window.IRIS_COMMUNITY);
  ok(Array.isArray(data), '실제 목록 = 배열', `${Array.isArray(data) ? data.length : '?'}건`);
  const nos = (data || []).map(x => x && x.no);
  ok(new Set(nos).size === nos.length, '실제 목록: 번호가 겹치지 않음');
  ok((data || []).every(x => x && Number.isInteger(x.no) && x.name && !/iris|아이리스/i.test(x.name) && x.maker && /^https:\/\//.test(x.repo || '') && /^\d{4}-\d{2}-\d{2}$/.test(x.checked || '') && x.one && x.one.ko && x.one.en && (!x.img || fs.existsSync(path.join(root, x.img)))),
    '실제 목록: 번호·이름(IRIS 없음)·만든 사람·https 주소·확인한 날·한 줄 소개(한·영)·그림 파일');
  ok(await real.locator('#cm-wall button.cm-tile').count() === (data || []).length, '실제 목록: 항목 수만큼 명판');
  ok(await real.locator('#cm-wall a.cm-seat').count() === 1, '빈 자리 명판 1개');
  ok((await real.getAttribute('.nav a.cur', 'href')) === '/community', '머리 메뉴에서 커뮤니티가 지금 쪽');
  ok((await real.getAttribute('#cm-send', 'href')).includes('Feynman520/iris-community/issues/new?template=community-listing.yml'), '신청 단추 → 신청 양식 주소');
  ok(await real.locator('.cm-cond li').count() === 6 && await real.isVisible('.cm-note'), '조건 6가지 + 책임 문구 보임');

  // ② 0건
  const z = await page(1280, 860, []);
  await z.goto(`${base}/community.html?lang=ko`); await z.waitForTimeout(300);
  ok(await z.isVisible('#cm-none') && await z.locator('#cm-wall li').count() === 1, '0건: 안내 글 + 빈 자리만');
  ok((await z.textContent('#cm-wall a.cm-seat')).includes('N° 001') && (await z.textContent('#cm-wall a.cm-seat')).includes('첫 자리'), '0건: N° 001 첫 자리');
  await z.screenshot({ path: path.join(out, 'empty.png'), fullPage: true });

  // ③ 가짜 목록
  const p = await page(1440, 900, FAKE);
  await p.goto(`${base}/community.html?lang=ko`); await p.waitForTimeout(400);
  const tiles = p.locator('#cm-wall button.cm-tile');
  ok(await tiles.count() === 2 && await p.isHidden('#cm-none'), '쓸 수 있는 항목 2개만 그림(못 쓰는 3개는 거름)');
  ok((await tiles.nth(0).textContent()).includes('N° 001') && (await tiles.nth(1).textContent()).includes('N° 003'), '번호 순서대로');
  ok((await p.textContent('#cm-wall a.cm-seat')).includes('N° 004') && (await p.textContent('#cm-wall a.cm-seat')).includes('다음 자리'), '빈 자리 = 마지막 번호 다음(N° 004)');
  ok((await tiles.nth(0).textContent()).includes('<img src=x') && await p.evaluate(() => window.__x === undefined) && await p.locator('#cm-wall .cm-nm img').count() === 0, '이름은 글자로만 들어감(HTML 로 해석 안 함)');
  ok(await tiles.nth(0).locator('img').count() === 1 && await tiles.nth(1).locator('img').count() === 0, '그림은 img/community/ 안의 파일만');
  ok(await tiles.nth(1).locator('.cm-rest').count() === 1 && await tiles.nth(0).locator('.cm-rest').count() === 0, '쉬는 중 꼬리표');
  ok(await flow(p) === 0, 'PC 폭 가로 넘침 0');
  await p.screenshot({ path: path.join(out, 'wall.png'), fullPage: true });
  await tiles.nth(0).click(); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelector('#cm-dlg').open), '명판을 누르면 큰 화면 열림');
  ok((await p.getAttribute('#cm-d-go', 'href')) === 'https://example.org/a' && (await p.textContent('#cm-d-maker')) === 'maker-a', '큰 화면: 보러 가기 주소·만든 사람');
  ok((await p.textContent('#cm-d-listed')) === '2026-11-21 올림' && (await p.textContent('#cm-d-checked')) === '2026-11-21' && (await p.textContent('#cm-d-updated')) === '2026-11-18', '큰 화면: 올린 날·확인한 날·마지막 갱신');
  ok(await p.locator('#cm-d-chg li').count() === 2 && await p.locator('#cm-d-chg b').count() === 0, '큰 화면: 바꾼 점도 글자로만');
  ok((await p.textContent('#cm-dlg .cm-base')).includes('IRIS Workspace 기반 커뮤니티 판'), '큰 화면: 소속 한 줄');
  await p.screenshot({ path: path.join(out, 'open.png') });
  await p.click('#cm-d-x'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !document.querySelector('#cm-dlg').open), '닫기');
  await p.click('.lang button[data-lang="en"]'); await p.waitForTimeout(200);
  await tiles.nth(0).click(); await p.waitForTimeout(150);
  ok((await p.textContent('#cm-d-one')) === 'Easier math input' && (await p.textContent('#cm-d-listed')) === 'Listed 2026-11-21' && (await p.getAttribute('#cm-d-x', 'aria-label')) === 'Close', '영어: 큰 화면의 한 줄 소개·올린 날·닫기 단추');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !document.querySelector('#cm-dlg').open), 'Esc 로 닫기');
  ok((await p.textContent('.cm h1')) === 'To each their own IRIS' && (await tiles.nth(1).textContent()).includes('Resting') && (await p.textContent('#cm-wall a.cm-seat')).includes('The next seat'), '영어: 머리말·쉬는 중·빈 자리');
  ok((await p.textContent('.nav a.cur')) === 'Community', '영어: 머리 메뉴');
  await tiles.nth(1).click(); await p.waitForTimeout(150);
  ok(await p.isHidden('#cm-d-shot') && (await p.textContent('#cm-d-name')).includes('Resting'), '그림 없는 판: 그림 틀 숨김 + 쉬는 중');
  await p.keyboard.press('Escape');

  // ④ 휴대폰 폭
  const m = await page(390, 844, FAKE);
  await m.goto(`${base}/community.html?lang=ko`); await m.waitForTimeout(300);
  ok(await flow(m) === 0, '휴대폰 폭 가로 넘침 0');
  ok(await m.locator('footer a[href="/feedback"]').count() === 1, '바닥 메뉴 있음');
  await m.screenshot({ path: path.join(out, 'mobile.png'), fullPage: true });

  // ⑤ 다른 쪽 — 들어오는 길은 머리·바닥 메뉴뿐, 첫 쪽 본문에는 커뮤니티 구역이 없다
  for (const f of ['index.html', 'install.html', 'privacy.html', 'feedback.html']) {
    const s = read(f);
    ok(count(s, /href="\/community"/g) === 2 && count(s, /<(nav|header)[\s\S]*?href="\/community"/g) >= 1 && /<footer[\s\S]*href="\/community"/.test(s), `${f}: 머리 메뉴 + 바닥 메뉴에 커뮤니티 링크(딱 2곳)`);
  }
  const main = (/<main[\s\S]*<\/main>/.exec(read('index.html')) || [''])[0];
  ok(main.length > 1000 && !/community|커뮤니티/i.test(main), '첫 쪽 본문(main)에는 커뮤니티가 없음');
  ok(/'nav\.cm': 'Community'/.test(read('site.js')), 'site.js: nav.cm 영어');
  const keys = [...read('community.html').matchAll(/data-i18n="([^"]+)"/g)].map(x => x[1]);
  const dict = read('site.js'); const missing = [...new Set(keys)].filter(k => !dict.includes(`'${k}':`));
  ok(missing.length === 0, 'community.html 의 data-i18n 키가 모두 영어 사전에 있음', missing.join(','));

  // ⑥ 메뉴 칸이 하나 늘었어도 머리 줄이 겹치지 않는다(메뉴가 보이는 가장 좁은 폭, 글이 긴 영어로)
  const boxes = (sel) => `(() => { const a = [...document.querySelector('header').querySelectorAll('${sel}')].filter(e => e.offsetParent !== null).map(e => e.getBoundingClientRect()).sort((x, y) => x.left - y.left); let ok = a.every(r => r.left >= 0 && r.right <= innerWidth + 0.5); for (let i = 1; i < a.length; i++) if (a[i].left < a[i - 1].right - 0.5) ok = false; return ok && a.length >= 3; })()`;
  for (const [f, w, sel] of [['index.html', 861, 'header > *'], ['index.html', 1024, 'header > *'], ['feedback.html', 721, '.brand, .top-right > *'], ['install.html', 721, '.brand, .top-right > *'], ['privacy.html', 721, '.brand, .top-right > *'], ['community.html', 721, '.brand, .top-right > *']]) {
    const h = await page(w, 800);
    await h.goto(`${base}/${f}?lang=en`); await h.waitForTimeout(f === 'index.html' ? 900 : 300);
    ok(await h.evaluate(boxes(sel)), `${f} 폭 ${w} 영어: 머리 줄이 겹치거나 넘치지 않음`);
    await h.close();
  }

  ok(errs.length === 0, '페이지 오류 0', errs.join('|'));
  await b.close(); srv.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
});
