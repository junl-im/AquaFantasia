# AquaFantasia v2.1.25

## v2.1.25 변경사항

- 버전을 `2.1.25`로 동기화했습니다.
- 게임 시작 오프닝 영상 위에 계속 보이던 큰 테두리/구형 프레임을 제거했습니다.
  - 오프닝 섹션에서 레거시 `v2097-village-loading`, `v2111-village-loading` 클래스를 분리했습니다.
  - `v2125-opening-cinematic`은 영상, 비네트, 말풍선, 스킵 버튼만 표시합니다.
  - 오프닝은 계속 최초 게임 시작 로딩 전용이며 홈/닫기/메뉴 복귀와 연결하지 않습니다.
- 플레이어 캐릭터 3시/9시 방향을 다시 고정했습니다.
  - 3시 이동은 `east` 프레임을 사용합니다.
  - 9시 이동은 `west` 프레임을 사용합니다.
  - 1시/11시 대각선 보정은 유지합니다.
  - `V2125_DIRECTION_MOTION_LOCK`을 추가했습니다.
- 플레이어 걷기 모션이 사라지는 원인을 수정했습니다.
  - 조이스틱 이동 직후 `updateActor(player)`가 빈 경로 처리로 다시 idle frame 01을 덮어쓰던 흐름을 끊었습니다.
  - 조이스틱 이동 중에는 `movePlayerByJoystick()`만 플레이어 위치/방향/걷기 프레임을 처리합니다.
  - 8방향 × 4프레임, 총 32프레임은 계속 검증합니다.
- 우측 상단 메뉴바를 조정했습니다.
  - 전체를 감싸는 테두리/배경을 투명화했습니다.
  - 아이콘 간 간격을 조금 넓혔습니다.
  - 버튼 아이콘 잘림과 상단 잔상 pseudo 요소를 차단했습니다.
  - 순서는 `+ / -`, `건설 / 원점`, `상점 / 출항`을 유지합니다.
- 우측 하단 메뉴바를 미세 확대했습니다.
  - 홈 / 가방 / 퀘스트 / 지도 아이콘을 조금 키웠습니다.
  - 눌렀을 때 버튼이 밀리거나 지도 버튼이 흔들리지 않도록 고정했습니다.
- 조이스틱은 기본 상태만 중앙이고, 조작 중에는 `--v2125-joystick-transform`으로 정상 이동합니다.
- 가방, 퀘스트, 지도, 상점, 건설, 개척, 캐릭터 정보창, 건물 정보창, 종료 팝업의 공통 아쿠아 카드 가독성 규칙을 유지했습니다.
- 낚시 화면은 마을 하단 메뉴가 붙지 않도록 유지하고, 구형 릴 프레임/장식 소품이 화면을 덮지 않도록 계속 차단합니다.
- 로그인 유지 토글은 마음에 든 현재 스타일을 계속 고정했습니다.
  - 이미지 배경을 다시 넣지 않습니다.
  - 작고 얇은 CSS 아쿠아 토글과 `✓` 표시만 사용합니다.
- 캐릭터 방향 계산 함수 자체는 수정하지 않았습니다.
  - `ACTOR_DIRECTION_TEXTURE_FIX`
  - `ACTOR_DIRECTION_TEXTURES`
  - `actorDirectionFromVector`
  - `actorTextureUrl`
  - `actorDirectionQaPasses`
  위 토큰은 계속 검증합니다.

## 검증 기준

- v2.1.25 작업본에서 `npm run validate`가 통과해야 합니다.
- v2.1.25 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.24 통파일에 v2.1.25 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version이 `2.1.25`로 동기화되어야 합니다.
- 루트 Markdown은 이 `README.md` 하나만 유지합니다.
- `node_modules`, `dist`, `reports`, 백업 폴더, `.log`, `*_NOTES.md`는 ZIP에 포함하지 않습니다.
- 금지 registry/internal 문자열은 포함하지 않습니다.
