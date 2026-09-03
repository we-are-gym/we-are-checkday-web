// 파일 용도: 공용 GNB(글로벌 내비게이션) 컴포넌트 — 주요 메뉴 링크 제공 (전 화면 공용)
// 기법: 단일 컴포넌트 팩토리(base/component.js) + 네이티브 웹 컴포넌트 (light DOM 모드)
// 속성: active="members" 등 현재 메뉴 키 (해당 링크에 active 강조·aria-current 부여)
import { TPL } from "@infra/templates.js";
import { defineComponent } from "@shared/components/base/component.js";

defineComponent({
	tag: "app-gnb",
	/**
	 * GNB 메뉴 HTML을 생성한다 (active 속성에 해당하는 링크를 강조)
	 * @returns {string} GNB HTML
	 */
	render() {
		return TPL.gnb({ active: this.getAttribute("active") || "" });
	},
});
