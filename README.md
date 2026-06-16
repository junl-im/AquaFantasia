# AquaFantasia v1.1.4 Pixel Perfect Polish

모바일 웹 낚시 게임 AquaFantasia의 v1.1.4 미세 품질 점검 패치입니다. v1.1.1 안전 UI 정책, v1.1.2 Premium 2.5D 엔진, v1.1.3 Micro Detail Polish를 유지하면서 작은 화면·낚시 HUD·결과 카드·랭킹·상점·미션의 마지막 여백과 텍스트 안정성을 더 조였습니다.

## 이번 패치 핵심

- v1.1.1 화면 밀림 방지, 하단 8칸 메뉴 고정, 낚시 화면 스와이프 비활성화 정책을 유지했습니다.
- v1.1.2 2.5D/3D 렌더 감성과 RuntimeQualityManager 품질 티어를 유지했습니다.
- v1.1.3 카드 fill, 버튼 대비, public asset 경로 정규화, 서비스워커 안전 캐시 정책을 유지했습니다.
- v1.1.4 `pixelPolish` 레이어를 추가해 초소형 화면에서 HUD, 지갑, 메뉴 라벨, 랭킹 행, 상점 가격, 미션 진행률, 결과 카드 버튼이 넘치지 않도록 한 번 더 보정했습니다.
- Pixi 포획 팝업 연출 중 사용자가 화면을 이동하거나 상태가 바뀌어도 ticker가 남지 않도록 정리했습니다.
- 릴 패널의 꾹 누르기 입력은 실제 릴링 상태에서만 반응하도록 보호했습니다.
- WebGL/HTML fallback 낚시 화면 모두에서 배경 효과가 캐릭터, 찌, 게이지, 최근 포획, 결과 카드 위로 올라오지 않도록 레이어와 pointer 정책을 재점검했습니다.
- SVG/벡터 신규 자산은 추가하지 않았고 PNG/WebP 기반 2.5D 렌더 스타일을 유지했습니다.
- 문서는 계속 `README.md` 하나만 유지합니다.

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
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.4-pixel-perfect-polish`
- 세로 고정 정책 유지
- Kakao/인앱 브라우저 회전 방지 정책 유지

## 다음 권장 단계

v1.1.5부터는 실제 모바일 기기 360px, 390px, 430px, 태블릿 세로 화면을 놓고 물고기별 행동 패턴, 결과 연출, 수역별 보스 연출을 더 확장하는 방향이 좋습니다.
