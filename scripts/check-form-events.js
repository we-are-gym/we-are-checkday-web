// 파일 용도: 체크기록 폼 공용 이벤트 위임 — checkday(작성)와 check-doc-edit(편집) 화면이 똑같이 등록하던
//        폼 조작 핸들러(목표/체크 태그 토글·평가 점수 증감·동작 피드백 CRUD·인바디/목표 실시간 갱신)를
//        한 곳으로 모아 두 화면에서 재사용한다.
// 기법: UI.delegate 기반 이벤트 위임 — 인라인 onclick·window 오염 없이 정적·동적 요소를 한 루트에서 처리
// 주의: [data-action] 화면별 액션(reset/save 등)은 화면마다 다르므로 여기서 다루지 않고 각 진입점이 등록한다.
import { UI } from "./UI.js";
import { toggleBasicFunctionDetail, adjustScore, updateVO2Disp } from "./evaluation.js";
import { updateInbodyTags } from "./inbody.js";
import { appendCheckMovement, appendCheckMovementItemRow } from "./feedback.js";

/**
 * 두 화면이 공유하는 상담지 폼 이벤트 위임을 등록한다 (1회 호출).
 *
 * - 목표·체크 문구 태그 토글
 * - 평가 카드 펼침/점수 증감 (동적 생성 요소)
 * - 동작 피드백 카드 CRUD (동적 생성 요소)
 * - 인바디 수치·VO₂ 입력 실시간 갱신
 *
 * @returns {void}
 */
export function setupCheckFormEvents() {
	// 목표·체크 문구 태그 토글
	UI.delegate(document, "click", ".goal-tag, .ctag", (e, el) => el.classList.toggle("on"));
	// 평가 카드 펼침 (동적 생성 요소)
	UI.delegate(document, "click", ".expand-toggle", (e, el) =>
		toggleBasicFunctionDetail(Number(el.dataset.i)),
	);
	// 평가 점수 증감 (동적 생성 요소)
	UI.delegate(document, "click", "#eval-cards .score-btn", (e, el) =>
		adjustScore(Number(el.dataset.i), Number(el.dataset.delta)),
	);
	// 동작 피드백 카드 CRUD (동적 생성 요소)
	UI.delegate(document, "click", ".fb-del-btn", (e, el) => el.closest(".fb-item")?.remove());
	UI.delegate(document, "click", ".add-check-btn", (e, el) => appendCheckMovementItemRow(el));
	UI.delegate(document, "click", ".fb-check-del", (e, el) => el.closest(".fb-check-row")?.remove());
	UI.delegate(document, "click", ".add-fb-btn", () => appendCheckMovement());
	// input 위임 — 인바디 수치·VO₂ 입력 갱신
	document.addEventListener("input", (e) => {
		const id = e.target.id;
		if (!id) return;
		if (id.startsWith("ib-")) updateInbodyTags();
		else if (id === "vo2-age" || id === "vo2-ht" || id === "vo2-wt" || id === "vo2-hr")
			updateVO2Disp();
	});
}