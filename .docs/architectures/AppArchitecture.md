# 애플리케이션 아키텍처

## 모듈 구조

JS는 **ES Modules**(`<script type="module">`)로 로드된다. 각 페이지는 진입점 모듈 하나만 `<script>` 태그로 로드하고, 나머지 의존성은 `import`/`export`로 모듈 그래프가 자동 구성된다. 페이지마다 공용 모듈을 수동 로드할 필요가 없다.

### 공용 기초 모듈 (임포트 그래프의 잎)

| 모듈              | 내보내기 | 책임                                 | 의존                      |
| ----------------- | -------- | ------------------------------------ | ------------------------- |
| `utils-array.js`  | `ARR`    | 배열 합계·0 배열                     | 없음                      |
| `utils-string.js` | `STR`    | 날짜 포맷·숫자 2자리                 | 없음                      |
| `validation.js`   | `VAL`    | 수치 파싱·NaN 판별·범위 clamp        | 없음                      |
| `constants.js`    | 상수     | 마법 숫자 중앙화 (점수·임계점·총점)  | 없음                      |
| `UI.js`           | `UI`     | DOM 조회·내용 설정·클래스 토글       | 없음                      |
| `states.js`       | `STATE`  | 평가 점수 배열·총점·초기화 단일 소스 | `ARR`, `VAL`, `constants` |

### 평가 공용 모듈

| 모듈                 | 내보내기                                                               | 용도                                                                    | 의존                                                                                               |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `assessment-data.js` | `ASSESSMENT_ITEMS`                                                     | 베이직 펑션 평가 7개 항목 데이터 (basic·checkday 공용)                  | 없음                                                                                               |
| `vo2.js`             | `VO2_NORMS`, `calcVo2Value`, `getVo2Grade`                             | VO₂ Max 공식·정상치·등급 산정                                           | 없음                                                                                               |
| `grade.js`           | `getGradeMeta`                                                         | 총점 → 등급 라벨 산정                                                   | `constants`                                                                                        |
| `grade-styles.js`    | `GRADE_STYLES`, `VO2_GRADE_STYLES`, `getScoreColor`                    | 등급·VO₂ 라벨 스타일 공용                                               | 없음                                                                                               |
| `inbody.js`          | `generateInbodyTags`, `updateInbodyTags`                               | 인바디 수치 → 상태 태그 분류·갱신                                       | `UI`                                                                                               |
| `evaluation.js`      | `evals`, `renderBasicFunctionCards`, `adj`, `toggleBasicFunctionDetail`, `calcVo2`, `updateTotal` | 베이직 펑션 평가 목록·카드 빌드·점수/등급/총점 갱신                     | `assessment-data`, `arr`, `validation`, `UI`, `STATE`, `constants`, `vo2`, `grade`, `grade-styles` |
| `feedback.js`        | `appendCheckMovement`, `appendCheckMovementItemRow`, `renderCheckMovementCards`, `collectCheckMovementData` 등       | 체크동작 CRUD 등                                                       | `UI`                                                                                               |
| `report.js`          | `openReportModal`, `copyReportToClipboard`                             | 리포트 조립·클립보드 복사 (공용 포맷터 `formatEvalLine`/`formatFbLine`) | `UI`, `STATE`, `evaluation`, `feedback`                                                            |

### 화면 진입점 (엔트리 모듈)

| 모듈          | 대상 화면                          | 역할                                                                      |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| `checkday.js` | `checkday_1/2.html`                | 상담지 시작점 — 날짜 표기·초기화 오케스트레이션·인라인 핸들러 window 노출 | `STR`, `UI`, `STATE`, `evaluation`, `feedback`, `report`, `inbody`                 |
| `basic.js`    | `basic_function_assessment_2.html` | 베이직 펑션 전용 — 항목·체크·VO₂·점수/등급·리포트                         | `assessment-data`, `arr`, `val`, `UI`, `vo2`, `grade`, `grade-styles`, `constants` |
| `members.js`  | `members.html`                     | 회원 관리 — mock 목록·검색·등록·제거                                      | `UI`, `VAL`, `STR`                                                                 |

> 참고: 인라인 `onclick`/`oninput` 핸들러는 전역 스코프에서 해석되므로, 진입점 모듈이 필요한 함수를 `window`에 노출한다.

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
