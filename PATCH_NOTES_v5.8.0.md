# Aqua Fantasia v5.8.0 2.5D Art Reboot + Stability Pass

## 목적

v5.7.0에서 지역별 물 배경은 개선했지만, 누적 패치로 인해 카드, 버튼, 하단 네비게이션, 가이드 패널, 낚시 HUD가 서로 다른 디자인 톤으로 섞여 보였습니다. v5.8.0은 기능보다 **보이는 게임 퀄리티와 안정성**을 우선으로 정리하는 패치입니다.

## 변경 사항

- `src/runtime/v58-ui-art-reboot.js` 추가
- 2.5D UI용 SVG 에셋 추가
  - `assets/art/v58_panel_25d.svg`
  - `assets/art/v58_button_primary_25d.svg`
  - `assets/art/v58_nav_shell_25d.svg`
  - `assets/art/v58_icon_fish_25d.svg`
  - `assets/art/v58_icon_lake_25d.svg`
- 주요 UI를 2.5D 톤으로 재정렬
  - 첫 실행 가이드
  - 지역 카드
  - 하단 네비게이션
  - 일반 카드/패널
  - 주요 버튼
  - 낚시 화면 캔버스/스테이지 외곽
- `QUICK ACTION`, `Node24 OK`, `STACK SAFE`, Pixi/Atlas 개발용 잔여 텍스트 자동 숨김
- 작은 화면, Save-Data, 저사양 기기, reduced motion 환경에서 자동 경량화
- Service Worker 캐시 버전 갱신
  - `aqua-fantasia-v5.8.0-2-5d-art-20260612`

## 적용 방식

기존 런타임 로직을 직접 덮어쓰지 않고, CSS/DOM 클래스 보강을 중심으로 작동합니다. 그래서 게임 진행, 저장 데이터, Firebase, 낚시 시스템에는 영향이 적습니다.
