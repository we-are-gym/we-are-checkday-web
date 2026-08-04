# 애플리케이션 아키텍처

## 모듈 구조

JS는 **ES Modules**(`<script type="module">`)로 로드된다. 각 페이지는 진입점 모듈 하나만 `<script>` 태그로 로드하고, 나머지 의존성은 `import`/`export`로 모듈 그래프가 자동 구성된다. 페이지마다 공용 모듈을 수동 로드할 필요가 없다.

### 공용 인프라 모듈 (임포트 그래프의 잎·화면 공용)

| 모듈                   | 내보내기                      | 책임                                                               | 의존                      |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------ | ------------------------- |
| `store.js`             | `createStore`                 | 관찰자 패턴 GUI 상태 스토어 — `getState`/`setState`/`subscribe`    | 없음                      |
| `component-factory.js` | `defineComponent`             | 순수 함수형 컴포넌트 + 네이티브 웹 컴포넌트(light DOM) 팩토리      | 없음                      |
| `templates.js`         | `TPL`, `escapeHtml`           | 바닐라JS 템플릿 함수 — 화면 공용 HTML 조각 (카드·행·헤더·GNB·모달) | 없음                      |
| `auth.js`              | `isAuthed`, `login`, `logout` | 세션 기반 데모 로그인 상태                                         | 없음                      |
| `utils-array.js`       | `ARR`                         | 배열 합계·0 배열                                                   | 없음                      |
| `utils-string.js`      | `STR`                         | 날짜 포맷·숫자 2자리                                               | 없음                      |
| `validation.js`        | `VAL`                         | 수치 파싱·NaN 판별·범위 clamp                                      | 없음                      |
| `constants.js`         | 상수                          | 마법 숫자 중앙화 (점수·임계점·총점)                                | 없음                      |
| `UI.js`                | `UI`                          | DOM 조회·내용 설정·클래스 토글·이벤트 위임                         | 없음                      |
| `states.js`            | `STATE`                       | 평가 점수 배열·총점·초기화 단일 소스                               | `ARR`, `VAL`, `constants` |

### 앱 상태·정적 스토어 (관찰자 패턴, sessionStorage mock 영속화)

| 모듈              | 내보내기                                           | 상태                                        | 저장 키               |
| ----------------- | -------------------------------------------------- | ------------------------------------------- | --------------------- |
| `member-store.js` | `memberStore`                                      | 회원 목록 5명 시드                          | `checkday.members.v1` |
| `record-store.js` | `recordStore`                                      | 체크기록 시드 6건(있음)                     | `checkday.records.v1` |
| `record-stats.js` | `sparkline`, `recordTotal`, `buildCompareTable` 등 | 기록 통계·스파크라인·비교 테이블(순수 함수) | —                     |

### 평가 공용 모듈 (레거시 체크데이 상담지·베이직 펑션)

| 모듈                 | 내보내기                                                                                                        | 용도                                                            | 의존                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `assessment-data.js` | `ASSESSMENT_ITEMS`, `ASSESSMENT_ITEMS_FULL`                                                                     | 움직임 평가 7개·8개(VO₂ 포함) 항목 데이터 (basic·checkday 공용) | 없음                                                                                               |
| `vo2.js`             | `VO2_NORMS`, `calcVo2Value`, `determineVO2Grade`                                                                | VO₂ Max 공식·정상치·등급 산정                                   | 없음                                                                                               |
| `grade.js`           | `getGradeMeta`                                                                                                  | 총점 → 등급 라벨 산정                                           | `constants`                                                                                        |
| `grade-styles.js`    | `GRADE_STYLES`, `VO2_GRADE_STYLES`, `getScoreColor`                                                             | 등급·VO₂ 라벨 스타일 공용                                       | 없음                                                                                               |
| `inbody.js`          | `generateInbodyTags`, `updateInbodyTags`                                                                        | 인바디 수치 → 상태 태그 분류·갱신                               | `UI`                                                                                               |
| `evaluation.js`      | `evals`, `renderBasicFunctionCards`, `adjustScore`, `toggleBasicFunctionDetail`, `updateVO2Disp`, `updateTotal` | 움직임 평가 카드 빌드·점수/등급/총점 갱신                       | `assessment-data`, `arr`, `validation`, `UI`, `STATE`, `constants`, `vo2`, `grade`, `grade-styles` |
| `feedback.js`        | `appendCheckMovement`, `appendCheckMovementItemRow`, `renderCheckMovementCards`, `collectCheckMovementData` 등  | 체크동작 CRUD 등                                                | `UI`                                                                                               |
| `report.js`          | `openReportModal`, `copyReportToClipboard`                                                                      | 리포트 조립·클립보드                                            | `UI`, `STATE`, `evaluation`, `feedback`                                                            |

### 웹 컴포넌트 (light DOM — `scripts/components/`)

| 컴포넌트       | 기능                                                     |
| -------------- | -------------------------------------------------------- |
| `app-header`   | 헤더 막대 — 로고·crumb·로그아웃(세션 해제 후 login.html) |
| `app-gnb`      | 주 메뉴(GNB) — aria-current로 활성 표시                  |
| `app-help`     | 내장 도움말 모달 — ESC·오버레이 클릭 닫기                |
| `member-table` | 회원 목록 표 — 행 선택/제거 콜백 위임                    |
| `member-form`  | 회원 등록 폼 (member-create 화면)                        |

### 화면 진입점 (엔트리 모듈)

| 모듈                | 대상 화면                          | 역할                                                                  |
| ------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| `index.js`          | `index.html`                       | 메인 — 배치·빠른 연결                                                 |
| `members.js`        | `members.html`                     | 회원 관리 — 목록·검색·제거·상세 이동 (member-store·record-store 구독) |
| `member-create.js`  | `member-create.html`               | 회원 등록                                                             |
| `member-detail.js`  | `member-detail.html`               | 회원 상세 — 정보 카드·스파크 라인·기록 목록·변화 분석 비교            |
| `check-doc-new.js`  | `check-doc-new.html`               | 체크기록 작성 — 상담지 폼 + `?memberID=` 프리필                       |
| `check-doc-view.js` | `check-doc-view.html`              | 체크기록 조회 — 읽기 전용 전체 보기                                   |
| `check-doc-edit.js` | `check-doc-edit.html`              | 체크기록 편집 — 기록 프리필·수정·저장                                 |
| `login.js`          | `login.html`                       | 데모 로그인 — 세션 기록·리로드 이동                                   |
| `checkday.js`       | `checkday_1.html`                  | 레거시 상담지 (무조치 유지)                                           |
| `basic.js`          | `basic_function_assessment_2.html` | 레거시 베이직 펑션 평가지                                             |
| `check-sessions.js` | `check-sessions.html`              | placeholder('준비중')                                                 |

> 이벤트는 `addEventListener` 위임 패턴(`UI.delegate`)으로 바인딩되며, 인라인 `onclick`·`oninput`과 `window` 오염은 사용하지 않는다.

## 화면 구성

정적 HTML 파일로 이루어진 MPA(상대 경로 링크 이동)이며 진입점은 `index.html`이다.

| 화면               | 파일                               | 컨테이너 최대 폭 | 비고                                                      |
| ------------------ | ---------------------------------- | ---------------- | --------------------------------------------------------- |
| 베이직 펑션 평가지 | `basic_function_assessment_2.html` | 640px            | 레거시 유지                                               |
| 체크데이 상담지    | `checkday_1.html`                  | 640px            | 레거시 유지                                               |
| 메인               | `index.html`                       | 640px            | 라우팅 허브 역할                                          |
| 로그인             | `login.html`                       | 650px            | 데모 로그인 (`checkday`/`1234`)                           |
| 회원 관리          | `members.html`                     | 640px            | 목록, 검색, 제거, 등록                                    |
| 회원 정보          | `member-detail.html`               | 960px            | 정보 카드, 변화 차트, 체크 기록, 변화 분석 (`?memberID=`) |
| 회원 등록          | `member-create.html`               | 640px            | 회원 등록 폼                                              |
| 회원 정보 편집     | `member-edit.html`                 | 640px            | 회원 정보 수정·저장 폼                                    |
| 체크기록 조회      | `check-doc-view.html`              | 720px            | 체크기록 읽기 전용 (`?docID=`)                            |
| 체크기록 작성      | `check-doc-new.html`               | 640px            | 체크기록 작성·저장 폼 (`?memberID=` 프리필)               |
| 체크기록 편집      | `check-doc-edit.html`              | 640px            | 체크기록 수정·저장 폼 (`?docID=`)                         |
| 체크회차 관리      | `check-sessions.html`              | 640px            | placeholder(『준비중』)                                   |

화면마다 컨테이너 최대 폭이 다를 수 있다.

## 상태 구조

- 평가 화면(checkday)은 `STATE`(단일 소스)가 평가 점수를 관리한다. (`init`/`get`/`set`/`getTotal`/`reset`)
- 회원·체크기록은 **관찰자 패턴 스토어**(`createStore`)로 관리한다. 화면은 `subscribe`로 구독해 상태가 바뀌면 재렌더링된다.
  - `memberStore` — `{ members, nextId }`
  - `recordStore` — `{ records, nextId }`
  - `record.duration.payload` — `{ name, session, trainer, ib, ibComment, scores[8], evalData[8], goals, goalMemo, feedbacks, consultMemo }`

## 영속성

API 미배포 상태라 **세션 mock**을 사용한다. 상태 변경 시 `sessionStorage`(키 `checkday.members.v1`·`checkday.records.v1`·`checkday.auth.v1`)에 직렬화해 브라우저 세션 동안 유지한다. 탭을 닫거나 시드가 손상되면 시드로 되돌아간다. (추후 `localStorage`/백엔드 연동 시 확장 예정)