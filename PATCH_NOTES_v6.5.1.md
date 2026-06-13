# Aqua Fantasia v6.5.1 Portrait Lock Hotfix

- Aqua Fantasia를 세로 전용 모바일 게임으로 고정했습니다.
- manifest orientation을 `portrait-primary`로 변경했습니다.
- 런타임 immersive 진입 시 `screen.orientation.lock('portrait-primary')`를 우선 시도하고 실패 시 `portrait`로 조용히 fallback합니다.
- 별도 회전 안내 팝업은 띄우지 않습니다.
- 물리적으로 기기가 가로 상태여도 CSS가 가로 전용 UI로 바뀌지 않고 세로 게임 셸을 유지합니다.
- Service Worker 캐시 버전을 `aqua-fantasia-v6.5.1-portrait-lock-hotfix`로 갱신했습니다.
