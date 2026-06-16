# AquaFantasia v1.1.1 Quality Engine + UI Audit

모바일 웹 낚시 게임 AquaFantasia의 v1.1.1 대규모 안정화/품질 점검 패치입니다.

## 이번 패치 핵심

- 화면이 밀리거나 UI가 화면 밖으로 나가는 문제를 막기 위해 앱 셸/하단 메뉴/스와이프 transform 기준을 다시 고정했습니다.
- `RuntimeQualityManager`를 추가해 기기 성능에 따라 WebGL 수중 효과와 DPR 상한을 자동 조정합니다.
- PixiJS 낚시 런타임은 유지하면서 WebGL 수중 레이어에 품질 티어와 UI 안전 알파를 추가했습니다.
- 하단 메뉴는 8칸 고정 프레임, 큰 아이콘, 낮은 프레임 높이를 유지하도록 최종 보정했습니다.
- 상점/미션/랭킹/장비/가방/도감 카드의 테두리 안쪽 배경 fill과 텍스트 containment를 보강했습니다.
- 낚시 화면은 배경/수중 효과가 캐릭터, 찌, 게이지, 버튼, 최근 포획을 묻지 않도록 z-index와 투명도를 다시 조정했습니다.
- 낚시 화면은 스와이프 메뉴 이동 비활성화 유지, 다른 메뉴는 좌우 스와이프 이동 유지입니다.
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
- PWA / service worker 캐시 버전: `aqua-fantasia-v1.1.1-quality-engine-ui-audit`
- 세로 고정 정책 유지
- Kakao/인앱 브라우저 회전 방지 정책 유지

## 다음 권장 단계

v1.1.2부터는 UI 폴리싱을 계속하면서, 낚시 액션 결과 팝업과 물고기 행동 패턴을 더 게임답게 확장하는 방향이 좋습니다.
