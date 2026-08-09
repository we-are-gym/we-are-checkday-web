// 파일 용도: 회원 정보 편집 화면(member-edit.html)
// ?memberID= 회원을 조회해 member-form에 프리필하고, 저장 시 memberStore의 해당 회원 정보를 갱신한다.
import { byId } from "@base/utils-dom.js";
import { getNumberParam } from "@base/utils-url.js";
import { memberStore, updateMember } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";
import "@base/components/app-header.js";
import "@member/components/member-form.js";

/** ?memberID= 파라미터 (없으면 0 — 미조회 상태) */
const memberId = getNumberParam("memberID");

/** 상세 화면으로 복귀하는 URL */
const detailUrl = `member-detail.html?memberID=${memberId}`;

/** 회원 편집 폼 컴포넌트 엘리먼트 */
const formEl = byId("member-form");
/** 편집 대상 회원 (없으면 undefined) */
const member = getMemberById(memberStore.getState().members, memberId);

if (!member) {
	// 대상 회원이 없으면 등록 화면 취소처럼 목록으로 이동하며 안내 (UI는 렌더링되지 않음)
	window.location.href = "members.html";
} else {
	formEl.cancelHref = detailUrl;
	/** 취소 시 상세 화면으로 복귀
	 * @returns {void}
	 */
	formEl.onCancel = () => {
		window.location.href = detailUrl;
	};
	formEl.prefill(member);
	/** 저장 시 해당 회원 정보를 스토어에 반영하고 상세 화면으로 복귀
	 * @param {Omit<import("@base/store.js").Member, "id">} data 폼 입력값
	 * @returns {void}
	 */
	formEl.onSubmit = (data) => {
		updateMember(memberId, data);
		// 저장 후 상세 화면으로 복귀
		window.location.href = detailUrl;
	};
}