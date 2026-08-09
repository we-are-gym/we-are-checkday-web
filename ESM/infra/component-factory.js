// 파일 용도: component-factory 재내보냄 — 단일 구현은 shared 컴포넌트 라이브러리가 보유한다.
// 결정: README의 "신규 컴포넌트 라이브러리(@shared/components) 소스코드를 우선 선택" 지침에 따라
//       @shared/components/base/component-factory.js를 단일 소스로 둔다. 이전 base 구현과 시그니처가
//       동일하므로 동작 회귀가 없다. (호환 shim — 폴더 재구성 시 제거 예정)
export { defineComponent } from "../shared/components/base/component-factory.js";
