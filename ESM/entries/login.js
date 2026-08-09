// 파일 용도: 로그인 화면(login.html) — 폼 렌더·검증·로그인 상태 기록·이동 (데모 계정 checkday/1234)
import { byId, setHTML } from "@tools/utils-dom.js";
import { isAuthed, login } from "@infra/auth.js";
import { TPL } from "@infra/templates.js";
import "@infra/components/app-header.js";

/** 로그인 성공 후 이동 대상 (?redirect=, 기본 index.html) */
const redirect =
	new URLSearchParams(window.location.search).get("redirect") || "index.html";

// ── 시작 ──
setHTML("login-box", TPL.loginForm());
/** 로그인 폼 엘리먼트 */
const form = byId("login-form");
/** 오류 안내 문구 엘리먼트 */
const errEl = byId("login-error");

// 이미 로그인 상태면 바로 이동
if (isAuthed()) {
	window.location.replace(redirect);
} else {
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const id = byId("login-id").value.trim();
		const pw = byId("login-pw").value;
		if (!id || !pw) {
			errEl.textContent = "아이디와 비밀번호를 모두 입력하세요.";
			errEl.hidden = false;
			return;
		}
		if (id !== "checkday" || pw !== "1234") {
			errEl.textContent =
				"데모 계정이 올바르지 않습니다. (checkday / 1234)";
			errEl.hidden = false;
			return;
		}
		login();
		window.location.href = redirect;
	});
	byId("login-id").focus();
}
