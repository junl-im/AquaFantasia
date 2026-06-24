# AquaFantasia v2.1.37

## v2.1.37 Change Log

- Added a v2.1.37 fishing-first UI overhaul for the rod/bait loadout strip, sea-lane label, cast button, visible reel gauges, and legacy fishing overlay cleanup.
- Kept the root APP_VERSION file removed; version history remains in README.md and runtime version remains in src/data.ts.
- Reworked the fishing screen layout so the HUD, selected sea-lane card, loadout strip, director, coach panel, reel panel, reel console, and touch zone use separate safe mobile portrait lanes.
- Hid old fishing guide/start-card decoration and stray fishing prop/art-frame overlays that could visually leak into the top of the game screen.
- Improved reel gauge visibility after bite by forcing the catch/tension/stamina gauges, safe window, tension track, console, and touch zone into fixed visible layers during reeling.
- Refined village tile touch precision more cautiously: the diamond-tile tolerance is tightened and placement snap assist is capped to nearby valid origins instead of jumping too far.
- Documented that full tile pixel shrinking remains locked behind a save-coordinate/building-footprint migration because changing TILE_W/TILE_H alone can destabilize existing saves and object sizes.
- Polished the top-right village command bar and right-bottom menu dock by removing/transparentizing their outer frame backgrounds while preserving button spacing and order.
- Expanded HUD/frontier spacing and improved the expedition/opened page surface for cleaner aqua-card readability.
- Preserved player/NPC direction locks, first-start-only opening video, construction preview/confirm flow, no village bottom dock in fishing, and root APP_VERSION removal.

## v2.1.37 변경사항

- 낚시 화면 우선 개편을 적용했습니다.
  - 로드/미끼 장비 테이블이 어색하게 보이지 않도록 투명 프레임을 제거하고 2칸 아쿠아 장비 스트립으로 재배치했습니다.
  - 바다물길 표기가 짧게 잘리지 않도록 별도 수역 정보 카드로 분리했습니다.
  - 예전 게임 사용법 카드와 시작 안내 카드가 현재 UI와 겹쳐 보이지 않도록 낚시 화면에서는 숨겼습니다.
  - 낚시 시작 버튼을 아쿠아 CTA 버튼으로 다시 고정하고 오래된 버튼 이미지 프레임을 제거했습니다.
- 입질 후 게이지 가시성을 보강했습니다.
  - 릴링 상태에서 포획/텐션/저항 게이지, 안전 구간, 릴 콘솔, 터치존이 화면 밖으로 밀리지 않도록 고정 레이어를 다시 잡았습니다.
  - 상단에 다른 그림 조각처럼 보이던 낚시 소품/프레임성 이미지가 낚시 UI 위로 새어 나오지 않도록 차단했습니다.
- 마을 타일 터치 영역을 더 신중하게 조정했습니다.
  - 이전보다 과한 주변 타일 점프를 줄이기 위해 다이아몬드 타일 판정 허용값을 살짝 조였습니다.
  - 건설/이동 자동 보정은 가까운 설치 가능 타일 위주로 제한해 의도하지 않은 멀리 점프를 줄였습니다.
- 타일 픽셀 자체 축소는 이번 패치에서도 바로 적용하지 않았습니다.
  - 타일 픽셀을 줄이고 오브젝트가 차지하는 타일 수를 늘리는 방식은 좋은 방향일 수 있지만, 현재 세이브 좌표, 건물 footprint, 충돌 판정, NPC 이동, 카메라 경계까지 함께 마이그레이션해야 안전합니다.
  - 그래서 이번에는 실제 TILE_W/TILE_H는 유지하고, 터치 판정/스냅/배치 안정화부터 먼저 진행했습니다.
- 우측 상단/하단 메뉴 프레임을 정리했습니다.
  - 우측 상단 메뉴바의 외부 테두리/테이블 배경을 투명화하고 버튼 간격을 다시 맞췄습니다.
  - 우측 하단 메뉴바도 둘러싼 배경/테두리를 거의 투명하게 정리하고, 홈/가방/퀘스트/지도 위치와 크기를 고정했습니다.
- HUD와 개척 페이지를 보강했습니다.
  - HUD 창 길이를 조금 더 확보하고, 개척 바와 너무 붙거나 멀어지지 않도록 상단 간격을 다시 잡았습니다.
  - 개척이 열렸을 때 중앙 아쿠아 카드 표면, 스크롤 영역, X 닫기 위치가 더 안정적으로 보이도록 정리했습니다.
- 모든 메뉴 페이지 공통 스킨을 한 번 더 고정했습니다.
  - 가방/퀘스트/지도/상점/도감/장비/랭킹 계열 페이지의 아쿠아 카드 표면, 버튼, 하단 여백, 하단 메뉴 충돌 방지 토큰을 보강했습니다.
- 기존 잠금 유지:
  - v2.1.29 플레이어 방향 파일명 identity 매핑 유지
  - NPC 방향 identity 매핑 유지
  - 오프닝 영상 최초 시작 전용 유지
  - 건설 프리뷰 → 중앙 확인 팝업 → 건설/취소 플로우 유지
  - 낚시 화면에서 마을 하단 메뉴 차단 유지
  - 루트 APP_VERSION 파일 제거 정책 유지

## 검증

- `npm run validate`는 다음 검증을 실행합니다.
  - `tools/clean-old-patch-docs.mjs`
  - `tools/validate-clean.mjs`
  - `tools/check-v2137-premium-fishing-ui-page-shell.mjs`
- v2.1.37 검증 항목:
  - 버전 동기화
  - CSS 괄호/중괄호/대괄호 균형
  - 플레이어 v2129 8방향 32프레임 존재 및 해시 불변
  - 플레이어 방향 파일명 identity 매핑 유지
  - NPC 8방향 자산/identity 매핑 검사
  - 오프닝 영상 최초 시작 전용 토큰 유지
  - 낚시 로드/미끼 스트립, 바다물길 카드, 시작 버튼, 게이지 고정 레이어 검사
  - 낚시 구형 가이드/프레임/소품 오버레이 차단 검사
  - 우측 상단/하단 메뉴 투명 프레임 및 고정 클래스 검사
  - HUD/개척 바 간격 및 개척 페이지 아쿠아 카드 검사
  - 마을 오브젝트 시각 안전 간격/타일 스냅 보정 검사
  - 타일 픽셀 축소 보류/마이그레이션 가드 검사
  - 상점 구매 버튼 가시성 검사
  - 건설 프리뷰/확인 팝업 플로우 검사
  - 루트 Markdown README.md 단독 유지
  - 루트 APP_VERSION 파일 미포함
  - 금지 산출물 미포함


## v2.1.35 Change Log

- Added a v2.1.35 system UI and fishing engine stabilization pass.
- Kept the root APP_VERSION file removed; version history remains in README.md and runtime version remains in src/data.ts.
- Hardened the aqua-card skin across menu pages, popups, close buttons, inputs, shop cards, and build confirm surfaces.
- Improved village object placement stability by applying saved-object footprint clearance during normalization and adding nearest valid tile snap assist for construction/move confirmation.
- Rebalanced HUD/frontier spacing so the HUD, expedition bar, top-right commands, guide toast, and bottom dock avoid overlap on portrait mobile screens.
- Strengthened shop purchase button contrast with a visible gold CTA surface.
- Upgraded fishing UX with a command/balance strip, pressure readout, wider safe-zone tuning, softer failure buffer, and smoother wind/release control.
- Preserved player/NPC direction locks, first-start-only opening video, construction preview/confirm flow, and no bottom village dock in fishing.

## v2.1.35 변경사항

- 공통 아쿠아 카드 스킨을 한 번 더 고정했습니다.
  - 카드 배경, 테두리, 그림자, 버튼, X 닫기 버튼, 입력/팝업 표면의 톤을 통일했습니다.
  - 메뉴/페이지 스크롤 영역과 우측 하단 메뉴가 겹치지 않도록 하단 여백을 보강했습니다.
- 마을 배치 엔진을 보강했습니다.
  - 저장된 기존 건물도 정규화 과정에서 1타일 안전 간격을 고려합니다.
  - 건설/이동 위치가 살짝 빗나갔을 때 주변의 가장 가까운 설치 가능 타일로 미세 보정합니다.
  - 타일 크기 자체 축소는 세이브 좌표/footprint 마이그레이션 위험이 있어 계속 보류하고, 클릭/스냅/안전 간격을 우선 안정화했습니다.
- HUD와 개척 바 간격을 재조정했습니다.
  - 너무 붙지 않게 상단 간격을 확보하고, 우측 상단 조작 버튼과 폭 충돌을 줄였습니다.
  - 마을 안내 토스트와 하단 메뉴가 겹치지 않도록 위치를 보정했습니다.
- 상점 구매 금액 버튼 가시성을 추가로 보강했습니다.
  - 가격/보유 배지가 배경에 묻히지 않도록 금색 CTA 버튼 계열로 다시 고정했습니다.
- 낚시게임을 추가 개선했습니다.
  - 추천 입력/밸런스/위험도 표시를 추가했습니다.
  - 안전 구간을 약간 넓히고 움직임을 완화해 모바일에서 갑작스러운 실패를 줄였습니다.
  - 감기/풀기/중립 입력 감도를 완화하고 실패 복구 시간을 늘렸습니다.
- 기존 잠금 유지:
  - v2.1.29 플레이어 방향 파일명 identity 매핑 유지
  - NPC 방향 identity 매핑 유지
  - 오프닝 영상 최초 시작 전용 유지
  - 건설 프리뷰 → 중앙 확인 팝업 → 건설/취소 플로우 유지
  - 루트 APP_VERSION 파일 제거 정책 유지

## 검증

- `npm run validate`는 다음 검증을 실행합니다.
  - `tools/clean-old-patch-docs.mjs`
  - `tools/validate-clean.mjs`
  - `tools/check-v2135-system-ui-fishing-engine.mjs`
- v2.1.35 검증 항목:
  - 버전 동기화
  - CSS 괄호/중괄호/대괄호 균형
  - 플레이어 v2129 8방향 32프레임 존재 및 해시 불변
  - 플레이어 방향 파일명 identity 매핑 유지
  - NPC 8방향 자산/identity 매핑 검사
  - 오프닝 영상 최초 시작 전용 토큰 유지
  - 우측 상단/하단 메뉴 고정 클래스 검사
  - 마을 오브젝트 안전 간격/타일 스냅 보정 검사
  - HUD/개척 바 간격 토큰 검사
  - 상점 구매 버튼 가시성 검사
  - 낚시 command/balance/pressure/게이지/버튼/상태 검사
  - 건설 프리뷰/확인 팝업 플로우 검사
  - 루트 Markdown README.md 단독 유지
  - 루트 APP_VERSION 파일 미포함
  - 금지 산출물 미포함


## v2.1.34 Change Log

- Added a v2.1.34 object-grid/shop/fishing UI stability pass.
- Kept the existing 40 x 40 village save grid stable, but improved tile targeting with a wider diamond-hit search instead of forcing a risky tile-size migration.
- Added a 1-tile visual clearance rule for new building/object placement so village objects are less likely to visually overlap.
- Rebalanced HUD and frontier/expedition bar spacing so they sit close enough to read but do not touch or collide with the top-right command bar.
- Reworked the shop purchase price badge so buy amounts use a visible gold button-style surface instead of blending into the card background.
- Added a clearer fishing coach lane for catch/tension/stamina, softened sudden failure pressure, and kept wind/release/neutral input stability from v2.1.33.
- Preserved player/NPC direction locks, first-start-only opening video, and construction preview/confirm flow.

## v2.1.34 변경사항

- 마을 오브젝트 겹침 방지를 보강했습니다.
  - 새 건물/오브젝트 배치 시 기존 건물/장식 주변 1타일 안전 간격을 검사합니다.
  - 배치 불가 안내 문구에 안전 간격 사유를 포함했습니다.
- 타일 클릭 정밀도를 개선했습니다.
  - 저장 데이터와 기존 건물 좌표가 깨질 수 있어 이번 버전에서는 타일 픽셀 자체를 줄이는 대규모 마이그레이션은 하지 않았습니다.
  - 대신 다이아몬드 타일 판정 검색 범위를 넓혀 모바일 터치 미세조정을 더 안정적으로 만들었습니다.
- HUD와 개척 바 간격을 다시 조정했습니다.
  - 너무 붙지 않게 1차 간격을 확보하고, 우측 상단 조작 버튼과 겹치지 않도록 최대 폭을 다시 제한했습니다.
- 상점 구매 금액 표시를 고쳤습니다.
  - 가격 배지를 금색 버튼형 표면으로 분리해 배경과 섞여 보이지 않는 문제를 줄였습니다.
- 낚시게임을 추가 보강했습니다.
  - 코치 패널에 포획/텐션/저항 요약 레인을 추가했습니다.
  - 극단 장력 실패까지의 복구 여유를 조금 더 늘렸습니다.
  - 포획 게이지 상승 체감을 조금 강화하고 실패 감소량을 완화했습니다.
- 기존 잠금 유지:
  - v2.1.29 플레이어 방향 파일명 identity 매핑 유지
  - NPC 방향 identity 매핑 유지
  - 오프닝 영상 최초 시작 전용 유지
  - 건설 프리뷰 → 중앙 확인 팝업 → 건설/취소 플로우 유지
  - 루트 APP_VERSION 파일 제거 정책 유지

## v2.1.32 Change Log

- Removed the unnecessary root `APP_VERSION` file from the full package. Runtime version data now stays in `src/data.ts`, and human-readable version history stays in `README.md`.
- Added a premium aqua-card UI stabilization layer for cards, borders, buttons, inputs, close buttons, HUD, top controls, and the fixed right-bottom menu.
- Added a fishing director panel with step states for cast, bite, reel, and catch so mobile portrait gameplay has a clear flow.
- Rebalanced the fishing tension loop to be smoother and less suddenly punishing while preserving reel wind/release decision making.
- Preserved the v2.1.29/v2.1.30/v2.1.31 player and NPC direction locks, opening-video first-start-only policy, and construction preview/confirm flow.

## v2.1.32 변경사항

- v2.1.29 `player.zip` 기반 플레이어 8방향 32프레임을 해시까지 다시 검증 고정했습니다.
  - `public/assets/v2129/characters/player`
  - 8방향 × 4프레임 = 32개 PNG 유지
  - `east → player_east_frame_*.png`, `west → player_west_frame_*.png` 등 파일명 identity 매핑 유지
  - 플레이어 방향을 flip/alias/swap으로 뒤집지 않도록 validate에서 고정합니다.
- NPC 방향 로직을 플레이어 로직과 분리해 다시 잠갔습니다.
  - `chief`, `merchant`, `guild`, `captain`, `tourist`, `vip` 8방향 PNG 존재 검사
  - NPC 방향 alias는 identity 매핑만 허용합니다.
- 우측 상단 메뉴바를 더 우측에 붙이고, 전체 박스/테두리 잔상을 제거했습니다.
  - `＋ / － / 건설 / 원점 / 상점 / 출항` 순서 유지
  - 버튼 간격을 넓히고 잘림/겹침 방지
- 우측 하단 메뉴바를 모든 마을/메뉴 페이지에서 동일 위치와 크기로 고정했습니다.
  - `홈 / 가방 / 퀘스트 / 지도` 유지
  - 아이콘/텍스트 크기 통일
  - 눌렀을 때 밀림/흔들림 방지
- HUD와 개척 바 간격을 안전영역 기준으로 다시 보정했습니다.
- 가방, 퀘스트, 지도, 상점, 건물상세, 캐릭터 정보, 개척정보, 종료팝업 계열 카드 톤을 공통 아쿠아 UI로 한 번 더 정리했습니다.
  - X 닫기 버튼 위치/형태 통일
  - 검은 입력창, 흐릿한 글씨, 잘림/겹침 방지 보강
- 건설/이동 UX를 v2.1.30 구조 그대로 유지하면서 안내와 상태를 강화했습니다.
  - 건물/오브젝트 선택 → 반투명 프리뷰 → 타일 선택 → 중앙 확인창 → 건설/취소
  - 기존 건물 이동도 동일한 확인 플로우 사용
  - 배치 불가 타일 안내 메시지 명확화
  - 장식물 이름은 띄우지 않고 주요 건물/NPC/본캐릭터 중심 표기 유지
- 낚시게임 UI/흐름을 재정리했습니다.
  - 첫 화면 안내 카드와 단계 표시 개선
  - 상단 HUD 겹침 완화
  - 포획/텐션/저항 게이지를 명확히 배치
  - 캐스팅/입질/릴링 메시지를 자연스러운 피드백으로 교체
  - 릴 패널/릴 콘솔/터치존/버튼 겹침 방지
  - 낚시 화면에서 마을 하단 메뉴가 나오지 않는 정책 유지
- 오프닝 영상은 최초 게임 시작 로딩 전용 정책을 유지합니다.
  - 홈/닫기/메뉴 복귀/마을 이동과 연결하지 않음
  - 큰 카드 테두리/프레임/장식 오버레이 재도입 금지
- 로그인 유지 토글은 현재 확정 스타일을 유지합니다.
  - 이미지 배경 금지
  - 작은 CSS 아쿠아 토글
  - 선택 상태는 `✓` 표시로만 구분

## 검증

- `npm run validate`는 다음 검증을 실행합니다.
  - `tools/clean-old-patch-docs.mjs`
  - `tools/validate-clean.mjs`
  - `tools/check-v2133-object-grid-shop-fishing-ui-stability.mjs`
- v2.1.34 검증 항목:
  - 버전 동기화
  - CSS 괄호/중괄호/대괄호 균형
  - 플레이어 v2129 8방향 32프레임 존재 및 해시 불변
  - 플레이어 방향 파일명 identity 매핑 유지
  - NPC 8방향 자산/identity 매핑 검사
  - 오프닝 영상 최초 시작 전용 토큰 유지
  - 우측 상단/하단 메뉴 고정 클래스 검사
  - 낚시 UI 핵심 클래스/게이지/버튼/상태 검사
  - 건설 프리뷰/확인 팝업 플로우 검사
  - 금지 registry/internal 문자열 부재
