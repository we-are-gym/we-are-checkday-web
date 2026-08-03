// 파일 용도: 회원 정보 폼 컴포넌트 — 이름·성별·목표·담당 트레이너 입력과 저장/취소 (member-create·member-edit 공용)
// 기법: 순수 함수형 컴포넌트 팩토리 + 네이티브 웹 컴포넌트 (light DOM 모드)
// 사용: el.onSubmit = (data) => {} 콜백 설정
// 결정: 저장 버튼은 to-be 지시에 따라 채색(btn-primary)을 주지 않는다 — 프로토타입과 달리 이 화면의 버튼은 무채색으로 둔다.
import { defineComponent } from "../component-factory.js";

defineComponent("member-form", {
	render() {
		return `
			<form class="member-form" id="member-form" novalidate>
				<label class="member-field">
					<span>이름</span>
					<input id="mf-name" type="text" required placeholder="이름" aria-required="true" />
				</label>
				<label class="member-field">
					<span>성별</span>
					<select id="mf-gender">
						<option value="">선택 안 함</option>
						<option value="여">여</option>
						<option value="남">남</option>
					</select>
				</label>
				<label class="member-field">
					<span>운동 목표</span>
					<input id="mf-goal" type="text" placeholder="예: 체지방 감소" />
				</label>
				<label class="member-field">
					<span>담당 트레이너</span>
					<input id="mf-trainer" type="text" placeholder="예: 김지훈" />
				</label>
				<div class="member-form-actions">
					<button class="btn btn-ghost" type="submit">저장</button>
					<a class="btn btn-ghost" href="members.html">취소</a>
				</div>
			</form>`;
	},
	onConnect() {
		const form = this.querySelector("form");
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const nameEl = form.querySelector("#mf-name");
			const name = nameEl.value.trim();
			if (!name) {
				nameEl.focus();
				return;
			}
			if (this.onSubmit) {
				this.onSubmit({
					name,
					gender: form.querySelector("#mf-gender").value,
					goal: form.querySelector("#mf-goal").value.trim() || "일반",
					trainer: form.querySelector("#mf-trainer").value.trim(),
				});
			}
		});
	},
});