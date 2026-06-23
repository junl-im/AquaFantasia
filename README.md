# AquaFantasia v2.1.3

## v2.1.3 변경사항

- 버전을 `2.1.3`으로 올리고 `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version, `README.md`를 동기화했습니다.
- `v213-aqua-ui-detail-root`와 `data-v213-aqua-ui-detail-polish-pass`를 추가해 v2.1.x 아쿠아 카드 UI 다듬기 라인을 이어갑니다.
- 시작 화면의 `이 기기에 로그인 유지` 체크 버튼을 더 넓고 크게 조정하고, 체크 표시가 선명하게 보이도록 보강했습니다.
- 왼쪽 위 HUD는 짧은 아쿠아 카드 형태를 유지하면서 `Lv.10+`, 긴 캐릭터명, 지역명 말줄임을 안정화했습니다.
- HUD 아래 개척 바의 높이, 폭, 텍스트 말줄임, 터치 영역을 다시 보정했습니다.
- 우측 상단 조작바는 2열 미니 아쿠아 메뉴바 기준을 유지하면서 버튼 높이, 아이콘 크기, 글자 간격, 클릭 우선순위를 세부 조정했습니다.
- 좌측 아래 조이스틱은 투명 아쿠아 패드 느낌을 유지하면서 하단 메뉴와 겹치지 않도록 크기와 z-index를 조정했습니다.
- 우측 아래 `홈 / 가방 / 퀘스트 / 지도` 메뉴바는 조이스틱 영역을 침범하지 않도록 최대 폭 계산과 라벨 말줄임을 강화했습니다.
- 캐릭터 정보창 스타일 기준으로 캐릭터/건물/건설/개척/일반 메뉴 카드의 밝은 아쿠아 카드, 바깥 딤/블러, 스크롤 루트, 닫기 X 위치를 다시 보정했습니다.
- 팝업/개척/건설창이 열렸을 때 조작바, 조이스틱, 하단 메뉴가 뒤에서 눌리지 않도록 포커스 차단과 흐림 처리를 강화했습니다.
- 구형 버튼 스프라이트, 과한 텍스트 그림자, 푸른 줄 잔상이 다시 보이지 않도록 주요 카드/버튼 배경 이미지를 제거하는 세부 차단 규칙을 추가했습니다.
- `tools/check-v213-aqua-ui-detail-polish.mjs`를 추가하고 `npm run validate`에 연결해 v2.1.3 버전 동기화, 세부 UI 루트, 로그인 유지 버튼, HUD/개척바/조작바/조이스틱/하단 메뉴바, 카드/닫기/스크롤, registry 오염 문자열, 패키지 청결을 검사합니다.
- 캐릭터 방향 로직은 수정하지 않았습니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- 통파일 ZIP과 패치 ZIP 모두 ZIP 무결성 검사를 통과해야 합니다.
- 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.2 통파일에 v2.1.3 패치 ZIP을 그대로 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`는 패키지에 포함하지 않습니다.
- `package.json`과 `package-lock.json`에는 `packages.applied-caas`, `applied-caas-gateway`, `10.192.`, `internal.api.openai` 문자열이 없어야 합니다.
