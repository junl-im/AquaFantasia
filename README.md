# AquaFantasia v2.1.22

## v2.1.22 변경사항

- 버전을 `2.1.22`로 동기화했습니다.
- 게임 시작 오프닝 영상은 **최초 시작 로딩 전용**으로 분리했습니다.
  - 홈 버튼, 메뉴 닫기 X, 팝업 닫기, 일반 화면 전환에서는 오프닝 영상이 다시 호출되지 않습니다.
  - `openingIntroPending` / `openingIntroShown` 상태로 최초 부팅 오프닝과 일반 마을 복귀를 분리했습니다.
- 오프닝 영상 위에 보이던 큰 프레임/테두리성 오버레이를 제거했습니다.
  - 영상은 풀화면으로 보이고, 상단의 작은 아쿠아 말풍선 메시지만 남습니다.
  - 영상 실패 시 poster/fallback 구조는 유지합니다.
- 플레이어 캐릭터 방향 오류를 수정했습니다.
  - `3시 방향`이 `9시 방향` 이미지로 보이던 cardinal remap을 제거했습니다.
  - `east → east`, `west → west`를 검증으로 고정했습니다.
  - 기존 1시/11시 대각선 보정은 유지했습니다.
- 플레이어 걷기 모션을 다시 보이도록 보강했습니다.
  - 8방향 × 4프레임 = 32프레임 유지
  - 이동 중 프레임 순환을 더 빠르게 보이도록 조정
  - 프레임 전환 시 스케일도 다시 계산해 이미지 전환이 무시되지 않게 했습니다.
- `V2122_PLAYER_CARDINAL_MOTION_LOCK` 검증 잠금을 추가했습니다.
- 조이스틱은 기본 상태 중앙, 조작 중 이동 구조를 유지합니다.
- 홈 / 가방 / 퀘스트 / 지도 우측 하단 메뉴는 v2.1.21 크기감을 유지하면서 화면 전환 라우팅 안정성을 보강했습니다.
- 가방, 퀘스트, 지도, 상점, 건설, 개척, 캐릭터 정보창, 건물 정보창, 종료 팝업의 공통 아쿠아 카드 스타일을 다시 묶었습니다.
- `이 기기에서 로그인 유지` 토글은 승인된 상태 그대로 고정했습니다.
  - 이미지 배경을 다시 입히지 않습니다.
  - 작고 얇은 CSS 아쿠아 토글과 `✓` 체크 표시를 유지합니다.
- 신규 v2.1.10 에셋과 v2.1.20 오프닝 MP4 최적화본은 유지합니다.
- 캐릭터 방향 핵심 로직 이름은 유지했습니다.
  - `ACTOR_DIRECTION_TEXTURE_FIX`
  - `ACTOR_DIRECTION_TEXTURES`
  - `actorDirectionFromVector`
  - `actorTextureUrl`
  - `actorDirectionQaPasses`

## 검증 기준

- v2.1.22 작업본에서 `npm run validate`가 통과해야 합니다.
- v2.1.22 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.21 통파일에 v2.1.22 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version이 `2.1.22`로 동기화되어야 합니다.
- 루트 Markdown은 `README.md` 하나만 유지합니다.
- `node_modules`, `dist`, `reports`, `*_NOTES.md`, `.log`, 백업 폴더는 ZIP에 포함하지 않습니다.
- `package-lock.json`과 핵심 파일에는 금지 registry/internal 문자열이 없어야 합니다.
