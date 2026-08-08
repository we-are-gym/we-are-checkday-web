# 체크데이

체크데이 웹UI

## 요구사항

- 적어도 화면 크기가 노트북 화면보다는 크거나 같아야 제대로 사용할 수 있다. 휴대기기처럼 작은 화면으로도 제대로 사용할 수 있으면 더 좋다.
- 버튼을 눌렀을 때 아무 응답이 없으면 안 됩니다.

## 코드 구조

### JS

- `scripts` 폴더 아래 ES Modules(`<script type="module">`) 로딩.
- 각 페이지는 진입점 모듈 하나만 로드하고 나머지는 `import`/`export` 모듈 그래프가 자동 구성.
- 모든 HTML은 `<script type="importmap">`(모듈 별칭)과 `<script type="module">`(진입점)만 사용한다. 레거시 화면(`checkday_1.html`·`basic_function_assessment_2.html`)도 동일 체계다.
- 정적 호스팅 캐시를 위해 각 화면의 스타일·진입 스크립트에 `?v=YYYYMMDD` 쿼리를 붙이며, `node tools/bump-version.mjs [YYYYMMDD]`로 일괄 갱신한다.
- 다음 모듈은 공용이다:
  - 공용 인프라
    - `UI.js`
    - `auth.js`
    - `store.js`
    - `states.js`
    - `component-factory.js`
    - `constants.js`
    - `templates.js`
    - `validation.js`
    - `utils-array.js`
    - `utils-string.js`
    - `member-utils.js`
    - `record-utils.js`
    - `utils-url.js`
  - 상태 스토어
    - `member-store.js`
    - `record-stats.js`
    - `record-store.js`
  - 평가 공용 모듈
    - `inbody.js`
    - `vo2.js`
    - `session-report.js`
    - `assessment-data.js`
    - `feedback.js`
    - `evaluation.js`
    - `check-form-events.js`
    - `grade.js`
    - `grade-styles.js`

더 상세한 내용은 [애플리케이션 아키텍처](.docs/architectures/AppArchitecture.md) 문서를 참고하십시오.

### CSS

- `styles/colors.css`(공용 단일 다크 팔레트 + 코랄 포인트)와 `styles/font.css`(공용 글꼴)를 모든 페이지가 먼저 로드하고, 화면별 레이아웃(`layout-*.css`)을 뒤에 로드한다.
- 각 화면은 `:root` 색상·글꼴을 재정의하지 않는다.

## 코드 스타일

- 파일마다 시작 부분에 그 파일의 용도를 밝히는 주석을 다십시오.
- 소스코드를 고치거나 작성할 때, 함수·메서드·클래스·모듈 따위는 JSDoc 문법을 써서 풀이하십시오.
- 주석은 한국어 합쇼체로 작성하십시오.
- 로그 메시지는 한국어 합쇼체로 작성하십시오.
- 직계존속 꾸러미나 직계비속 꾸러미를 임포트하는 경우에는 상대 경로 임포트를 쓰십시오. 나머지 경우(직계 형제·자매 꾸러미 포함)는 절대 경로 임포트를 쓰십시오.
- bare import 문법은 비표준이니까 쓰지 마십시오.
- 순환 임포트는 쓰지 마십시오.
- 임포트 폴백은 쓰지 마십시오.
- JavaScripty한 코드를 짜십시오.
- 자료형 힌트를 적극적으로 쓰십시오. 그치만 지역변수에는 꼭 필요한 만큼만 쓰십시오.
- `var` 키워드는 쓰지 마십시오. 대신 `const` 키워드랑 `let` 키워드를 쓰십시오.
- 적극적으로 `async`/`await` 문법을 쓰십시오.
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
  - `DTO`
  - `CORS`
- 예외·오류는 `try`/`catch` 문법을 써서 처리하십시오.

## 영속성

- API 미배포 상태라 **세션 mock**을 사용한다. (추후 백엔드 API와 연동 예정)
- 상태 변경 시 `sessionStorage`(키 `checkday.members.v2`·`checkday.records.v3`·`checkday.auth.v1`)에 직렬화해 브라우저 세션 동안 유지한다.
- 탭을 닫거나 시드가 손상되면 시드로 되돌아간다.

<!-- EOF -->
