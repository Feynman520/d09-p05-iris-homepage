---
id: iris:xvnqohlo
type: project
code: P07
status_scheme: task5
lifecycle: active
tags:
- {kind: 소프트웨어/산출물 종류, value: Web}
drawers: [docs, site]
aliases: ['P05-아이리스 홈페이지(IRIS Homepage) 〖Web〗']
created: '2026-09-13'
---
# P07-아이리스 홈페이지(IRIS Homepage) 〖Web〗

IRIS의 공식 홈페이지 `https://iris-workspace.com` — IRIS를 소개하고 설치 패키지를 내려받게 하는 정적 사이트(프레임워크 없는 HTML·CSS·JS, Vercel 정적 배포). 스타일은 IRIS-Face(P01)의 "별의 홍채" 그대로(토큰·글꼴·이모지 금지·강조색 하나).

- 정본: 설계 = `docs\설계.md`(2026-09-13 조각 ①~⑥). 사이트 = `site\`(그대로 배포되는 파일). 홈페이지 저장소 = `https://github.com/Feynman520/d09-p05-iris-homepage`(public·MIT·`.stack=A`).
- 다운로드 단추는 설치 패키지(P02) 저장소 `Feynman520/d09-p03-iris-installer`의 **최신 릴리스를 GitHub API로 읽어** 채운다(`site\site.js`의 `CONFIG` 한 곳). zip은 이 저장소에 두지 않는다. API가 막히면 `CONFIG.fallback`(마지막으로 안 판)으로 그린다 — 새 판을 내면 그 값도 함께 올린다. **두 갈래(2026-11-09):** `CONFIG.fallback` = 안정판(채운 단추·아래 띠), `CONFIG.preview.installer` = 최신판(테두리 단추 상자 `#dl-pre`, 안정판보다 높을 때만 보임, API 로 찾지 않음). 두 값은 손으로 고치지 않고 릴리스 도구(`iris-release.mjs` 최신판 릴리스·`preview-homepage`·`promote`)가 쓴다. 검사 = `node scripts/check-channels.mjs`(headless, 6경우).
- **첫 페이지 = 입자 IRIS 첫 화면 + 정보 구역(2026-11-11 사용자 확정 — 정본 `docs\설계-첫페이지-다듬기-2026-11-11.md`)**: 입자 장면은 ① 첫 화면 하나뿐이고, 그 아래는 옛 홈페이지 내용(IRIS란 → 비교표 → 기능 → **보이지 않는 곳에서 하는 일** → 내려받기 → 안에 든 것 → 구성 요소와 새 소식 → 자주 묻는 질문)을 지금 스타일(검정 바탕·`N° 0x` 장 표시·가는 줄)로 다시 쓴 정보 구역이다. **N° 05 `#hood`(2026-11-12 사용자 채택, 시안 = `docs\시안-새구역-2026-11-12\`)** = 일의 지도(온톨로지)·스스로 배우는 규칙(자기개선)·문서 도구·내 계정 여러 개·대화는 내 PC에 — 계정 문구는 "내 계정 여러 개"로만 쓰고 여럿이 한 계정을 나눠 쓰는 것을 권하는 표현은 넣지 않는다(구독 약관 위험). 이 기능들이 바뀌면 비교표 `cmp.r12`·`cmp.r13`, 안에 든 것 `in.r7`·`in.r8`, FAQ `faq.8` 도 함께 본다. 머리 = 붓펜 손글씨 IRIS 그림(`site\img\iris-wordmark.png`, 세 쪽 공통 — 2026-11-11 로고 시안 19 확정) + 도는 육각 큐브(기호 확정 전까지의 자리 표시; 로고 정본 = D09 `로고설계-아이리스(IRIS Logo Design)-2026-11-11.md`). `site\index.html` + `home.css` + `particles.js`(three.js 입자, 첫 화면을 지나면 쉼·WebGL 없음/움직임 줄이기 대체, ②~⑥ 장면 모양은 쓰지 않고 남겨 둠) + `vendor\three.iife.js`(three r170 을 고전 스크립트로 감싼 것, MIT). 내려받기 단추는 `site.js` 가 id(`dl-btn`·`dock-dl`·`dl-pre*`·`cmp-size` 등)로 채우므로 **화면을 바꿔도 그 id 계약을 지킨다**(검사 = `scripts/check-channels.mjs`). 안정판·최신판 카드는 「내려받기」 구역에 나란히(최신판 없으면 비활성). 「구성 요소와 새 소식」 = 지금 판 한 줄(GitHub 자동, `comp-*-ver`·`comp-*-date`) + 사람이 쓴 연대표(`ol.tl`, 최근 것이 위) — 안정판을 올리면 연대표 맨 위에 한 칸을 더하고 `.cur` 를 옮긴다(한국어 + `site.js` 영어 사전 `comp.t*`·`comp.hotfix` 둘 다). 시안·제작 절차 원본 = R07 `_web-design-mockups\`(이 폴더 `docs\시안-홈페이지-2026-11-10\` 은 git 제외). `style.css` 는 이제 `install.html`·`privacy.html`·`feedback.html` 만, `stars.js` 는 앞의 둘만 쓴다.
- **그림 셋(2026-11-11 사용자 채택, 시안 = `docs\시안-그림-2026-11-11\`)**: N° 02 「직업별 폴더 나무」(R 번호 = 직업 순서 R01 교사 … R07 작가, 사용자 지정) · N° 04 「IRIS 창 설명」(`img/face-home.png` 위 번호 점 7개, 점 위치는 그 캡처 기준 % — 캡처를 바꾸면 점도 다시 맞춘다) · N° 06 「설치 흐름 띠」(2026-11-12 새 구역으로 05→06). 동작 = `site\figures.js`, 영어 = `site.js` 사전 `jt.*`·`ws.*`·`fl.*`. 폴더 나무 자료는 P02 `installer/ui/presets.json`의 **손 복사본**이라 프리셋을 고치면 `figures.js`의 `JOBS`도 같은 턴에 고친다.
- **의견 보내기 `/feedback`(2026-11-13 — 설계 정본 `docs\설계-의견함-2026-11-12.md`, 모양 = ⑥ 분류 레일)**: `site\feedback.html` + `feedback.js`. 이 사이트에서 유일하게 **바깥에 쓰는** 페이지 — IRIS 공용 DB(P03 허브 Supabase)의 넣기 전용 함수 `submit_feedback` 을 anon 키로 부른다(표·상한·알림 메일·Vault = P03 `hub\server\migrations\0005_feedback.sql`, 운영 = P03 `hub\server\운영.md` ②-1, 읽기 = P03 `hub\server\ops\feedback.mjs`). 함수 인자(`p_kind`·`p_place`·`p_body`·`p_email`·`p_source`·`p_app_info`·`p_trap`)나 종류·어디서 값 목록을 바꾸면 두 저장소를 같은 턴에 고치고 P03 `npm run verify:rls` + 이 저장소 `node scripts/check-feedback.cjs`(headless, 19경우, 네트워크 가짜)를 둘 다 통과시킨다. 처리방침 「의견 보내기」 절(`privacy.html#feedback` ↔ P03 `처리방침.md`)은 두 곳을 같이 고친다. `?info=` 는 IRIS 창이 앱 안 전송에 실패했을 때 넘기는 판 정보 자리(다음 최신판 창에서 씀).
- 별 엔진 `site\stars.js`는 P01 `app\stars.js`의 웹판(Electron 지표·설정 저장·자동 측정 제거, 무대 종류는 sphere·iris만). 원본이 바뀌면 그리기 부분만 따라 고친다.
- 언어: 한국어 기본 + 영어(`data-i18n` 사전 = `site\site.js`). 본문 긴 글(처리방침)은 `lang-ko`/`lang-en` 블록 두 벌.
- 도메인 DNS(가비아)는 루트 A·`www` CNAME만 이 사이트 몫이다. 같은 도메인의 Resend 메일 기록(`send`·`resend._domainkey`·MX)은 P03 메신저 몫이라 손대지 않는다.
- 배포: 스택 A(`use-stack.ps1 A ; vercel …`), GitHub `main` 푸시 = 자동 배포. 배포·새 판마다 R07 배포스택 지도 갱신.

<!-- 상위(루트/R07/D09) AGENTS.md 규칙 재서술 금지 -->
