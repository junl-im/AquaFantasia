# AquaFantasia v2.1.9

## v2.1.9 변경사항

- 버전을 `2.1.9`로 올리고 `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version, `README.md`를 동기화했습니다.
- `v219-ui-touch-shop-fishing-audit-root`를 추가했습니다. v2.1.8 안정 롤백을 유지하면서 터치 좌표, 상점 버튼 라우팅, 메뉴 페이지 크기, 모달 가림, 낚시 HUD/입력 충돌만 좁게 보정합니다.
- 로그인 유지 토글을 더 작고 얇은 이미지 없는 아쿠아 버튼으로 재정리했습니다. 선택 상태는 원형 인디케이터의 `✓` 체크만으로 구분합니다.
- 마을 바닥 터치 판정을 raw-only에서 작은 발끝 보정으로 조정했습니다. 원본 좌표는 건물 거리 계산에 그대로 사용하고, 타일 선택만 약한 좌하단 발판 기준으로 보정합니다.
- 상점 버튼 무반응 방지를 위해 `VillageWorld` 내부에도 `onOpenShop` 라우팅을 연결했습니다. 우측 상단 상점 버튼의 클릭/포인터 충돌을 줄였습니다.
- 상점/가방/퀘스트/지도 등 메뉴 페이지에서 HUD가 따라오지 않도록 숨기고, 실제 페이지 내용은 중앙의 큰 아쿠아 카드로 열리도록 보정했습니다.
- 캐릭터 정보창/건물창/개척창은 화면 중앙 모달로 정리하고, 열림 상태에서는 HUD/조이스틱/하단 메뉴/가이드가 뒤에 남아 보이거나 눌리지 않도록 가림 규칙을 강화했습니다.
- 우측 하단 `홈 / 가방 / 퀘스트 / 지도` 메뉴바를 더 작게 유지하되 우측 하단 고정을 다시 잠갔습니다.
- 낚시 화면에서는 하단 마을 메뉴바를 숨기고, 골드/미끼/장비/최근 포획 아이콘의 최대 크기를 줄였으며, 캐스팅 버튼/릴 콘솔/최근 포획 영역의 위치와 크기를 다시 제한했습니다.
- `tools/check-v219-ui-touch-shop-fishing-audit.mjs`를 추가하고 `npm run validate`에 연결했습니다.
- 캐릭터 방향 고정 로직(`ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses`)은 수정하지 않았습니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- v2.1.9 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.8 통파일에 v2.1.9 패치 ZIP을 그대로 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, 백업 폴더, `.log`, `*_NOTES.md`를 포함하지 않습니다.
- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- `package-lock.json`에는 내부 registry 오염 문자열이 없어야 합니다.
