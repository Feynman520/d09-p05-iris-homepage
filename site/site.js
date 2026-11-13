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
      face: { version: 'v2.102.0' },
      messenger: { version: 'v0.4.3' },
      installer: { version: 'v2.0.59', bytes: 593563124, date: '2026-11-11', asset: 'IRIS-Setup_v2.0.59_2026-11-10.zip',
        url: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/download/iris-installer--v2.0.59/IRIS-Setup_v2.0.59_2026-11-10.zip', // 첨부 직접 주소(단추를 누르면 바로 내려받기)
        page: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/tag/iris-installer--v2.0.59', // 릴리스 노트 쪽
        sha: 'b115b0368d0097e94b3bfd045bb24b40470d8bcd70a3ba365afc0bb043b1dc15' }, // 릴리스 첨부 .sha256 은 CORS 가 막혀 브라우저가 못 읽는다 → 아는 판의 값만 여기 둔다
    },
    // 최신판(2026-11-09 두 갈래 배포, P03 docs\설계-배포채널-2026-11-09.md): 위 fallback = 안정판, 여기 = 사전 공개(prerelease)로 낸 최신판.
    // 릴리스 도구(iris-release.mjs)가 최신판을 낼 때 채우고, promote 로 안정판에 올리면 비운다(null). GitHub API 로 찾지 않는다 —
    // 학교망 공유 IP 의 익명 호출 한도를 더 쓰지 않고, 사람이 시험 단계로 고른 판만 보이게(코덱스 검토 10).
    // installer 가 null 이거나 판이 안정판보다 높지 않으면 최신판 상자는 숨는다.
    preview: {
      installer: { version: 'v2.0.63', bytes: 593759138, date: '2026-11-13', asset: 'IRIS-Setup_v2.0.63_2026-11-13.zip',
        url: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/download/iris-installer--v2.0.63/IRIS-Setup_v2.0.63_2026-11-13.zip',
        page: 'https://github.com/Feynman520/d09-p03-iris-installer/releases/tag/iris-installer--v2.0.63',
        sha: 'd96f39cad00428a19722d7aae64955ac0de443caf5d12121c25f5008da7246fb' },
      face: { version: 'v2.105.0' },
    },
    // 미러(2026-09-14): 일부 네트워크(학교·회사)가 GitHub 릴리스 첨부 서버(release-assets.githubusercontent.com)만 끊는다(실측: github.com 은 열리고 첨부만 연결 재설정).
    // 같은 파일을 Cloudflare R2 에도 둔다(릴리스 도구가 올림). assets = 미러에 있는 첨부 이름 목록 — 여기 있는 판만 미러 링크를 보인다.
    // 2026-09-17: 300MB 한도는 S3 멀티파트(P03 build/mirror-upload.mjs)로 넘겼다. 새 판을 낼 때마다 zip+.sha256 을 R2 에 올리고 여기 이름을 더한다 —
    // 여기 있는 판은 내려받기 단추가 **미러를 1순위**로 가리킨다(GitHub 첨부 서버가 막힌 학교·회사 망 실측 4회).
    // 2026-11-09: base 를 r2.dev → 같은 버킷의 빠른 창구 iris-workspace-dl.pages.dev(P03 mirror-worker)로 바꿨다 — 학교 유선 실측
    // r2.dev 초당 60~80KB(미국 LA, 556MB 에 2시간+) / pages.dev 초당 30~43MB(서울, 약 15초). r2.dev 는 옛 IRIS 창용으로 살아 있다.
    mirror: { base: 'https://iris-workspace-dl.pages.dev', assets: ['IRIS-Setup_v2.0.19_2026-09-18.zip', 'IRIS-Setup_v2.0.20_2026-09-18.zip', 'IRIS-Setup_v2.0.21_2026-09-19.zip', 'IRIS-Setup_v2.0.22_2026-09-19.zip', 'IRIS-Setup_v2.0.23_2026-09-19.zip', 'IRIS-Setup_v2.0.24_2026-09-19.zip', 'IRIS-Setup_v2.0.25_2026-09-19.zip', 'IRIS-Setup_v2.0.26_2026-09-19.zip', 'IRIS-Setup_v2.0.27_2026-09-19.zip', 'IRIS-Setup_v2.0.28_2026-09-20.zip', 'IRIS-Setup_v2.0.29_2026-09-20.zip', 'IRIS-Setup_v2.0.30_2026-09-20.zip', 'IRIS-Setup_v2.0.31_2026-09-20.zip', 'IRIS-Setup_v2.0.32_2026-09-20.zip', 'IRIS-Setup_v2.0.33_2026-09-21.zip', 'IRIS-Setup_v2.0.34_2026-09-21.zip', 'IRIS-Setup_v2.0.35_2026-09-21.zip', 'IRIS-Setup_v2.0.36_2026-09-23.zip', 'IRIS-Setup_v2.0.37_2026-09-23.zip', 'IRIS-Setup_v2.0.38_2026-09-23.zip', 'IRIS-Setup_v2.0.39_2026-09-28.zip', 'IRIS-Setup_v2.0.40_2026-10-02.zip', 'IRIS-Setup_v2.0.41_2026-10-03.zip', 'IRIS-Setup_v2.0.42_2026-10-12.zip', 'IRIS-Setup_v2.0.43_2026-10-12.zip', 'IRIS-Setup_v2.0.44_2026-10-16.zip', 'IRIS-Setup_v2.0.45_2026-10-16.zip', 'IRIS-Setup_v2.0.46_2026-10-21.zip', 'IRIS-Setup_v2.0.47_2026-10-22.zip', 'IRIS-Setup_v2.0.48_2026-10-23.zip', 'IRIS-Setup_v2.0.49_2026-10-27.zip', 'IRIS-Setup_v2.0.50_2026-10-27.zip', 'IRIS-Setup_v2.0.51_2026-10-28.zip', 'IRIS-Setup_v2.0.52_2026-10-28.zip', 'IRIS-Setup_v2.0.53_2026-11-02.zip', 'IRIS-Setup_v2.0.54_2026-11-04.zip', 'IRIS-Setup_v2.0.55_2026-11-09.zip', 'IRIS-Setup_v2.0.56_2026-11-09.zip', 'IRIS-Setup_v2.0.57_2026-11-09.zip', 'IRIS-Setup_v2.0.58_2026-11-10.zip', 'IRIS-Setup_v2.0.59_2026-11-10.zip', 'IRIS-Setup_v2.0.60_2026-11-11.zip', 'IRIS-Setup_v2.0.61_2026-11-11.zip', 'IRIS-Setup_v2.0.62_2026-11-12.zip', 'IRIS-Setup_v2.0.63_2026-11-13.zip'] },
  };

  // ---- ② 언어 ----
  const I18N = {
    en: {
      'title': 'IRIS — an AI assistant workspace inside your PC',
      'desc': 'IRIS installs a folder system, rules and AI agents (Claude Code · Codex) as one box on your Windows PC. Free, open source, one zip, double-click.',
      'nav.what': 'About', 'nav.how': 'How it works', 'nav.install': 'Install guide', 'nav.download': 'Download',
      'nav.cmp': 'Compare', 'nav.fb': 'Feedback',
      // 의견 보내기(/feedback, 2026-11-13) — 입력 안내·오류 문구는 feedback.js 가 따로 고른다
      'fb.title': 'IRIS — Send feedback', 'fb.h': 'Send feedback', 'fb.sub': 'No sign-in needed. Only the developer reads it.',
      'fb.k0': 'Something broke', 'fb.k1': 'Could be better', 'fb.k2': 'Feature idea', 'fb.k3': 'Anything else',
      'fb.k1s': 'Better', 'fb.k2s': 'Idea', 'fb.k3s': 'Other',
      'fb.where': 'Where', 'fb.w0': 'Choose', 'fb.w1': 'Installing', 'fb.w2': 'IRIS window', 'fb.w3': 'Messenger', 'fb.w4': 'This website', 'fb.w5': 'Not sure',
      'fb.body': 'Message', 'fb.help': 'The first line becomes the title.',
      'fb.tip': '<b>Stuck while installing?</b> The installer’s “Report to the developer” button is faster. If you already closed it, write here.',
      'fb.info': 'Sent along', 'fb.mail': 'Email for a reply · optional',
      'fb.privacy': 'No screenshots or files. Your email is used only to reply. Please don’t put names or contact details in the message. <a href="/privacy#feedback">Privacy</a>',
      'fb.send': 'Send', 'fb.gh': 'Prefer it public? There’s also the <a href="https://github.com/Feynman520/d09-p03-iris-installer/issues" rel="noopener">GitHub board</a> — anyone can read it.',
      'fb.done': 'Feedback sent.', 'fb.rc': 'Receipt', 'fb.copy': 'Copy', 'fb.replyNote': 'If a reply is needed, we’ll write to the email you left.', 'fb.again': 'Send another',
      'hero.motto': 'Agents solve. We define.',
      'chip.free': 'Free · MIT',
      'dock.title': 'Download IRIS',
      // IRIS란
      'what.h': 'What IRIS is',
      'what.define': 'IRIS is an <b>AI agent workspace</b>: it sets up the place, the rules and the tools for your work on your PC, so AI agents know your work and get it done.',
      'what.lead': 'To hand work to an AI assistant, you need an office: desks for the work (folders), a manual for how it is done (rule files), office tools (document tools), and a control room that shows every job at once (the IRIS window). IRIS sets up that office in one folder, C:\\IRIS, and Claude Code and Codex work inside it.',
      'what.1h': 'Folder system', 'what.1p': 'Places are laid out as role → domain → project → step. The assistant knows what the work is from the folder it is in.',
      'what.2h': 'Rule files', 'what.2p': 'The AGENTS.md in each folder is the rule for that place. Rules from the folders above carry down on their own.',
      'what.3h': 'Agents and the window', 'what.3p': 'Claude Code and Codex are the hands that do the work. The IRIS window steers several of their sessions from one screen.',
      // 그림 A1 직업별 폴더 나무(폴더 이름 자체는 실제 이름이라 번역하지 않는다)
      'jt.h': 'Folders shaped to your work, ready from day one',
      'jt.lead': 'Pick your job during installation and IRIS creates role (R) → domain (D) → project (P) folders, each with its own rule file. You can rename them any time.',
      'jt.j0': 'Teacher', 'jt.j1': 'Researcher', 'jt.j2': 'Business owner', 'jt.j3': 'Developer', 'jt.j4': 'Office worker', 'jt.j5': 'Student', 'jt.j6': 'Writer',
      'jt.cap': 'folders, each with an AGENTS.md',
      'jt.sm': 'Step (S) folders are made with your assistant as the project moves along. Choose “Start from scratch” to begin with an empty tree.',
      // 비교표
      'cmp.h': 'Terminal, desktop app, and IRIS',
      'cmp.lead': 'The same Claude Code works differently depending on where you use it. Only IRIS also installs the place your work lives in, and its rules.',
      'cmp.c1': 'Terminal', 'cmp.c2': 'Claude Code desktop app',
      'cmp.r1': 'First setup', 'cmp.r1a': 'Install Node, Git, Python and the CLI one by one', 'cmp.r1b': 'One app install; document tools separately', 'cmp.r1c': '<b>One zip, one double-click</b><small>Runtime, agents and document tools in one folder, <code>C:\\IRIS</code></small>',
      'cmp.r2': 'Where work lives', 'cmp.r2a': 'Up to you', 'cmp.r2b': 'You pick a project folder', 'cmp.r2c': '<b>Role → domain → project → step folders, ready-made</b><small>7 presets by occupation</small>',
      'cmp.r3': 'Rule files', 'cmp.r3a': 'Write and manage yourself', 'cmp.r3b': 'Write yourself', 'cmp.r3c': '<b>AGENTS.md in every folder, parent rules inherited</b><small>Whichever folder you open, it knows the rules of that place</small>',
      'cmp.r12': 'Map of your work', 'cmp.r12a': 'None', 'cmp.r12c': '<b>Folders and rules read into a map (ontology) automatically</b><small>Ask “where is that job?” and the assistant goes straight there</small>',
      'cmp.r13': 'Rules that learn', 'cmp.r13a': 'Write them down yourself', 'cmp.r13c': '<b>Repeated corrections become rules automatically</b><small>Correct the same mistake twice and it keeps the rule from then on</small>',
      'cmp.r4': 'Agents', 'cmp.r4a': 'One at a time', 'cmp.r4b': 'Claude only', 'cmp.r4c': '<b>Claude Code + Codex</b><small>Hand the conversation context between the two</small>',
      'cmp.r5': 'Screen', 'cmp.r5a': 'A black window of scrolling text', 'cmp.r5b': 'A clean chat window', 'cmp.r5c': '<b>Chat window + session cards</b><small>Closing the window keeps sessions alive</small>',
      'cmp.r11': 'Several jobs at once', 'cmp.r11a': 'Switch between windows yourself', 'cmp.r11b': 'Several sessions can be open', 'cmp.r11c': '<b>Steer several sessions from one screen</b><small>A note when one finishes, a card when one asks permission</small>',
      'cmp.r6': 'Document work', 'cmp.r6a': 'Find and install MCPs yourself', 'cmp.r6b': 'Separate install', 'cmp.r6c': '<b>Hangul, Excel, PowerPoint, Word and PDF tools bundled</b><small>Parked without Hancom or Office, on once installed</small>',
      'cmp.r7': 'Without internet', 'cmp.r7a': 'Hard to install', 'cmp.r7b': 'Cannot install', 'cmp.r7c': '<b>Folders, rules and tools install offline</b><small>Only login and downloads are left as remaining work</small>',
      'cmp.r8': 'Undo', 'cmp.r8b': 'Settings are scattered', 'cmp.r8c': '<b>Delete one folder and it is gone</b><small>Everything inside <code>C:\\IRIS</code>, with an install receipt</small>',
      'cmp.r9': 'Cost', 'cmp.r9a': 'Subscription only', 'cmp.r9c': '<b>Subscription only; IRIS is free (MIT)</b>',
      'cmp.r10': 'Limits', 'cmp.r10a': 'Lightest and most flexible', 'cmp.r10b': 'Simplest', 'cmp.r10c': 'Windows 64-bit only', 'cmp.r10s': 'Unsigned, so one Windows warning on first run',
      // 기능
      'feat.h': 'Features',
      'feat.1b': 'Many sessions, one window', 'feat.1s': 'Move between sessions in the task list on the left. Each session remembers its own folder, agent and model.',
      'feat.2b': 'The same choices as the terminal', 'feat.2s': 'Agent, model, thinking depth and permission mode are passed only as CLI start options. Config files stay untouched.',
      'feat.3b': 'Previews inside the conversation', 'feat.3s': 'Images, HTML, PDF and local addresses open right in the conversation. Hangul and Office documents are converted to PDF in place.',
      'feat.4b': 'Helper tasks are visible', 'feat.4s': 'Helper tasks the agent starts appear as chips; click one to read its log, read-only.',
      'feat.5b': 'Done notes and approval cards', 'feat.5s': 'A small note when a request finishes, and a card with the choices when the agent asks for permission. Voice input is processed only on your PC.',
      // 그림 B5 IRIS 창 설명
      'ws.1b': 'Task list', 'ws.1d': 'Move between sessions. Each one remembers its own folder, agent and model.',
      'ws.2b': 'Usage left', 'ws.2d': 'Shows how much of each Claude and Codex account is left, as a battery.',
      'ws.3b': 'Settings', 'ws.3d': 'Updates and extension modules live here.',
      'ws.4b': 'Folder', 'ws.4d': 'Pick the folder to work in, and the agent reads the rules of that place.',
      'ws.5b': 'Agent', 'ws.5d': 'Choose between Claude Code and Codex.',
      'ws.6b': 'Model and thinking depth', 'ws.6d': 'The same choices as the terminal, passed only as start options.',
      'ws.7b': 'Request box', 'ws.7d': 'Ask with text, voice, photos or files. Voice is processed only on your PC.',
      'feat.6b': 'Extension modules', 'feat.6s': 'Pick official modules in settings and install them. The first is IRIS Messenger, for sending text and files between people with end-to-end encryption.',
      // 내려받기
      'dl.h': 'Download', 'dl.btn': 'Download IRIS', 'dl.all': 'All releases',
      // 그림 B1 설치 흐름 띠
      'fl.1b': 'Download', 'fl.1p': 'One zip file',
      'fl.2b': 'Unblock', 'fl.2p': 'Before extracting: Properties → “Unblock”',
      'fl.3b': 'Double-click',
      'fl.4b': 'Follow the installer', 'fl.4p': 'You decide two things: subscription and work folders',
      'fl.5b': 'Log in and start', 'fl.5p': 'One account login → the IRIS window',
      'fl.net': 'Internet', 'fl.off': 'This part works offline',
      'fl.you': 'Steps you do by hand', 'fl.rest': 'The installer does the rest',
      'dl.reqh': 'What you need',
      'dl.req1': 'Windows 10 (1809) or later, 64-bit', 'dl.req2': 'At least 3 GB free on drive C',
      'dl.req3': 'Internet — used only in the final “Connect accounts” step. Every step before it works offline.',
      'dl.req4': 'A paid Claude or ChatGPT subscription — the agents work under that account',
      'dl.stepsh': 'Install in three steps',
      'dl.step1': 'After downloading the zip, <strong>before extracting</strong>, right-click it → Properties → tick “Unblock” at the bottom → OK. Then extract it.',
      'dl.step2': 'Double-click <code>IRIS-설치.cmd</code> in the extracted folder. A blue warning window or a “Smart App Control” block appears because the file is not code-signed yet — follow “When Windows blocks it” in the <a href="/install?lang=en#blocked">install guide</a>.',
      'dl.step3': 'Follow the installer that opens in your browser (eight screens). You decide two things — subscription and work folders — and the only thing you do by hand is log in to your account.',
      'dl.twoh': 'One install, two ways to use it',
      'dl.two1': '<b>Use everything right away</b> — when installation finishes, continue straight into login.',
      'dl.two2': '<b>Window, folders and dashboard first</b> — skip the login and try the IRIS window first. Finish the rest any time with “Continue setup” in the IRIS window.',
      'dl.note': 'If the zip will not extract, compare the size in its Properties window with the byte count under “Details” above. A different number means the download was cut off — just download it again.',
      'dl.update': 'Already installed? Settings → Update in the IRIS window brings everything up to date in one step. Running a new zip also shows “Start update”, and your files, settings and logins stay as they are. Only moving from 1.x to 2.0 needs a fresh install (existing files are kept).',
      'dl.more': 'The <a href="/install?lang=en">install guide</a> explains each screen and what to do if you get stuck.',
      'dl.bytes': 'exact size',
      'dl.via': 'The download button serves the file from Cloudflare.', 'dl.github': 'Download directly from GitHub',
      'dl.viagh': 'The download button serves the file from the GitHub release attachment.', 'dl.relpage': 'Release notes for this version',
      'dl.stable': 'Stable · recommended', 'dl.prebtn': 'Download the latest build', 'dl.pretag': 'Latest · in testing',
      'dl.prenote': 'An early build with the newest changes. The “Update” button inside IRIS does not install it; it becomes the stable build after testing. If something goes wrong, uninstall IRIS (“Keep my work”) and install the stable build fresh.',
      'dl.prenone': 'No preview build is being tested right now — the stable build is the newest.',
      // 보이지 않는 곳에서 하는 일(N° 05)
      'hood.h': 'A workspace that fits your work more the more you use it',
      'hood.lead': 'Five things work behind the IRIS window. It maps your work, learns from your corrections, handles documents directly, carries on across your several accounts, and keeps your conversations on your PC.',
      'hood.1h': 'Map of your work',
      'hood.1p': 'IRIS reads the header of the rule file in every folder and builds a map (ontology) of what lives where and what connects to what. When you add or move a folder, the map is redrawn. The assistant asks this map things like “where is last term’s assessment plan?” or “what is the original of this form?” and goes straight there.',
      'hood.m1': 'Teacher', 'hood.m2': 'Classes', 'hood.m3': 'Admin', 'hood.m4': 'Physics, term 1', 'hood.m5': 'Physics, term 2', 'hood.m6': 'Grading form', 'hood.m7': 'this form is the original',
      'hood.mr': 'role', 'hood.md': 'domain', 'hood.mp': 'project',
      'hood.2h': 'Rules that learn',
      'hood.2p': 'When you correct a result or say “from now on, do it this way”, IRIS records the lesson. When the same lesson comes back, it writes one line into the rule file of the folder where it belongs, and keeps it from the next session on. If you do not like it, just say “drop that rule”.',
      'hood.l1b': 'You correct', 'hood.l1d': '“Put the table in the body, not at the end”',
      'hood.l2b': 'Lesson recorded', 'hood.l2d': 'Written down in one sentence',
      'hood.l3b': 'Corrected again', 'hood.l3d': 'The same lesson comes back',
      'hood.l4b': 'It becomes a rule', 'hood.l4d': 'One line in the rule file, kept from then on',
      'hood.lcap': 'Records and rules stay only in the IRIS folder on your PC.',
      'hood.3h': 'Hands for documents',
      'hood.3p': 'The assistant opens Hangul, Excel, PowerPoint, Word and PDF files itself, fills in the blanks and turns them into PDF. On a PC without Hancom or Office it waits and switches on once they are installed.',
      'hood.4h': 'Several accounts of yours, one window',
      'hood.4p': 'Connect several of your Claude or ChatGPT subscription accounts and keep working from one window. When one account reaches its limit, work moves to the next, and each account’s remaining usage shows as a battery.',
      'hood.5h': 'Your conversations stay on your PC',
      'hood.5p': 'Conversations you have in IRIS are stored only on this PC. They do not appear in the conversation lists of the Claude or ChatGPT web and apps, and IRIS sends nothing out.',
      // 안에 든 것
      'in.h': 'What is inside',
      'in.lead': 'Everything goes into one folder, C:\\IRIS. The only thing outside it is an “IRIS” shortcut on the desktop, and deleting that folder removes it all.',
      'in.th1': 'Part', 'in.th2': 'What it does',
      'in.r1': 'The base the agents and the window run on. Bundled, so nothing else is installed.',
      'in.r2': 'The agents that do the work. Codex is bundled; Claude Code is downloaded in the “Connect accounts” step. Both log in with your own subscription.',
      'in.r3t': 'Account relay and usage screen', 'in.r3': 'A small server that lets several subscription accounts be used from one window, and a per-account usage screen (the battery in the IRIS window header). Both work only inside your PC.',
      'in.r4t': 'IRIS window', 'in.r4': 'The desktop app that steers several sessions from one window. The first extension module, Messenger, comes with it.',
      'in.r6t': 'Document automation tools', 'in.r6': 'Tool servers for Hangul, Excel, PowerPoint, Word and PDF. On a PC without Hancom or Office they wait as “parked” and switch on once installed.',
      'in.r5t': 'Rule files and the handoff note', 'in.r5': 'The installer finishes the work folders, rules and tool setup and leaves a handoff note. On first run the assistant reads it and starts with a greeting.',
      'in.r7t': 'Ontology tools', 'in.r7': 'Read your folders and rule files to build the map of your work, and let the assistant ask that map about locations, originals and links. The map can also be viewed as a single page.',
      'in.r8t': 'Self-improvement tool', 'in.r8': 'Records the mistakes you corrected and your “from now on” as lessons, and writes them into rule files when they repeat. Records stay on your PC.',
      'in.lic': 'All source is published under the MIT license. Licenses of bundled parts are listed in <code>payload/licenses/NOTICES.md</code> inside the zip.',
      // 구성 요소와 새 소식
      'comp.h': 'Components and news',
      'comp.lead': 'The current version of each part is read fresh from GitHub on every visit. Below is the road IRIS has taken so far, newest first.',
      'comp.now': 'Now',
      'comp.face': 'IRIS window', 'comp.messenger': 'Messenger', 'comp.installer': 'Installer package',
      'comp.none': 'No release notes yet.', 'comp.nover': 'No release yet',
      'comp.cur': 'Current stable',
      'comp.t1v': 'Stable 2.0.59 · window 2.102.0', 'comp.t1h': 'A new tools screen',
      'comp.hotfix': 'Tools are split into Skill, MCP and Plugin, and hand-picked tools install or uninstall with one button. The model name you pick always matches the model actually used, and a Claude and a Codex account with the same email can both be added.',
      'comp.t2v': '2.0.55 · window 2.99.0', 'comp.t2h': 'First stable — two release channels',
      'comp.t2p': 'New versions are tried first as the latest build; only checked ones become stable. Fixed Claude\'s first-run prompts blocking the chat on a new PC.',
      'comp.t3h': 'Login keys: warned before they expire',
      'comp.t3p': 'Each key shows its expiry date and days left, warns three days ahead, and renews with one button.',
      'comp.t4h': 'MCP relay',
      'comp.t4p': 'A session first gets only the tool list; a real MCP starts for that session when its tool is first used. Only what you use runs, so memory is saved.',
      'comp.t5v': '2.0.46 · window 2.92.1', 'comp.t5h': 'First-run tutorial',
      'comp.t5p': 'A new PC starts by making your own folders, and the map of your work appears as role characters and a folder tree.',
      'comp.t6h': 'Agents keep themselves up to date',
      'comp.t6p': 'Claude Code and Codex update themselves to the newest version.',
      'comp.t7v': 'Messenger 0.1', 'comp.t7h': 'First module: IRIS Messenger',
      'comp.t7p': 'People exchange messages and files with end-to-end encryption, right inside the IRIS window.',
      'comp.t8h': 'One zip installs everything',
      'comp.t8p': 'Double-click one zip on a fresh Windows PC with nothing installed, and the whole IRIS system installs to the end.',
      'comp.all': 'All versions and change notes (GitHub)',
      // 자주 묻는 질문
      'faq.h': 'Questions',
      'faq.1q': 'Do I need a paid subscription?', 'faq.1a': 'Yes. IRIS does not make an AI of its own; it runs Claude Code and Codex with the Claude or ChatGPT subscription you already have. IRIS itself is free.',
      'faq.2q': 'Where do my files and conversations go?', 'faq.2a': 'They stay on your PC. The IRIS window, relay and installer send nothing out of it. What an agent exchanges with its AI company follows that agent’s own policy.',
      'faq.3q': 'How do I uninstall?', 'faq.3a': 'Delete the C:\\IRIS folder and the desktop shortcut. Nothing is written to the registry or system folders.',
      'faq.4q': 'Does it run on macOS or Linux?', 'faq.4a': 'Only Windows 10/11 64-bit for now. Other systems are planned, without a date.',
      'faq.5q': 'Will it conflict with an existing Claude Code install?', 'faq.5a': 'No. IRIS uses its own copy inside its folder and leaves existing installs and settings alone.',
      'faq.6q': 'A new version came out — do I reinstall?', 'faq.6a': 'No. Settings → Update in the IRIS window brings everything up to date in one step, and running a new zip also shows “Start update”. Either way your files, settings and logins stay. Only moving from 1.x to 2.0 needs a fresh install (existing files are kept).',
      'faq.7q': 'Is a ChatGPT subscription alone enough?', 'faq.7a': 'Yes. Pick only ChatGPT in the installer and Codex takes the lead. Claude Code is installed too, so the IRIS window shows both Claude and Codex buttons from the start; if you get a Claude subscription later, just add the account in the usage screen.',
      'faq.8q': 'I have several subscription accounts — how do I use them?', 'faq.8a': 'Add your accounts in the usage screen (the battery) in the IRIS window header. You can mix Claude and ChatGPT accounts; when one reaches its limit, work carries on with the next. Each account’s remaining usage is shown separately.',
      'foot.card': 'Digital card', 'foot.installer': 'Installer', 'foot.face': 'IRIS window', 'foot.messenger': 'Messenger', 'foot.privacy': 'Privacy',
      // 설치 안내 쪽
      'inst.title': 'IRIS — Install guide', 'crumb.home': 'IRIS', 'inst.h': 'Install guide',
      'inst.lead': 'What each of the installer’s eight screens does, in order, and what to do when something stops. You decide only three things: subscription, work folders and login.',
      'inst.s0h': 'Get it — download and extract', 'inst.s0': 'Download the zip from the home page. <strong>Before extracting</strong>, right-click it → Properties → tick “Unblock” at the bottom → OK (this removes the mark Windows puts on files from the internet; skip it and Smart App Control on Windows 11 blocks the next step — if it does, see <a href="#blocked">When Windows blocks it</a> just below). Then extract it anywhere.',
      'inst.s1h': 'Run it — double-click the IRIS-설치.cmd file', 'inst.s1': 'In the extracted folder, double-click the <code>IRIS-설치.cmd</code> file with the mouse — there is nothing to type in a command window (the .cmd at the end is just the file type). A console window flashes briefly and the installer screen opens in your browser (127.0.0.1:3460). From here almost everything runs on its own — the only manual part left is deciding your subscription and work folders.',
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
      'inst.scrh': 'The installer’s eight screens',
      'inst.scr': 'The screens go from ① to ⑧ in order, and the progress bar at the top shows which one you are on. You decide only three things — ③ subscription, ④ work folders and ⑦ login — and the installer does the rest. The internet is used only in ⑦.',
      'inst.s2h': '① Readiness check', 'inst.s2': 'Windows version, a 64-bit CPU, free space on drive C (3 GB), PowerShell, ports and the integrity of the downloaded files are checked automatically. Nothing is changed — it only reads, and usually takes about ten seconds. Anything that blocks the install is named with what to do; things that may matter later, such as internet access or Smart App Control, are only listed as “good to know”.',
      'inst.s3h': '② Install location', 'inst.s3': 'IRIS always installs to <code>C:\\IRIS</code> and never asks for a location — it only checks that the spot can be used, then you press “Next”. On a PC that already has IRIS, an “Update to the new version” screen appears here instead; “Start update” swaps only the changed parts and keeps your files, settings and logins.',
      'inst.s4h': '③ Subscription', 'inst.s4': 'Tick every paid subscription you have: Claude, ChatGPT, or both. With both, Claude Code leads and both are used afterwards. With ChatGPT only, Codex leads. Both assistants are installed whatever you pick, so adding the other subscription’s account later connects it right away.',
      'inst.s5h': '④ Work folders', 'inst.s5': 'Sets up the rooms your work will live in (role → domain → project folders). Press one of the seven presets — teacher, researcher, business owner, developer, office worker, student, writer — and the folder tree that will be created appears on the right; rename entries or add more as you like. English names can be left blank. If it is hard to decide now, “Decide later with the assistant” moves on.',
      'inst.s6h': '⑤ Confirm', 'inst.s6': 'A summary of the chosen subscription and the folder tree to be created. This is everything a person decides; press “Start install” and the installer continues on its own from here.',
      'inst.s7h': '⑥ Installing', 'inst.s7': 'Nine jobs run in order without the internet — unpacking the bundled programs, environment variables, the workspace skeleton, work folders, the Python environment, agent hookups, relay preparation, catalog cards and checks. The progress bar shows the current job; if something fails, an error code and log path are shown right there. “Retry” resumes from that job without deleting files already created. A few minutes.',
      'inst.s8h': '⑦ Connect accounts', 'inst.s8': 'The internet is used from here. Connectivity is checked first (a blocked address is named and the installer waits — reopen it where the internet works and it continues from here), then Claude Code is fetched (both assistants are installed whatever you picked — if the one you did not pick fails to download, you only get a warning). Next, press “Log in” for each chosen subscription and the browser opens that account’s login page — Claude first, then ChatGPT, if you chose both. It is safe to press it again if a login window is slow or does not appear. Once the logins finish, the account relay starts and the accounts are connected.',
      'inst.s9h': '⑧ Done', 'inst.s9': 'A five-part report: what was attempted, the safety of your existing files, the result, what any remaining items mean, and what to do now (the same text is saved to <code>C:\\IRIS\\_agent\\setup\\설치보고-*.md</code>). Press “Open IRIS” — the IRIS window opens and the assistant reads the handoff note and says hello first. A one-time messenger login card appears; “Open messenger” does it now, “Later” skips it.',
      'inst.updh': 'Updating',
      'inst.upd': 'When a new version comes out there are two ways to update, and both keep your files, settings and logins. <b>①</b> When Settings → Update in the IRIS window shows a new version, press the “Update” button at the top of that section — after the download and its checks finish, a confirmation card appears. Confirm it and every open session ends, the new version is applied, and the window reopens with those sessions resumed automatically. <b>②</b> Or download the new zip from the home page and run it — it recognises the existing install, shows “Update to the new version”, and “Start update” closes the IRIS programs, swaps only the changed parts and reopens the IRIS window. On networks where the window’s update check is blocked from GitHub and never sees the new version, ② is the sure way.',
      'inst.upd1x': 'Coming from 1.x: 2.0 changes how installation works, so it installs fresh. Your existing data is left untouched — just run the installer. Instead of the “Update” button above, download the new zip from the home page and follow the steps on this page (get it, run it, then ①–⑧).',
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
      'inst.k3h': 'Something else failed', 'inst.k3': 'Every screen where the installer can stop (⑥ installing, ⑦ account link, update, done) has a “Report to the developer” button. It sends the failed step, error code, diagnostics and the tail of the logs with your Windows user name masked (since 2.0.20). The log files are <code>C:\\IRIS\\_agent\\setup\\installer.log</code> and <code>%LOCALAPPDATA%\\IRIS-Installer\\server.log</code>. If nothing helps, see <a href="#clean">wipe and reinstall</a> below.',
      'inst.cleanh': 'If nothing else works — wipe and reinstall',
      'inst.clean0': 'The last resort when neither the update nor the steps above work. <strong>A PC that already has 2.0.x usually does not need this</strong> — running a new zip shows an “Start update” button and keeps your files, settings and logins. The steps below are for when even that is stuck, and for coming up from 1.x. <span class="warn">If you created documents inside C:\\IRIS, move them elsewhere first — step ③ deletes the whole folder.</span>',
      'inst.clean1b': '① Restart the PC', 'inst.clean1s': 'Every leftover IRIS window, installer and relay stops. Skip this and the deletion fails with “access denied”, or a new installer opens the old installer’s screen.',
      'inst.clean2b': '② Open PowerShell as administrator', 'inst.clean2s': 'Right-click the Start button → “Terminal (Admin)” or “Windows PowerShell (Admin)”. A blue (or black) window opens.',
      'inst.clean3b': '③ Paste these four lines as a block and press Enter', 'inst.clean3s': 'Deletes the IRIS folder, the installer’s record folder and the desktop shortcut; items that do not exist are skipped quietly. When the last line prints <code>False</code> <code>False</code>, everything is gone. If it prints <code>True</code>, go back to ① (something is still running).',
      'inst.clean4b': '④ (Optional) Only when leaving IRIS for good — clear the environment variables', 'inst.clean4s': 'Not needed if you plan to reinstall (the new installer overwrites them). Paste this only when removing IRIS completely; it clears the four user environment variables the installer registered.',
      'inst.clean5b': '⑤ Download the latest zip from the home page and install from scratch', 'inst.clean5s': 'Exactly the order on this page — get it, run it, then ①~⑧. You log in to your subscription once more. Check that the version shown at the top right of the installer matches the latest on the home page — if not, start again from ① (restart).',
      'inst.rmh': 'Uninstall', 'inst.rm': 'Double-click <code>IRIS-삭제.cmd</code> in the folder where you extracted the zip (since 2.0.39 — a PC installed from an older version can be removed with this file from the latest zip; a PC installed or updated with 2.0.39 or later also has it in <code>C:\\IRIS\\_agent\\setup\\installer\\installer</code>). It stops a running IRIS by itself, shows what it will delete and what it will keep, then deletes. The default “Keep my work” moves the folders and files you made to <code>C:\\IRIS-보관-&lt;date&gt;</code>; “Delete everything” asks once more. It also cleans up the environment variables, PATH, sign-in auto-start and the desktop shortcut, and restores the environment values you had before installing. Cancel subscriptions separately on claude.ai / chatgpt.com. If this file is blocked, follow ①~④ of “wipe and reinstall” above (skip ⑤).',
      // 첫 화면(2026-11-10 입자 군무 판) — 새로 쓰는 열쇠만
      'p.skip': 'Skip to download',
      'p.kicker': 'An AI assistant workspace inside your PC',
      'p.motto1': 'Agents do the solving.', 'p.motto2': 'We do the defining.',
      'p.sub': 'Claude Code and Codex work from a map of your work and its rules.',
      'p.guide': 'Read the install guide',
      'p.more': 'Details',
      'p.hashnote': 'To check that the file matches the original, run this in PowerShell and compare the result with the value above.',
      'p.privacy': 'Privacy policy',
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
    set('chip-ver', r.version); set('chip-size', mb(r.bytes)); set('cmp-size', mb(r.bytes)); /* cmp-size = 비교표 「한계」 줄의 크기(옛 고정값 541 MB 대신 늘 지금 안정판) */ set('dl-ver', r.version); set('dl-size', mb(r.bytes)); set('dl-date', r.date); set('foot-ver', r.version);
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

  // 판 비교: 'v2.0.56' 같은 X.Y.Z 세 정수만(사전 공개 꼬리표 -rc 등은 쓰지 않는다). 형식이 아니면 null.
  const semver = (v) => { const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(v || '').trim()); return m ? [+m[1], +m[2], +m[3]] : null; };
  const cmpVer = (a, b) => { const x = semver(a), y = semver(b); if (!x || !y) return null; for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1; return 0; };
  /** 최신판 카드: 늘 보인다. CONFIG.preview.installer 가 안정판(stableVersion)보다 높을 때만 켜고, 아니면 비활성(.off — 단추 주소 없음)으로 둔다. */
  function paintPreview(stableVersion) {
    const box = document.getElementById('dl-pre'); if (!box) return;
    const p = CONFIG.preview && CONFIG.preview.installer;
    const show = !!(p && p.asset && p.url && cmpVer(p.version, stableVersion) === 1);
    box.hidden = false; box.classList.toggle('off', !show);
    const btn0 = document.getElementById('dl-pre-btn');
    if (!show) { if (btn0) { btn0.removeAttribute('href'); btn0.setAttribute('aria-disabled', 'true'); } return; }
    if (btn0) btn0.removeAttribute('aria-disabled');
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v == null ? '' : v; };
    set('dl-pre-ver', p.version); set('dl-pre-size', p.bytes ? mb(p.bytes) : ''); set('dl-pre-date', p.date || '');
    set('dl-pre-bytes', p.bytes ? `${Number(p.bytes).toLocaleString('en-US')} bytes` : '');
    set('dl-pre-sha', p.sha || ''); // 이 판(asset)의 값만 — 모르면 비운다
    const btn = document.getElementById('dl-pre-btn'); if (btn) btn.href = mirrorFor(p.asset) || p.url;
    const rp = document.getElementById('dl-pre-relpage'); if (rp && p.page) rp.href = p.page;
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
    if (d.date) set(`comp-${key}-date`, d.date); // 못 읽었으면 HTML 에 적어 둔 날짜를 그대로 둔다
    set(`comp-${key}-note`, d.note || (d.version ? '—' : t(I18N.en['comp.none'], '변경 내용 없음')));
    const sum = document.getElementById(`comp-${key}-summary`);
    if (sum) sum.textContent = d.version ? t(`What's new in ${d.version}`, `${d.version} 변경 내용`) : t(I18N.en['comp.none'], '변경 내용 없음');
    const body = document.getElementById(`comp-${key}-body`);
    if (body) { if (d.notes) fillNotes(body, d.notes); else body.textContent = t(I18N.en['comp.none'], '아직 내용이 없습니다.'); }
  }
  function renderAllComponents() { for (const key of PARTS) renderComponent(key); }

  // 첫 화면을 지나면 html.past — 머리를 검정 띠로 바꿔 아래 정보 구역 글이 메뉴와 겹쳐 보이지 않게 한다(home.css)
  const hero = document.getElementById('hero');
  if (hero) {
    const past = () => document.documentElement.classList.toggle('past', scrollY > hero.offsetHeight - innerHeight * .35);
    window.addEventListener('scroll', past, { passive: true }); window.addEventListener('resize', past); past();
  }

  for (const b of $$('.lang button')) b.addEventListener('click', () => setLang(b.dataset.lang));
  setLang(initialLang()); // 여기서 renderAllComponents() 도 한 번 불려 fallback 이 먼저 그려진다

  paint(CONFIG.fallback.installer); // 어느 쪽이든 아는 판으로 먼저 그린다(설치 안내의 해시 명령·값 포함) — 없는 요소는 건너뜀
  paintPreview(CONFIG.fallback.installer.version); // 최신판 상자(안정판보다 높을 때만)
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
              sha: version === CONFIG.fallback.installer.version && zip.name === CONFIG.fallback.installer.asset ? CONFIG.fallback.installer.sha : null }); // 같은 판·같은 첨부일 때만 값, 아니면 링크만
            paintPreview(version); // 안정판이 더 새로 올라왔으면(최신판이 승격됨) 최신판 상자를 다시 판정
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
