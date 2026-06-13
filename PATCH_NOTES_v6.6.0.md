# Aqua Fantasia v6.6.0 Reference Art Remaster

## Art

- 사용자 제공 레퍼런스 시트 기반으로 핵심 에셋을 재정리했습니다.
- `bg_ocean`, `login_ocean_fishing_25d`, `player_boat`, `fishing_float`, `fish_clown`, `gauge_frame`, `fish_slot`을 교체했습니다.
- 텍스트가 들어간 `START` 버튼을 제거하고 텍스트 없는 2.5D 버튼 베이스를 추가했습니다.
- 낚시 CAST 버튼은 낚시 액션용으로 유지했습니다.

## UX

- `낚시터로 출항` 버튼에 이미지 내부 `START` 문구가 겹치던 문제를 제거했습니다.
- 마을 상단의 개발/기술 느낌 문구를 게임 분위기 문구로 바꿨습니다.
- 세로 전용 모바일 게임 방향 정책을 유지했습니다.

## Runtime

- Vite / TypeScript / PixiJS 8 / Howler.js / Firebase 준비 구조 유지
- PixiJS 실패 시 HTML fallback 낚시 모드 유지
- Service Worker 캐시: `aqua-fantasia-v6.6.0-reference-art-remaster`
