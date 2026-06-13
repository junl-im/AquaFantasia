# Aqua Fantasia v6.5.1 Clean Replace Guide

이번 핫픽스는 세로 전용 고정 패치입니다.

권장 적용:
1. 이미 v6.5.0 클린 교체를 적용했다면 v6.5.1 덮어쓰기 ZIP만 적용해도 됩니다.
2. 이전 누적 파일이 남아 있다면 `.git`만 남기고 전체 교체 ZIP을 사용하세요.
3. 모바일에서 예전 PWA 아이콘이 있으면 삭제 후 다시 설치하면 orientation manifest가 더 확실하게 반영됩니다.

주의:
- 일반 브라우저 탭에서는 iOS/Android 정책상 주소창/기기 회전을 100% 강제할 수 없는 경우가 있습니다.
- PWA 설치 실행에서는 `portrait-primary` manifest와 fullscreen 설정이 가장 안정적으로 적용됩니다.
