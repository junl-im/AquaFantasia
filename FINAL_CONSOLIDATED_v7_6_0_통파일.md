# Aqua Fantasia v7.6.0 최종 정리 통파일

## 1. 이번 패치 목표

- 모바일에서 화면을 드래그/스크롤해도 하단 메뉴바가 최하단에 고정되도록 수정.
- SVG/벡터 느낌을 피하고, 첨부된 v9 PNG 전용 2.5D/3D 렌더드 에셋을 실제 런타임에 연결.
- 낚시 화면의 조작 안내, 캐스팅/입질/릴링 액션감, UI 겹침을 개선.
- Vite / TypeScript / PixiJS 8 / Howler.js / Firebase / PWA / GitHub Actions 구조를 유지하면서 안정적으로 확장.

## 2. 버전/캐시

- 앱 버전: `7.6.0`
- 서비스워커 캐시명: `aqua-fantasia-v7.6.0-nav-fixed-25d-runtime`
- 검증 스크립트: `tools/check-v760-nav-fixed-25d-runtime.mjs`

## 3. 핵심 수정 요약

### 하단 네비게이션 고정

기존 v7.5.0 CSS에는 기본 `.bottom-nav`는 `fixed`였지만, 세로 고정 모드에서 아래 규칙이 나중에 덮어쓰고 있었습니다.

```css
html.portrait-only-game .bottom-nav {
  position: absolute !important;
}
```

이 때문에 스크롤 가능한 화면에서는 하단 네비게이션이 화면 최하단 고정 UI가 아니라 스크롤 콘텐츠처럼 움직일 수 있었습니다.

v7.6.0에서는 다음 구조로 바꿨습니다.

- `mountBottomNav()`가 네비게이션을 스크롤되는 `main.game-screen` 내부가 아니라 `#app` 바로 아래 sibling으로 마운트.
- `.bottom-nav.fixed-root-nav` 클래스와 `data-fixed-root="true"` 속성 추가.
- 최종 CSS 레이어에서 `position: fixed !important`, safe-area, 중앙 고정 폭, 높은 z-index를 강제.
- 마을/장비/도감/상점/미션뿐 아니라 낚시 화면에도 하단 네비게이션 연결.

### 낚시 화면 UI 겹침 완화

- 하단 네비게이션 높이를 CSS 변수 `--bottom-nav-height-v760`으로 관리.
- 캐스트 버튼 위치를 네비게이션 위로 이동.
- 릴 패널 위치를 네비게이션 위로 이동.
- 콤보 배지도 네비게이션/릴 패널과 겹치지 않게 재배치.

### 실전 플레이 안내 강화

낚시 화면에 `fishing-guide-card`를 추가했습니다.

표시 내용:

1. 찌 던지기
2. 물었다! 터치
3. 눌렀다 떼며 녹색 3초 유지

캐스팅/릴링 중에는 안내 카드가 자동으로 사라지도록 `casting-mode`, `reeling-mode` 상태 클래스를 연결했습니다.

### 낚시 액션감 개선

- 캐스팅 시작 시 stage 상태 클래스로 안내 카드 숨김.
- 입질 대기/릴링 상태 전환 시 UI 상태 정리.
- 릴링 중 bobber가 누름/해제 상태에 따라 흔들리고 당겨지는 느낌을 추가.
- v9 링/오라/파티클 이미지를 터치 링, 스플래시, 성공 블룸에 연결.

## 4. v9 2.5D/3D 렌더드 에셋 배치

원본 에셋 팩은 PNG 541개 구조였습니다. 모바일 성능 우선 원칙에 따라 전부를 런타임 프리로드하지 않고, 실제 게임에 바로 필요한 핵심 에셋만 `public/assets/v9`에 선별 배치했습니다.

선별 배치 결과:

- UI PNG: 25개
- 아이콘 PNG: 10개
- 물고기 PNG: 28개
- 장비 PNG: 9개
- FX PNG: 10개
- 배경/오버레이 WebP: 12개
- 런타임 매니페스트: `public/assets/v9/manifest.runtime.json`

대형 1920x1080 배경 PNG는 모바일 전송량과 GPU 텍스처 비용을 줄이기 위해 1280px WebP로 변환했습니다.

## 5. 실제 연결된 에셋 위치

### UI 프레임

- 하단 네비게이션: `public/assets/v9/ui/bottom_nav_bar_deepblue.png`
- 상단 HUD/낚시 상단바: `public/assets/v9/ui/panel_status_deepblue.png`
- 메인 패널: `public/assets/v9/ui/content_panel_aqua.png`
- 모달/결과창: `public/assets/v9/ui/modal_aqua.png`
- 도감 카드: `public/assets/v9/ui/card_dex_deepblue.png`, `card_dex_gold.png`
- 미션 카드: `public/assets/v9/ui/card_mission_emerald.png`
- 낚시 릴 패널: `public/assets/v9/ui/fishing_zone_aqua.png`

### 버튼

- 주요 CTA: `button_large_gold_normal.png`, `button_large_gold_pressed.png`
- 보조 버튼: `button_medium_aqua_normal.png`
- 퍼플 버튼: `button_medium_purple_normal.png`
- 날씨/상태 버튼: `button_medium_emerald_normal.png`
- 하단 nav active: `button_tiny_gold_normal.png`

### 네비게이션 아이콘

- 마을: `public/assets/v9/icons/nav_village.png`
- 낚시: `public/assets/v9/icons/nav_fishing.png`
- 장비: `public/assets/v9/icons/nav_gear.png`
- 도감: `public/assets/v9/icons/nav_dex.png`
- 상점: `public/assets/v9/icons/nav_shop.png`
- 미션: `public/assets/v9/icons/nav_mission.png`

### 낚시 런타임

- 보트: `public/assets/v9/equipment/boat.png`
- 찌: `public/assets/v9/equipment/bobber.png`
- 장력 게이지 프레임: `public/assets/v9/ui/progress_frame_aqua.png`
- 터치 링: `public/assets/v9/fx/ring_aqua.png`
- 성공 오라: `public/assets/v9/fx/aura_gold.png`

### 수역 배경

- 바다: `public/assets/v9/bg/ocean.webp`
- 호수: `public/assets/v9/bg/lake.webp`
- 강/산호숲: `public/assets/v9/bg/river.webp`
- 항구: `public/assets/v9/bg/town_waterfront.webp`
- 심해: `public/assets/v9/bg/deepsea.webp`
- 하천/정원: `public/assets/v9/bg/stream.webp`

## 6. 주요 수정 파일

- `src/main.ts`
  - 하단 nav 마운트 위치 변경.
  - 낚시 화면에 bottom nav 추가.
  - 낚시 안내 카드 추가.
  - v9 보트/찌/게이지/FX 연결.
  - 릴링 중 bobber 액션 보강.

- `src/styles.css`
  - v7.6.0 최종 CSS 레이어 추가.
  - 하단 nav fixed root 강제.
  - v9 UI 프레임/버튼/아이콘/FX 연결.
  - 낚시 화면 UI 겹침 완화.

- `src/data.ts`
  - `APP_VERSION`, `CACHE_NAME` 갱신.
  - 수역 배경을 v9 WebP로 연결.
  - 주요 물고기 이미지를 v9 PNG로 연결.
  - nav 아이콘을 v9 PNG로 연결.

- `public/sw.js`
  - 캐시명 v7.6.0 갱신.
  - 핵심 v9 런타임 에셋 precache 추가.

- `tools/validate-clean.mjs`
  - v7.6.0 기준 검증으로 갱신.

- `tools/check-v760-nav-fixed-25d-runtime.mjs`
  - fixed root nav, v9 에셋, CSS/TS 토큰 검증 추가.

## 7. 검증 결과

아래 명령을 실제 실행했고 통과했습니다.

```bash
npm run validate
npm run typecheck
npm run build
```

빌드 결과:

- Vite production build 성공.
- `dist/assets/v9/ui/bottom_nav_bar_deepblue.png` 존재 확인.
- GitHub Actions 구조 유지.

## 8. 엔진 판단

현재 방향은 PixiJS 8 유지가 가장 안전합니다.

이유:

- 이미 Vite/TypeScript/PixiJS 8/Howler/Firebase/PWA 구조가 잡혀 있음.
- Aqua Fantasia의 현재 목표는 완전 3D 시뮬레이션보다 모바일에서 빠른 2.5D 렌더드 PNG/WebP 기반 액션 낚시 화면이 우선임.
- PixiJS는 GPU 기반 2D/2.5D 렌더링과 스프라이트 애니메이션에 적합함.
- 완전 3D 수중 월드, glTF 캐릭터, 카메라 이동, 라이트/쉐이더 중심으로 바뀌는 시점에는 PlayCanvas/WebGPU 브랜치를 별도로 실험하는 것이 좋음.

즉, 지금 당장 엔진을 갈아타기보다 `PixiJS 8 + 렌더드 2.5D 에셋 + 점진적 WebP/Atlas/FX 최적화`가 가장 빠르고 안전한 최고 품질 방향입니다.

## 9. 덮어쓰기 방법

1. 패치 ZIP을 압축 해제합니다.
2. 기존 GitHub 프로젝트 루트에 그대로 덮어씁니다.
3. GitHub Desktop에서 변경 사항을 확인합니다.
4. Commit 후 Push합니다.
5. GitHub Actions에서 validate/typecheck/build가 통과하면 Pages 배포가 갱신됩니다.
6. 모바일에서 이전 화면이 남으면 브라우저 캐시 또는 PWA 앱 데이터를 지우고 다시 접속합니다.

## 10. 다음 개발 우선순위 제안

1. 낚시 화면을 `casting`, `waiting`, `bite`, `reeling`, `success`, `fail` 별 애니메이션 상태 머신으로 더 분리.
2. PixiJS `Assets` 로더에 v9 fish/background manifest를 연결해 수역별 lazy loading 강화.
3. WebP Atlas 또는 TexturePacker 계열 atlas로 UI/FX draw call 감소.
4. 낚싯줄, 물살, 입질 파동을 PixiJS Graphics/mesh 또는 pre-rendered FX로 강화.
5. Firebase는 Spark 플랜 유지 기준으로 anonymous save sync와 랭킹/미션 클레임 검증부터 점진 연결.
