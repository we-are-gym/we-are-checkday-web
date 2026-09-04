import{r as e}from"./app-header-Jju2jUlD.js";e(`member-form`,{render(){return`
			<form class="member-form" id="member-form" novalidate aria-label="회원 정보 입력 폼">
				<label class="member-field">
					<span>이름</span>
					<input id="mf-name" type="text" required placeholder="이름" aria-required="true" />
				</label>
				<label class="member-field">
					<span>성별</span>
					<select id="mf-gender">
						<option value="">선택 안 함</option>
						<option value="녀">여</option>
						<option value="남">남</option>
					</select>
				</label>
				<label class="member-field">
					<span>운동 목표</span>
					<input id="mf-goal" type="text" placeholder="예: 체지방 감소" />
				</label>
				<label class="member-field">
					<span>담당 트레이너</span>
					<input id="mf-trainer" type="text" placeholder="예: 정지훈" />
				</label>
				<div class="member-form-actions">
					<button class="btn btn-ghost" type="submit">저장</button>
					<button class="btn btn-ghost" type="button" data-cancel>취소</button>
				</div>
			</form>`},onConnect(){let e=this.querySelector(`form`);e.addEventListener(`submit`,t=>{t.preventDefault();let n=e.querySelector(`#mf-name`),r=n.value.trim();if(!r){n.focus();return}this.onSubmit&&this.onSubmit({name:r,gender:e.querySelector(`#mf-gender`).value,goal:e.querySelector(`#mf-goal`).value.trim()||`일반`,trainer:e.querySelector(`#mf-trainer`).value.trim()})});let t=this.querySelector(`[data-cancel]`);t&&t.addEventListener(`click`,()=>{this.onCancel?this.onCancel():window.location.href=this.cancelHref||`members.html`})},prefill(e){let t=e=>this.querySelector(`#${e}`);t(`mf-name`)&&(t(`mf-name`).value=e.name||``),t(`mf-gender`)&&(t(`mf-gender`).value=e.gender||``),t(`mf-goal`)&&(t(`mf-goal`).value=e.goal||``),t(`mf-trainer`)&&(t(`mf-trainer`).value=e.trainer||``)}});