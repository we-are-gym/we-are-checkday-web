// 파일 용도: DataTable 컴포넌트 Storybook 스토리
import "./data-table.js";

export default {
	title: "Shared/ui-data-table",
	tags: ["autodocs"],
};

/** 기본 테이블 */
export const Default = {
	render() {
		return `
			<ui-data-table
				columns='[{"key":"name","label":"이름"},{"key":"age","label":"나이"},{"key":"city","label":"도시"}]'
				rows='[{"name":"홍길동","age":30,"city":"서울"},{"name":"이순신","age":40,"city":"인천"},{"name":"강감찬","age":35,"city":"부산"}]'
			></ui-data-table>`;
	},
};

/** 빈 테이블 */
export const Empty = {
	render() {
		return `<ui-data-table columns='[{"key":"name","label":"이름"}]' rows='[]'></ui-data-table>`;
	},
};

/** 열 정렬·줄무늬 해제·포인터 커서 — 회원 목록 화면과 동일한 시각 계약 데모 (align-* 는 data-table.css 구현) */
export const AlignNoStripe = {
	render() {
		return `
			<ui-data-table
				striped="false"
				columns='[{"key":"name","label":"이름","align":"center"},{"key":"trainer","label":"담당 트레이너","align":"center"},{"key":"count","label":"체크 횟수","align":"center"},{"key":"action","label":"관리","align":"right"}]'
				rows='[{"name":"홍길동","trainer":"김코치","count":"3회","action":"삭제"},{"name":"이순신","trainer":"박코치","count":"1회","action":"삭제"}]'
			></ui-data-table>`;
	},
};
