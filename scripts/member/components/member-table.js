// 파일 용도: 회원 목록 테이블 컴포넌트 — rows 속성으로 렌더, 행 선택·제거 이벤트 위임 (회원 관리 공용)
// 기법: 순수 함수형 컴포넌트 팩토리 + 네이티브 웹 컴포넌트 (light DOM 모드)
// 사용: el.rows = [...]; el.refresh(); / el.onSelect(id), el.onRemove(id) 콜백 설정
import { defineComponent } from "../component-factory.js";
import { TPL } from "../templates.js";

defineComponent("member-table", {
	/**
	 * 회원 목록 테이블 HTML을 생성한다 (빈 목록이면 안내 행 포함)
	 * @returns {string} 테이블 HTML
	 */
	render() {
		const rows = this.rows || [];
		// to-be: 프로토타입 배치와 동일하게 「목표」 열을 두지 않는다 (5열)
		// 빈 목록이면 목록 안에 안내 행을 렌더링한다 (프로토타입 "검색 결과가 없어요" 대응)
		const body = rows.length
			? rows.map((m) => TPL.memberRow(m)).join("")
			: `<tr class="member-empty-cell"><td colspan="5">검색 결과가 없어요</td></tr>`;
		return `
			<table class="member-table" aria-label="회원 목록">
				<thead>
					<tr>
						<th>이름</th>
						<th>성별</th>
						<th>담당 트레이너</th>
						<th>체크 횟수</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					${body}
				</tbody>
			</table>`;
	},
	/**
	 * 행 선택·제거 이벤트를 루트 위임으로 연결하고 키보드(Enter/Space) 선택을 지원한다
	 */
	onConnect() {
		// 행 선택·제거는 컴포넌트 루트 위임 (refresh로 tbody가 바뀌어도 유지)
		this.addEventListener("click", (e) => {
			const rm = e.target.closest("[data-remove-id]");
			if (rm) {
				e.stopPropagation();
				if (this.onRemove) this.onRemove(Number(rm.dataset.removeId));
				return;
			}
			const row = e.target.closest("[data-member-id]");
			if (row && this.onSelect) this.onSelect(Number(row.dataset.memberId));
		});
		// 키보드 접근성: 행이 tabindex=0이므로 Enter/Space로도 선택
		this.addEventListener("keydown", (e) => {
			if (e.key !== "Enter" && e.key !== " ") return;
			const row = e.target.closest("[data-member-id]");
			if (row && this.onSelect) {
				e.preventDefault();
				this.onSelect(Number(row.dataset.memberId));
			}
		});
	},
});