---
id: iris:xvnqohlo
type: project
code: P05
status_scheme: task5
lifecycle: active
tags:
- {kind: 소프트웨어/산출물 종류, value: Web}
drawers: [docs, site]
created: '2026-09-13'
---
# P05-아이리스 홈페이지(IRIS Homepage) 〖Web〗

IRIS의 공식 홈페이지 `https://iris-workspace.com` — IRIS를 소개하고 설치 패키지를 내려받게 하는 정적 사이트(프레임워크 없는 HTML·CSS·JS, Vercel 정적 배포). 스타일은 IRIS-Face(P02)의 "별의 홍채" 그대로(토큰·글꼴·이모지 금지·강조색 하나).

- 정본: 설계 = `docs\설계.md`(2026-09-13 조각 ①~⑥). 사이트 = `site\`(그대로 배포되는 파일). 홈페이지 저장소 = `https://github.com/Feynman520/d09-p05-iris-homepage`(public·MIT·`.stack=A`).
- 다운로드 단추는 설치 패키지(P03) 저장소 `Feynman520/d09-p03-iris-installer`의 **최신 릴리스를 GitHub API로 읽어** 채운다(`site\site.js`의 `CONFIG` 한 곳). zip은 이 저장소에 두지 않는다. API가 막히면 `CONFIG.fallback`(마지막으로 안 판)으로 그린다 — 새 판을 내면 그 값도 함께 올린다. **두 갈래(2026-11-09):** `CONFIG.fallback` = 안정판(채운 단추·아래 띠), `CONFIG.preview.installer` = 최신판(테두리 단추 상자 `#dl-pre`, 안정판보다 높을 때만 보임, API 로 찾지 않음). 두 값은 손으로 고치지 않고 릴리스 도구(`iris-release.mjs` 최신판 릴리스·`preview-homepage`·`promote`)가 쓴다. 검사 = `node scripts/check-channels.mjs`(headless, 6경우).
- **첫 페이지 = 입자 IRIS 첫 화면 + 정보 구역(2026-11-11 사용자 확정 — 정본 `docs\설계-첫페이지-다듬기-2026-11-11.md`)**: 입자 장면은 ① 첫 화면 하나뿐이고, 그 아래는 옛 홈페이지 내용(IRIS란 → 비교표 → 기능 → 내려받기 → 안에 든 것 → 구성 요소와 새 소식 → 자주 묻는 질문)을 지금 스타일(검정 바탕·`N° 0x` 장 표시·가는 줄)로 다시 쓴 정보 구역이다. 머리 = 옛 홈페이지의 IRIS 손글씨 제목 + 도는 큐브. `site\index.html` + `home.css` + `particles.js`(three.js 입자, 첫 화면을 지나면 쉼·WebGL 없음/움직임 줄이기 대체, ②~⑥ 장면 모양은 쓰지 않고 남겨 둠) + `vendor\three.iife.js`(three r170 을 고전 스크립트로 감싼 것, MIT). 내려받기 단추는 `site.js` 가 id(`dl-btn`·`dock-dl`·`dl-pre*`·`cmp-size` 등)로 채우므로 **화면을 바꿔도 그 id 계약을 지킨다**(검사 = `scripts/check-channels.mjs`). 안정판·최신판 카드는 「내려받기」 구역에 나란히(최신판 없으면 비활성). 「구성 요소와 새 소식」의 손글씨 소식 문단(`comp.hotfix`)은 안정판을 올릴 때 한국어·영어 둘 다 바꿔 쓴다. 시안·제작 절차 원본 = R07 `_web-design-mockups\`(이 폴더 `docs\시안-홈페이지-2026-11-10\` 은 git 제외). `style.css`·`stars.js` 는 이제 `install.html`·`privacy.html` 만 쓴다.
- 별 엔진 `site\stars.js`는 P02 `app\stars.js`의 웹판(Electron 지표·설정 저장·자동 측정 제거, 무대 종류는 sphere·iris만). 원본이 바뀌면 그리기 부분만 따라 고친다.
- 언어: 한국어 기본 + 영어(`data-i18n` 사전 = `site\site.js`). 본문 긴 글(처리방침)은 `lang-ko`/`lang-en` 블록 두 벌.
- 도메인 DNS(가비아)는 루트 A·`www` CNAME만 이 사이트 몫이다. 같은 도메인의 Resend 메일 기록(`send`·`resend._domainkey`·MX)은 P04 메신저 몫이라 손대지 않는다.
- 배포: 스택 A(`use-stack.ps1 A ; vercel …`), GitHub `main` 푸시 = 자동 배포. 배포·새 판마다 R07 배포스택 지도 갱신.

<!-- 상위(루트/R07/D09) AGENTS.md 규칙 재서술 금지 -->
