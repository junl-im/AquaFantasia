# AquaFantasia v2.1.12

## v2.1.12 변경사항

- 버전을 `2.1.12`로 동기화했습니다.
- v2.1.11의 새 아쿠아 쉘 위에 `v2112-aqua-foundation-root`를 추가해 HUD, 개척 바, 우측 상단 조작바, 좌측 하단 조이스틱, 우측 하단 메뉴바, 모달, 메뉴 페이지, 낚시 화면을 더 강하게 한 구조로 묶었습니다.
- 화면 전환 시 남아 있던 `v218-aqua-modal-open`, `v2111-modal-open`, `v2111-expedition-open`, `v2111-build-open` 및 신규 `v2112-*` 상태를 정리해 HUD/개척/조이스틱/하단 메뉴가 사라진 채 남는 문제를 줄였습니다.
- 마을 기본 화면은 왼쪽 위 HUD, HUD 아래 개척 바, 오른쪽 위 `건설 / 상점 / 출항 / 원점 / 확대 / 축소`, 왼쪽 아래 조이스틱, 오른쪽 아래 `홈 / 가방 / 퀘스트 / 지도` 구성을 기준으로 재고정했습니다.
- 우측 하단 메뉴바는 더 작게 유지하고, 글자 번짐을 줄이기 위해 텍스트 그림자/필터를 제거했습니다.
- 로그인 유지 버튼은 PNG/이미지 배경 없이 더 얇은 순수 CSS 아쿠아 토글로 재정리했고, 선택 상태는 원형 인디케이터의 `✓` 체크로만 표시합니다.
- 개척/캐릭터/건물/건설 모달은 열릴 때 HUD, 조작바, 조이스틱, 하단 메뉴가 뒤에서 따라오지 않도록 `v2112-modal-open`, `v2112-expedition-open`, `v2112-build-open` 상태를 명확히 분리했습니다.
- 상점/가방/퀘스트/지도 페이지는 HUD를 따라가지 않고 중앙의 큰 아쿠아 카드로 열리도록 `v2112-runtime-page-shell`과 `v2112-aqua-page` 규칙을 추가했습니다.
- 건설/상점/출항 버튼은 `pointerup` 경로를 한 번 더 보강해 오버레이나 캔버스가 탭을 뺏는 상황을 줄였습니다.
- 마을 바닥 터치 좌표는 실제 canvas-local diamond hit 기준을 유지해 누적 보정값으로 엉뚱한 타일이 눌리는 문제를 막는 방향을 유지했습니다.
- 낚시 화면은 `v2112-fishing-foundation-screen` 기준으로 하단 마을 메뉴를 숨기고, 골드/미끼 아이콘, 장비바, 최근 포획, 캐스팅 버튼, 릴 콘솔 크기를 제한했습니다.
- v2.1.10 신규 에셋 278개는 유지하되, UI 버튼/토글 배경으로 무분별하게 덮지 않고 필요한 경로만 명시적으로 사용합니다.
- `tools/check-v2112-aqua-foundation-shell.mjs`를 추가하고 `npm run validate`에 연결했습니다.
- 캐릭터 방향 고정 로직(`ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses`)은 유지했습니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.11 통파일에 v2.1.12 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, 백업 폴더, 임시 로그, `*_NOTES.md`를 포함하지 않습니다.
- 루트 Markdown 파일은 이 `README.md` 하나만 유지합니다.
- GitHub Actions workflow `validate-and-deploy`에서는 public npm registry 사용과 validate/typecheck/build 절차를 유지합니다.
