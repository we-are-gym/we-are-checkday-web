/* 파일 용도: 회원 관리 화면(members.html) — mock 회원 데이터와 목록·검색·생성·제거 로직
   상태는 메모리(mock)만 유지, 재로딩 시 초기값으로 복원 */
import { UI } from "./UI.js";
import { VAL } from "./validation.js";
import { STR } from "./utils-string.js";
import "./components/app-header.js";
import "./components/app-gnb.js";

const MOCK_MEMBERS = [
  { id: 1, name: "김민준", gender: "남", age: 27, phone: "010-1234-1001", goal: "체지방 감소", registered: "2026-07-01" },
  { id: 2, name: "이서연", gender: "여", age: 24, phone: "010-2234-1002", goal: "근력 향상", registered: "2026-07-03" },
  { id: 3, name: "박지훈", gender: "남", age: 31, phone: "010-3234-1003", goal: "체중 감량", registered: "2026-07-08" },
  { id: 4, name: "최수아", gender: "여", age: 29, phone: "010-4234-1004", goal: "체형 교정", registered: "2026-07-12" },
  { id: 5, name: "정우진", gender: "남", age: 35, phone: "010-5234-1005", goal: "근력 향상", registered: "2026-07-18" },
];

/* ── 상태 ── */
let members = MOCK_MEMBERS.slice(0);
let nextId = members.length + 1;
let keyword = "";

/* ── 목록 렌더링 ── */
function renderMembers() {
  const emptyEl = UI.byId("member-empty");
  const kw = keyword.trim().toLowerCase();
  const filtered = kw
    ? members.filter((m) =>
        [m.name, m.phone, m.goal].some((f) => f.toLowerCase().includes(kw)),
      )
    : members.slice(0);

  UI.setHTML(
    "member-list",
    filtered
      .map(
        (m) => `
      <tr class="member-row" data-id="${m.id}" tabindex="0">
        <td class="member-name">${m.name}</td>
        <td class="member-gender">${m.gender}</td>
        <td class="member-age">${m.age}</td>
        <td class="member-phone">${m.phone}</td>
        <td class="member-goal">${m.goal}</td>
        <td class="member-action">
          <button type="button" class="member-remove" data-id="${m.id}" title="회원 삭제">제거</button>
        </td>
      </tr>`,
      )
      .join(""),
  );

  emptyEl.hidden = filtered.length !== 0;
  UI.setText("member-count", `${filtered.length}명`);
  UI.queryAll(".member-row").forEach((row) => {
    // 행 클릭 → 상세 이동
    row.addEventListener("click", () => {
      window.location.href = `member-detail.html?id=${row.dataset.id}`;
    });
    row.querySelectorAll(".member-remove").forEach((btn) => {
      // 제거 버튼은 행 이동을 트리거하지 않도록 별도 처리
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeMember(Number(btn.dataset.id));
      });
    });
  });
}

/* ── 검색 ── */
function onSearch() {
  keyword = UI.byId("search-input").value;
  renderMembers();
}

/* ── 생성 ── */
function addMember(formData) {
  members.push({ id: nextId++, ...formData });
  renderMembers();
}

/* ── 제거 ── */
function removeMember(id) {
  members = members.filter((m) => m.id !== id);
  renderMembers();
}

/* ── 이벤트 바인딩 ── */
function bindMemberEvents() {
  UI.byId("search-input").addEventListener("input", onSearch);
  UI.byId("member-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = UI.byId("f-name").value.trim();
    const gender = UI.byId("f-gender").value;
    const age = VAL.parseToNum(UI.byId("f-age").value);
    const phone = UI.byId("f-phone").value.trim();
    const goal = UI.byId("f-goal").value.trim() || "일반";
    if (!name) return;
    addMember({ name, gender, age, phone, goal, registered: STR.today() });
    e.target.reset();
  });
}

function initMembers() {
  renderMembers();
  bindMemberEvents();
}

// ── 시작 (모듈 스크립트는 defer되므로 DOM 완료 후 실행; DOMContentLoaded 대기 불필요) ──
initMembers();