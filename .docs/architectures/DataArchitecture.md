# 데이터 아키텍처

본 문서는 『위아짐 체크데이』 웹애플리케이션의 데이터 모형, 상태 구조, 데이터 흐름, 영속성 전략 및 제약 조건을 기술한다.

## 상태 구조

평가 화면(checkday)은 `STATE`(단일 소스)가 평가 점수를 관리한다.

- `STATE.init(count, max)` — `count`만큼 0점 배열 + 총점 상한(`max`) 초기화
- `STATE.get(i)` / `STATE.set(i, v)` — 점수 조회·설정(set 시 0~3 clamp)
- `STATE.total()` — 합계, `STATE.reset()` — 전부 0
- `STATE.all()` — 배열 참조

회원 관리(`members.js`)는 `MOCK_MEMBERS`에서 복제한 `members` 배열을 메모리 상태로 유지하며, 재로딩 시 초기 목록으로 복원된다.

## 영속성

현재 **영속 저장소 없음** — 모든 상태는 브라우저 메모리(mock/세션)에만 존재한다. 새로고침 시 회원 변경분이 초기값으로 되돌아간다. (추후 `localStorage`/백엔드 연동 시 확장 예정)

<!-- EOF -->