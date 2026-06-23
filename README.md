# AquaFantasia v2.1.14

## v2.1.14 변경사항

- 버전을 `2.1.14`로 동기화했습니다.
- `v2114-aqua-interaction-root`와 `v2114-village-interaction`을 추가해 v2.1.11~v2.1.13 아쿠아 쉘 위에 실제 입력/표시 수호 레이어를 얹었습니다.
- 마을 기본 UI를 다시 고정했습니다. 왼쪽 위 HUD, HUD 아래 개척 바, 우측 상단 건설/상점/출항/원점/확대/축소, 좌측 아래 조이스틱, 우측 아래 `홈 / 가방 / 퀘스트 / 지도` 메뉴바가 각각 독립 위치를 유지합니다.
- 우측 하단 메뉴바의 글 번짐을 줄이기 위해 텍스트 그림자와 필터를 제거하고 아이콘/라벨 크기를 더 작고 선명하게 조정했습니다.
- 건설/상점/출항 버튼을 `bindVillagePrimaryTap` 단일 브리지로 묶었습니다. 기존 root capture fallback은 v2.1.14 루트에서는 비활성화하고, 중복 토글을 막기 위해 VillageWorld 쪽은 이미 처리된 이벤트를 건너뛰도록 보강했습니다.
- 캐릭터 정보창, 건물 정보창, 개척창, 건설창, 상점/가방/퀘스트/지도 페이지는 공통 아쿠아 카드 색상, 테두리, 그림자, 딤/블러, 우측 상단 닫기 버튼 규칙을 v2114 레이어에서 다시 정리했습니다.
- 개척/캐릭터/건물/건설 모달이 열린 상태에서는 HUD, 조작바, 조이스틱, 하단 메뉴가 위에 따라오지 않도록 `v2114-modal-open`, `v2114-expedition-open`, `v2114-build-open` 상태를 추가했습니다.
- 시작 화면 `이 기기에서 로그인 유지` 버튼은 이미지 배경 없이 작고 얇은 CSS 아쿠아 토글로 유지하고, 선택 상태는 원형 인디케이터의 `✓`로만 표시합니다.
- 낚시 화면에서는 마을 메뉴바와 v2.1.10 장식 소품이 다시 덮이지 않도록 숨기고, 골드/미끼/장비/최근 포획/캐스팅 버튼 크기 제한을 유지했습니다.
- 신규 v2.1.10 에셋 278개는 유지하되, UI 버튼 배경으로 무분별하게 덮지 않습니다.
- 캐릭터 방향 고정 로직은 수정하지 않았습니다.
- `tools/check-v2114-interaction-shell-polish.mjs`를 추가하고 `npm run validate`에 연결했습니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.13 통파일에 v2.1.14 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`는 ZIP에 포함하지 않습니다.
- 루트 Markdown은 `README.md` 하나만 유지합니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version이 같은 버전이어야 합니다.
- 내부/사설 registry 오염 문자열은 포함하지 않습니다.
- GitHub Actions workflow `validate-and-deploy` 기준을 유지합니다.
