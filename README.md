# AquaFantasia v1.1.7 Viewport Safe Lock

모바일 웹 낚시 게임 AquaFantasia의 v1.1.7 레이아웃 안전 보강 패치입니다. v1.1.6에서 화면 경계 가드를 넣었지만, 일부 실제 기기/브라우저에서 `100vw`, 태블릿 세로 보정, fixed 하단바 기준이 다시 엇갈릴 수 있는 위험이 남아 있었습니다. 이번 패치는 신규 기능보다 **최하단 메뉴바, 메뉴별 UI, 낚시 HUD가 실제 앱 화면 밖으로 나가지 않게 하는 것**을 최우선으로 잡았습니다.

## 이번 패치 핵심

- `v1117-viewport-safe-lock` 최종 viewport 안전 레이어를 추가했습니다.
- v1.1.6의 `100vw` 강제 기준 위에 실제 `portrait-width`/앱 케이지 기준을 다시 덮어, 화면이 넓은 브라우저·인앱 브라우저·태블릿 세로에서도 하단바가 앱 밖으로 벌어지지 않게 했습니다.
- v1.1.6의 540px 이상 세로 화면 보정에서 다시 들어갈 수 있던 `left:50% + translateX(-50%)` 중심 정렬을 v1.1.7에서 `left/right auto-width` 방식으로 재고정했습니다.
- 하단 8칸 메뉴바는 앱 폭 기준으로 inset 계산을 다시 적용하고, 런타임에서 실제 bounding box가 앱 밖으로 나가면 즉시 `v117-nav-bounds-emergency` 보정이 걸리도록 했습니다.
- 메뉴 화면 루트, HUD, 콘텐츠, 카드, 버튼, 리스트, 랭킹 패널을 `width:100%`, `max-width:500px`, `overflow-x:hidden`, `min-width:0` 기준으로 다시 정리했습니다.
- 스와이프 화면 전환 중 `swipe-route-peek/out` 클래스가 화면 전체나 내부 콘텐츠를 밀지 않도록 v1.1.7 레이어에서도 재차 차단했습니다.
- 낚시 화면 HUD, 최근 포획, 릴 패널, 캐스팅 버튼, 결과 카드가 하단 메뉴바와 겹치거나 앱 화면 밖으로 나가지 않도록 다시 묶었습니다.
- `#toast-root`도 앱 폭 기준으로 보정해 토스트가 화면 가장자리 밖으로 튀는 상황을 줄였습니다.
- v1.1.4 Pixel Perfect Polish와 v1.1.4 설치 Hotfix의 `@protobufjs/*` 수정, v1.1.5 Layout Rescue, v1.1.6 UI Bounds Polish를 유지합니다.
- SVG/벡터 신규 자산은 추가하지 않았고 PNG/WebP 기반 2.5D/3D 렌더 스타일을 유지했습니다.
- 문서는 계속 `README.md` 하나만 유지합니다.

## 유지된 안전 정책

- 하단 메뉴바 8칸 고정
- 낚시 화면 스와이프 이동 비활성화
- 카드/테두리 내부 배경 fill 보강 유지
- 상점/미션/랭킹/장비/가방/도감 텍스트 containment 유지
- RuntimeQualityManager, WebGL 품질 티어, Pixi DPR 상한 유지
- 서비스워커 프리캐시 실패 방지 유지
- GitHub Pages / Vite build 구조 유지

## 검증 명령

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
node --check public/sw.js
```

## 배포 구조

- GitHub Pages / Vite build 유지
- Firebase Spark 기준 구조 유지
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.7-viewport-safe-lock`
- 세로 고정 정책 유지
- Kakao/인앱 브라우저 회전 방지 정책 유지
- 하단 8칸 메뉴바 화면 내 고정 정책 유지

## 실제 모바일 확인 순서

v1.1.7 적용 후 360px, 390px, 430px, 540px 이상 세로 화면에서 마을, 낚시, 장비, 가방, 도감, 상점, 미션, 랭킹을 순서대로 눌러 확인하세요. 특히 하단 메뉴바가 앱 폭 밖으로 밀리지 않는지, 각 메뉴 카드가 좌우로 튀지 않는지, 낚시 HUD와 결과 카드가 하단바에 가리지 않는지 먼저 확인하면 됩니다.
