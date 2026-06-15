# AquaFantasia v13 탭별 전체 UI 구성도

이 팩은 사용자가 제공한 `낚시.zip` 레퍼런스의 캐주얼 낚시게임 스타일을 기준으로, 각 탭 메뉴의 전체 화면 배치를 1080×1920 기준으로 구성한 UI 설계 이미지입니다.

## 포함 탭

1. 마을 / 홈
2. 낚시
3. 장비
4. 가방
5. 도감
6. 상점
7. 미션
8. 랭킹

## 폴더 구조

- `01_full_screen_clean` : 라벨 없는 완성형 화면 PNG
- `02_annotated_layout_guides` : UI 블록 이름이 표시된 구성도 PNG
- `03_shared_ui_components_png` : 상단 HUD, 하단 탭 네비게이션 공통 컴포넌트
- `04_layout_specs` : 탭별 좌표/구성 JSON
- `05_preview_sheet` : 모든 탭을 한 장으로 확인하는 미리보기

## 공통 레이아웃 규칙

- 기준 해상도: 1080×1920 세로 모바일
- 상단 HUD: 0–250px
- 본문 콘텐츠: 270–1640px
- 하단 탭 네비: 1682–1920px
- 메인 CTA는 주황 젤리 버튼으로 통일
- 보조 액션은 파랑/민트 버튼 사용
- 카드/패널은 레퍼런스처럼 파란 말랑 프레임과 크림색 내부를 우선 사용

## 실제 적용 방향

게임 코드에서는 각 탭을 하나의 Scene 또는 Route로 나누고, 상단 HUD와 하단 네비는 공통 컴포넌트로 고정한 뒤 본문 영역만 교체하면 됩니다.
`tab_ui_layout_map.json`의 rect 좌표를 기준으로 CSS absolute layout 또는 React component layout으로 옮기면 됩니다.
