# AquaFantasia v1.1.3 Micro Detail Polish

모바일 웹 낚시 게임 AquaFantasia의 v1.1.3 세부 디자인/안정성 점검 패치입니다. v1.1.1 안전 UI 정책과 v1.1.2 Premium 2.5D 엔진 레이어는 유지하고, 작은 화면에서 보이는 미세한 여백·텍스트·버튼·카드·낚시 HUD 문제를 더 조밀하게 보정했습니다.

## 이번 패치 핵심

- v1.1.1 화면 밀림 방지, 하단 8칸 메뉴 고정, 낚시 화면 스와이프 비활성화 정책을 유지했습니다.
- v1.1.2 Premium 2.5D/3D 렌더 감성, RuntimeQualityManager, Pixi/WebGL 품질 티어, WebGL fallback 개선을 유지했습니다.
- 오래된 CSS 레이어의 `../assets` public 경로를 `/assets`로 정규화해 런타임 이미지 누락과 Vite 빌드 경고 가능성을 줄였습니다.
- HUD, 카드, 상점, 미션, 랭킹, 장비, 가방, 도감 텍스트 containment를 한 번 더 조였습니다.
- 버튼의 최대폭이 과하게 좁아질 수 있는 부분을 보정해 CTA와 가격 버튼이 각자 역할에 맞게 보이도록 다듬었습니다.
- 낚시 화면 상단 HUD, 최근 포획, 캐스팅 버튼, 릴 패널, 결과 카드의 간격·z-index·내부 fill·글씨 대비를 재점검했습니다.
- 확인창 HTML 중복 닫힘 태그를 정리해 작은 DOM 깨짐 가능성을 줄였습니다.
- SVG/벡터 느낌의 신규 자산은 추가하지 않았고, PNG/WebP와 CSS depth 효과 중심으로 유지했습니다.
- 문서는 계속 `README.md` 하나만 유지합니다.

## 검증 명령

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## 배포 구조

- GitHub Pages / Vite build 유지
- Firebase Spark 기준 구조 유지
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.3-micro-detail-polish`
- 세로 고정 정책 유지
- Kakao/인앱 브라우저 회전 방지 정책 유지

## 다음 권장 단계

v1.1.4부터는 실제 모바일 기기에서 360px, 390px, 430px, 태블릿 세로 화면을 비교하면서 포획 결과 연출과 물고기 행동 패턴을 더 게임답게 확장하는 방향이 좋습니다.
