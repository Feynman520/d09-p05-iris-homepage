// sync-notice.mjs — P03 install-notice.txt → site/install.html #sac 절 HTML 생성
//
// P03(아이리스 설치 패키지)의 payload-src/policy/install-notice.txt 가 SAC(스마트 앱 컨트롤)
// 차단 안내문의 정본이다. 이 스크립트는 그 평문을 읽어 HTML로 바꾸고, site/install.html 안의
// `<!-- notice:begin -->...<!-- notice:end -->` 사이만 갈아 끼운다. 손으로 그 사이를 고치지
// 말 것 — 다음 실행 때 덮어써진다.
//
// 실행: node scripts/sync-notice.mjs [--check]
//   --check : 파일을 바꾸지 않고 "바뀔 내용이 있는지"만 종료코드로 알린다(0=동일, 1=다름/오류).
//
// 파서 규칙 (이 규칙과 install-notice.txt 쪽 들여쓰기 관례를 함께 바꾸지 말 것 — 실측 =
// `cat -A install-notice.txt`, 2026-09-15):
//   - 원문 첫 줄 = 절 제목. install.html 쪽 <h3 id="sac"> 문구는 따로 손으로 관리하므로(번역
//     가능해야 해서) 이 스크립트는 첫 줄을 버리고 그 다음부터만 쓴다.
//   - 그 뒤로는 빈 줄이 문단을 가른다. 비어 있지 않은 한 줄은 아래 중 하나로 분류한다:
//       · `[...]`로 시작                → 번호/글머리 목록의 절 제목 한 줄(예: "[방법 ㉮] ...")
//       · `  1. 내용` (2칸 들여쓰기+번호) → <ol> 항목의 시작
//       · `  - 내용` (2칸 들여쓰기+대시) → <ul> 항목의 시작
//       · 3~8칸 들여쓰기               → 바로 앞 항목이 이어지는 설명(같은 <li>에 공백으로 합침)
//       · 9칸 이상 들여쓰기            → 바로 앞 항목에 딸린 "그대로 칠 것" 한 줄(명령/경로/URL).
//                                       http(s):// 로 시작하면 <a href>, 아니면 <code>로 그
//                                       항목 안에 줄바꿈(<br>) 뒤에 붙인다.
//       · 그 외(들여쓰기 없는 줄)      → 그냥 문단(<p>). 다만 바로 다음에 목록이 이어지면 이
//                                       문단의 마지막 한 줄을 그 목록의 제목으로 승격한다
//                                       (예: "그래도 안 될 때" — 원문엔 대괄호가 없는 절 제목).
//   - UTF-8 BOM은 읽을 때 제거한다.
//   - install-notice.txt는 P03 소관 파일이라 이 스크립트는 절대 쓰지 않는다(읽기 전용 입력).
//   - 영어 번역(site.js의 I18N.en['inst.sacbody'])은 이 스크립트가 만들지 않는다 —
//     install-notice.txt에 영어판이 없어 손으로 옮겨 쓴 번역을 site.js에 계속 둔다. 원문이
//     바뀌면 영어 쪽도 사람이 같이 고칠 것.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, '..', 'site');
const INSTALL_HTML = path.join(SITE_DIR, 'install.html');
const NOTICE_TXT = path.join(
  __dirname, '..', '..',
  'P03-아이리스 설치 패키지(IRIS Installer) 〖Local App〗',
  'payload-src', 'policy', 'install-notice.txt'
);

const BEGIN = '<!-- notice:begin -->';
const END = '<!-- notice:end -->';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** install-notice.txt 평문 → { title, blocks } (blocks = [{type:'p', text} | {type:'ol'|'ul', heading, items}]) */
function parseNotice(raw) {
  let text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

  const title = (lines[0] || '').trim();
  let i = 1;
  while (i < lines.length && lines[i].trim() === '') i++;

  const blocks = [];
  let paraLines = [];
  let curList = null; // { heading: string|null, listType: 'ol'|'ul', items: [[{t,v}, ...], ...] }

  function flushPara() {
    if (paraLines.length) {
      blocks.push({ type: 'p', text: paraLines.join(' ') });
      paraLines = [];
    }
  }
  function flushList() {
    if (curList) { blocks.push({ type: curList.listType, heading: curList.heading, items: curList.items }); curList = null; }
  }
  function startListIfNeeded(kind) {
    if (curList) { curList.listType = kind; return; }
    let heading = null;
    if (paraLines.length) {
      heading = paraLines.pop();
      flushPara(); // 승격시키고 남은 앞쪽 줄이 있으면 별도 <p>로 먼저 내보낸다(원문엔 안 생기지만 대비)
    }
    curList = { heading, listType: kind, items: [] };
  }

  for (; i < lines.length; i++) {
    const raw2 = lines[i];
    if (raw2.trim() === '') continue;

    if (/^\[.+\]/.test(raw2)) {
      flushPara(); flushList();
      curList = { heading: raw2.trim().replace(/\s+/g, ' '), listType: null, items: [] };
      continue;
    }
    const num = /^ {2}\d+\.\s+(.*)$/.exec(raw2);
    if (num) {
      startListIfNeeded('ol');
      curList.items.push([{ t: 'text', v: num[1].trim() }]);
      continue;
    }
    const bul = /^ {2}-\s+(.*)$/.exec(raw2);
    if (bul) {
      startListIfNeeded('ul');
      curList.items.push([{ t: 'text', v: bul[1].trim() }]);
      continue;
    }
    const orphan = /^ {9,}(\S.*)$/.exec(raw2);
    if (orphan && curList && curList.items.length) {
      const val = orphan[1].trim();
      const seg = /^https?:\/\//.test(val) ? { t: 'link', v: val } : { t: 'code', v: val };
      curList.items[curList.items.length - 1].push(seg);
      continue;
    }
    const cont = /^ {3,8}(\S.*)$/.exec(raw2);
    if (cont && curList && curList.items.length) {
      const item = curList.items[curList.items.length - 1];
      const last = item[item.length - 1];
      if (last && last.t === 'text') last.v += ' ' + cont[1].trim();
      else item.push({ t: 'text', v: cont[1].trim() });
      continue;
    }
    // 들여쓰기 없는 보통 문단 줄
    flushList();
    paraLines.push(raw2.trim());
  }
  flushPara();
  flushList();

  return { title, blocks };
}

function renderItem(segments) {
  const parts = [];
  for (const seg of segments) {
    if (seg.t === 'text') parts.push(escapeHtml(seg.v));
    else if (seg.t === 'code') parts.push(`<code>${escapeHtml(seg.v)}</code>`);
    else if (seg.t === 'link') parts.push(`<a href="${escapeHtml(seg.v)}">${escapeHtml(seg.v)}</a>`);
  }
  return parts.join('<br>');
}

function renderBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.type === 'p') {
      out.push(`  <p>${escapeHtml(b.text)}</p>`);
    } else if (b.type === 'ol' || b.type === 'ul') {
      if (b.heading) out.push(`  <h4>${escapeHtml(b.heading)}</h4>`);
      out.push(`  <${b.type}>`);
      for (const item of b.items) out.push(`    <li>${renderItem(item)}</li>`);
      out.push(`  </${b.type}>`);
    }
  }
  return out.join('\n');
}

function main() {
  const check = process.argv.includes('--check');

  const noticeRaw = fs.readFileSync(NOTICE_TXT, 'utf8');
  const { blocks } = parseNotice(noticeRaw);
  const generated = renderBlocks(blocks);

  const html = fs.readFileSync(INSTALL_HTML, 'utf8');
  const bi = html.indexOf(BEGIN);
  const ei = html.indexOf(END);
  if (bi === -1 || ei === -1 || ei < bi) {
    console.error(`실패: ${INSTALL_HTML} 안에 ${BEGIN} / ${END} 마커를 찾지 못했습니다.`);
    process.exit(1);
  }
  const before = html.slice(0, bi + BEGIN.length);
  const after = html.slice(ei);
  const next = `${before}\n${generated}\n  ${after}`;

  if (check) {
    if (next === html) { console.log('OK  install.html #sac 절이 install-notice.txt와 이미 일치합니다.'); process.exit(0); }
    console.log('다름  install.html #sac 절이 install-notice.txt와 다릅니다 — --check 없이 다시 실행하세요.');
    process.exit(1);
  }

  fs.writeFileSync(INSTALL_HTML, next, 'utf8');
  console.log(`OK  ${INSTALL_HTML} 의 #sac 절을 install-notice.txt(${NOTICE_TXT})에서 다시 만들었습니다.`);
}

main();
