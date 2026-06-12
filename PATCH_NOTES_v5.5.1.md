# Aqua Fantasia v5.5.1 Runtime Error Hotfix

## 목적

v5.5 Mobile Feel 패치 후 실제 실행 중 발생할 수 있는 런타임 충돌을 우선 복구하는 핫픽스입니다.

## 수정 내용

- `src/runtime/v551-hotfix-runtime.js` 추가
  - 기존 단일 HTML의 `onclick="castLine()"`, `hookFishFromTarget()`, `reelAction()` 레거시 루프가 v5.3 모듈 낚시 시스템과 동시에 실행되지 않도록 차단합니다.
  - CAST, BITE, REEL 입력을 v5.3 `AquaFantasiaV53.fishing` API로 단일 라우팅합니다.
  - v5.3 모듈이 아직 준비되지 않은 경우에만 기존 레거시 함수로 안전하게 fallback합니다.

- `index.html` 수정
  - 런타임 모듈에 `?v=5.5.1` 캐시 버스터를 추가했습니다.
  - `v551-hotfix-runtime.js`를 v55 런타임 뒤에 로드합니다.
  - Service Worker 등록에 `updateViaCache: 'none'`와 `reg.update()` 호출을 추가했습니다.

- `sw.js` 수정
  - 캐시 버전을 `aqua-fantasia-v5.5.1-hotfix-20260612`로 올렸습니다.
  - v5.5.0 캐시 마이그레이션 마커는 검증/이전 캐시 정리를 위해 유지했습니다.
  - v5.5.1 핫픽스 런타임을 precache 목록에 추가했습니다.

## 확인 포인트

- CAST 버튼을 눌렀을 때 알림/레거시 입질 루프와 v5.3 릴 게이지가 동시에 실행되지 않아야 합니다.
- 입질 상태에서 화면 터치 또는 찌 터치가 하나의 챔질 처리로만 이어져야 합니다.
- 릴 버튼 또는 수면 길게 누르기 입력이 v5.3 `setDown(true/false)`로만 전달되어야 합니다.
- 배포 후 강력 새로고침 없이도 Service Worker가 새 캐시로 갱신되어야 합니다.

