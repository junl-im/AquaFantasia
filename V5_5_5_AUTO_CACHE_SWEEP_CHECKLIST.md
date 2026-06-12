# V5.5.5 Auto Cache Sweep Checklist

- [x] `src/runtime/v555-auto-cache-sweep.js`가 모든 런타임보다 먼저 로드된다.
- [x] Service Worker 캐시 버전이 v5.5.5로 갱신된다.
- [x] 이전 `aqua-fantasia-*` 캐시는 자동 삭제된다.
- [x] `캐시 정리 후 새로고침` 복구 카드가 계속 남지 않는다.
- [x] v5.5.2/v5.5.4 레거시 복구 카드는 v5.5.5에서 숨김 처리된다.
- [x] 스택 오류 감지 시 캐시 정리 후 1회만 자동 새로고침된다.
- [x] 저장 데이터는 삭제하지 않는다.
- [x] push 자동 GitHub Actions는 Pages workflow 하나만 실행된다.
