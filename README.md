# AquaFantasia v2.1.46

## v2.1.46 Change Log

- Added a v2.1.46 overlap/icon/fishing polish pass with shorter reporting but the same package-boundary validation discipline.
- Rebuilt the Home/Bag/Quest/Map dock PNGs as clean 128x128 transparent aqua icons so neighboring sprite fragments cannot peek through the top or sides.
- Right-top village controls now use one translucent proportional button frame only. The outer table/backplate layer is removed, button pseudo-frames are suppressed, and spacing is fixed in a 3x2 grid.
- Runtime page ghost titles are removed at the DOM data-attribute level and with a final CSS guard, so Bag, Quest, Map, Shop, and related pages keep only the real HUD title.
- Shop cards reserve a separate text column and gold price CTA column so item names/descriptions are not covered by the purchase amount.
- Fishing prep is decluttered to one sea-lane card, one loadout strip, one coach card, and one casting CTA. Duplicate route/priority bars and legacy frame fragments are hidden.
- Fishing reeling mode hides prep cards entirely and hard-centers the reel panel, console, and touch zone with viewport-width bounds so the main game UI cannot drift off the left edge.
- Tile pixels are still not reduced. v2.1.46 tightens the diamond touch score to 0.950 while keeping the 80x40 save grid until save coordinates, building footprints, NPC movement, collision, and camera boundaries can be migrated safely.
- `npm ci` generated `node_modules` remains allowed as a local/CI working dependency, while full/patch ZIP boundaries continue to reject generated artifacts.

## v2.1.46 변경사항

- 최종 보고는 짧게 줄이되, 실제 패키지/검증 경계는 유지하는 v2.1.46 겹침/아이콘/낚시 정리 패스를 추가했습니다.
- 홈/가방/퀘스트/지도 하단 아이콘 PNG를 깨끗한 128x128 투명 아쿠아 아이콘으로 다시 만들어, 옆쪽/위쪽 다른 이미지 조각이 보일 여지를 없앴습니다.
- 우측 상단 마을 메뉴는 아이콘을 감싸는 반투명 버튼 프레임 1개만 남기고, 뒤쪽 테이블/배경 테두리와 버튼 pseudo-frame을 차단했습니다. 배열은 3x2 그리드로 고정했습니다.
- 가방, 퀘스트, 지도, 상점 등 메뉴 페이지의 뒷배경 제목 잔상은 DOM 데이터 속성과 CSS 가드 양쪽에서 제거해 실제 HUD 제목만 보이게 했습니다.
- 상점 아이템 카드는 글 영역과 골드 구매 버튼 영역을 확실히 분리해 이름/설명이 금액 버튼에 가려지는 느낌을 줄였습니다.
- 낚시 준비 화면은 바다물길 카드 1개, 장비 스트립 1개, 코치 카드 1개, 캐스팅 버튼 1개만 보이도록 줄이고 중복 route/priority 바와 구형 프레임 조각을 숨겼습니다.
- 낚시 릴링 모드에서는 준비 카드들을 모두 숨기고, 릴 패널/콘솔/터치존을 화면 중앙 기준으로 고정해 본 게임 UI가 왼쪽 화면 밖으로 밀려나지 않도록 했습니다.
- 타일 픽셀 축소는 아직 적용하지 않았습니다. v2.1.46은 다이아몬드 터치 점수를 0.950으로 조정하지만, 80x40 세이브 그리드는 유지합니다. 타일 픽셀 축소는 세이브 좌표, 건물 footprint, NPC 이동, 충돌 판정, 카메라 경계 마이그레이션이 필요합니다.
- `npm ci`가 만든 `node_modules`는 작업환경 의존성으로 허용하지만, full/patch ZIP과 패키지 경계에는 산출물이 들어가지 않도록 계속 차단합니다.

## v2.1.45 Change Log

- Added a v2.1.45 icon/fishing/page polish pass for bottom dock icon containment, right-top control frame cleanup, page title ghost removal, shop text readability, expedition route card styling, and fishing cockpit centering.
- Cleaned the Home/Bag/Quest/Map dock icon PNGs so neighboring sprite fragments no longer peek from the top or sides, then clipped each dock button with proportional translucent aqua borders.
- Right-top village controls now keep only the proportional icon button border. The outer table-like background/frame is removed and button spacing is balanced.
- Runtime pages hide the old generated background title pseudo-element so Bag, Quest, Map, Shop, and related pages no longer show duplicate title text behind the real HUD title.
- Expedition route/action cards, including 항로 조사 and 후보지 차트 sections, now use the same aqua-card treatment instead of loose floating text.
- Shop item cards use a safer grid and gold CTA price badge so item names/descriptions are not covered by the buy amount.
- Fishing keeps a single sea-lane card, hides legacy usage/director/prop fragments, reduces prep clutter, and hard-centers the reeling panel, console, and touch zone to prevent the main game UI from drifting off the left edge.
- Tile pixels are still not reduced. v2.1.45 tightens the diamond touch score to 0.952 but keeps the 80x40 save grid until save coordinates, building footprints, NPC movement, collision, and camera boundaries can be migrated safely.
- The `npm ci` generated `node_modules` folder is still allowed as a local/CI working dependency, while ZIP/package boundaries continue to reject generated artifacts.

## v2.1.45 변경사항

- 하단 홈/가방/퀘스트/지도 아이콘에서 옆쪽/위쪽 다른 그림 조각이 보이던 PNG를 정리하고, 버튼 내부에서 다시 새지 않도록 비례형 투명 아쿠아 테두리와 클리핑을 적용했습니다.
- 우측 상단 메뉴바는 3중 구조처럼 보이던 외부 배경/테이블 테두리를 제거하고, 아이콘을 감싸는 버튼 테두리만 작고 투명하게 남겼습니다.
- 가방, 퀘스트, 지도, 상점 등 메뉴 페이지 뒤쪽에 중복으로 보이던 페이지 제목 pseudo-title을 제거했습니다.
- 개척 화면의 항로 조사, 후보지 차트, 출항 후보지 카드가 덩그러니 글만 놓인 느낌이 나지 않도록 같은 아쿠아 카드 톤으로 정리했습니다.
- 상점 아이템 카드는 글 영역과 가격 버튼 영역을 분리해 이름/설명이 구매 금액 배지에 가려지지 않도록 했습니다.
- 낚시 화면은 바다물길 표기를 하나로 정리하고, 구형 사용법/프레임/소품 조각을 더 강하게 차단했으며, 입질 후 릴링 본 게임 패널이 왼쪽 화면 밖으로 밀려나지 않도록 중앙 고정 레이아웃을 적용했습니다.
- 타일 픽셀 축소는 아직 적용하지 않았습니다. v2.1.45는 다이아몬드 터치 점수를 0.952로 더 신중하게 조정하지만, 80x40 세이브 그리드는 유지합니다. 타일 픽셀 축소는 세이브 좌표, 건물 footprint, NPC 이동, 충돌 판정, 카메라 경계 마이그레이션이 필요합니다.
- `npm ci`가 만든 `node_modules`는 작업환경 의존성으로 허용하지만, full/patch ZIP과 패키지 경계에는 산출물이 들어가지 않도록 계속 차단합니다. node_modules가 Git에 추적되거나 full/patch ZIP에 들어가는 것은 계속 차단합니다.


## v2.1.44 Change Log

- Added a v2.1.44 UI placement polish sweep focused on overlap scouting, village placement, fishing cockpit lane separation, HUD length, expedition panel spacing, and common aqua card pages.
- Fishing keeps the v2.1.42 bite action and adds a v2144 stage-layer deconflict pass so the rod/bait strip, sea-lane card, priority hint, coach panel, casting CTA, bite CTA, reel gauges, reel console, and touch zone occupy clearer mobile portrait lanes.
- Old fishing guide frames, start cards, prop fragments, image button frames, vertical gauge art, horizontal gauge art, fish shadow fragments, ripple/foam props, and resistance art are suppressed in the live fishing screen to prevent stray overlapping icon fragments.
- The reeling phase prioritizes the actual capture/tension/stamina gauges with a sticky compact gauge stack and reserves fixed space for the reel console and touch zone.
- Right-top village controls and right-bottom menu keep the transparent-frame policy with fixed sizes, no table-like wrapper, no press shift, and safer spacing.
- Village HUD and expedition/opened development panel spacing were adjusted so they are neither glued together nor pushed too far apart, while HUD width is kept readable beside the right-top controls.
- Runtime menu pages keep a common premium aqua card skin with stronger scroll bottom padding so cards and the fixed bottom nav do not collide.
- Shop price/purchase badges stay on the gold CTA palette so the buy amount does not disappear into the card background.
- Tile pixels are still not reduced. v2.1.44 tightens the diamond touch score to 0.955 and keeps auto-snap assistance near the tapped tile so taps feel precise without migrating save coordinates, building footprints, NPC movement, collision, or camera boundaries.
- The `npm ci` generated `node_modules` folder is still allowed as a local/CI working dependency, while ZIP/package boundaries continue to reject generated artifacts.

## v2.1.44 변경사항

- UI 겹침, 마을 배치, 낚시 콕핏 레인 분리, HUD 길이, 개척 패널 간격, 공통 아쿠아 카드 페이지를 다시 점검하는 v2.1.44 배치/겹침 스윕을 추가했습니다.
- 낚시 화면은 v2.1.42의 입질 후 `릴링 시작` 버튼을 유지하면서, 로드/미끼 스트립, 바다물길 카드, 우선 안내, 코치 패널, 캐스팅 CTA, 입질 CTA, 릴 게이지, 릴 콘솔, 터치존이 더 명확한 모바일 세로 레인에 놓이도록 v2144 stage-layer deconflict 레이어를 추가했습니다.
- 구형 낚시 사용법 카드, 시작 카드, 소품 조각, 이미지 버튼 프레임, 세로/가로 게이지 이미지, 물고기 그림자 조각, 물결/거품 소품, 저항 바 이미지를 라이브 낚시 화면에서 차단해 이상한 아이콘 조각과 겹침을 줄였습니다.
- 릴링 중에는 실제 포획/텐션/저항 게이지가 최우선으로 보이도록 sticky 압축 게이지 스택을 적용하고, 릴 콘솔과 터치존 공간을 고정 예약했습니다.
- 우측 상단 마을 조작 버튼과 우측 하단 메뉴는 투명 프레임, 고정 크기, 테이블형 외곽 제거, 눌림 흔들림 방지, 안전 간격 정책을 유지합니다.
- 마을 HUD와 개척/개발 패널은 너무 붙지도 너무 떨어지지도 않도록 간격을 다시 조정했고, 우측 상단 조작 버튼 옆에서도 HUD 글자가 읽히도록 폭을 보강했습니다.
- 모든 런타임 메뉴 페이지는 공통 프리미엄 아쿠아 카드 스킨과 하단 스크롤 여백을 유지해 고정 하단 메뉴와 카드가 충돌하지 않게 했습니다.
- 상점 구매 금액/가격 배지는 골드 CTA 팔레트로 유지해 배경과 같은 색으로 묻히지 않게 했습니다.
- 타일 픽셀 축소는 아직 적용하지 않았습니다. v2.1.44는 다이아몬드 터치 점수를 0.955로 더 신중하게 조정하고 자동 스냅 보정이 누른 타일 주변에서만 작동하도록 유지했습니다. 타일 픽셀 축소는 세이브 좌표, 건물 footprint, NPC 이동, 충돌 판정, 카메라 경계 마이그레이션이 필요합니다.
- `npm ci`가 만든 `node_modules`는 작업환경 의존성으로 허용하지만, full/patch ZIP과 패키지 경계에는 산출물이 들어가지 않도록 계속 차단합니다. node_modules가 Git에 추적되거나 full/patch ZIP에 들어가는 것은 계속 차단합니다.

## 검증 메모

- `npm run validate`는 README-only 루트 정책, 버전 동기화, CSS 괄호/중괄호/대괄호 균형, 플레이어 8방향 32프레임 해시/방향 고정, NPC 방향 identity 매핑, 오프닝 영상 최초 시작 전용, 건설 확인 플로우, 낚시/메뉴/HUD/타일 가드를 함께 검사합니다.
- 루트 Markdown은 `README.md` 하나만 유지합니다.
- 루트 `APP_VERSION` 파일은 사용하지 않습니다.
