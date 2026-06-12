# V5.5 Mobile Feel Runtime Checklist

## 모바일 성능

- [ ] 첫 로딩 후 `document.body.classList`에 `aqua-v55-ready`가 붙는다.
- [ ] Save-Data 또는 저사양 기기에서 `aqua-v55-lite`, `perf-lite`가 붙는다.
- [ ] 작은 화면 또는 낮은 높이에서 `aqua-v55-compact`가 붙고 상단 패널이 줄어든다.
- [ ] 낚시 화면에서 스크롤 튐/더블탭 줌이 발생하지 않는다.

## 낚시 조작감

- [ ] CAST 버튼 터치 후 기존 캐스팅 흐름이 유지된다.
- [ ] 입질 상태에서 작은 원이 아닌 수면 영역을 터치해도 챔질된다.
- [ ] 릴링 상태에서 수면 영역을 길게 누르면 장력이 올라간다.
- [ ] 손을 떼면 장력이 내려간다.
- [ ] 장력 94 이상에서 계속 누르면 v5.5 텐션 가드가 입력을 끊는다.

## UI 겹침

- [ ] 낚시 화면에서 상점 FAB가 보이지 않는다.
- [ ] v49 홀드 패드와 v53 릴 UI가 겹치지 않는다.
- [ ] v5.5 터치 코치가 stage guide, bite target, result popup을 가리지 않는다.
- [ ] 결과창 v54는 기존처럼 보관/판매/다시 던지기가 가능하다.

## PWA / 캐시

- [ ] `sw.js` 캐시 버전이 `aqua-fantasia-v5.5.0-mobile-feel-20260612`이다.
- [ ] v5.5 최초 부팅 뒤 오래된 `aqua-fantasia-*` 캐시가 정리된다.
- [ ] 오프라인 페이지와 manifest가 정상 로드된다.

## 검증 명령

```bash
npm run validate
npm run typecheck
npm run runtime:check
npm run audit
npm run atlas:check
npm run clean:report
```
