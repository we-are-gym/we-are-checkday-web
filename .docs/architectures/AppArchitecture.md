# 애플리케이션 아키텍처

## 모듈 구조

JS는 `<script>` 태그 전역 로딩(ESM 아님)이며, **의존성 순서에 따라 로드 순서가 결정**된다. 페이지마다 공용 모듈을 동일 순서로 먼저 로드하고 화면 전용 모듈을 뒤에 로드한다.

### 공용 기초 모듈 (의존성 순서로 로드)

| 모듈              | 전역    | 책임                                 | 의존         |
| ----------------- | ------- | ------------------------------------ | ------------ |
| `utils-array.js`  | `ARR`   | 배열 합계·0 배열                     | 없음         |
| `utils-string.js` | `STR`   | 날짜 포맷·숫자 2자리                 | 없음         |
| `validation.js`   | `VAL`   | 수치 파싱·NaN 판별·범위 clamp        | 없음         |
| `UI.js`           | `UI`    | DOM 조회·내용 설정·클래스 토글       | 없음         |
| `states.js`       | `STATE` | 평가 점수 배열·총점·초기화 단일 소스 | `ARR`, `VAL` |

### 도메인 모듈 (평가 화면 공용)

| 모듈                 | 용도                                                   | 의존                                                            |
| -------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| `assessment-data.js` | 움직임 평가 7개 항목 데이터 (basic·checkday 공용)      | 없음                                                            |
| `vo2.js`             | VO₂ Max 공식·정상치·등급 산정                          | 없음                                                            |
| `grade.js`           | 총점 → 등급 라벨 산정                                  | 없음                                                            |
| `inbody.js`          | 인바디 수치 → 상태 태그 분류·갱신                      | `UI`                                                            |
| `evaluation.js`      | 평가 목록 구성·카드 빌드·점수/등급/총점 갱신           | `ASSESSMENT_ITEMS`, `ARR`, `VAL`, `UI`, `STATE`, `vo2`, `grade` |
| `feedback.js`        | 피드백 CRUD·체크 행·데이터 수집                        | `ARR`, `UI`                                                     |
| `report.js`          | 리포트 조립·클립보드 복사                              | `UI`, `STATE`, `evaluation`, `feedback`                         |
| `checkday.js`        | 상담지 시작점 — 날짜 표기·초기화 오케스트레이션        | `STR`, `UI`, `STATE`, `evaluation`, `feedback`                  |
| `basic.js`           | 베이직 펑션 전용 — 항목 카드·체크·VO₂·점수/등급·리포트 | `ASSESSMENT_ITEMS`, `ARR`, `VAL`, `UI`, `STATE`, `vo2`, `grade` |
| `members.js`         | 회원 관리 — mock 목록·검색·등록·제거                   | `ARR`, `VAL`, `UI`                                              |

## 화면 구성

정적 HTML 파일로 이루어진 MPA(상대 경로 링크 이동)이며 진입점은 `index.html`이다.

| 화면               | 파일                                  | 비고                                                  |
| ------------------ | ------------------------------------- | ----------------------------------------------------- |
| 메인               | `index.html`                          | 로고·빠른 연결 카드                                   |
| 회원 관리          | `members.html`                        | 목록·검색·등록·제거 (mock 데이터, 메모리 상태)        |
| 회원 상세          | `member-detail.html`                  | placeholder('준비중') — 목록 행 클릭 시 `?ID=`로 이동 |
| 체크회차 관리      | `check-sessions.html`                 | placeholder('준비중')                                 |
| 체크데이 상담지    | `checkday_1.html` / `checkday_2.html` | 동일 상태·모듈 공유, 파일 자체는 각각 유지            |
| 베이직 펑션 평가지 | `basic_function_assessment_2.html`    | 베이직 7항목 + VO₂ Max Test                           |
