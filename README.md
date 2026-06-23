# AquaFantasia v2.1.16

## v2.1.16 변경사항

- 버전을 `2.1.16`으로 동기화했습니다.
- `v2116-village-asset-polish-root`를 추가해 v2.1.15 아쿠아 화면 쉘을 유지하면서 신규 에셋을 마을 오브젝트와 바다/해변 타일에 더 직접 적용했습니다.
- 신규 v2.1.10 에셋 278개는 계속 유지하며, 이번 패치에서는 특히 다음 에셋을 실제 마을 런타임에 연결했습니다.
  - 32x32 바다 타일: 바다/모래/목재 계열 타일 텍스처 후보로 등록
  - 낚시 소품 PNG: 배, 나룻배, 밧줄, 닻, 보물상자, 해초, 유목, 통발, 구명환을 마을 항구 주변 오브젝트로 배치
  - 기존 항구 소품 일부를 신규 PNG로 교체: 램프, 상자, 부표, 바위, 조개더미, 통, 산호, 밧줄, 말뚝, 게시판 계열
- 마을 오브젝트는 화면을 뒤덮는 오버레이가 아니라 PixiJS 월드의 장식 레이어에 작은 비차단 오브젝트로 배치했습니다.
- 새 오브젝트는 주 이동/터치 동선을 막지 않도록 항구와 해변 측면 포켓 위주로 배치했습니다.
- 마을 타일 텍스처는 기존 타일을 완전히 제거하지 않고 신규 32x32 에셋을 우선 후보로 추가해 실패 시 기존 에셋으로 fallback되게 했습니다.
- 우측 상단 조작바는 `+ / -`, `건설 / 원점`, `상점 / 출항` 2열 3행 구성을 유지하면서 여백과 아이콘 잔상을 다시 줄였습니다.
- 우측 하단 `홈 / 가방 / 퀘스트 / 지도` 메뉴바는 작고 선명한 아쿠아 바 기준으로 유지했습니다.
- 시작 화면 `이 기기에 로그인 유지` 버튼은 이미지 배경 없이 작고 얇은 CSS 아쿠아 토글로 유지하며, 선택 상태는 `✓` 체크로 구분합니다.
- 가방, 퀘스트, 지도, 상점, 건설, 개척, 캐릭정보창, 건물정보창은 공통 아쿠아 카드 스킨과 우측 상단 `X` 닫기 버튼 기준을 유지했습니다.
- 건물 정보 UI의 대형 내부 이미지는 계속 숨겨 정보가 밀리지 않도록 유지했습니다.
- 낚시 화면은 불안정한 장식 오브젝트가 다시 화면을 덮지 않도록 신규 낚시 소품을 가장자리의 작은 장식으로만 표시하고, 아이콘/장비/최근 포획/캐스팅 버튼 크기 제한을 유지했습니다.
- 캐릭터 방향 고정 로직(`ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses`)은 유지했습니다.

## 검증

- `npm run validate`가 통과해야 합니다.
- v2.1.16 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.15 통파일에 v2.1.16 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`는 포함하지 않습니다.
- 루트 Markdown 파일은 `README.md` 하나만 유지합니다.
- package registry 금지 문자열은 포함하지 않습니다.

## 환경 메모

현재 작업 컨테이너에서는 public npm registry DNS 조회가 불안정할 수 있습니다. 이 경우 `npm run ci:registry:check`, `npm run typecheck`, `npm run build`는 `node_modules` 부재나 registry DNS 문제로 실패할 수 있습니다. 코드/패키지 구조 검증 기준은 `npm run validate`입니다.

## 배포

GitHub Actions workflow `validate-and-deploy` 기준으로 `npm run validate`를 먼저 통과한 뒤 배포합니다.
