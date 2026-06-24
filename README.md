# AquaFantasia v2.1.43

## v2.1.43 Change Log

- Added a v2.1.43 sweep for UI overlap, village placement, fishing cockpit readability, HUD spacing, expedition panel spacing, and common aqua card pages.
- Fishing keeps the v2.1.42 bite action and adds a v2143 safe-stack layer so the rod/bait strip, sea-lane card, priority hint, casting CTA, reel gauges, reel console, and touch zone occupy clearer vertical lanes.
- Old fishing guide frames, start cards, prop fragments, image button frames, vertical gauge art, and resistance art are suppressed in the live fishing screen to avoid stray overlapping icon fragments.
- The reeling phase prioritizes the actual capture/tension/stamina gauges with a sticky compact gauge stack and reserves fixed space for the reel console and touch zone.
- Right-top village controls and right-bottom menu keep the transparent-frame policy with fixed sizes, no table-like wrapper, no press shift, and safer spacing.
- Village HUD and expedition/opened development panel spacing were adjusted so they are neither glued together nor pushed too far apart.
- Runtime menu pages keep a common premium aqua card skin with stronger scroll bottom padding so cards and the fixed bottom nav do not collide.
- Shop price/purchase badges stay on the gold CTA palette so the buy amount does not disappear into the card background.
- Tile pixels are still not reduced. v2.1.43 tightens the diamond touch score to 0.96 and limits auto-snap placement assistance to a nearby radius so taps feel precise without migrating save coordinates, building footprints, NPC movement, collision, or camera boundaries.
- The `npm ci` generated `node_modules` folder is still allowed as a local/CI working dependency, while ZIP/package boundaries continue to reject generated artifacts.

## v2.1.43 변경사항

- UI 겹침, 마을 배치, 낚시 콕핏 가독성, HUD 간격, 개척 패널 간격, 공통 아쿠아 카드 페이지를 다시 점검하는 v2.1.43 스윕을 추가했습니다.
- 낚시 화면은 v2.1.42의 입질 후 `릴링 시작` 버튼을 유지하면서, 로드/미끼 스트립, 바다물길 카드, 우선 안내, 캐스팅 CTA, 릴 게이지, 릴 콘솔, 터치존이 더 명확한 세로 레인에 놓이도록 v2143 safe-stack 레이어를 추가했습니다.
- 구형 낚시 사용법 카드, 시작 카드, 소품 조각, 이미지 버튼 프레임, 세로 게이지 이미지, 저항 바 이미지를 라이브 낚시 화면에서 차단해 이상한 아이콘 조각과 겹침을 줄였습니다.
- 릴링 중에는 실제 포획/텐션/저항 게이지가 최우선으로 보이도록 sticky 압축 게이지 스택을 적용하고, 릴 콘솔과 터치존 공간을 고정 예약했습니다.
- 우측 상단 마을 조작 버튼과 우측 하단 메뉴는 투명 프레임, 고정 크기, 테이블형 외곽 제거, 눌림 흔들림 방지, 안전 간격 정책을 유지합니다.
- 마을 HUD와 개척/개발 패널은 너무 붙지도 너무 떨어지지도 않도록 간격을 다시 조정했습니다.
- 모든 런타임 메뉴 페이지는 공통 프리미엄 아쿠아 카드 스킨과 하단 스크롤 여백을 유지해 고정 하단 메뉴와 카드가 충돌하지 않게 했습니다.
- 상점 구매 금액/가격 배지는 골드 CTA 팔레트로 유지해 배경과 같은 색으로 묻히지 않게 했습니다.
- 타일 픽셀 축소는 아직 적용하지 않았습니다. v2.1.43은 다이아몬드 터치 점수를 0.96으로 더 신중하게 조정하고 자동 스냅 보정 반경을 근거리로 제한했습니다. 타일 픽셀 축소는 세이브 좌표, 건물 footprint, NPC 이동, 충돌 판정, 카메라 경계 마이그레이션이 필요합니다.
- `npm ci`가 만든 `node_modules`는 작업환경 의존성으로 허용하지만, full/patch ZIP과 패키지 경계에는 산출물이 들어가지 않도록 계속 차단합니다. node_modules가 Git에 추적되거나 full/patch ZIP에 들어가는 것은 계속 차단합니다.

## 검증 메모

- `npm run validate`는 README-only 루트 정책, 버전 동기화, CSS 괄호/중괄호/대괄호 균형, 플레이어 8방향 32프레임 해시/방향 고정, NPC 방향 identity 매핑, 오프닝 영상 최초 시작 전용, 건설 확인 플로우, 낚시/메뉴/HUD/타일 가드를 함께 검사합니다.
- 루트 Markdown은 `README.md` 하나만 유지합니다.
- 루트 `APP_VERSION` 파일은 사용하지 않습니다.
