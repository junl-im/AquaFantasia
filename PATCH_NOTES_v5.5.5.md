# Aqua Fantasia v5.5.5 Auto Cache Sweep + Silent Recovery

## 핵심 수정

- 배포 버전 변경 시 오래된 `aqua-fantasia-*`, Workbox, Vite, precache 캐시를 자동 정리합니다.
- 정상 업데이트 과정에서는 `캐시 정리 후 새로고침` 팝업이 계속 떠 있지 않도록 숨김 처리합니다.
- 스택 오류 또는 구버전 런타임 충돌이 감지되면 저장 데이터는 유지하고 캐시만 정리한 뒤 1회 자동 새로고침합니다.
- v5.5.2/v5.5.4 복구 카드가 계속 남아 있는 문제를 v5.5.5 런타임에서 강제로 숨깁니다.
- Service Worker 캐시 버전을 `aqua-fantasia-v5.5.5-auto-cache-sweep-20260612`로 갱신했습니다.
- GitHub Actions는 `pages.yml`만 push 자동 실행, `aqua-static-validate.yml`은 수동 실행 전용입니다.

## 적용 후 기대 동작

1. 사용자가 별도 버튼을 누르지 않아도 이전 캐시가 정리됩니다.
2. 실제로 캐시가 삭제된 경우에만 1회 자동 새로고침합니다.
3. 새로고침 후에는 복구 팝업이 계속 떠 있지 않습니다.
4. 저장 데이터와 Firebase 데이터는 삭제하지 않습니다.
