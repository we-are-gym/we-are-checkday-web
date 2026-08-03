// 파일 용도: 회원 등록 화면(member-create.html) — member-form 제출 시 스토어에 추가 후 목록으로 이동
import { UI } from "./UI.js";
import { memberStore } from "./member-store.js";
import "./components/app-header.js";
import "./components/member-form.js";

const formEl = UI.byId("member-form");

formEl.onSubmit = (data) => {
	memberStore.setState((prev) => ({
		...prev,
		members: [...prev.members, { id: prev.nextId, ...data }],
		nextId: prev.nextId + 1,
	}));
	// 저장 후 회원 목록으로 이동
	window.location.href = "members.html";
};
