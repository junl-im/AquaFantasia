# AquaFantasia Patch 42 - v5.3 Casual UX Polish

## 핵심
- v5.2 캐주얼 리팩토링 위에 실전 UX를 정리했습니다.
- 낚시 중 상단/하단 UI 겹침을 줄이고, 상태별 안내 문구를 강화했습니다.
- 텐션 30~70 안전지대 유지 미니게임을 더 명확하게 보이도록 개선했습니다.
- 가방은 panel_1.png 기반 하단 팝업으로 정리하고 4x3 그리드 표시를 강화했습니다.
- v5.3 runtime connector를 추가하고 Service Worker 캐시를 갱신했습니다.

## 테스트
- npm run validate
- npm run audit
- npm run runtime53:check
- node --check sw.js
