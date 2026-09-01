# 애플리케이션 아키텍처

## 모듈 구조

- JS는 **ES Modules**(`<script type="module">`)로 로드된다. 각 페이지는 진입점 모듈 하나만 `<script>` 태그로 로드하고, 나머지 의존성은 `import`/`export`로 모듈 그래프가 자동 구성된다. 페이지마다 공용 모듈을 수동 로드할 필요가 없다.
- 계층 구조나 클린 아키텍처 따위에 집착하지 마십시오.
- `ESM` 모듈은 책임에 따라 폴더로 나뉜다: `infra`(앱 인프라)·`tools`(재사용 유틸)·`calc`(순수 계산)·`gym`(체크데이 도메인)·`member`·`check-doc`·`shared/components` (importmap 별칭 `@infra/`·`@tools/`·`@calc/`·`@gym/`·`@member/`·`@check-doc/`·`@shared/`).

### 공용 인프라 모듈 (임포트 그래프의 잎·화면 공용)

| 모듈                     | 내보내기                                                                   | 책임                                                                               | 의존                                     |
| ------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| `store.js`               | `Store`                                                                    | 관찰자 패턴 GUI 상태 스토어 — `getState`/`setState`/`subscribe`                    | 없음                                     |
| `component-factory.js`   | `defineComponent`                                                          | 순수 함수형 컴포넌트 + 네이티브 웹 컴포넌트(light DOM) 팩토리                      | 없음                                     |
| `templates.js`           | `TPL`, `escapeHtml`                                                        | 바닐라JS 템플릿 함수 — 화면 공용 HTML 조각 (카드·행·도트·비교테이블·헤더·GNB·모달) | `utils-array`                            |
| `auth.js`                | `isAuthed`, `login`, `logout`                                              | localStorage 영속 로그인 상태                                                      | `token-storage` · `api-client`           |
| `utils-array.js`         | `sum`, `createZeroArray`                                                   | 배열 합계·0 배열                                                                   | 없음                                     |
| `utils-string.js`        | `pad2`, `today`                                                            | 날짜 포맷·숫자 2자리                                                               | 없음                                     |
| `utils-url.js`           | `getUrlParam`, `getNumberParam`                                            | URL 쿼리 파라미터 읽기 헬퍼 (문자열·숫자, 기본값 폴백)                             | 없음                                     |
| `validation.js`          | `parseToNum`, `anyNaN`, `clamp`                                            | 수치 파싱·NaN 판별·범위 clamp                                                      | 없음                                     |
| `constants.js`           | 상수                                                                       | 마법 숫자 중앙화 (점수·임계점·총점)                                                | 없음                                     |
| `utils-dom.js`           | `byId`, `queryOne`, `queryAll`, `setHTML`, `setText`, `toggle`, `delegate` | DOM 조회·내용 설정·클래스 토글·이벤트 위임                                         | 없음                                     |
| `basicFunction-store.js` | `createScoreState`, `scoreState`                                           | 평가 점수 배열·총점·평가 항목 단일 소스 (팩토리 + 전역 인스턴스)                   | `utils-array`, `validation`, `constants` |

### 앱 상태·정적 스토어 (관찰자 패턴, Mason API 연동 영속화)

| 모듈              | 상태                                                                           | 영속화                   |
| ----------------- | ------------------------------------------------------------------------------ | ------------------------ |
| `member-store.js` | 회원 목록 · 등록/정보 갱신 헬퍼 — Mason API CRUD 경유                          | GCP Datastore (REST API) |
| `record-store.js` | 체크기록 · CRUD 경유 (목록·작성·편집·삭제)                                     | GCP Datastore (REST API) |
| `record-utils.js` | 기록 조회·정렬·건수 순수 헬퍼 (단일 소스 — member-utils에 있던 기록 헬퍼 통합) | —                        |
| `record-stats.js` | 기록 통계·스파크라인·총점·비교 테이블(순수 함수)                               | —                        |

### 평가 공용 모듈 (레거시 체크데이 상담지·베이직 펑션)

| 모듈                   | 내보내기                                                                                                                                                                    | 용도                                                                                                       | 의존                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `assessment-data.js`   | `ASSESSMENT_ITEMS`, `ASSESSMENT_ITEMS_FULL`, `ASSESSMENT_ITEMS_BASIC5`, `itemsForRecord`, `resolveRecordItems`                                                              | 움직임 평가 7개·8개(VO₂) 항목 + 체크기록 작성용 5항목 + 기록별 항목 선택 헬퍼                              | 없음                                                                                                      |
| `vo2.js`               | `VO2_NORMS`, `calcVo2Value`, `determineVO2Grade`, `calcVo2Assessment`                                                                                                       | VO₂ Max 공식·정상치·등급 산정·입력 검증 조합                                                               | 없음                                                                                                      |
| `grade.js`             | `getGradeMeta`                                                                                                                                                              | 총점 → 등급 라벨 산정                                                                                      | `constants`                                                                                               |
| `grade-styles.js`      | `GRADE_STYLES`, `VO2_GRADE_STYLES`, `getScoreColor`                                                                                                                         | 등급·VO₂ 라벨 스타일 공용                                                                                  | 없음                                                                                                      |
| `inbody.js`            | `generateInbodyTags`, `updateInbodyTags`                                                                                                                                    | 인바디 수치 → 상태 태그 분류·갱신                                                                          | `UI`                                                                                                      |
| `evaluation.js`        | `configureEvaluation`, `getEvals`, `getScore`, `getTotal`, `getMax`, `renderBasicFunctionCards`, `adjustScore`, `toggleBasicFunctionDetail`, `updateVO2Disp`, `updateTotal` | 평가 항목 구성(화면별 5·8) 설정 + 카드 빌드·점수/등급/총점 갱신 (항목·만점은 scoreState Store가 단일 소스) | `assessment-data`, `validation`, `UI`, `states`, `templates`, `constants`, `vo2`, `grade`, `grade-styles` |
| `feedback.js`          | `appendCheckMovement`, `appendCheckMovementItemRow`, `renderCheckMovementCards`, `collectCheckMovementData` 등                                                              | 체크동작 CRUD 등                                                                                           | `UI`, `templates`                                                                                         |
| `check-form-events.js` | `setupCheckFormEvents`, `resetCheckForm`                                                                                                                                    | 상담지 폼 공용 이벤트 위임·인바디/목표 주입·전체 초기화                                                    | `UI`, `templates`, `constants`, `states`, `evaluation`, `inbody`, `feedback`                              |
| `report-collect.js`    | `collectReportData` 등                                                                                                                                                      | 세션 리포트 데이터 수집 — 폼 DOM·평가 상태 읽기                                                            | `evaluation`, `feedback`, `gym/inbody-data`, `UI`                                                         |
| `report-template.js`   | `sessionReport`, `SessionReport`, `buildReportHTML`, `buildReportText`                                                                                                      | 결과 요약 HTML·텍스트 조립, 세션 리포트 모달·클립보드 복사                                                 | `report-collect`, `UI`                                                                                    |

### 회원 상세 화면 모듈 (member-detail 분할 — `ESM/member/`·`ESM/infra/`)

| 모듈                  | 내보내기                                                          | 용도                                                              | 의존                                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `member-view.js`      | `getRecords`, `renderRecords`, `refreshRecords`, `init`, `goView` | 회원 상세 조회·화면 조립 — 데이터 로드와 렌더 조합, 진입점이 호출 | `member-info-card`, `charts`, `checkdoc-compare`, `export-image`, `record-store`, `record-utils`, `member-store`, `member-utils`, `templates`, `record-stats`, `utils-array`, `utils-dom` |
| `member-info-card.js` | `renderInfoCard`                                                  | 회원 정보 카드 렌더링 (스토어 비의존 — member·recordCount 주입)   | `member-utils`, `utils-dom`                                                                                                                                                               |
| `charts.js`           | `renderStatCards`                                                 | 변화 차트 — 지표별 스파크라인·누적 델타 카드                      | `record-stats`, `templates`, `utils-dom`                                                                                                                                                  |
| `checkdoc-compare.js` | `fillCompareSelects`, `renderCompare`                             | 체크기록 회차 비교 테이블                                         | `record-stats`, `record-utils`, `utils-dom`                                                                                                                                               |
| `export-image.js`     | `exportMemberDetailPNG`, `downloadPdf`                            | 화면 PNG 캡처·PDF 다운로드                                        | `api-client`, `member-store`, `member-utils`, `utils-dom`                                                                                                                                 |
| `UI-tabs.js`          | `setupTabs`                                                       | 탭 위젯 — role=tablist 규약(aria-selected·방향키 이동) 배선       | `utils-dom`                                                                                                                                                                               |

### 웹 컴포넌트 (light DOM — `ESM/infra/components/`·`ESM/member/components/`)

| 컴포넌트       | 기능                                                     |
| -------------- | -------------------------------------------------------- |
| `app-header`   | 헤더 막대 — 로고·crumb·로그아웃(세션 해제 후 login.html) |
| `app-gnb`      | 주 메뉴(GNB) — aria-current로 활성 표시                  |
| `app-help`     | 내장 도움말 모달 — ESC·오버레이 클릭 닫기                |
| `member-table` | 회원 목록 표 — 행 선택/제거 콜백 위임                    |
| `member-form`  | 회원 등록 폼 (member-create 화면)                        |

### 화면 진입점 (엔트리 모듈)

| 모듈               | 대상 화면            | 역할                                                                  |
| ------------------ | -------------------- | --------------------------------------------------------------------- |
| `index.js`         | `index.html`         | 메인 — 배치·빠른 연결                                                 |
| `members.js`       | `members.html`       | 회원 관리 — 목록·검색·제거·상세 이동 (member-store·record-store 구독) |
| `member-create.js` | `member-create.html` | 회원 등록                                                             |
| `member-edit.js`   | `member-edit.html`   | 회원 정보 수정·저장                                                   |

| `member-detail.js`            | `member-detail.html`               | 회원 상세 화면 조립자 — memberID 파싱·UI 이벤트 배선·초기 렌더 트리거 (조회·카드·차트·비교·탭·내보내기는 분할 모듈 위임)|
| `check-form-new.js`           | `check-doc-new.html`               | 체크기록 작성 — 베이직 펑션 5항목·15점, 회원 이름 통합·회차 자동계산(N+1) + `?memberID=` 프리필 |
| `check-doc-view.js`           | `check-doc-view.html`              | 체크기록 조회 — 읽기 전용 전체 보기 (5·8항목 기록별 맞춤)                                       |
| `check-doc-edit.js`           | `check-doc-edit.html`              | 체크기록 편집 — 기록 항목 구성(5·8)에 맞춰 프리필·수정·저장                                     |
| `login.js`                    | `login.html`                       | 데모 로그인 — 세션 기록·리로드 이동                                                             |
| `checkday.js`                 | `checkday_1.html`                  | 레거시 상담지 (무조치 유지)                                                                     |
| `basicFunction-assessment.js` | `basic_function_assessment_2.html` | 레거시 베이직 펑션 평가지                                                                       |

> 이벤트는 `addEventListener` 위임 패턴(`delegate`(utils-dom.js))으로 바인딩되며, 인라인 `onclick`·`oninput`과 `window` 오염은 사용하지 않는다.

## 화면 구성

정적 HTML 파일로 이루어진 MPA(상대 경로 링크 이동)이며 진입점은 `index.html`이다.

| 화면               | 파일                               | 컨테이너 최대 폭 | 비고                                                                         |
| ------------------ | ---------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| 베이직 펑션 평가지 | `basic_function_assessment_2.html` | 640px            | 레거시 유지                                                                  |
| 체크데이 상담지    | `checkday_1.html`                  | 640px            | 레거시 유지                                                                  |
| 메인               | `index.html`                       | 640px            | 라우팅 허브 역할                                                             |
| 로그인             | `login.html`                       | 650px            | 데모 로그인 (`checkday`/`1234`)                                              |
| 회원 관리          | `members.html`                     | 640px            | 목록, 검색, 제거, 등록                                                       |
| 회원 정보          | `member-detail.html`               | 960px            | 정보 카드, 변화 차트, 체크 기록, 변화 분석 비교, PNG 내보내기 (`?memberID=`) |
| 회원 등록          | `member-create.html`               | 640px            | 회원 등록 폼                                                                 |
| 회원 정보 편집     | `member-edit.html`                 | 640px            | 회원 정보 수정·저장 폼                                                       |
| 체크기록 조회      | `check-doc-view.html`              | 720px            | 체크기록 읽기 전용 (`?docID=`)                                               |
| 체크기록 작성      | `check-doc-new.html`               | 640px            | 베이직 펑션 5항목·15점, 회원 이름 통합, 회차 자동계산 (`?memberID=` 프리필)  |
| 체크기록 편집      | `check-doc-edit.html`              | 640px            | 체크기록 수정·저장 폼 (`?docID=`) — 상담일 편집 가능·회원명 읽기 전용        |

화면마다 컨테이너 최대 폭이 다를 수 있다.

## 상태 구조

- 평가 화면(checkday)은 `STATE`(단일 소스)가 평가 점수를 관리한다. (`init`/`get`/`set`/`getTotal`/`reset`)
- 회원·체크기록은 **관찰자 패턴 스토어**(`Store`)로 관리한다. 화면은 `subscribe`로 구독해 상태가 바뀌면 재렌더링된다.
  - `memberStore` — `{ members, loading, error }` (API 연동, 회원 목록은 서버에서 로드)
  - `recordStore` — `{ records, loading, error }` (API 연동, 체크기록은 서버에서 로드)
  - `record.payload` — `{ session(회차, 예: "3회차"), trainer, ib, ibComment, scores[BasicFunctionsCount], items[BasicFunctionsCount], evalData[BasicFunctionsCount], goals(고정 태그만 — 추가 목표 커스터마이징 미지원), goalMemo, feedbacks, consultMemo }`
  - 회원 이름은 `record.memberId → memberStore.members` 참조로 해석한다. 회원 정보 편집 화면에서 회원명을 바꾸면 체크데이 조회 화면과 체크데이 편집 화면에도 즉시 반영된다.

## 체크기록 편집 화면 규칙 (check-doc-edit)

- 회원 이름(`#m-name`)은 **읽기 전용** — 회원 정보 화면(member-edit)에서만 변경 가능하며, 체크기록 조회·편집 화면은 memberId 참조로 변경된 이름이 즉시 반영된다.
- 상담일(`#m-date`)은 **편집 가능** — 저장 시 기록 레벨 `date`에 반영된다 (`check-doc-edit.js saveRecord`).

## 접근성·타입·컴포넌트 지침

- `aria-*`를 적극적으로 사용하십시오.
  - `aria-label` 및 `aria-required` - 입력 필드
  - `role="alert"` -오류 메시지
  - `role="tab"`, `aria-selected`, `aria-controls` - 탭
  - `aria-live`
  - `aria-pressed`
  - …
- 공용 타입 정보는 JSDoc으로 문서화하십시오.
  - 코드 편집기의 타입 추론을 위하여 `@param {import("@infra/store.js").CheckRecord}`처럼 참조형 타입을 사용하십시오.
- 舊 컴포넌트 라이브러리보다 新 컴포넌트 라이브러리(`@shared/components`)의 소스코드를 우선적으로 선택하여 사용하십시오.
