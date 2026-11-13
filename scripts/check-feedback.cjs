// IRIS homepage · © 2026 Sejun Ham (함세준) · MIT · https://feynman520.github.io/card/#home
// /feedback 동작 시험(2026-11-13, 설계 = docs/설계-의견함-2026-11-12.md). 네트워크는 가짜 — 실제 DB·알림 메일을 건드리지 않는다.
// 설치 안내 조건·종류별 안내·표시 선·빈 글·횟수 제한/연결 실패 안내·보낸 값·접수 화면·영어·?info=(IRIS 창에서 넘어옴)을 본다.
//   node scripts/check-feedback.cjs [캡처 폴더]      (playwright 가 없으면 SKIP 하고 0 으로 끝)
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
let pw = null;
for (const c of ['playwright', path.join(process.env.APPDATA || '', 'npm/node_modules/playwright')]) { try { pw = require(c); break; } catch {} }
if (!pw) { console.log('SKIP: playwright 없음'); process.exit(0); }
const { chromium } = pw;
const root = path.join(__dirname, '..', 'site');
const out = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'iris-fb-'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const srv = http.createServer((q, r) => { const f = path.resolve(root, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html'); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
let pass = 0, fail = 0; const ok = (c, n, x = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' — ' + x : ''}`); };
srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port; const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let sent = null, mode = 'ok';
  await p.route('**/rest/v1/rpc/submit_feedback', async (route) => {
    sent = JSON.parse(route.request().postData());
    if (mode === 'rate') return route.fulfill({ status: 400, contentType: 'application/json', body: '{"code":"22023","message":"rate_limited"}' });
    if (mode === 'down') return route.abort();
    return route.fulfill({ status: 200, contentType: 'application/json', body: '"F-20261113-abcdef"' });
  });
  await p.goto(`http://127.0.0.1:${port}/feedback.html?lang=ko`); await p.waitForTimeout(400);
  ok(await p.isHidden('#fb-tip'), '처음에는 설치 안내 숨김');
  await p.selectOption('#fb-where', 'install'); ok(await p.isVisible('#fb-tip'), '고장+설치 → 설치 안내 보임');
  await p.click('.fb-rail button:nth-of-type(2)'); ok(await p.isHidden('#fb-tip'), '종류를 바꾸면 설치 안내 숨김');
  ok((await p.getAttribute('#fb-body', 'placeholder')).includes('어떻게 바뀌면'), '종류별 입력 안내 바뀜');
  ok((await p.$eval('.fb-rail', e => e.style.getPropertyValue('--i'))) === '1', '표시 선 = 두 번째 칸');
  await p.click('#fb-send'); ok(await p.isVisible('#fb-err') && sent === null, '빈 내용 → 오류, 안 보냄');
  await p.fill('#fb-body', '첫 줄 제목\n둘째 줄'); await p.fill('#fb-mail', 'a@b.co');
  mode = 'rate'; await p.click('#fb-send'); await p.waitForTimeout(300);
  ok((await p.textContent('#fb-err')).includes('10분에 5통') && (await p.inputValue('#fb-body')).startsWith('첫 줄'), '횟수 제한 → 안내 + 쓴 글 그대로');
  mode = 'down'; await p.click('#fb-send'); await p.waitForTimeout(300);
  ok((await p.textContent('#fb-err')).includes('인터넷 연결'), '연결 실패 → 안내');
  ok(!(await p.isDisabled('#fb-send')) && (await p.textContent('#fb-send')) === '보내기', '실패 뒤 단추 원래대로');
  mode = 'ok'; await p.click('#fb-send'); await p.waitForTimeout(300);
  ok(sent && sent.p_kind === 'improve' && sent.p_place === 'install' && sent.p_source === 'site' && sent.p_email === 'a@b.co' && sent.p_trap === null && sent.p_body.startsWith('첫 줄'), '보낸 값', JSON.stringify(sent));
  ok(await p.isVisible('#fb-done') && (await p.textContent('#fb-number')) === 'F-20261113-abcdef', '보낸 뒤 화면 + 접수 번호');
  ok(await p.isVisible('#fb-reply-note'), '이메일 남기면 답장 안내 보임');
  await p.screenshot({ path: path.join(out, 'done.png') });
  await p.click('#fb-again'); ok(await p.isVisible('#fb-write') && (await p.inputValue('#fb-body')) === '', '하나 더 보내기 → 빈 글');
  await p.click('.lang button[data-lang="en"]'); await p.waitForTimeout(150);
  ok((await p.getAttribute('#fb-body', 'placeholder')).startsWith('How is it now'), '영어로 바꾸면 입력 안내도 영어');
  // 앱에서 넘어온 경우
  const q = await b.newPage({ viewport: { width: 390, height: 844 } }); q.on('pageerror', e => errs.push(e.message));
  await q.route('**/rest/v1/rpc/submit_feedback', async (route) => { sent = JSON.parse(route.request().postData()); route.fulfill({ status: 200, contentType: 'application/json', body: '"F-20261113-000001"' }); });
  await q.goto(`http://127.0.0.1:${port}/feedback.html?lang=ko&info=${encodeURIComponent('IRIS 창 2.105.0 · Windows 11')}`); await q.waitForTimeout(300);
  ok(await q.isVisible('#fb-info') && (await q.textContent('#fb-info-v')).includes('2.105.0'), '?info= → 함께 보내는 정보 보임');
  await q.click('.fb-rail button:nth-of-type(4)'); ok((await q.$eval('.fb-rail', e => e.style.getPropertyValue('--i'))) === '3', '휴대폰 탭 네 번째');
  await q.fill('#fb-body', 'x'); await q.click('#fb-send'); await q.waitForTimeout(300);
  ok(sent.p_app_info === 'IRIS 창 2.105.0 · Windows 11' && sent.p_kind === 'other' && sent.p_place === 'unknown', '앱 정보·종류·어디서 미선택=잘 모름', JSON.stringify(sent));
  ok(await q.isHidden('#fb-reply-note'), '이메일 없으면 답장 안내 숨김');
  ok(errs.length === 0, '페이지 오류 0', errs.join('|'));
  await b.close(); srv.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
});
