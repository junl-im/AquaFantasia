# AquaFantasia v2.1.6

## v2.1.6 변경사항

- 버전을 `2.1.6`으로 올리고 `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version, `README.md`를 동기화했습니다.
- 이벤트 충돌 점검 패치로 `v216-event-ui-fishing-stability-root`를 추가했습니다.
- 마을 주요 건물 클릭 후 정보/관리창이 열리지 않던 원인을 수정했습니다. 실제 DOM은 `data-v2097-interior-*`인데 런타임 코드가 `data-v2094-interior-*`만 찾던 문제를 양쪽 호환 셀렉터로 고쳤습니다.
- 건물/인테리어 패널이 열렸을 때 우측 조작바, 조이스틱, 하단 메뉴, 마을 캔버스가 뒤에서 눌리지 않도록 모달 오픈 상태와 포인터 차단 규칙을 보강했습니다.
- 하단 우측 메뉴바는 `홈 / 가방 / 퀘스트 / 지도` 한 줄형만 유지하고 구형 전체폭 도크 보정이 다시 개입하지 않도록 추가 잠금했습니다.
- 낚시게임 입력 충돌을 정리했습니다. PointerEvent 지원 환경에서는 pointer 입력만 사용하고, touch/mouse fallback은 비지원 환경에서만 연결되도록 분리했습니다.
- 낚시 릴 패널/감기/풀기/터치존을 루트 캐스팅 입력에서 제외해 중복 입력, 중복 터치 링, 의도치 않은 릴링 시작을 줄였습니다.
- 낚시 화면을 핵심 게임으로 보고 HUD, 장비바, 최근 포획, 캐스팅, 릴 콘솔이 서로 눌림/겹침 없이 우선 동작하도록 `v216-fishing-input-ui-screen`과 전용 CSS를 추가했습니다.
- 토스트는 계속 비활성 상태를 유지합니다.
- 캐릭터 방향 로직은 수정하지 않았습니다.

## 검증 기준

- 루트 Markdown은 `README.md` 하나만 유지합니다.
- v2.1.6 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.5 통파일에 v2.1.6 패치 ZIP을 그대로 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`를 포함하지 않습니다.
- `packages.applied-caas`, `applied-caas-gateway`, `10.192.`, `internal.api.openai` 문자열이 `package.json`/`package-lock.json`에 없어야 합니다.
