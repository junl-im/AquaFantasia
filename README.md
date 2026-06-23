# AquaFantasia v2.1.8

## v2.1.8 변경사항

- 버전을 `2.1.8`로 올리고 `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version, `README.md`를 동기화했습니다.
- v2.1.0~v2.1.7에서 누적된 과도한 공통 UI 덮어쓰기 레이어를 제거하고, v2.0.99에 남아 있던 v2080~v2098 안정 UI/낚시 런타임 기준으로 되돌렸습니다.
- `v218-stable-ui-fishing-rollback-root`를 추가했습니다. 이 루트는 로그인 토글, 메뉴 페이지 카드 크기, 캐릭터/건물/개척 모달 크기, 우측 하단 메뉴바, 낚시 HUD 아이콘 크기만 좁게 보정합니다.
- `이 기기에 로그인 유지`는 이미지 배경 없이 작은 얇은 아쿠아 토글로 정리했습니다. 선택 상태는 원형 인디케이터의 `✓` 체크로만 표시합니다.
- 마을 바닥 터치 좌표는 과한 좌하단 bias를 제거하고 canvas-local raw diamond hit test 기준으로 되돌렸습니다. 화면에서 누른 위치가 이웃 타일로 밀리는 문제를 줄였습니다.
- 건물/인테리어 패널은 실제 DOM의 `data-v2097-*` 셀렉터와 기존 `data-v2094-*` 셀렉터를 모두 호환하도록 고쳤습니다. 주요 건물 클릭 후 패널이 안 열리는 문제를 다시 점검했습니다.
- 개척 창은 화면 밖으로 밀리지 않도록 fixed 중앙 모달로 보정하고, 열릴 때 HUD/조작바/조이스틱/하단 메뉴가 뒤에서 보이거나 눌리지 않게 했습니다.
- 가방/퀘스트/지도/상점 같은 메뉴 페이지가 코딱지만하게 열리지 않도록 `.runtime-content`의 최소 높이와 카드 폭을 재보정했습니다.
- 낚시게임은 v2055/v2057/v2073/v2084/v2098 계열의 안정 낚시 화면을 기준으로 되돌렸고, v2.1.x에서 추가된 과한 낚시 카드/아이콘 덮어쓰기는 제거했습니다. 골드/미끼/장비/최근 포획 아이콘은 최대 크기를 제한했습니다.
- 토스트 팝업은 비활성 상태를 유지합니다.
- 캐릭터 방향 로직은 수정하지 않았습니다.

## 검증 기준

- 루트 Markdown은 `README.md` 하나만 유지합니다.
- v2.1.8 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.7 통파일에 v2.1.8 패치 ZIP을 그대로 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`를 포함하지 않습니다.
- `packages.applied-caas`, `applied-caas-gateway`, `10.192.`, `internal.api.openai` 문자열이 `package.json`/`package-lock.json`에 없어야 합니다.
