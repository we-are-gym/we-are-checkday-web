// 파일 용도: 회원 등록 화면(member-create.html) — member-form 제출 시 스토어에 추가 후 목록으로 이동
import "@infra/components/app-header.js";
import "@member/components/member-form.js";
import { addMember } from "@member/member-store.js";
import { byId } from "@tools/utils-dom.js";

/** 회원 등록 폼 컴포넌트 엘리먼트 */
const formEl = byId("member-form");

/** 폼 제출 시 회원을 스토어에 추가하고 회원 목록으로 이동
 * @param {Omit<import("@infra/store.js").Member, "id">} data 폼 입력값 (이름·성별·목표·트레이너)
 * @returns {void}
 */
formEl.onSubmit = async data => {
	await addMember(data);
	// 저장 후 회원 목록으로 이동
	window.location.href = "members.html";
};
