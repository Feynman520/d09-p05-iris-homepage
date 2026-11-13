/* IRIS homepage figures · © 2026 Sejun Ham (함세준) · MIT
   2026-11-11 채택 그림 둘의 동작(시안 원본 = docs\시안-그림-2026-11-11\그림시안.html):
   A1 직업별 폴더 나무 — 직업 단추를 누르면 #jt-tree 를 새로 그린다. 직업과 R·D·P 이름 = 설치기(P02) installer/ui/presets.json 7종.
      R 번호는 직업 순서(R01 교사 … R07 작가 — 사용자 지정). 폴더 이름은 실제 이름이라 영어 화면에서도 그대로 둔다.
      presets.json 을 고치면 아래 JOBS 도 함께 고친다.
   B5 IRIS 창 설명 — 설명 줄(또는 번호 점)에 마우스를 올리면 짝이 되는 점·줄을 밝힌다. */
(function () {
  'use strict';
  // [R(한/영), [[D 한, D 영, [[P 한, P 영] …]] …]]
  const JOBS = [
    [['교사', 'Teacher'], [['수업', 'Teaching', [['이번 학기 수업 준비', 'Semester Prep'], ['평가와 기록', 'Assessment']]], ['학급 운영', 'Homeroom', [['학급 살림', 'Class Care']]], ['연수와 성장', 'Professional Growth', [['연수 기록', 'Training Notes']]]]],
    [['연구자', 'Researcher'], [['연구 주제', 'Research Topic', [['선행 연구 조사', 'Literature Review'], ['실험과 분석', 'Experiments']]], ['논문 쓰기', 'Paper Writing', [['첫 논문', 'First Paper']]], ['학회와 발표', 'Conferences', [['발표 준비', 'Talk Prep']]]]],
    [['사업가', 'Business Owner'], [['사업 기획', 'Business Planning', [['올해 사업 계획', 'Annual Plan']]], ['영업과 고객', 'Sales and Customers', [['고객 관리', 'Customer Care'], ['제안서', 'Proposals']]], ['살림과 회계', 'Finance', [['매출과 지출', 'Revenue and Costs']]]]],
    [['개발자', 'Developer'], [['제품 만들기', 'Product Work', [['첫 제품', 'First Product']]], ['도구 만들기', 'Tooling', [['업무 자동화', 'Work Automation']]], ['배움과 기록', 'Learning', [['기술 노트', 'Tech Notes']]]]],
    [['직장인', 'Office Worker'], [['맡은 업무', 'Assigned Work', [['이번 분기 업무', 'Quarterly Work'], ['보고서 쓰기', 'Reports']]], ['회의와 일정', 'Meetings', [['회의 기록', 'Meeting Notes']]], ['경력 관리', 'Career', [['배움 기록', 'Learning Log']]]]],
    [['학생', 'Student'], [['공부', 'Study', [['이번 학기 공부', 'Semester Study'], ['시험 준비', 'Exam Prep']]], ['과제와 활동', 'Assignments', [['과제 모음', 'Assignment Set']]], ['진로 탐색', 'Career Search', [['진로 조사', 'Career Research']]]]],
    [['작가', 'Writer'], [['글쓰기', 'Writing', [['첫 책', 'First Book'], ['짧은 글', 'Short Pieces']]], ['자료 조사', 'Source Research', [['취재와 자료', 'Source Material']]], ['독자와 소통', 'Readers', [['연재와 소식', 'Newsletter']]]]],
  ];
  const pad = (n) => (n < 10 ? '0' : '') + n;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const jobs = document.getElementById('jt-jobs'), tree = document.getElementById('jt-tree'), count = document.getElementById('jt-count');
  if (jobs && tree) {
    const row = (i, lv, cls, code, ko, en) =>
      `<div class="jt-r ${cls}" style="--i:${i};--lv:${lv}"><span class="ind"></span><span class="fd"></span>` +
      `<span><b>${code ? `<span class="cd">${code}-</span>` : ''}${esc(ko)}</b>${en ? `<span class="en">(${esc(en)})</span>` : ''}</span>` +
      `<span class="md">AGENTS.md</span></div>`;
    const show = (k) => {
      const [r, ds] = JOBS[k], h = [];
      let i = 0;
      h.push(row(i++, 0, 'root', '', 'C:\\IRIS', ''));
      h.push(row(i++, 1, 'R', 'R' + pad(k + 1), r[0], r[1]));
      ds.forEach((d, di) => {
        h.push(row(i++, 2, 'D', 'D' + pad(di + 1), d[0], d[1]));
        d[2].forEach((p, pi) => h.push(row(i++, 3, 'P', 'P' + pad(pi + 1), p[0], p[1])));
      });
      tree.innerHTML = h.join('');
      if (count) count.textContent = String(i - 1); // C:\IRIS 를 뺀 폴더 수
      for (const b of jobs.querySelectorAll('button')) b.setAttribute('aria-pressed', String(Number(b.dataset.job) === k));
    };
    jobs.addEventListener('click', (e) => { const b = e.target.closest('button[data-job]'); if (b) show(Number(b.dataset.job)); });
    show(0);
  }

  const shot = document.getElementById('ws-shot'), keys = document.getElementById('ws-keys');
  if (shot && keys) {
    const hi = (k) => {
      for (const d of shot.querySelectorAll('.ws-dot')) d.classList.toggle('on', d.dataset.k === k);
      for (const l of keys.querySelectorAll('li')) l.classList.toggle('on', l.dataset.k === k);
    };
    keys.addEventListener('mouseover', (e) => { const l = e.target.closest('li'); if (l) hi(l.dataset.k); });
    shot.addEventListener('mouseover', (e) => { const d = e.target.closest('.ws-dot'); if (d) hi(d.dataset.k); });
    keys.addEventListener('mouseleave', () => hi(''));
    shot.addEventListener('mouseleave', () => hi(''));
  }
})();
