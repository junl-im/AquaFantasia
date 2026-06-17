# AquaFantasia v1.1.6 UI Bounds Polish

모바일 웹 낚시 게임 AquaFantasia의 v1.1.6 UI 화면 경계 안정화 패치입니다. v1.1.5에서 하단 메뉴바 이탈을 복구한 뒤, 다시 실제 모바일 화면에서 흔들릴 수 있는 작은 레이아웃 요인까지 더 강하게 잠갔습니다. v1.1.1 안전 UI 정책, v1.1.2 Premium 2.5D 엔진, v1.1.3 Micro Detail Polish, v1.1.4 Pixel Perfect Polish, v1.1.4 설치 Hotfix, v1.1.5 Layout Rescue를 모두 유지합니다.

## 이번 패치 핵심

- v1.1.5 복구 위에 `v1116-ui-bounds-polish` 최종 화면 경계 가드를 추가했습니다.
- 메뉴 화면의 루트, HUD, 콘텐츠, 카드, 버튼, 랭킹 행이 `100vw` 밖으로 나가지 않도록 `max-width`, `min-width`, `overflow-x:hidden`, `box-sizing`을 다시 고정했습니다.
- 스와이프 이동 중 생기는 `swipe-route-peek/out` transform이 전체 화면이나 카드 기준을 밀지 않도록 최종 차단했습니다.
- 하단 8칸 메뉴바를 더 슬림하게 재정렬하고, 작은 화면에서 아이콘/라벨이 셀 밖으로 밀리지 않도록 다시 보정했습니다.
- 마을, 장비, 가방, 도감, 상점, 미션, 랭킹 화면은 하나의 세로 스크롤 박스 안에서만 움직이도록 정리했습니다.
- 상점 가격, 장비 버튼, 미션 버튼, 도감 카드, 수역 카드의 텍스트 containment를 더 강화했습니다.
- 낚시 화면의 HUD, 최근 포획, 캐스팅 버튼, 릴 패널, 콤보 배지, 결과 카드가 하단 메뉴바와 겹치거나 화면 밖으로 나가지 않도록 다시 압축 배치했습니다.
- 360px 이하 초소형 화면과 540px 이상 태블릿 세로 화면을 별도 보정했습니다.
- SVG/벡터 신규 자산은 추가하지 않았고 PNG/WebP 기반 2.5D/3D 렌더 스타일을 유지했습니다.
- 문서는 계속 `README.md` 하나만 유지합니다.

## v1.1.4 설치 Hotfix 유지

GitHub Actions의 `npm install` 단계에서 존재하지 않는 `@protobufjs/*@1.1.3` 잠금 버전을 찾으며 실패할 수 있던 문제의 수정도 그대로 유지했습니다. `package-lock.json`은 npm에 실제 배포되어 있는 `@protobufjs/aspromise@1.1.2`, `@protobufjs/base64@1.1.2`, `@protobufjs/path@1.1.2`를 사용하고, `package.json` override도 유지합니다.

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
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.6-ui-bounds-polish`
- 세로 고정 정책 유지
- Kakao/인앱 브라우저 회전 방지 정책 유지
- 하단 8칸 메뉴바 화면 내 고정 정책 유지

## 실제 모바일 확인 순서

v1.1.6 적용 후 360px, 390px, 430px, 태블릿 세로 화면에서 마을, 낚시, 장비, 가방, 도감, 상점, 미션, 랭킹을 한 번씩 눌러 확인하세요. 이번 패치는 새 기능 추가보다 화면 밖 이탈 방지와 메뉴별 배치 안정화를 우선합니다.
