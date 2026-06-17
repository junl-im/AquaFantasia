# AquaFantasia v1.1.14 Button Style Hotfix

모바일 웹 낚시 게임 AquaFantasia의 v1.1.14 버튼 스타일 긴급 보정 패치입니다. v1.1.10~v1.1.13의 마을 배경, 메뉴 순서, 스와이프, 세로 스크롤, 기술/성능/호환성 안정화는 유지하면서, 사용자가 요청한 버튼 톤과 길이가 실제 화면에 적용되지 않던 문제를 다시 점검해 보정했습니다.

## v1.1.14에서 확인한 문제

- 장비 강화 금액 버튼이 `compact-cost-btn`이면서 동시에 `image-btn soft`를 가지고 있어, 최종 CSS 우선순위에 따라 금색이 아니라 aqua 계열로 보일 수 있었습니다.
- 가방의 상점/사용/낚시/미션 버튼은 일부 카드 규칙 때문에 길이가 카드 폭 전체로 늘어날 수 있었습니다.
- 미션 진행/수령/완료 버튼은 일부 상태에서 blue/cyan이 섞여 보여, 장비 관리에서 마음에 든 aqua 버튼 톤과 일관되지 않을 수 있었습니다.
- 상점 무료/가격 배지는 금액 계열이어야 하는데, 이전 CSS 계층이 여러 번 겹쳐 최종 색/길이가 화면마다 달라질 여지가 있었습니다.
- 랭킹 도전, 도감 채우기, 가방 상점 같은 이동 액션 버튼에 명시적인 역할 클래스가 없어, 이전 레이어의 폭/색상 규칙이 다시 덮을 수 있었습니다.

## v1.1.14에서 반영한 부분

- `btn-aqua-action` 역할 클래스 추가
  - 장비 `낚시터`
  - 가방 `상점`, `사용`, `낚시`, `미션`
  - 도감 `채우기`
  - 미션 `진행`, 각 미션 버튼, `수령`, `완료`
  - 랭킹 `도전`
- `btn-gold-cost` 역할 클래스 추가
  - 장비 강화 금액 버튼
  - 상점 `무료`
  - 상점 구매 가격 배지
- 기존 2.5D/3D PNG 버튼 자산 사용 유지
  - aqua 액션: `/assets/v3d_underwater/ui/buttons/button_mid_aqua_normal.png`
  - gold 금액: `/assets/v3d_underwater/ui/buttons/button_mid_gold_normal.png`
- 버튼 길이 보정
  - 카드 폭 전체로 늘어나던 버튼을 `fit-content` 기준으로 보정
  - 글씨 길이에 맞되 터치 가능한 최소 높이는 유지
  - 초소형 화면에서는 자동으로 더 작게 보정
- 미션 보상 수령 버튼은 금색으로 바꾸지 않고 aqua 액션 톤 유지
- v1.1.13까지의 하단 메뉴바, 세로 스크롤, 좌우 스와이프, 낚시 엔진, PWA, RuntimeQualityManager 안정화 정책 유지
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

- 앱 버전: `1.1.14`
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.14-button-style-hotfix`
- 문서 정책: README.md 단일 문서 유지

## 유지 중인 누적 안정화 계보

- v1.1.4 Pixel Perfect Polish
- v1.1.8 Layout QA Sweep
- v1.1.9 Interaction QA Polish
- v1.1.10 Village Flow Swipe Polish
- v1.1.11 Tech Perf Compat
- v1.1.12 Content Flow Engine QA
- v1.1.13 Detail Stability QA
- v1.1.14 Button Style Hotfix
