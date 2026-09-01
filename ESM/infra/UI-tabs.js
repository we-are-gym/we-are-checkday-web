// 파일 용도: 탭 UI — role=tablist 규약(aria-selected·tabindex·방향키 이동)을 따르는 공용 탭 위젯
// 기법: setupTabs()가 탭 버튼 선택자·패널 매핑을 받아 이벤트를 배선하고 activate(tabName)를 반환한다.
// 사용: member-detail 화면(회원 상세)이 "records"/"compare" 탭 전환에 사용한다.
import { byId, queryAll } from "@tools/utils-dom.js";

/**
 * 탭 위젯 배선 — 클릭·방향키 이동 이벤트를 등록하고 activate 함수를 돌려준다.
 * @param {{ buttons?: string, panels?: Record<string, string> }} [opts]
 *   buttons: 탭 버튼 선택자 (기본 ".tab-btn", data-tab 속성이 탭 키)
 *   panels: 탭 키 → 패널 요소 id 매핑 (예: { records: "panel-records", compare: "panel-compare" })
 * @returns {{ activate: (tabName: string) => void }} activate — 탭 전환 함수
 */
export function setupTabs({ buttons = ".tab-btn", panels = {} } = {}) {
	const tabs = queryAll(buttons);

	/** 탭 전환 (role=tablist 규약: aria-selected·tabindex·패널 표시 관리)
	 * @param {string} tabName 활성화할 탭 키
	 * @returns {void}
	 */
	const activate = tabName => {
		tabs.forEach(btn => {
			const active = btn.dataset.tab === tabName;
			btn.setAttribute("aria-selected", String(active));
			btn.tabIndex = active ? 0 : -1;
		});
		for (const [tab, panelId] of Object.entries(panels)) {
			byId(panelId).hidden = tab !== tabName;
		}
	};

	/** 탭 키보드 방향키 이동 (role=tablist 규약)
	 * @param {KeyboardEvent} e 키보드 이벤트
	 * @returns {void}
	 */
	const onKeydown = e => {
		if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
		e.preventDefault();
		const idx = tabs.findIndex(t => t.dataset.tab === e.target.dataset.tab);
		const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
		activate(tabs[next].dataset.tab);
		tabs[next].focus();
	};

	tabs.forEach(btn => {
		btn.addEventListener("click", () => activate(btn.dataset.tab));
		btn.addEventListener("keydown", onKeydown);
	});

	return { activate };
}
