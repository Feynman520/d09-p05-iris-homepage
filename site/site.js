// IRIS homepage · © 2026 Sejun Ham (함세준) · MIT · https://feynman520.github.io/card/#home
/* 네 가지만 한다: ① 언어 전환(KO 원문 / EN 사전) ② 최신 릴리스 3곳을 읽어 다운로드 단추와 「구성 요소와 새 소식」 절 채우기 ③ 별의 구 띄우기 + 워드마크 두 번 클릭 서명. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---- ① 설정 한 곳: 세 부품의 저장소와 마지막으로 안 판(API 가 막혔을 때 그리는 값) ----
  const CONFIG = {
    repos: {
      face: 'Feynman520/d06-p02-iris-face',
      messenger: 'Feynman520/d06-p04-iris-messenger',
      installer: 'Feynman520/d09-p03-iris-installer',
    },
    fallback: {
      face: { version: 'v2.58.0' },
      messenger: { version: 'v0.3.2' },
      installer: { version: 'v1.3.2', bytes: 250264924, date: '2026-09-14', asset: 'IRIS-Setup_v1.3.2_2026-09-14.zip',
        url: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/latest',
        sha: '338465090c88d94230ed0f79d282cd4ffdf31d8ffc08457125059196a8e5d683' }, // 릴리스 첨부 .sha256 은 CORS 가 막혀 브라우저가 못 읽는다 → 아는 판의 값만 여기 둔다
    },
  };

  // ---- ② 언어 ----
  const I18N = {
    en: {
      'title': 'IRIS — an AI assistant workspace inside your PC',
      'desc': 'IRIS installs a folder system, rules and AI agents (Claude Code · Codex) as one box on your Windows PC. Free, open source, one zip, double-click.',
      'nav.what': 'About', 'nav.how': 'How it works', 'nav.install': 'Install guide', 'nav.download': 'Download',
      'hero.motto': 'Agents solve. We define.',
      'hero.sub': 'IRIS is an AI assistant workspace built inside your own PC. A folder system, rules and agents in one box, installed from a single zip.',
      'hero.foot': 'Scroll down to see what IRIS is and how it works',
      'chip.free': 'Free · MIT',
      'dock.title': 'Download IRIS', 'dock.sub': 'Unzip, double-click IRIS-설치.cmd, and you are done',
      'what.h': 'What IRIS is',
      'what.define': 'An AI assistant workspace inside your PC — a folder system, rules and agents in one box.',
      'what.lead': 'To hand work to an assistant you need three things: a place where the work lives, written rules for how it is done, and hands that actually do it. IRIS installs all three into one folder (C:\\IRIS).',
      'what.1h': 'Folder system', 'what.1p': 'Role → domain → project → step. The assistant knows where it is working from the folder it is in.',
      'what.2h': 'Rule files', 'what.2p': 'Each folder\'s AGENTS.md is the rule for that place. Rules from parent folders carry down automatically.',
      'what.3h': 'Agents and the window', 'what.3p': 'Claude Code and Codex are the hands. The IRIS window steers several of their sessions from one screen.',
      'how.h': 'How it works',
      'how.lead': 'The IRIS window does not hide the terminal — it uses it. Your existing CLI runs inside a hidden virtual terminal, and its own transcript is rendered as a clean conversation.',
      'how.1b': 'Choose', 'how.1s': 'Pick a folder, Claude or Codex, a model and a thinking depth, then type the request.',
      'how.2b': 'Launch', 'how.2s': 'The real CLI starts in that folder inside a virtual terminal. Settings, subscriptions and instruction files are never touched.',
      'how.3b': 'Render', 'how.3s': 'The transcript the CLI writes for itself is read back and shown as request → process → answer.',
      'how.4b': 'Continue', 'how.4s': 'Keep talking in the same session, resume with another model, or hand the context from Claude to Codex and back.',
      'how.5b': 'Keep', 'how.5s': 'Closing the window keeps sessions alive. When you are done, stop everything at once from the tray.',
      'feat.h': 'Features',
      'feat.1b': 'Many sessions, one window', 'feat.1s': 'Switch sessions in the left task list; each remembers its own folder, agent and combination.',
      'feat.2b': 'The same choices as the terminal', 'feat.2s': 'Agent, model, thinking depth and permission mode are passed only as CLI start flags. Config files stay untouched.',
      'feat.3b': 'Previews inside the conversation', 'feat.3s': 'Images, HTML, PDF and local addresses open in place. Hangul and Office documents are converted to PDF and shown there.',
      'feat.4b': 'Subagents are visible', 'feat.4s': 'Background helpers the agent spawns appear as chips; click one to read its transcript in a read-only drawer.',
      'feat.5b': 'Done notifications and approval cards', 'feat.5s': 'A small toast when a request finishes, and a card with choices when the agent asks for permission. Voice input is processed on your PC only.',
      'feat.6b': 'Extension modules', 'feat.6s': 'Install official modules from settings. The first is IRIS Messenger — text and files between people, end-to-end encrypted.',
      'scr.h': 'Screens',
      'scr.1bar': 'IRIS window (desktop app)',
      'scr.1': 'The IRIS window home. Pick a folder, type a request, and a new session opens.',
      'scr.2bar': 'Installer (in the browser)', 'scr.2': 'The installer opens in your browser and walks you from the readiness check to login.',
      'scr.3bar': 'IRIS Messenger (module)', 'scr.3': 'The first extension module. The server stores ciphertext only and cannot read messages.',
      'dl.h': 'Download', 'dl.btn': 'Download IRIS', 'dl.all': 'All releases',
      'dl.reqh': 'What you need',
      'dl.req1': 'Windows 10 (1809) or later, 64-bit', 'dl.req2': 'At least 2 GB free on drive C',
      'dl.req3': 'Internet access (to fetch Claude Code and to log in)',
      'dl.req4': 'A paid Claude (claude.ai) or ChatGPT (chatgpt.com) subscription — the agent CLI works under that account',
      'dl.stepsh': 'Install in three steps',
      'dl.step1': 'Download the zip and extract it.', 'dl.step2': 'Double-click <code>IRIS-설치.cmd</code> inside the extracted folder.',
      'dl.step3': 'Follow the installer screen that opens in your browser. The only manual step is logging in to your subscription.',
      'dl.note': 'If extraction fails, first check the file size in its Properties window: a different number of bytes means the download was cut short — download it again. To verify the file itself, compare the output of this PowerShell command with the SHA-256 value.',
      'dl.bytes': 'exact size',
      'dl.update': 'Already installed? Settings → Update in the IRIS window brings everything up to date in one step.',
      'dl.more': 'The <a href="/install?lang=en">install guide</a> explains each screen and what to do if you get stuck.',
      'in.h': 'What is inside',
      'in.lead': 'Everything goes into one folder, C:\\IRIS, and the only thing outside it is an “IRIS” shortcut on the desktop. To remove IRIS, delete the folder.',
      'in.th1': 'Part', 'in.th2': 'What it does',
      'in.r1': 'The runtime the agents and the window need. Bundled, so nothing else is installed.',
      'in.r2': 'The agents that do the work. The latest versions are fetched at install time and log in with your subscription.',
      'in.r3t': 'Account relay', 'in.r3': 'A small local server that lets several subscription accounts be used from one window. Runs on your PC only.',
      'in.r4t': 'IRIS window', 'in.r4': 'The desktop app that steers several sessions from one window — the one in the screens above.',
      'in.r5t': 'Setup guide and rules', 'in.r5': 'The guide the assistant reads on first run to set up your workspace with you, plus the default rule files.',
      'in.lic': 'All source is published under the MIT license. Licenses of bundled parts are listed in <code>payload/licenses/NOTICES.md</code> inside the zip.',
      'comp.h': 'Components and news',
      'comp.lead': 'Read fresh from GitHub on every visit — the current version and release notes of all three parts.',
      'comp.th1': 'Part', 'comp.th2': 'Version', 'comp.th3': 'Date', 'comp.th4': 'One line',
      'comp.face': 'IRIS window', 'comp.messenger': 'Messenger', 'comp.installer': 'Installer package',
      'comp.none': 'No release notes yet.', 'comp.nover': 'No release yet',
      'faq.h': 'Questions',
      'faq.1q': 'Do I need a paid subscription?', 'faq.1a': 'Yes. IRIS does not ship an AI of its own; it runs Claude Code and Codex CLI under the Claude or ChatGPT subscription you already have. IRIS itself is free.',
      'faq.2q': 'Where do my files and conversations go?', 'faq.2a': 'They stay on your PC. The IRIS window, relay and installer send nothing off your machine. What the agent CLIs exchange with the AI vendors follows each CLI\'s own policy.',
      'faq.3q': 'How do I uninstall?', 'faq.3a': 'Delete the C:\\IRIS folder and the desktop shortcut. Nothing is written to the registry or system folders.',
      'faq.4q': 'Does it run on macOS or Linux?', 'faq.4a': 'Windows 10/11 64-bit only for now. Other systems are planned, without a date.',
      'faq.5q': 'Will it conflict with an existing Claude Code install?', 'faq.5a': 'No. IRIS uses its own copy inside its folder and leaves your existing install and settings alone.',
      'faq.6q': 'A new version came out — do I have to reinstall?', 'faq.6a': 'No. Already installed? Settings → Update in the IRIS window brings everything up to date in one step.',
      'foot.card': 'Digital card', 'foot.installer': 'Installer', 'foot.face': 'IRIS window', 'foot.messenger': 'Messenger', 'foot.privacy': 'Privacy',
      // 설치 안내 쪽
      'inst.title': 'IRIS — Install guide', 'crumb.home': 'IRIS', 'inst.h': 'Install guide',
      'inst.lead': 'What each installer screen does, in order, and what to do when something stops.',
      'inst.s0h': 'Before you start', 'inst.s0': 'Download the zip from the home page, extract it anywhere, and double-click <code>IRIS-설치.cmd</code>. A console window flashes briefly and the installer opens in your browser at 127.0.0.1:3460.',
      'inst.s1h': 'Readiness check', 'inst.s1': 'Windows version, free space on drive C and internet access are checked automatically. Anything missing is named, with what to do.',
      'inst.s2h': 'Install location', 'inst.s2': 'IRIS always installs to C:\\IRIS. If it already exists, the installer switches to update mode and never overwrites your files.',
      'inst.s3h': 'Subscription', 'inst.s3': 'Tick what you have: Claude, ChatGPT, or both. With both, Claude Code leads the first setup.',
      'inst.s4h': 'Installing', 'inst.s4': 'Bundled runtime and the IRIS window are unpacked, Claude Code is fetched from npm. About 1 GB, a few minutes.',
      'inst.s5h': 'Login and hand-over', 'inst.s5': 'The browser opens the login page of your subscription once. Afterwards the IRIS window opens and the assistant takes over the rest of the setup.',
      'inst.updh': 'Updating',
      'inst.upd': 'Once installed, new versions show up under Settings → Update in the IRIS window. When one is available, press the “Update” button at the top of that section — after the download and its checks finish, a confirmation card appears. Confirm it and every open session ends, the new version is applied, and the window reopens with those sessions resumed automatically.',
      'inst.stuckh': 'If you get stuck',
      'inst.k1h': 'Windows warns about an unknown app', 'inst.k1': 'IRIS-설치.cmd is a plain script, not a signed .exe, so SmartScreen may warn. Choose “More info” → “Run anyway”. The script only starts the bundled Node.js.',
      'inst.k2h': 'The login window does not appear', 'inst.k2': 'Look for a browser tab in the background. If nothing appears within a minute, press “Retry” on the installer screen; the login step can be repeated safely.',
      'inst.k3h': 'Something else failed', 'inst.k3': 'The log is at <code>C:\\IRIS\\_agent\\shared\\package-install.log</code>. Open an issue on GitHub with the last lines of that file — it contains no secrets.',
      'inst.rmh': 'Uninstall', 'inst.rm': 'Stop IRIS from the tray, then delete C:\\IRIS and the desktop shortcut. That is all.',
      // 처리방침 쪽
      'priv.title': 'IRIS — Privacy', 'priv.h': 'IRIS Messenger privacy policy',
    },
  };
  const KEY = 'iris.site.lang';
  const original = new Map();
  function setLang(lang) {
    const en = lang === 'en';
    document.documentElement.lang = en ? 'en' : 'ko';
    for (const el of $$('[data-i18n]')) {
      const k = el.dataset.i18n;
      if (!original.has(el)) original.set(el, el.innerHTML);
      el.innerHTML = en && I18N.en[k] != null ? I18N.en[k] : original.get(el);
    }
    for (const el of $$('[data-i18n-content]')) { const k = el.dataset.i18nContent; if (!original.has(el)) original.set(el, el.content); el.content = en && I18N.en[k] != null ? I18N.en[k] : original.get(el); }
    for (const b of $$('.lang button')) b.setAttribute('aria-pressed', String(b.dataset.lang === (en ? 'en' : 'ko')));
    try { localStorage.setItem(KEY, en ? 'en' : 'ko'); } catch {}
    renderAllComponents();
  }
  function initialLang() {
    const q = new URLSearchParams(location.search).get('lang'); if (q === 'en' || q === 'ko') return q;
    try { const s = localStorage.getItem(KEY); if (s === 'en' || s === 'ko') return s; } catch {}
    return /^ko\b/i.test(navigator.language || '') ? 'ko' : 'en';
  }

  // ---- ③ 최신 릴리스 3곳 → 다운로드 단추 + 「구성 요소와 새 소식」 절 ----
  const mb = (bytes) => `${Math.round(bytes / 1048576)} MB`;
  function paint(r) {
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.textContent = v; };
    set('chip-ver', r.version); set('chip-size', mb(r.bytes)); set('dl-ver', r.version); set('dl-size', mb(r.bytes)); set('dl-date', r.date); set('foot-ver', r.version);
    if (r.bytes) set('dl-bytes', `${Number(r.bytes).toLocaleString('en-US')} bytes`); // 정확한 바이트 수 — 내려받기가 중간에 끊긴 파일을 사용자가 속성 창에서 바로 알아보게
    for (const id of ['dock-dl', 'dl-btn']) { const a = document.getElementById(id); if (a) a.href = r.url; }
    const cmd = document.getElementById('dl-hashcmd'); if (cmd) cmd.textContent = `Get-FileHash .\\${r.asset} -Algorithm SHA256`;
    if (r.shaUrl) { const l = document.getElementById('dl-shalink'); if (l) l.href = r.shaUrl; }
    if (r.sha) { const s = document.getElementById('dl-sha'); if (s) { s.textContent = r.sha; s.hidden = false; } }
  }

  const PARTS = ['face', 'messenger', 'installer'];
  const compData = {}; // 부품별 { version, date, note(한 줄), notes(전문) } — fallback 으로 시작, 성공한 fetch 로만 덮어씀
  for (const key of PARTS) compData[key] = { version: CONFIG.fallback[key].version || null, date: null, note: null, notes: null };

  function stripMd(line) { return line.replace(/^[#*\-\s]+/, '').trim(); }
  function firstLine(body) {
    for (const raw of String(body || '').split(/\r?\n/)) {
      const t = raw.trim();
      if (t) return stripMd(t);
    }
    return '';
  }
  function fillNotes(el, body) {
    el.textContent = '';
    const lines = String(body || '').split(/\r?\n/);
    lines.forEach((line, i) => {
      el.appendChild(document.createTextNode(line));
      if (i < lines.length - 1) el.appendChild(document.createElement('br'));
    });
  }
  function t(en, ko) { return document.documentElement.lang === 'en' ? en : ko; }
  function renderComponent(key) {
    const d = compData[key]; if (!d) return;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set(`comp-${key}-ver`, d.version || t(I18N.en['comp.nover'], '아직 판이 없습니다'));
    set(`comp-${key}-date`, d.date || '—');
    set(`comp-${key}-note`, d.note || (d.version ? '—' : t(I18N.en['comp.none'], '변경 내용 없음')));
    const sum = document.getElementById(`comp-${key}-summary`);
    if (sum) sum.textContent = d.version ? t(`What's new in ${d.version}`, `${d.version} 변경 내용`) : t(I18N.en['comp.none'], '변경 내용 없음');
    const body = document.getElementById(`comp-${key}-body`);
    if (body) { if (d.notes) fillNotes(body, d.notes); else body.textContent = t(I18N.en['comp.none'], '아직 내용이 없습니다.'); }
  }
  function renderAllComponents() { for (const key of PARTS) renderComponent(key); }

  for (const b of $$('.lang button')) b.addEventListener('click', () => setLang(b.dataset.lang));
  setLang(initialLang()); // 여기서 renderAllComponents() 도 한 번 불려 fallback 이 먼저 그려진다

  const onIndex = !!document.getElementById('dl-btn');
  if (onIndex) {
    paint(CONFIG.fallback.installer);
    async function fetchRelease(key) {
      try {
        const res = await fetch(`https://api.github.com/repos/${CONFIG.repos[key]}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
        return res.ok ? await res.json() : null;
      } catch { return null; }
    }
    (async () => {
      const results = await Promise.all(PARTS.map(fetchRelease)); // 페이지당 요청 3개, 병렬
      PARTS.forEach((key, i) => {
        const rel = results[i];
        if (!rel) return; // 실패한 것은 fallback 그대로 둔다
        const version = String(rel.tag_name || '').replace(/^.*--/, '') || compData[key].version;
        compData[key] = { version, date: String(rel.published_at || '').slice(0, 10), note: firstLine(rel.body) || null, notes: rel.body || null };
        renderComponent(key);
        if (key === 'installer') {
          const zip = (rel.assets || []).find(a => /\.zip$/i.test(a.name));
          if (zip) {
            const shaAsset = (rel.assets || []).find(a => /\.sha256$/i.test(a.name));
            paint({ version, bytes: zip.size, date: compData.installer.date, asset: zip.name, url: zip.browser_download_url, shaUrl: shaAsset?.browser_download_url,
              sha: version === CONFIG.fallback.installer.version ? CONFIG.fallback.installer.sha : null }); // 새 판이 나왔는데 이 파일이 아직 옛 값이면 값 대신 링크만
          }
        }
      });
    })();
  }

  // ---- ④ 별의 구 + 서명 ----
  const canvas = document.getElementById('iris');
  if (canvas && window.IrisStars) {
    const small = Math.min(window.innerWidth, window.innerHeight) < 640;
    window.IrisStars.mount(canvas, { style: 'sphere', density: small ? 0.5 : 1 });
    const sig = document.getElementById('hero-sig'), heroIn = $('.hero-in');
    let busy = false;
    function signature() {
      if (busy) return; const r = window.IrisStars.signature('SEJUN HAM'); if (!r) return; busy = true;
      heroIn.style.transition = 'opacity .6s ease'; heroIn.style.opacity = '0';
      setTimeout(() => sig.classList.add('on'), r.in * 0.7);
      setTimeout(() => { sig.classList.remove('on'); heroIn.style.opacity = '1'; setTimeout(() => { busy = false; }, 800); }, r.in + r.hold);
    }
    document.getElementById('wordmark')?.addEventListener('dblclick', (e) => { e.preventDefault(); signature(); });
    document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.altKey && (e.key === 'i' || e.key === 'I')) { e.preventDefault(); signature(); } });
  }
})();
