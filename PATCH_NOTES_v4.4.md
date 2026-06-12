# AquaFantasia Patch 33 - v4.4 Animation Performance Suite

## 목표
낚시 중 조작 안내, 애니메이션, 기술적 한계 대응, 성능 자동 조절을 한 번에 개선한 패치입니다.

## 주요 변경
- 낚시 화면 전용 v4.4 Motion Layer 추가
- 캐스팅 라인 아크 애니메이션 추가
- 입질 순간 터치 원, 터치 화살표, 수면 링 위치 동기화
- 릴 단계에서 물고기 궤적/리듬 커서 애니메이션 추가
- v4.4 Objective Strip으로 지금 해야 할 조작을 항상 표시
- 낚시 화면에서 연출/안내/성능 모드를 바로 조절 가능
- Frame Governor 도입: 프레임 저하가 길어지면 자동 Lite 모드 적용
- v4.4 SVG 에셋 12종 추가
- Service Worker v4.4.0 캐시 갱신
- 저장 키 aqua_v4.4 추가

## 추가 에셋
- assets/art/v44_animation_fishing_stage.svg
- assets/art/v44_line_arc.svg
- assets/art/v44_hook_prompt.svg
- assets/art/v44_tap_arrow.svg
- assets/art/v44_fish_swim_sheet.svg
- assets/art/v44_action_overlay.svg
- assets/art/v44_rhythm_lane.svg
- assets/art/v44_reel_button.svg
- assets/art/v44_status_scroll.svg
- assets/art/v44_performance_governor.svg
- assets/art/v44_low_mode_texture.svg
- assets/art/v44_motion_particles.svg

## 성능 방침
무거운 PNG 에셋을 추가하는 대신 SVG 기반으로 연출을 구성했습니다. 핵심 에셋만 선캐시하고 나머지는 런타임 캐시로 처리합니다.
