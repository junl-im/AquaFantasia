# AquaFantasia v2.1.11

## v2.1.11 변경사항

- 버전을 `2.1.11`로 동기화했습니다.
- v2.1.x에서 누적된 UI 덮어쓰기 충돌을 줄이기 위해 `v2111-aqua-shell-root` 단일 UI 루트를 추가했습니다.
- 화면 전환 시 남아 있던 `v218-aqua-modal-open`, `v2094-modal-open`, `v2111-modal-open` 등 잔여 모달 상태를 정리하도록 수정했습니다.
- 마을 HUD, HUD 아래 개척 바, 우측 상단 조작바, 좌측 하단 조이스틱, 우측 하단 하단 메뉴바를 새 아쿠아 쉘 좌표계로 재정렬했습니다.
- 우측 하단 메뉴바는 `홈 / 가방 / 퀘스트 / 지도` 4개만 유지하고 크기를 더 줄였습니다.
- 로그인 유지 버튼은 PNG 배경 없이 작고 얇은 순수 CSS 아쿠아 토글로 다시 구성했습니다. 선택 상태는 `✓` 체크로 표시됩니다.
- 개척 창, 캐릭터 정보창, 건물 정보창, 건설 창, 상점/가방/퀘스트/지도 페이지를 공통 아쿠아 카드/딤/블러 구조로 묶었습니다.
- 개척/캐릭터/건물 모달이 열릴 때 HUD, 조작바, 조이스틱, 하단 메뉴가 뒤에서 따라오지 않도록 정리했습니다.
- 마을 바닥 터치 좌표는 이전 보정 누적으로 틀어지지 않도록 실제 canvas-local diamond hit 기준으로 되돌렸습니다.
- 건설/상점/출항 버튼은 pointerup/click 경로를 모두 연결해 무반응 가능성을 줄였습니다.
- 낚시 화면은 하단 마을 메뉴를 제거하고, 화면을 가득 채우던 장식 오브젝트와 대형 HUD 아이콘을 숨기거나 제한했습니다.
- 신규 v2.1.10 에셋은 계속 포함하되, v2.1.11에서는 UI 버튼 배경으로 무분별하게 덮지 않고 필요한 이미지 경로만 명시적으로 사용합니다.
- `tools/check-v2111-aqua-shell-rebuild.mjs`를 추가하고 `npm run validate`에 연결했습니다.
- 캐릭터 방향 고정 로직(`ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses`)은 유지했습니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.10 통파일에 v2.1.11 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, 백업 폴더, 임시 로그, `*_NOTES.md`를 포함하지 않습니다.
- 루트 Markdown 파일은 이 `README.md` 하나만 유지합니다.
- GitHub Actions workflow `validate-and-deploy`에서는 public npm registry 사용과 validate/typecheck/build 절차를 유지합니다.
