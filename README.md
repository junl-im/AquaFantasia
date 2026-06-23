# AquaFantasia v2.1.19

## v2.1.19 변경사항

- 버전을 `2.1.19`로 동기화했습니다.
- `v2119-opening-exit-character-ui-root`를 추가해 오프닝 로딩 연출, 게임 종료 팝업, 수정 캐릭터 프레임, 우측 하단 메뉴 크기, 물/땅 타일 밸런스를 한 레이어에서 보정했습니다.
- 현재 승인된 `이 기기에서 로그인 유지` 토글은 검증 고정했습니다. PNG/이미지 배경을 다시 입히지 않고, 작고 얇은 CSS 아쿠아 토글과 `✓` 체크만 유지합니다.
- 게임 시작 시 마을 로딩 화면을 풀화면 오프닝 애니메이션 느낌으로 변경했습니다. 딤 처리된 UI가 같이 뜨지 않고, `아쿠아 판타지아 마을에 아침이 밝아오고 있습니다.` 말풍선 메시지가 표시됩니다.
- 게임 나가기/종료 팝업은 구형 프레임 이미지가 겹쳐 보이지 않도록 공통 아쿠아 카드 스타일로 다시 정리했습니다. 우측 상단 `X` 닫기와 하단 선택 버튼만 사용합니다.
- 우측 하단 `홈 / 가방 / 퀘스트 / 지도` 메뉴바 아이콘을 아주 조금 키웠고, 눌렀을 때 버튼 폭이나 위치가 밀리지 않도록 `v2119-bottom-nav`로 고정했습니다.
- 우측 상단 `+ / -`, `건설 / 원점`, `상점 / 출항` 조작바는 v2.1.18보다 살짝 넓혀 아이콘 잘림을 줄였고, HUD는 안전 영역 안에서 조금 더 길게 보이도록 맞췄습니다.
- 마을 바닥 타일은 다시 색감 균형을 잡았습니다. `grass`, `sand`, `wood`에는 파란 sea tile을 넣지 않고, 신규 물 타일은 실제 `sea` 후보로만 사용합니다.
- 사용자가 수정해 준 캐릭터 ZIP을 비교해 플레이어 대각선 낚싯대 보정 프레임을 반영했습니다. 기존 8방향 방향 계산 로직은 건드리지 않고 이미지 파일만 교체했습니다.
- 교체 후 `V2119_PLAYER_MOTION_IMAGE_LOCK`과 검증 스크립트를 추가해 해당 플레이어 모션 이미지 세트가 다시 임의로 바뀌지 않도록 고정했습니다.
- 가방, 퀘스트, 지도, 상점, 건설, 개척, 캐릭정보창, 건물정보창의 아쿠아 카드 스타일과 글씨 번짐 방지 규칙을 유지했습니다.
- 낚시 화면은 마을 하단 메뉴가 붙지 않도록 유지하고, 기존 중앙 고정 릴/찌/감기/풀기 UI 제한을 유지했습니다.

## 검증 기준

- v2.1.19 작업본에서 `npm run validate`가 통과해야 합니다.
- v2.1.19 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.18 통파일에 v2.1.19 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version이 `2.1.19`로 동기화되어야 합니다.
- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`를 포함하지 않습니다.
- 내부 registry 오염 금지 문자열 검사를 통과해야 합니다.
- `ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses` 토큰은 유지합니다.
- `V2118_PLAYER_MOTION_LOCK`과 `V2119_PLAYER_MOTION_IMAGE_LOCK`을 유지합니다.
- v2.1.10 신규 에셋 278개와 v2.1.18/v2.1.19 캐릭터/타일 에셋 manifest를 유지합니다.
- GitHub Actions workflow `validate-and-deploy` 기준으로 검증 가능한 구조를 유지합니다.
