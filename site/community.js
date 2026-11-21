// IRIS homepage · © 2026 Sejun Ham (함세준) · MIT · https://feynman520.github.io/card/#home
/* /community 동작 — community-data.js 의 목록을 명판 벽으로 그리고, 명판을 누르면 큰 화면을 연다.
   목록의 글은 전부 글자로만 넣는다(HTML 로 해석하지 않는다). 주소는 https 만, 그림은 img/community/ 안의 파일만 받는다.
   언어는 site.js 의 setLang 이 data-i18n 을 바꾸고, 여기서 만드는 글은 <html lang> 을 보고 고른다. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var T = {
    ko: { by: '만든 사람', rest: '쉬는 중', listed: function (d) { return d + ' 올림'; }, first: '첫 자리', next: '다음 자리',
          seat: '아이리스를 고쳐 쓰고 있다면 아래에서 신청해 주세요.', close: '닫기', shot: function (n) { return n + ' 화면 미리보기'; }, wall: '올라온 판' },
    en: { by: 'Made by', rest: 'Resting', listed: function (d) { return 'Listed ' + d; }, first: 'The first seat', next: 'The next seat',
          seat: 'If you run your own build of IRIS, ask for a listing below.', close: 'Close', shot: function (n) { return 'Preview of ' + n; }, wall: 'Listed builds' }
  };
  var lang = function () { return document.documentElement.lang === 'en' ? 'en' : 'ko'; };
  var t = function () { return T[lang()]; };

  var DATE = /^\d{4}-\d{2}-\d{2}$/, IMG = /^img\/community\/[A-Za-z0-9._-]+\.(png|jpg|jpeg|webp)$/;
  var str = function (v) { return typeof v === 'string' ? v.trim() : ''; };
  var date = function (v) { return DATE.test(str(v)) ? str(v) : ''; };
  function https(v) { try { var u = new URL(str(v)); return u.protocol === 'https:' ? u.href : ''; } catch (e) { return ''; } }
  function pick(v) { if (!v || typeof v !== 'object') return ''; return v[lang()] != null ? v[lang()] : v.ko; }

  // 못 쓰는 항목(번호·이름·만든 사람·주소가 빠졌거나 틀린 것)은 그리지 않는다.
  var list = (Array.isArray(window.IRIS_COMMUNITY) ? window.IRIS_COMMUNITY : []).map(function (b) {
    if (!b || typeof b !== 'object') return null;
    var o = { no: Number(b.no), name: str(b.name), maker: str(b.maker), repo: https(b.repo), img: IMG.test(str(b.img)) ? str(b.img) : '',
              listed: date(b.listed), checked: date(b.checked), updated: date(b.updated), rest: b.rest === true, one: b.one, changes: b.changes };
    return Number.isInteger(o.no) && o.no > 0 && o.name && o.maker && o.repo ? o : null;
  }).filter(Boolean).sort(function (a, b) { return a.no - b.no; });

  var wall = $('#cm-wall'), none = $('#cm-none'), dlg = $('#cm-dlg');
  if (!wall) return;
  var num = function (n) { return 'N° ' + String(n).padStart(3, '0'); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function restTag() { return el('span', 'cm-rest', t().rest); }
  function byLine() { var s = el('span', 'cm-by', t().by + ' '); return s; }

  function tile(b) {
    var btn = el('button', 'cm-tile' + (b.rest ? ' rest' : '')); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
    if (b.img) { var im = el('img'); im.src = b.img; im.alt = ''; im.loading = 'lazy'; btn.appendChild(im); }
    var top = el('span', 'cm-top'); top.appendChild(el('span', 'cm-n', num(b.no))); if (b.rest) top.appendChild(restTag());
    var bot = el('span'), by = byLine(); by.appendChild(el('b', '', b.maker));
    bot.appendChild(el('span', 'cm-nm', b.name)); bot.appendChild(by); bot.appendChild(el('span', 'cm-on', str(pick(b.one))));
    btn.appendChild(top); btn.appendChild(bot);
    btn.addEventListener('click', function () { open(b); });
    var li = el('li'); li.appendChild(btn); return li;
  }
  function seat() {
    var a = el('a', 'cm-tile cm-seat'); a.href = '#apply';
    var top = el('span', 'cm-top'); top.appendChild(el('span', 'cm-n', num(list.length ? list[list.length - 1].no + 1 : 1)));
    var bot = el('span'); bot.appendChild(el('span', 'cm-nm', list.length ? t().next : t().first)); bot.appendChild(el('span', 'cm-on', t().seat));
    a.appendChild(top); a.appendChild(bot);
    var li = el('li'); li.appendChild(a); return li;
  }
  function render() {
    wall.textContent = ''; wall.setAttribute('aria-label', t().wall);
    list.forEach(function (b) { wall.appendChild(tile(b)); });
    wall.appendChild(seat());
    if (none) none.hidden = list.length > 0;
    var x = $('#cm-d-x'); if (x) x.setAttribute('aria-label', t().close);
    if (shown) fill(shown);
  }

  var shown = null;
  function fill(b) {
    $('#cm-d-no').textContent = num(b.no);
    var h = $('#cm-d-name'); h.textContent = b.name; if (b.rest) h.appendChild(restTag());
    $('#cm-d-maker').textContent = b.maker;
    $('#cm-d-listed').textContent = b.listed ? t().listed(b.listed) : '';
    $('#cm-d-one').textContent = str(pick(b.one));
    var ul = $('#cm-d-chg'); ul.textContent = '';
    var ch = pick(b.changes); (Array.isArray(ch) ? ch : []).forEach(function (c) { if (str(c)) ul.appendChild(el('li', '', str(c))); });
    $('#cm-d-updated').textContent = b.updated; $('#cm-d-updated-w').hidden = !b.updated;
    $('#cm-d-checked').textContent = b.checked; $('#cm-d-checked-w').hidden = !b.checked;
    $('#cm-d-go').href = b.repo;
    var shot = $('#cm-d-shot'), img = $('#cm-d-img');
    shot.hidden = !b.img; shot.className = 'cm-shot' + (b.rest ? ' rest' : ''); $('#cm-d-in').classList.toggle('noshot', !b.img);
    if (b.img) { img.src = b.img; img.alt = t().shot(b.name); } else { img.removeAttribute('src'); }
  }
  function open(b) { if (!dlg || !dlg.showModal) { location.href = b.repo; return; } shown = b; fill(b); dlg.showModal(); }
  if (dlg) {
    $('#cm-d-x').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // 바깥(어두운 곳)을 누르면 닫힘
    dlg.addEventListener('close', function () { shown = null; });
  }
  // 언어가 바뀌면(site.js setLang → <html lang>) 이 파일이 만든 글도 다시 그린다.
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
