# AquaFantasia v2.1.4

## v2.1.4 변경사항

- 버전을 `2.1.4`로 올리고 `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version, `README.md`를 동기화했습니다.
- 시작 화면의 `이 기기에 로그인 유지` 버튼을 기존 구형 체크 이미지 느낌에서 일반 아쿠아 버튼 계열의 말끔한 토글 버튼으로 재정리했습니다.
- 토스트 팝업은 런타임에서 생성하지 않도록 비활성화하고 `#toast-root`도 화면/터치 흐름에서 제거했습니다.
- 모든 메뉴 페이지, 팝업, 캐릭터/건물/건설/개척 카드가 같은 밝은 아쿠아 카드 규칙을 공유하도록 `v214-aqua-ui-unified-root`를 추가했습니다.
- 메뉴/팝업 본문은 하나의 안정된 스크롤 루트를 유지하고, 카드 바깥 딤/블러, 우측 상단 원형 X 버튼, 버튼 높이와 텍스트 말줄임 규칙을 공통화했습니다.
- 낚시게임 화면은 `v214-fishing-polish-screen` 기준으로 HUD, 장비바, 최근 포획, 캐스팅 버튼, 릴링 콘솔, 입질 콜아웃을 다시 정렬했습니다.
- 낚시 화면의 구형 프레임 이미지/스프라이트 잔상은 숨기고, 밝은 아쿠아 카드 스타일과 명확한 감기/풀기 버튼을 우선 표시하도록 보강했습니다.
- `tools/check-v214-aqua-ui-unification.mjs`를 추가하고 `npm run validate`에 연결해 버전 동기화, 토스트 비활성화, 공통 아쿠아 UI 루트, 로그인 유지 버튼, 낚시 화면 정돈, 패키지 청결을 검사합니다.
- 캐릭터 방향 로직은 수정하지 않았습니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- v2.1.4 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.3 통파일에 v2.1.4 패치 ZIP을 그대로 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`를 포함하지 않습니다.
- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- `package.json`/`package-lock.json`에 `packages.applied-caas`, `applied-caas-gateway`, `10.192.`, `internal.api.openai` 문자열이 없어야 합니다.
