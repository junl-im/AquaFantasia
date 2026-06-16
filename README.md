# AquaFantasia v1.1.5 UI Layout Rescue Hotfix

모바일 웹 낚시 게임 AquaFantasia의 v1.1.5 UI 레이아웃 긴급 복구 패치입니다. v1.1.1 안전 UI 정책, v1.1.2 Premium 2.5D 엔진, v1.1.3 Micro Detail Polish, v1.1.4 Pixel Perfect Polish와 설치 Hotfix를 유지하면서, v1.1.4에서 발생한 하단 메뉴바 밀림과 메뉴별 UI 화면 밖 이탈 문제를 바로잡았습니다.

## 이번 패치 핵심

- v1.1.4에서 하단 메뉴바에 `left/right` 보정을 추가했지만 이전 `translateX(-50%)`가 남아 메뉴바가 화면 밖으로 밀릴 수 있던 문제를 수정했습니다.
- 하단 8칸 메뉴바를 다시 viewport 기준 `left/right` 고정형으로 복구했습니다.
- 메뉴바의 `width:auto`, `transform:none`, `right/left safe-area` 정책을 강제해 360px·390px·430px 폭에서 화면 밖으로 나가지 않게 했습니다.
- 마을, 장비, 가방, 도감, 상점, 미션, 랭킹 화면의 scroll container를 다시 `overflow-y:auto`로 고정했습니다.
- `runtime-hud`, 카드, 상점 가격, 미션 카드, 랭킹 행, 도감/가방 그리드의 max-width와 min-width를 재정리했습니다.
- 낚시 화면은 전체 배경과 Pixi/WebGL 효과를 유지하되 HUD, 최근 포획, 캐스팅 버튼, 릴 패널, 결과 카드가 하단 메뉴바와 겹치거나 화면 밖으로 나가지 않게 다시 배치했습니다.
- 초소형 360px 이하 대응을 별도 media query로 강화했습니다.
- SVG/벡터 신규 자산은 추가하지 않았고 PNG/WebP 기반 2.5D 렌더 스타일을 유지했습니다.
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
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.5-ui-layout-rescue`
- 세로 고정 정책 유지
- Kakao/인앱 브라우저 회전 방지 정책 유지
- 하단 8칸 메뉴바 화면 내 고정 정책 재복구

## 다음 권장 단계

v1.1.5 적용 후 실제 모바일 360px, 390px, 430px, 태블릿 세로 화면에서 각 메뉴를 한 번씩 눌러보고, 화면 밖 이탈이 사라졌는지 먼저 확인하는 것이 우선입니다. 그 다음 물고기 행동 패턴, 결과 연출, 수역별 보스 연출을 확장하는 방향이 좋습니다.
