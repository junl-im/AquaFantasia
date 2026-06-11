# Aqua Fantasia v4.1 Flow Combat Polish

## 핵심 목표
- 낚시 화면 UI 겹침 제거
- 실전 낚시 중 지금 무엇을 눌러야 하는지 명확하게 표시
- 보스 패턴/장력/릴 타이밍 안내를 한 HUD로 통합
- 모바일 렉 감소를 위해 전투 루프 주기와 에셋 캐시를 조정

## 주요 변경
- `Flow Combat HUD 4.1` 추가
- 낚시 화면에서 상단바, 하단 내비, 몰입 FAB, 스마트 독 숨김
- 낚시 화면을 `100dvh` 기반으로 재정렬
- 입질 시 터치 타깃을 더 크게 표시
- 릴 단계에서 현재 추천 조작을 실시간으로 표시
- 보스 패턴별 추천 조작 표시
  - 붉은 파동: 돌진 회피
  - 장력 폭주: 줄 풀기
  - 카운터 창: 차지 릴
- 모바일/절전 모드에서 전투 루프 tick rate 완화
- Service Worker 캐시 v4.1.0으로 갱신

## 추가 에셋
- `assets/art/v41_flow_fishing_stage.svg`
- `assets/art/v41_mobile_fishing_shell.svg`
- `assets/art/v41_action_prompt.svg`
- `assets/art/v41_hud_panel.svg`
- `assets/art/v41_precision_ring.svg`
- `assets/art/v41_reel_console.svg`
- `assets/art/v41_action_button.svg`
- `assets/art/v41_touch_diagram.svg`
- `assets/art/v41_boss_timeline.svg`
- `assets/art/v41_tension_alarm.svg`
- `assets/art/v41_safe_zone.svg`
- `assets/art/v41_ui_trim.svg`

## 검증
- `npm run validate` 통과
- `npm run audit` 통과
- `node --check sw.js` 통과
