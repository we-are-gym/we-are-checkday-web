# 배포 아키텍처

## 개요

- 빌드 단계는 따로 없습니다.
- 테스트 환경은 기트허브 페이지로 호스팅됩니다.
- 운영 환경은 클라우드플레어 페이지로 호스팅됩니다.
- 진입점은 `index.html`입니다.

## 캐시 버전 관리

- 정적 서빙 환경에서 브라우저가 이전 CSS·진입 스크립트를 캐시해 최신 코드가 반영되지 않는 문제를 막기 위해,
  각 화면 HTML의 `<link rel="stylesheet">`·`<script type="module">` 태그에 `?v=YYYYMMDD` 캐시 버전 쿼리를 붙인다.
- 코드를 바꾼 뒤에는 다음 명령으로 모든 화면의 버전을 오늘 날짜로 일괄 갱신한다:
  `node scripts/bump-version.mjs [YYYYMMDD]` (인자 없으면 오늘 날짜)
- 레거시 화면(`checkday_1.html`·`basic_function_assessment_2.html`)은 변경 대상에서 제외한다.

## URL

- 테스트 환경으로 배포된 웹UI URL은 `https://<기트허브조직>.github.io/<기트허브저장소>`입니다.

<!-- EOF -->