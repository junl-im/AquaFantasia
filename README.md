# AquaFantasia v2.1.5

## v2.1.5 변경사항

- 버전을 `2.1.5`로 올리고 `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version, `README.md`를 동기화했습니다.
- 최하단 메뉴바가 화면 전체 폭으로 보정되거나 중앙/좌측으로 밀리는 문제를 막기 위해 `v2098-bottom-nav` 전용 우측 하단 고정 보정 로직을 추가했습니다.
- `repairBottomNavBounds()`가 최신 우측 하단 메뉴바를 과거 전체폭 하단 도크처럼 강제 보정하지 않도록 분기했습니다.
- `v215-ui-hitbox-menu-fix-root`를 추가해 `홈 / 가방 / 퀘스트 / 지도` 메뉴바가 항상 우측 아래 한 줄 아쿠아 카드로 고정되도록 했습니다.
- 항상 떠 있던 `v2097-build-backdrop`이 마을 캔버스 클릭을 막을 수 있는 문제를 수정했습니다. 건설창이 닫힌 상태에서는 확실히 숨기고 포인터 이벤트를 차단합니다.
- 주요 건물 터치 판정을 넓혀 건물 몸통, 바닥 풋프린트, 정면 발판 근처를 더 안정적으로 인식하도록 했습니다.
- 건물/마을 캔버스 터치가 HUD, 우측 조작바, 조이스틱, 하단 메뉴를 제외한 영역에서 다시 정상적으로 들어가도록 포인터 이벤트 우선순위를 정리했습니다.
- `tools/check-v215-ui-hitbox-menu-fix.mjs`를 추가하고 `npm run validate`에 연결했습니다.
- `src/villageWorld.ts`의 캐릭터 방향 관련 고정 로직(`ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses`)은 유지했습니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- v2.1.5 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.4 통파일에 v2.1.5 패치 ZIP을 그대로 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- ZIP 안에는 `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`가 없어야 합니다.
- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- `package.json`과 `package-lock.json`에는 `packages.applied-caas`, `applied-caas-gateway`, `10.192.`, `internal.api.openai` 문자열이 없어야 합니다.
- 캐릭터 방향 로직은 임의 수정하지 않습니다.
