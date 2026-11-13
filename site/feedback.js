/* IRIS homepage · © 2026 Sejun Ham (함세준) · MIT · https://feynman520.github.io/card/#home */
/* 의견 보내기(/feedback) — 설계 정본 = docs/설계-의견함-2026-11-12.md (② 분류 레일).
   보내기 = IRIS 공용 DB(메신저 허브 Supabase)의 넣기 전용 함수 submit_feedback 하나. 이 anon 키는 공개해도 안전하다
   (표는 직접 읽기·쓰기 전부 막혀 있고 함수 안에서 길이·횟수·크기 상한을 건다 — P08 허브 server/migrations/0005_feedback.sql).
   언어는 site.js 의 setLang 이 data-i18n 을 바꾸고, 여기서 만드는 글(입력 안내·오류)은 <html lang> 을 보고 고른다. */
(function () {
  'use strict';
  var HUB = { url: 'https://bgintjgktcajltvmtpia.supabase.co', anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnaW50amdrdGNhamx0dm10cGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTc0NTQsImV4cCI6MjEwNDc5MzQ1NH0.X-b7j6cYkgG0rr_K5eOkT_Sxyzw3foYDnxbdMIi2AUo' };
  var $ = function (s) { return document.querySelector(s); };
  var KINDS = ['bug', 'improve', 'feature', 'other'];
  var T = {
    ko: {
      ph: ['무엇을 하다가 무엇이 나왔나요?', '지금은 어떻고, 어떻게 바뀌면 좋을까요?', '무엇을 하고 싶은데 무엇이 없나요?', '편하게 적어 주세요.'],
      empty: '내용을 적어 주세요.', sending: '보내는 중', send: '보내기',
      rate: '잠시 뒤에 다시 보내 주세요. 같은 곳에서는 10분에 5통까지 받습니다.',
      full: '지금은 의견을 받을 수 없습니다. GitHub 게시판에 남겨 주세요.',
      fail: '보내지 못했습니다. 인터넷 연결을 확인하고 다시 보내 주세요. 쓴 내용은 그대로 있습니다.',
      bad: '보내지 못했습니다. 이메일 주소를 확인해 주세요.',
      copied: '접수 번호를 복사했습니다.', copyFail: '접수 번호를 선택해 복사해 주세요.'
    },
    en: {
      ph: ['What were you doing, and what happened?', 'How is it now, and how should it change?', 'What do you want to do that you can’t yet?', 'Write anything.'],
      empty: 'Please write something first.', sending: 'Sending', send: 'Send',
      rate: 'Please try again in a little while. We accept up to 5 per 10 minutes from one place.',
      full: 'We can’t take feedback right now. Please use the GitHub board.',
      fail: 'Couldn’t send. Check your connection and try again — your text is still here.',
      bad: 'Couldn’t send. Please check the email address.',
      copied: 'Receipt number copied.', copyFail: 'Select the receipt number to copy it.'
    }
  };
  var t = function () { return T[document.documentElement.lang === 'en' ? 'en' : 'ko']; };
  var rail = Array.prototype.slice.call(document.querySelectorAll('.fb-rail button'));
  var body = $('#fb-body'), where = $('#fb-where'), mail = $('#fb-mail'), send = $('#fb-send'), err = $('#fb-err');
  var kind = 0;
  var narrow = window.matchMedia('(max-width: 720px)');

  // 앱에서 넘어온 경우(IRIS 창 → 「홈페이지에서 보내기」): ?info=IRIS 창 2.x · 설치 패키지 2.x · Windows 11 …
  var info = '';
  try { info = (new URLSearchParams(location.search).get('info') || '').slice(0, 300); } catch (e) {}
  if (info) { $('#fb-info-v').textContent = info; $('#fb-info').hidden = false; }

  // 표시 선 위치는 CSS 가 --i(고른 차례)로 계산한다(PC = 세로 48px 칸, 휴대폰 = 가로 25% 칸).
  function mark() { $('.fb-rail').style.setProperty('--i', kind); }
  function grow() { body.style.height = 'auto'; body.style.height = Math.max(body.scrollHeight + 2, 208) + 'px'; }
  function sync() {
    rail.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === kind)); });
    body.placeholder = t().ph[kind];
    $('#fb-tip').hidden = !(kind === 0 && where.value === 'install');
    where.classList.toggle('unset', !where.value);
    mark();
  }
  rail.forEach(function (b, i) { b.addEventListener('click', function () { kind = i; sync(); body.focus(); }); });
  where.addEventListener('change', sync);
  body.addEventListener('input', function () { grow(); err.hidden = true; });
  window.addEventListener('resize', mark);
  if (narrow.addEventListener) narrow.addEventListener('change', mark);
  // 언어가 바뀌면(site.js setLang → <html lang>) 이 파일이 만든 글도 다시 고른다.
  new MutationObserver(function () { sync(); if (!send.disabled) send.textContent = t().send; }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  function showErr(msg) { err.textContent = msg; err.hidden = false; }
  $('#fb-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!body.value.trim()) { showErr(t().empty); body.focus(); return; }
    send.disabled = true; send.textContent = t().sending; err.hidden = true;
    fetch(HUB.url + '/rest/v1/rpc/submit_feedback', {
      method: 'POST',
      headers: { apikey: HUB.anonKey, Authorization: 'Bearer ' + HUB.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_kind: KINDS[kind], p_place: where.value || 'unknown', p_body: body.value,
        p_email: mail.value.trim() || null, p_source: 'site', p_app_info: info || null, p_trap: $('#fb-website').value || null
      })
    }).then(function (r) {
      return r.text().then(function (txt) {
        if (r.ok) return JSON.parse(txt);
        throw new Error(/rate_limited/.test(txt) ? 'rate' : /"full"|full/.test(txt) ? 'full' : r.status === 400 ? 'bad' : 'fail');
      });
    }).then(function (receipt) {
      $('#fb-number').textContent = receipt;
      $('#fb-reply-note').hidden = !mail.value.trim();
      $('#fb-write').hidden = true; $('#fb-done').hidden = false;
      $('#fb-done-title').focus();
    }).catch(function (x) {
      showErr(t()[x && x.message in T.ko ? x.message : 'fail']);
    }).then(function () { send.disabled = false; send.textContent = t().send; });
  });
  $('#fb-copy').addEventListener('click', function () {
    var n = $('#fb-number').textContent, st = $('#fb-copy-status');
    (navigator.clipboard ? navigator.clipboard.writeText(n) : Promise.reject()).then(function () { st.textContent = t().copied; }, function () {
      st.textContent = t().copyFail; var r = document.createRange(); r.selectNodeContents($('#fb-number')); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    });
  });
  $('#fb-again').addEventListener('click', function () {
    body.value = ''; $('#fb-copy-status').textContent = '';
    $('#fb-done').hidden = true; $('#fb-write').hidden = false; grow(); sync(); body.focus();
  });
  grow(); sync();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(mark);
})();
