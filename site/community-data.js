// IRIS homepage · © 2026 Sejun Ham (함세준) · MIT · https://feynman520.github.io/card/#home
/* /community 에 올라온 판 목록 — 명판 한 장 = 항목 하나. 그리기는 community.js.
   올릴지는 관리자가 건마다 정한다(신청 = Feynman520/iris-community 의 「커뮤니티 판 소개 신청」 양식, 규칙 = 그 저장소 TRADEMARKS.md).
   항목을 더하거나 고친 뒤에는 node scripts/check-community.cjs 를 돌린다.

   한 항목의 모양:
   {
     no: 1,                               // 올라온 순서. 한 번 준 번호는 다시 쓰지 않는다(내린 판의 번호도 비워 둔다)
     name: '판 이름',                      // 이름에 IRIS 를 넣지 않은 것만
     maker: 'github-id',                  // 아이디·별명. 실명·연락처는 적지 않는다
     repo: 'https://github.com/…',        // 「보러 가기」가 가는 곳 = 만든 사람의 저장소 첫 화면(https 만)
     img: 'img/community/001.png',        // 미리보기 그림(가로 16 : 세로 10). 이 폴더에 넣은 파일만
     listed: '2026-11-21',                // 올린 날
     checked: '2026-11-21',               // 관리자가 조건을 눈으로 확인한 날
     updated: '2026-11-18',               // 그 판이 마지막으로 갱신된 날(확인한 날 기준)
     rest: false,                         // true = 쉬는 중(1년 넘게 갱신 없음)
     one: { ko: '한 줄 소개', en: 'One line' },
     changes: { ko: ['바꾼 점', '…'], en: ['What changed', '…'] },   // 세 개 안팎
   }
*/
window.IRIS_COMMUNITY = [
];
