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
