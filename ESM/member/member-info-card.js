// 파일 용도: 회원 정보 카드 렌더링 — 회원 상세 화면(member-detail.html) 좌측 프로필 카드
// 기법: 순수 렌더 함수 — 스토어 비의존, 화면 조립자(member-view)가 member·recordCount를 주입한다.
import { displayGender } from "@member/member-utils.js";
import { setText } from "@tools/utils-dom.js";

/**
 * 회원 정보 카드 렌더링 (to-be: 프로토타입처럼 이름·성별·담당 트레이너 3행만)
 * @param {import("@infra/store.js").Member} member 대상 회원
 * @param {number} recordCount 회원의 체크기록 건수 (화면 조립자가 주입)
 * @returns {void}
 */
export function renderInfoCard(member, recordCount) {
	setText("md-title", member.name);
	setText("md-sub", `체크기록 ${recordCount}건`);
	setText("md-name", member.name);
	setText("md-gender", displayGender(member.gender) || "-");
	setText("md-trainer", member.trainer || "-");
	document.title = `${member.name} — 회원 상세`;
}
