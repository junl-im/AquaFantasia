# v5.5.1 Runtime Error Hotfix Checklist

## 실행 오류 복구

- [ ] 브라우저 콘솔에 `AquaFantasia v5.5.1-hotfix-runtime-error ready` 로그가 표시된다.
- [ ] `window.AquaFantasiaV551`가 존재한다.
- [ ] `window.AquaFantasiaV53`가 준비되면 복구 배너가 표시되지 않는다.

## 낚시 루프 충돌 방지

- [ ] CAST 버튼 1회 터치 시 v5.3 캐스팅 루프만 시작된다.
- [ ] 기존 `castLine()` inline onclick으로 인한 레거시 입질 타이머가 중복 생성되지 않는다.
- [ ] 입질 터치 시 `hook()`이 중복 호출되지 않는다.
- [ ] 릴 버튼 클릭/포인터 입력이 레거시 `reelAction()`과 동시에 실행되지 않는다.

## PWA 캐시

- [ ] `sw.js` 캐시 버전이 `aqua-fantasia-v5.5.1-hotfix-20260612`이다.
- [ ] 기존 `aqua-fantasia-v5.5.0-mobile-feel-20260612` 캐시가 제거 대상에 포함된다.
- [ ] Service Worker 등록 옵션에 `updateViaCache: 'none'`가 적용된다.

