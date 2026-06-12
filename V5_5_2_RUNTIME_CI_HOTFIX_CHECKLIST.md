# v5.5.2 Runtime & CI Hotfix Checklist

## GitHub Actions
- [ ] workflow가 `actions/checkout@v6`를 사용한다.
- [ ] workflow가 `actions/setup-node@v6`를 사용한다.
- [ ] `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`가 설정되어 있다.
- [ ] `node-version: '24'`가 설정되어 있다.
- [ ] `npm run validate`가 통과한다.
- [ ] `npm run runtime:check`가 통과한다.

## Runtime
- [ ] 콘솔에 `5.5.2-runtime-ci-hotfix ready`가 표시된다.
- [ ] 콘솔에 `5.5.1-hotfix-runtime-error ready`가 표시된다.
- [ ] CAST/BITE/REEL 입력이 중복 실행되지 않는다.
- [ ] 오류 발생 시 복구 배너가 표시된다.
- [ ] 캐시 정리 후 새로고침 버튼이 정상 동작한다.

## PWA Cache
- [ ] `sw.js` 캐시 버전이 `aqua-fantasia-v5.5.2-runtime-ci-hotfix-20260612`이다.
- [ ] `v552-ci-runtime-guard.js`가 precache 목록에 포함되어 있다.
- [ ] 이전 v5.5.0/v5.5.1 캐시가 삭제 대상에 포함된다.
