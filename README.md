# 체크데이

체크데이 웹 UI

## 명령어

```powershell
# 정적 서버 실행 (개발용 — CORS_ORIGINS에 허용된 포트)
bunx http-server -p 30010
# → http://localhost:30010

bunx http-server -p 30016
# → http://localhost:30016

# 캐시 버전 갱신 (모든 ?v= 쿼리 일괄 갱신)
uv run python tools/bump_version.py [YYYYMMDDHH]

# 린트 체크
# …

# 린트 체크 및 오토픽스
# …

# 정적 타입 체크
# …

# 자동화 테스트
# …
```

## 요구사항

- 적어도 화면 크기가 노트북 화면보다는 크거나 같아야 제대로 사용할 수 있다. 휴대기기처럼 작은 화면으로도 제대로 사용할 수 있으면 더 좋다.
- 버튼을 눌렀을 때 아무 응답이 없으면 안 됩니다.
- 클래스·메서드·함수·모듈·패키지·커밋 등의 SRP 원칙 위반 금지

## 코드 구조

### JS

- `ESM` 폴더 아래 ES Modules(`<script type="module">`) 로딩.
- 각 페이지는 진입점 모듈 하나만 로드하고 나머지는 `import`/`export` 모듈 그래프가 자동 구성.
- 모든 HTML은 `<script type="importmap">`(모듈 별칭)과 `<script type="module">`(진입점)만 사용한다. 레거시 화면(`checkday_1.html`·`basic_function_assessment_2.html`)도 동일 체계다.
- 정적 호스팅 캐시를 위해 각 화면의 스타일·진입 스크립트에 `?v=YYYYMMDDHH` 쿼리를 붙이며, `uv run python tools/bump_version.py [YYYYMMDDHH]`로 일괄 갱신한다.
- `ESM` 모듈은 책임에 따라 폴더로 나뉜다 (`importmap` 별칭: `@infra/`·`@tools/`·`@calc/`·`@gym/`·`@member/`·`@check-doc/`·`@shared/`):
  - `ESM/infra/` — 화면 무관 앱 인프라: `store.js`·`auth.js`·`constants.js`·`validation.js`·`templates.js`·`component-factory.js`·`components/`(app-header·app-gnb·app-help)
  - `ESM/tools/` — 재사용 순수 유틸: `utils-dom.js`·`utils-array.js`·`utils-string.js`·`utils-url.js`
  - `ESM/calc/` — 순수 계산·표현: `vo2.js`·`grade.js`·`grade-styles.js`
  - `ESM/gym/` — 체크데이 도메인(모형·상태): `inbody.js`·`inbody-data.js`·`basicFunction-store.js`
  - `ESM/member/` — 회원 도메인: `member-store.js`·`member-utils.js`·`components/`(member-table·member-form)
  - `ESM/check-doc/` — 체크기록 도메인: `record-store.js`·`record-utils.js`·`record-stats.js`·`record-rest.js`·`evaluation.js`·`feedback.js`·`check-form-events.js`·`check-form-payload.js`·`check-form-payload-core.js`·`session-report.js`·`assessment-data.js`·`basic-function-item.js`·`check-movement-store.js`·`check-movement-item.js`
  - `ESM/shared/components/` — 재사용 UI 컴포넌트 라이브러리

더 상세한 내용은 [애플리케이션 아키텍처](.docs/architectures/AppArchitecture.md) 문서를 참고하십시오.

### CSS

- `styles/colors.css`(공용 단일 다크 팔레트 + 코랄 포인트)와 `styles/font.css`(공용 글꼴)를 모든 페이지가 먼저 로드하고, 화면별 레이아웃(`layout-*.css`)을 뒤에 로드한다.
- 각 화면은 `:root` 색상·글꼴을 재정의하지 않는다.

## 코드 스타일

- 임포트 스타일:
  - 직계존속 꾸러미나 직계비속 꾸러미를 임포트하는 경우에는 상대 경로 임포트를 쓰십시오. 나머지 경우(직계 형제·자매 꾸러미 포함)는 절대 경로 임포트를 쓰십시오.
  - bare import 문법은 비표준이니까 쓰지 마십시오.
  - 순환 임포트는 쓰지 마십시오.
  - 임포트 폴백은 쓰지 마십시오.
- 파일마다 시작 부분에 그 파일의 용도를 밝히는 주석을 다십시오.
- 소스코드를 고치거나 작성할 때, 함수·메서드·클래스·모듈 따위는 JSDoc 문법을 써서 풀이하십시오.
- 주석은 한국어 합쇼체로 작성하십시오.
- 로그 메시지는 한국어 합쇼체로 작성하십시오.
- JavaScripty한 코드를 짜십시오.
- 자료형 힌트를 적극적으로 사용하십시오. 그치만 지역변수에는 꼭 필요한 만큼만 사용하십시오.
- `var` 키워드는 쓰지 사용하십시오. 대신 `const` 키워드랑 `let` 키워드를 사용하십시오.
- 적극적으로 `async`/`await` 문법을 사용하십시오.
- 변수 이름은 `camelCase`로 지으십시오.
- 상수 이름은 `SCREAMING_SNAKE_CASE`로 지으십시오.
- 프로퍼티 이름은 `camelCase`로 지으십시오.
- 함수나 메서드의 이름은 `camelCase`로 지으십시오.
- 클래스 이름은 `PascalCase`로 지으십시오.
- 다음 낱말은 JS 공동체 관례를 따르는 대신 전체를 대문자로 작성하십시오:
  - `ID`
  - `BMI`
  - `BFP`
  - `BMR`
  - `VO2`
  - `UI`
  - `API`
  - `HTML`
  - `JS`
  - `CSS`
  - `URL`
  - `CPAN`
  - `DTO`
  - `CORS`
  - `ESM`
- 예외·오류는 `try`/`catch` 문법을 써서 처리하십시오.

## 영속성

- 회원·체크기록은 **Mason API** (`checkday-rest-…run.app`)를 통해 GCP Datastore에 영속화된다.
- 모든 CRUD(Create/Read/Update/Delete)는 REST API 경유 — 로컬 `sessionStorage`에 의존하지 않는다.
- 2026-08-16: 웹 UI의 하드코딩 시드 데이터(`SEED_RECORDS` 26건)가 GCP 실제 DB로 마이그레이션 완료. 시드 데이터는 REST API 도구(`migrate_seed_data.py`) 내부에 임베딩되어 별도 관리.

## 참조 문서

- [AGENTS.md](AGENTS.md)
- [소프트웨어 아키텍처](.docs/architectures/SoftwareArchitecture.md)
- [애플리케이션 아키텍처](.docs/architectures/AppArchitecture.md)
- [배포 아키텍처](.docs/architectures/DeployArchitecture.md)

<!-- EOF -->
