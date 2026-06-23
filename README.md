# AquaFantasia v2.1.13

## v2.1.13 변경사항

- 버전을 `2.1.13`으로 동기화했습니다.
- v2.1.11~v2.1.12의 새 아쿠아 쉘을 유지하면서 `v2113-aqua-core-root`를 추가해 UI 상태, 버튼 입력, 낚시 화면을 한 번 더 안정화했습니다.
- 마을 기본 UI는 왼쪽 위 HUD, HUD 아래 개척 바, 오른쪽 위 `건설 / 상점 / 출항 / 원점 / 확대 / 축소`, 왼쪽 아래 조이스틱, 오른쪽 아래 `홈 / 가방 / 퀘스트 / 지도` 배치를 다시 잠갔습니다.
- 게임 시작 로딩 오버레이는 과하게 화면을 덮지 않도록 낮은 z-index의 얇은 아쿠아 로딩 카드로 줄였습니다.
- 로그인 유지 버튼은 좌측 밀림을 막기 위해 inline guard까지 `left: 50%`, `translateX(-50%)` 기준으로 재고정했고, 이미지 배경 없이 얇은 아쿠아 토글과 `✓` 체크 상태만 사용합니다.
- 우측 하단 메뉴바는 더 작고 선명한 텍스트 기준으로 고정하고, 닫기/모달 이후에도 `grid` 구조가 유지되도록 보정했습니다.
- 건설 버튼 무반응 원인을 수정했습니다. 기존 root capture guard가 건설 버튼 이벤트를 막고도 실제 토글을 하지 않던 흐름을 v2.1.13에서 `VillageWorld.setBuildTrayOpen()` 직접 호출 방식으로 보강했습니다.
- 건설창은 다시 중앙 아쿠아 카드 모달로 열리고, 바깥 영역은 딤/블러 처리됩니다.
- 상점/출항 버튼은 기존 pointerup/click 라우팅을 유지하면서 오버레이가 탭을 뺏는 상황을 줄이는 구조를 유지했습니다.
- 캐릭터 정보창, 건물 정보창, 개척창, 건설창, 상점/가방/퀘스트/지도 페이지는 공통 아쿠아 카드 색상, 테두리, 그림자, 우측 상단 X 버튼 규칙을 v2113 레이어에서 다시 묶었습니다.
- 상점/가방/퀘스트/지도 페이지는 코딱지만하게 열리지 않도록 중앙 큰 카드 최소 높이와 스크롤 루트를 다시 지정했습니다.
- 낚시 화면은 핵심 게임 모드로 분리해 마을 하단 메뉴가 붙지 않도록 유지하고, 화면을 채우던 v2110 낚시 장식 소품을 숨긴 뒤 HUD, 골드/미끼, 장비바, 최근 포획, 캐스팅 버튼, 릴 콘솔 크기를 제한했습니다.
- v2.1.10 신규 에셋 278개는 계속 포함하되, UI 버튼/토글 배경으로 무분별하게 덮지 않고 명시적으로 필요한 에셋만 사용합니다.
- `tools/check-v2113-aqua-core-steward.mjs`를 추가하고 `npm run validate`에 연결했습니다.
- 캐릭터 방향 고정 로직(`ACTOR_DIRECTION_TEXTURE_FIX`, `ACTOR_DIRECTION_TEXTURES`, `actorDirectionFromVector`, `actorTextureUrl`, `actorDirectionQaPasses`)은 유지했습니다.

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- 통파일 ZIP을 새로 풀어도 `npm run validate`가 통과해야 합니다.
- v2.1.12 통파일에 v2.1.13 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- ZIP에는 `node_modules`, `dist`, `reports`, 백업 폴더, 임시 로그, `*_NOTES.md`를 포함하지 않습니다.
- 루트 Markdown 파일은 이 `README.md` 하나만 유지합니다.
- GitHub Actions workflow `validate-and-deploy`에서는 public npm registry 사용과 validate/typecheck/build 절차를 유지합니다.
