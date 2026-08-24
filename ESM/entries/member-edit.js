// 파일 용도: 회원 정보 편집 화면(member-edit.html)
// ?memberID= 회원을 API에서 조회해 member-form에 프리필하고, 저장 시 API를 통해 갱신한다.
import { guardOnBfcache } from "@infra/auth.js";
import "@infra/components/app-header.js";
import "@member/components/member-form.js";
import { loadMembers, memberStore, updateMember } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";
import { byId } from "@tools/utils-dom.js";
import { getUrlParam } from "@tools/utils-url.js";

// bfcache 복원 갱신 콜백을 넘기지 않는다 — 프리필 재실행 시 미저장 폼 입력이 덮여쓰이기 때문
guardOnBfcache();

/** ?memberID= 파라미터 (문자열 member_ID) */
const memberId = getUrlParam("memberID");

/** 상세 화면으로 복귀하는 URL */
const detailUrl = `member-detail.html?memberID=${encodeURIComponent(memberId)}`;

/** 회원 편집 폼 컴포넌트 엘리먼트 */
const formEl = byId("member-form");

/**
 * 회원 정보를 불러와 폼을 채우고 저장 이벤트를 연결합니다.
 * @returns {Promise<void>}
 */
async function init() {
	try {
		await loadMembers();
	} catch (err) {
		console.error("회원 목록 로드 실패:", err);
		window.location.href = "members.html";
		return;
	}

	const member = getMemberById(memberStore.getState().members, memberId);
	if (!member) {
		// 대상 회원이 없으면 목록으로 이동
		window.location.href = "members.html";
		return;
	}

	formEl.cancelHref = detailUrl;
	/** 취소 시 상세 화면으로 복귀
	 * @returns {void}
	 */
	formEl.onCancel = () => {
		window.location.href = detailUrl;
	};
	formEl.prefill(member);
	/** 저장 시 해당 회원 정보를 API에 반영하고 상세 화면으로 복귀
	 * @param {Omit<import("@infra/store.js").Member, "id">} data 폼 입력값
	 * @returns {Promise<void>}
	 */
	formEl.onSubmit = async data => {
		try {
			await updateMember(memberId, data);
			// 저장 후 상세 화면으로 복귀
			window.location.href = detailUrl;
		} catch (err) {
			console.error("회원 정보 수정 실패:", err);
		}
	};
}

init();
