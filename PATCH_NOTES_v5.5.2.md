# Aqua Fantasia v5.5.2 Runtime & CI Hotfix

## 핵심 수정

### 1. 게임 실행 오류 대응
- v5.5.1의 레거시 inline 낚시 루프 차단 런타임을 유지합니다.
- v5.5.2 `v552-ci-runtime-guard.js`를 추가해 브라우저 런타임 오류, Firebase 초기화 오류, 캐시 충돌 징후를 감지합니다.
- 오래된 Service Worker 캐시가 남아 있으면 `aqua-fantasia-v5.5.2-runtime-ci-hotfix-20260612` 기준으로 정리합니다.
- 모듈 URL을 `?v=5.5.2`로 갱신해 GitHub Pages/PWA 캐시 잔존 문제를 줄였습니다.

### 2. GitHub Actions Node 20 deprecation 경고 대응
- `.github/workflows/aqua-static-validate.yml`을 Node 24 기준으로 갱신했습니다.
- `actions/checkout@v6`, `actions/setup-node@v6`로 변경했습니다.
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`를 추가했습니다.
- `node-version: '24'`로 검증 런타임을 고정했습니다.
- package-lock이 없는 현재 프로젝트 구조에 맞춰 `npm install`을 유지하고, setup-node v6의 자동 package-manager cache는 비활성화했습니다.

### 3. 검증 스크립트 안정화
- `validate-static.mjs`가 v5.5.0만 허용하던 조건을 v5.5.x로 확장했습니다.
- `check-v53`, `check-v54`, `check-v55`, `check-v551`이 v5.5.2 메타/캐시 버전을 허용하도록 수정했습니다.
- 신규 `check-v552-ci-hotfix.mjs`를 추가했습니다.

## 적용 방법
1. 덮어쓰기 ZIP을 저장소 루트에 그대로 덮어씁니다.
2. GitHub Desktop에서 변경 파일을 커밋합니다.
3. GitHub Pages 배포 후 모바일 브라우저에서 한 번 새로고침합니다.
4. 문제가 남으면 게임 화면의 복구 배너에서 “캐시 정리 후 새로고침”을 누릅니다.
