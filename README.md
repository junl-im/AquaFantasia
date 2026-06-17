# AquaFantasia v1.1.15 Foundation Frame Rescue

모바일 웹 낚시 게임 AquaFantasia의 v1.1.15 뼈대 안정화 패치입니다. 이번 패치는 새 기능을 늘리는 대신, 실제 화면에서 가장 먼저 무너져 보이는 마을 첫 화면, 상단 배너, 로그인 유지 토글, 공통 프레임 모서리, 미션 탭 밀림, 낚시 효과 화면 이탈을 우선 복구합니다.

## v1.1.15에서 확인한 문제

- 마을 배경이 CSS 배경 변수와 여러 배경 레이어에 묻혀, 사용자가 제공한 섬 배경 이미지가 실제 화면에서 보이지 않을 수 있었습니다.
- 마을 상단 `Aqua Fantasia` 배너가 화면 좌우를 충분히 채우지 못하고 작아 보였습니다.
- 첫 시작 화면의 `이 기기에서 로그인 유지` 글씨가 배경 아트와 섞여 번져 보일 수 있었고, 체크 상태도 눈에 잘 들어오지 않았습니다.
- 여러 카드/패널 프레임의 모서리가 서로 다른 패치 레이어에 덮이며 통일감이 떨어질 수 있었습니다.
- 테두리 안쪽 텍스트 여백이 부족해 글씨가 프레임에 붙어 보이는 문제가 남아 있었습니다.
- 미션 탭의 카드 레이아웃이 이전 compact 규칙과 frame 규칙이 겹치며 옆으로 밀려 보일 수 있었습니다.
- 낚시 화면의 버블/스플래시/캐스팅 효과 일부가 낚시 스테이지 밖으로 튀거나 잘려 깨져 보일 수 있었습니다.
- 낚시 캐릭터를 우측으로 배치한 뒤에도 Pixi 캐스팅 경로와 HTML fallback 캐스팅 효과가 충분히 왼쪽 투척처럼 보이지 않았습니다.

## v1.1.15에서 반영한 부분

- 마을 배경 복구
  - 사용자가 제공한 섬 이미지를 마을 화면에 실제 `<img>` 배경 레이어로 삽입
  - 기본 마을 배경을 `public/assets/v1110/home/village_islands_user_bg.png`로 지정
  - WebP 자산도 유지하여 기존 최적화 자산을 보존
  - 배경 레이어가 WebGL/수중 레이어에 묻히지 않도록 z-index와 opacity 재정리

- 마을 상단 배너 재조정
  - 위아래는 과하게 늘리지 않되, 요청대로 좌우 폭을 화면에 더 가득 차게 보정
  - 매우 작은 화면에서는 자동 축소하여 UI 밖으로 나가지 않게 유지

- 시작 화면 로그인 유지 토글 개선
  - `이 기기에서 로그인 유지` 글씨를 흰색으로 고정
  - 낚시터로 출항 계열과 비슷한 밝은 게임 UI 텍스트 느낌으로 보정
  - 체크 박스 표시를 별도 aqua 박스와 체크 표시로 다시 보이게 개선

- 공통 프레임 모서리 정비
  - 카드, 패널, 미션, 상점, 도감, 랭킹, HUD의 모서리를 aqua 2.5D 프레임 톤으로 통일
  - 텍스트가 테두리에 붙지 않도록 내부 여백 보강
  - SVG/벡터가 아닌 기존 PNG 프레임 자산 유지

- 미션 탭 밀림 복구
  - 미션 카드 grid를 `copy / button / progress` 구조로 재고정
  - 진행 게이지가 텍스트나 버튼과 겹치지 않게 재배치
  - 세로 스크롤은 유지하고 가로 밀림만 차단

- 낚시 화면 효과 클리핑
  - 낚시 스테이지, Pixi 레이어, HTML fallback, stage-ui에 `contain: paint`와 overflow clipping 보강
  - 캐스팅 trail, splash, bite/action FX가 화면 밖으로 깨져 나가는 문제를 줄임

- 낚시 캐릭터/찌 방향 보정
  - 캐릭터는 더 작고 우측에 붙은 상태 유지
  - Pixi 캐스팅 시작점을 우측, 도착점을 왼쪽 수면으로 재조정
  - HTML fallback 찌 애니메이션도 우측에서 왼쪽으로 던지는 방향으로 보정

## 유지 중인 정책

- v1.1.4 설치 Hotfix 유지
- v1.1.5~v1.1.9 레이아웃/viewport/PWA 안전장치 유지
- v1.1.10 마을 배경/메뉴 순서/스와이프 정책 유지
- v1.1.11 기술·성능·호환성 안정화 유지
- v1.1.12 콘텐츠 흐름/엔진 QA 유지
- v1.1.13 세부 안정화 QA 유지
- v1.1.14 버튼 스타일 Hotfix 유지
- README.md 단일 문서 정책 유지
- SVG/벡터 신규 자산 추가 없음
- PNG/WebP 기반 2.5D/3D 방향 유지

## 적용 방법

1. 변경 파일만 ZIP을 압축 해제합니다.
2. 기존 프로젝트 루트에 그대로 덮어씁니다.
3. GitHub Desktop에서 변경 파일을 확인합니다.
4. Commit 후 Push 합니다.
5. GitHub Actions `validate`가 통과하는지 확인합니다.

## 검증 명령

```bash
npm ci --ignore-scripts --no-audit --progress=false
npm run validate
npm run typecheck
npm run build
npm run audit
npm run runtime:check
node --check public/sw.js
```

## 버전

- 앱 버전: `1.1.15`
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.15-foundation-frame-rescue`
- 문서 정책: README.md 단일 문서 유지

## 누적 검증 마커

- v1.1.4 Pixel Perfect Polish
- v1.1.5 UI Layout Rescue
- v1.1.6 UI Bounds Polish
- v1.1.7 Viewport Safe Lock
- v1.1.8 Layout QA Sweep
- v1.1.9 Interaction QA Polish
- v1.1.10 Village Flow Swipe Polish
- v1.1.11 Tech Perf Compat
- v1.1.12 Content Flow Engine QA
- v1.1.13 Detail Stability QA
- v1.1.14 Button Style Hotfix
- v1.1.15 Foundation Frame Rescue

## v2.1 Lumina Village Polish Notes

The v2 village overhaul now includes a polished first-village pass: Lumina Bay naming, a collapsible build tray, objective tracker, mobile pinch zoom, tap tile feedback, soft camera follow, camera bounds, and generated village decoration layer. The supplied object/NPC/tilemap sheets are staged under `public/assets/v2/village/` for the next sprite slicing pass.

## v2.2 Mobile RPG Controls Polish Notes

The v2 village world now uses mobile RPG-style controls: horizontal swipe tab routing is disabled, the top HUD is compact, the old bottom menu is replaced by a right-side four-button menu, a left-bottom analog joystick is added, build mode opens as a popup from a small Build button, player/NPC movement is slower, buildings render smaller, +/− zoom buttons refocus on the player, and supplied SD character/icon/generated asset packs are staged under `public/assets/v22/`.
