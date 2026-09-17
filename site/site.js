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
      face: { version: 'v2.65.0' },
      messenger: { version: 'v0.3.2' },
      installer: { version: 'v2.0.2', bytes: 383133309, date: '2026-09-17', asset: 'IRIS-Setup_v2.0.2_2026-09-17.zip',
        url: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/download/iris-installer--v2.0.2/IRIS-Setup_v2.0.2_2026-09-17.zip', // 첨부 직접 주소(단추를 누르면 바로 내려받기)
        page: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/tag/iris-installer--v2.0.2', // 릴리스 노트 쪽
        sha: '0baf810d63d9709f2b41d7a4baa4d85db0240ce8576c218d8323a58b1274e1a3' }, // 릴리스 첨부 .sha256 은 CORS 가 막혀 브라우저가 못 읽는다 → 아는 판의 값만 여기 둔다
    },
    // 미러(2026-09-14): 일부 네트워크(학교·회사)가 GitHub 릴리스 첨부 서버(release-assets.githubusercontent.com)만 끊는다(실측: github.com 은 열리고 첨부만 연결 재설정).
    // 같은 파일을 Cloudflare R2 에도 둔다(릴리스 도구가 올림). assets = 미러에 있는 첨부 이름 목록 — 여기 있는 판만 미러 링크를 보인다.
    mirror: { base: 'https://pub-6bb549660d7d4bd79ed07a7b6523f5c5.r2.dev', assets: [] }, // v2.0.0(383MB)은 R2 REST PUT 300MB 한도 초과 → 미러 보류(멀티파트/S3 키 필요). GitHub 막힌 네트워크는 아직 미대응.
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
      'dock.title': 'Download IRIS', 'dock.sub': 'Unzip, then double-click the IRIS-설치.cmd file in the folder — installation starts (no command window needed)',
      'what.h': 'What IRIS is',
      'what.define': 'An AI assistant workspace inside your PC — a folder system, rules and agents in one box.',
      'what.lead': 'To hand work to an assistant you need three things: a place where the work lives, written rules for how it is done, and hands that actually do it. IRIS installs all three into one folder (C:\\IRIS).',
      'what.1h': 'Folder system', 'what.1p': 'Role → domain → project → step. The assistant knows where it is working from the folder it is in.',
      'what.2h': 'Rule files', 'what.2p': 'Each folder\'s AGENTS.md is the rule for that place. Rules from parent folders carry down automatically.',
      'what.3h': 'Agents and the window', 'what.3p': 'Claude Code and Codex are the hands. The IRIS window steers several of their sessions from one screen.',
      // 3열 비교
      'cmp.h': 'Terminal, desktop app, and IRIS',
      'cmp.lead': 'Even with the same Claude Code, where and how you use it makes a difference. Of the three, IRIS is the only route that also installs the place your work lives in, and its rules.',
      'cmp.c1': 'CLI in a terminal', 'cmp.c2': 'Claude Code desktop app',
      'cmp.r1': 'First setup', 'cmp.r1a': 'Install and configure Node, Git, Python, the CLI and MCPs one by one (and sort out non-ASCII paths and PATH yourself)', 'cmp.r1b': 'One app install. Document tools and other agents are separate', 'cmp.r1c': '<b>One zip, double-click.</b> Runtime (Node · Python · Git), Claude Code, Codex, document-automation tools and the dashboard install into one folder, <code>C:\\IRIS</code>. System folders and the registry are never touched',
      'cmp.r2': 'Where work lives', 'cmp.r2a': 'Folders are up to you', 'cmp.r2b': 'You pick a project folder', 'cmp.r2c': 'A ready-made <b>role → domain → project → step folder system</b> (7 presets: teacher, researcher, business, developer, office, student, author)',
      'cmp.r3': 'Rules (instruction files)', 'cmp.r3a': 'Write and manage them yourself', 'cmp.r3b': 'Write them yourself', 'cmp.r3c': '<b>An <code>AGENTS.md</code> rule in every folder, parent rules inherited automatically.</b> Whichever folder you open, the assistant already knows “here, we do it this way”',
      'cmp.r4': 'Agents', 'cmp.r4a': 'One at a time', 'cmp.r4b': 'Claude only', 'cmp.r4c': '<b>Both Claude Code and Codex.</b> Continue the same request with another model, or hand the conversation context from Claude to Codex and back',
      'cmp.r5': 'Screen', 'cmp.r5a': 'A stream of text. One session per window', 'cmp.r5b': 'A clean chat window', 'cmp.r5c': 'A clean chat window <b>plus several sessions steered from one screen</b> (cards). Closing the window keeps sessions alive; stop them all at once from the tray',
      'cmp.r11': 'Several jobs at once', 'cmp.r11a': 'Open several windows and switch between them yourself; you have to check each one to see which has finished', 'cmp.r11b': 'Several sessions can be open', 'cmp.r11c': '<b>Run several session cards at once and steer them from one screen.</b> A toast when one finishes and a confirmation card when one asks permission, so you see at a glance which session is waiting for you. Helpers the agent spawns show up as chips too',
      'cmp.r6': 'Document work', 'cmp.r6a': 'Find and install MCPs yourself', 'cmp.r6b': 'Separate install', 'cmp.r6c': '<b>Bundled automation tools for HWP (Hangul), Excel, PowerPoint, Word and PDF</b> — active right away if Hancom or Office is present, otherwise parked as “pending” and switched on once installed',
      'cmp.r7': 'Without internet', 'cmp.r7a': 'Installation itself is hard', 'cmp.r7b': 'Cannot install', 'cmp.r7c': 'Even offline, installation completes through stage ③ (folders, rules, tools); only login and downloads are written into the handover document as “remaining work”',
      'cmp.r8': 'Transparency and undo', 'cmp.r8a': '—', 'cmp.r8b': 'App settings are scattered', 'cmp.r8c': 'Everything is inside <code>C:\\IRIS</code>. <b>Delete one folder and it is gone.</b> An install report and receipt (what went where) are kept',
      'cmp.r9': 'Cost', 'cmp.r9a': 'Subscription only', 'cmp.r9b': 'Subscription only', 'cmp.r9c': '<b>Subscription only. IRIS itself is free and open (MIT)</b>',
      'cmp.r10': 'Limits (honestly)', 'cmp.r10a': 'Lightest and most flexible', 'cmp.r10b': 'Simplest', 'cmp.r10c': 'Windows 10/11 64-bit only. The first install zip is 383 MB. No code signing yet, so a Windows warning has to be passed once on first run',
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
      'dl.step1': 'Download the zip, then <strong>before extracting</strong> right-click it → Properties → tick “Unblock” at the bottom → OK. Now extract it.', 'dl.step2': 'Double-click the <code>IRIS-설치.cmd</code> file inside the extracted folder with the mouse (no command window needed). A blue warning window, or “Smart App Control blocked this file”, means the file is not code-signed yet — follow the steps under “When Windows blocks it” in the <a href="/install?lang=en#blocked">install guide</a>, from the top.',
      'dl.step3': 'Follow the installer screen that opens in your browser. Once the readiness check finishes, answer two questions (subscription and work folder) — after that, the only manual step is logging in to your subscription.',
      'dl.twoh': 'One install, two ways to use it',
      'dl.two1': '<b>Use everything right away</b> — when installation finishes, continue straight into login (⑥ in the install guide).',
      'dl.two2': '<b>Window, folders and dashboard first</b> — you may skip the login and download steps and try the IRIS window first. What remains is listed in order in <code>C:\\IRIS\\_agent\\setup\\설치보고-*.md</code>, and “Continue setup” in the IRIS window finishes it whenever you like.',
      'dl.note': 'If extraction fails, first check the file size in its Properties window: a different number of bytes means the download was cut short — download it again. To verify the file itself, compare the output of this PowerShell command with the SHA-256 value.',
      'dl.bytes': 'exact size',
      'dl.via': 'The download button serves the file from Cloudflare.', 'dl.github': 'Download directly from GitHub instead',
      'dl.viagh': 'The download button serves the file from the GitHub release attachment.', 'dl.relpage': 'Release notes for this version',
      'dl.update': 'Already installed? Settings → Update in the IRIS window brings everything up to date in one step, in most cases. Coming from 1.x is the exception — 2.0 installs fresh (your existing data is left untouched). <a href="install.html#upd1x">Details</a>',
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
      'comp.hotfix': '<b>Installer 2.0.1 (2026-09-16, hotfix)</b> — fixes the install stalling at 44% on PCs without Hancom Office (if you installed 2.0.0, reinstalling with 2.0.1 is recommended). Also 12 other fixes: first-run check failing after the Claude Code download, the final check timing out on slow PCs, a Smart App Control notice, and more. Full text in the <a href="https://github.com/Feynman520/d09-p03-iris-installer/releases/tag/iris-installer--v2.0.2" rel="noopener">release notes</a>.',
      'faq.h': 'Questions',
      'faq.1q': 'Do I need a paid subscription?', 'faq.1a': 'Yes. IRIS does not ship an AI of its own; it runs Claude Code and Codex CLI under the Claude or ChatGPT subscription you already have. IRIS itself is free.',
      'faq.2q': 'Where do my files and conversations go?', 'faq.2a': 'They stay on your PC. The IRIS window, relay and installer send nothing off your machine. What the agent CLIs exchange with the AI vendors follows each CLI\'s own policy.',
      'faq.3q': 'How do I uninstall?', 'faq.3a': 'Delete the C:\\IRIS folder and the desktop shortcut. Nothing is written to the registry or system folders.',
      'faq.4q': 'Does it run on macOS or Linux?', 'faq.4a': 'Windows 10/11 64-bit only for now. Other systems are planned, without a date.',
      'faq.5q': 'Will it conflict with an existing Claude Code install?', 'faq.5a': 'No. IRIS uses its own copy inside its folder and leaves your existing install and settings alone.',
      'faq.6q': 'A new version came out — do I have to reinstall?', 'faq.6a': 'If already installed, in most cases Settings → Update in the IRIS window brings everything up to date in one step. Coming from 1.x to 2.0 is the exception, though — installation works differently now, so it installs fresh (your existing data is left untouched).',
      'foot.card': 'Digital card', 'foot.installer': 'Installer', 'foot.face': 'IRIS window', 'foot.messenger': 'Messenger', 'foot.privacy': 'Privacy',
      // 설치 안내 쪽
      'inst.title': 'IRIS — Install guide', 'crumb.home': 'IRIS', 'inst.h': 'Install guide',
      'inst.lead': 'What each installer screen does, in order, and what to do when something stops.',
      'inst.s0h': '① Download and extract', 'inst.s0': 'Download the zip from the home page. <strong>Before extracting</strong>, right-click it → Properties → tick “Unblock” at the bottom → OK (this removes the mark Windows puts on files from the internet; skip it and Smart App Control on Windows 11 blocks the next step — if it does, see <a href="#blocked">When Windows blocks it</a> just below). Then extract it anywhere.',
      'inst.s1h': '② Double-click the IRIS-설치.cmd file', 'inst.s1': 'In the extracted folder, double-click the <code>IRIS-설치.cmd</code> file with the mouse — there is nothing to type in a command window (the .cmd at the end is just the file type). A console window flashes briefly and the installer screen opens in your browser (127.0.0.1:3460). From here almost everything runs on its own — the only manual part left is answering two questions.',
      // 「윈도우가 막을 때」
      'inst.blkh': 'When Windows blocks it because the file is unsigned',
      'inst.blkwhy': 'The IRIS installer has no code signature yet (a developer certificate that proves to Windows who made the file). So Windows may treat it as an “unknown app” and block it once. The file itself is built from source published on GitHub, and the SHA-256 value below lets you check that what you downloaded is identical to the original.',
      'inst.blkorderh': 'If it is blocked — try from the top, and stop when it works',
      'inst.blk1b': 'Blue window “Windows protected your PC” (SmartScreen)', 'inst.blk1s': 'Click “More info” and a “Run anyway” button appears → run it. The script only starts the bundled Node.js.<em class="next">If no window appears at all, or it says “Smart App Control blocked this file” ↓</em>',
      'inst.blk2b': 'Turn off Smart App Control (SAC) — on a new PC it is usually on (or in evaluation mode)', 'inst.blk2s': 'Settings › Privacy &amp; security › Windows Security › App &amp; browser control › Smart App Control settings › “Off”. <span class="warn">Once off, it cannot be turned back on — short of reinstalling Windows.</span> While it is on, most unsigned programs are blocked. Then double-click <code>IRIS-설치.cmd</code> again.<em class="next">If still nothing happens ↓</em>',
      'inst.blk3b': 'Run it from a command window', 'inst.blk3s': '<ol class="sub"><li>Open the extracted folder.</li><li>Click the address bar (the box showing the folder path), type <code>cmd</code> and press Enter → a black window (Command Prompt) opens in that folder.</li><li>Paste this one line into the black window and press Enter:<br><code>IRIS-설치.cmd</code></li><li>If your browser opens with the installer screen a few seconds later, it worked. The black window closes by itself.</li></ol><em class="next">If the black window prints an error ↓</em>',
      'inst.blk4b': 'Ask for help', 'inst.blk4s': 'Take a photo of that screen (or copy the text) and get in touch. The same guidance is in “설치가 안 되면.txt” at the root of the zip.',
      'inst.blkhashh': 'Check that the file is the original (optional)',
      'inst.blkhash': 'Open PowerShell in the folder that holds the zip and run the command below. If the value it prints matches the one under it, the file is identical.',
      'inst.blksach': 'If Smart App Control is on during installation (from 2.0.1)',
      'inst.blksac': 'The installer’s readiness check warns in advance: “Smart App Control is on”. Installation usually still completes, but the bundled Python tools may be blocked and setup can stall at the venv (Python environment) stage. If so, turn it off as in ② above and press “Retry”.',
      'inst.s2h': '③ Readiness check', 'inst.s2': 'Windows version, free space on drive C and internet access are checked automatically. IRIS always installs to <code>C:\\IRIS</code> and never asks for a location — if it already exists, the installer switches to update mode and never overwrites your files. Anything missing is named, with what to do.',
      'inst.s3h': '④ Two questions', 'inst.s3': 'Shows the subscriptions you have: Claude, ChatGPT, or both (with both, Claude Code leads the first setup). Next, choose how to lay out your work folder — pick one of the ready-made layouts; English names can be left blank. Finally a summary with a folder tree is shown, and pressing “Start install” moves on.',
      'inst.s4h': '⑤ Installing', 'inst.s4': 'Bundled runtime and the IRIS window are unpacked, Claude Code is fetched from npm. A progress bar shows the current step; if something fails, an error code and log path are shown right there. “Retry” resumes from that step without deleting files already created. About 1 GB, a few minutes.',
      'inst.s5h': '⑥ Login', 'inst.s5': 'The browser opens the login page of the subscription(s) you chose. With both, Claude then ChatGPT open once each. It is safe to press it again if a login window is slow or does not appear.',
      'inst.s6h': '⑦ Done', 'inst.s6': 'After a summary of what was installed, press “Open IRIS” — the IRIS window opens and the assistant sends the first greeting on its own. The module drawer opens with a one-time messenger login note; skipping it is fine, it can be done later from settings.',
      'inst.updh': 'Updating',
      'inst.upd': 'Once installed, new versions show up under Settings → Update in the IRIS window. When one is available, press the “Update” button at the top of that section — after the download and its checks finish, a confirmation card appears. Confirm it and every open session ends, the new version is applied, and the window reopens with those sessions resumed automatically.',
      'inst.upd1x': 'Coming from 1.x: 2.0 changes how installation works, so it installs fresh. Your existing data is left untouched — just run the installer. Instead of the “Update” button above, download the new zip from the home page and follow the steps (①–⑦) on this page.',
      'inst.stuckh': 'If you get stuck',
      'inst.sach': 'If installation does not go through — the detailed fix when “Unblock” was skipped',
      'inst.sacnote': 'For the step-by-step order, start with <a href="#blocked">“When Windows blocks it because the file is unsigned”</a> above. What follows is the same text as “설치가 안 되면.txt” inside the zip.',
      'inst.sacbody': '<p>Double-clicking <code>IRIS-설치.cmd</code> (IRIS-Setup.cmd) does nothing, or a window says something like “This app was blocked for your protection.” The cause is Windows Smart App Control: it marks files downloaded from the internet, and when it is on, it blocks a marked executable with no “Run anyway” button at all. Nothing is wrong with your PC or with IRIS — either fix below is enough.</p>'
        + '<h4>[Method A] Unblock, then extract again (recommended)</h4>'
        + '<ol><li>Right-click the downloaded zip file.</li>'
        + '<li>Click “Properties” at the bottom.</li>'
        + '<li>Near the bottom of the window, next to “Security: This file came from another computer...”, tick the “Unblock” box. (If you do not see this text, it is already unblocked — go to Method B.)</li>'
        + '<li>Click “OK”.</li>'
        + '<li>Delete the folder you extracted earlier, then extract the zip again.</li>'
        + '<li>Double-click <code>IRIS-설치.cmd</code> again.</li></ol>'
        + '<h4>[Method B] Run it from Explorer’s address bar</h4>'
        + '<ol><li>Open the extracted folder in Explorer.</li>'
        + '<li>Click the address bar at the top once — the path text turns blue and gets selected.</li>'
        + '<li>Type the line below in its place and press Enter.<br><code>cmd /c IRIS-설치.cmd</code></li>'
        + '<li>A black console window appears and installation starts.</li></ol>'
        + '<p>Files the installer creates itself do not carry this mark, so once you get past this once, it will not happen again from the next step onward.</p>'
        + '<h4>If it still does not work</h4>'
        + '<ul><li>An install log is kept at the path below. Paste it into Explorer’s address bar to open the folder.<br><code>%LOCALAPPDATA%\\IRIS-Installer\\bootstrap.log</code></li>'
        + '<li>A version of this guide with screenshots is on the home page.<br><a href="https://iris-workspace.com/install.html#sac">https://iris-workspace.com/install.html#sac</a></li>'
        + '<li>When you ask for help, attach the log file above — it tells us right away where things stopped.</li></ul>',
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
  const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`; // 십진 MB(383,132,591 B → 383.1 MB). 정확한 바이트 수는 따로 보인다
  function paint(r) {
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.textContent = v; };
    set('chip-ver', r.version); set('chip-size', mb(r.bytes)); set('dl-ver', r.version); set('dl-size', mb(r.bytes)); set('dl-date', r.date); set('foot-ver', r.version);
    if (r.bytes) set('dl-bytes', `${Number(r.bytes).toLocaleString('en-US')} bytes`); // 정확한 바이트 수 — 내려받기가 중간에 끊긴 파일을 사용자가 속성 창에서 바로 알아보게
    // 내려받기 단추 = 미러(Cloudflare) 우선(2026-09-15). GitHub 첨부 서버가 막힌 네트워크가 실재하고, 브라우저 쪽 자동 감지(no-cors 탐침)는
    // 막힘 방식(재설정/지연)에 따라 놓칠 수 있어 사용자가 두 번 헛걸음했다. 미러에 있는 판이면 무조건 미러, 아니면(막 나온 판·미러 한도 초과 판) GitHub 첨부.
    const mirror = mirrorFor(r.asset);
    const primary = mirror || r.url;
    for (const id of ['dock-dl', 'dl-btn']) { const a = document.getElementById(id); if (a) a.href = primary; }
    const gh = document.getElementById('dl-github'); if (gh) gh.href = r.url;
    const rp = document.getElementById('dl-relpage'); if (rp && r.page) rp.href = r.page;
    // "어디서 받나" 한 줄은 두 벌(미러/GitHub) 중 실제 단추가 가리키는 쪽만 보인다
    const viaM = document.getElementById('dl-via-mirror'), viaG = document.getElementById('dl-via-github');
    if (viaM) viaM.hidden = !mirror; if (viaG) viaG.hidden = !!mirror;
    for (const id of ['dl-hashcmd', 'inst-hashcmd']) { const cmd = document.getElementById(id); if (cmd) cmd.textContent = `Get-FileHash .\\${r.asset} -Algorithm SHA256`; }
    if (r.shaUrl) { const l = document.getElementById('dl-shalink'); if (l) l.href = r.shaUrl; }
    for (const id of ['dl-sha', 'inst-sha']) { const s = document.getElementById(id); if (s) { if (r.sha) { s.textContent = r.sha; s.hidden = false; } else if (id === 'dl-sha') s.hidden = true; } }
  }
  const mirrorFor = (asset) => (CONFIG.mirror && asset && CONFIG.mirror.assets.includes(asset)) ? `${CONFIG.mirror.base}/${asset}` : null;

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

  paint(CONFIG.fallback.installer); // 어느 쪽이든 아는 판으로 먼저 그린다(설치 안내의 해시 명령·값 포함) — 없는 요소는 건너뜀
  const onIndex = !!document.getElementById('dl-btn');
  if (onIndex) {
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
            paint({ version, bytes: zip.size, date: compData.installer.date, asset: zip.name, url: zip.browser_download_url, page: rel.html_url, shaUrl: shaAsset?.browser_download_url,
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
