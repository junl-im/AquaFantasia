# AquaFantasia v2.1.15

## v2.1.15 변경사항

- 버전을 `2.1.15`로 동기화했습니다.
- `v2115-aqua-screen-shell-root`를 추가해 시작 화면, 마을 로딩, 마을 HUD/개척/조이스틱/우측 상단 조작바/우측 하단 메뉴, 모달/페이지, 낚시 화면을 한 번 더 분리했습니다.
- 첫 화면에서 `이 기기에 로그인 유지` 버튼이 배경 이미지보다 먼저 혼자 보이지 않도록, 시작 이미지가 준비된 뒤 전체 버튼 묶음이 함께 표시되게 했습니다.
- 로그인 유지 버튼은 이미지 배경 없이 작고 얇은 아쿠아 토글로 유지하고, 선택 상태는 `✓` 체크로만 구분합니다.
- 게임 시작 후 마을 로딩 화면에는 HUD, 개척, 조작바, 조이스틱, 우측 하단 메뉴가 같이 뜨지 않도록 숨기고, 마을 로딩이 끝난 뒤 표시되도록 분리했습니다.
- 좌측 아래 조이스틱 기본 노브를 중앙에 고정했습니다. CSS에서도 `left:50%`, `top:50%`, `translate(-50%,-50%)` 기준을 강제합니다.
- 개척 창은 화면 밖으로 밀리지 않도록 중앙 fixed 모달로 다시 고정하고, 바깥 영역은 딤/블러 처리합니다.
- 우측 상단 조작바는 요청 순서에 맞춰 `+ / -`, `건설 / 원점`, `상점 / 출항` 2열 3행으로 재배치했습니다.
- 우측 상단 버튼과 우측 하단 메뉴의 글 번짐을 줄이기 위해 text-shadow/filter와 불필요한 pseudo 이미지를 제거했습니다.
- 가방, 퀘스트, 지도, 상점, 건설, 개척, 캐릭정보창, 건물정보창을 공통 아쿠아 카드 스킨으로 맞추고, 열리는 창은 우측 상단 `X` 닫기 버튼 기준으로 통일했습니다.
- 건물 정보 UI에서는 큰 장식 이미지가 내용을 밀지 않도록 대형 내부 이미지를 숨기고, 작은 초상/정보/액션 버튼 중심으로 정리했습니다.
- 낚시 화면은 계속 풀스크린 핵심 게임 모드로 분리하고, 마을 하단 메뉴가 붙지 않도록 유지했습니다. 골드/미끼/장비/최근 포획/캐스팅 버튼의 크기 제한도 유지했습니다.
- v2.1.10 신규 에셋 278개는 유지하며, UI에는 `main_aqua_cards`, `buttons_and_badges`, `modals_tabs_toggles` 계열을 과하지 않은 공통 카드/버튼 스킨으로 사용했습니다. 로그인 유지 토글에는 이미지 배경을 사용하지 않습니다.
- 캐릭터 방향 고정 로직(`ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses`)은 유지했습니다.

## 검증

- `npm run validate`가 통과해야 합니다.
- v2.1.15 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.14 통파일에 v2.1.15 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version이 같은 버전이어야 합니다.
- 루트 Markdown은 `README.md` 하나만 유지합니다.
- `node_modules`, `dist`, `reports`, `AquaFantasia_backup_v1`, `.log`, `*_NOTES.md`는 ZIP에 포함하지 않습니다.
- 금지 registry 문자열은 포함하지 않습니다.
- GitHub Actions workflow `validate-and-deploy` 기준으로 `npm run validate`가 통과해야 합니다.
