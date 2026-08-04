// 파일 용도: 회원 정보 편집 화면(member-edit.html)
// ?memberID= 회원을 조회해 member-form에 프리필하고, 저장 시 memberStore의 해당 회원 정보를 갱신한다.
import { byId } from "./UI.js";
import { memberStore } from "./member-store.js";
import { getMemberById } from "./member-utils.js";
import "./components/app-header.js";
import "./components/member-form.js";

/** ?memberID= 파라미터 (없으면 0 — 미조회 상태) */
const memberId = Number(new URLSearchParams(window.location.search).get("memberID")) || 0;

/** 편집 대상 회원 */
function getMember() {
	return getMemberById(memberStore.getState().members, memberId);
}

/** 상세 화면으로 복귀하는 URL */
const detailUrl = `member-detail.html?memberID=${memberId}`;

const formEl = byId("member-form");
const member = getMember();

if (!member) {
	// 대상 회원이 없으면 등록 화면 취소처럼 목록으로 이동하며 안내 (UI는 렌더링되지 않음)
	window.location.href = "members.html";
} else {
	formEl.cancelHref = detailUrl;
	formEl.onCancel = () => {
		window.location.href = detailUrl;
	};
	formEl.prefill(member);
	formEl.onSubmit = (data) => {
		memberStore.setState((prev) => ({
			...prev,
			members: prev.members.map((m) => (m.id === memberId ? { ...m, ...data } : m)),
		}));
		// 저장 후 상세 화면으로 복귀
		window.location.href = detailUrl;
	};
}