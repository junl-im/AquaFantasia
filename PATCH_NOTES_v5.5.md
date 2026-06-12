# Aqua Fantasia v5.5 Mobile Feel & Cache Guard Patch

기준: `AquaFantasia_v4.9_ACTION_FULL_PROJECT_NO_GIT.zip`에서 이어지는 누적 패치입니다. 실제 내부 버전은 v5.4 Result/Shop Polish까지 포함되어 있었으므로, v5.5는 그 위에 덮어쓰기 가능한 런타임 오버레이로 적용됩니다.

## 핵심 변경

- `src/runtime/v55-mobile-feel-runtime.js` 추가
  - 입질 상태에서 작은 원을 정확히 누르지 않아도 `#fishing-visual` 영역 터치로 챔질 가능.
  - 릴링 중 수면 영역을 길게 누르면 `setDown(true)`, 손을 떼면 `setDown(false)`로 연결.
  - 장력 94 이상에서 계속 누르고 있으면 자동으로 릴 입력을 끊어 줄 끊김을 줄이는 텐션 가드 추가.
  - 평균 FPS, Save-Data, 저사양 하드웨어, 작은 화면을 감지해 `aqua-v55-lite`, `aqua-v55-compact`, `perf-lite` 적용.

- UI 겹침 정리
  - 낚시 화면에서 v54 상점 FAB 숨김.
  - v49 홀드 패드는 숨기고 v53 릴 UI를 주 조작 UI로 통일.
  - 작은 화면에서는 상단 튜닝 패널/코치 패널을 숨겨 낚시 시야 확보.
  - v5.5 터치 코치와 SAFE 진행 미터를 낚시 비주얼 레이어 안에 추가.

- PWA 캐시 가드
  - Service Worker 버전: `aqua-fantasia-v5.5.0-mobile-feel-20260612`.
  - `AQUA_CLEAR_RUNTIME_CACHE` 메시지가 현재 keepPrefix를 보존하도록 수정.
  - v5.5 최초 부팅 시 오래된 `aqua-fantasia-*` 캐시 정리 시도.

- GitHub Actions 검증 추가
  - `.github/workflows/aqua-static-validate.yml` 추가.
  - `npm run validate`, `npm run runtime:check`, `npm run audit`, `npm run atlas:check` 실행.

## 덮어쓰기 파일 목록

- `index.html`
- `sw.js`
- `manifest.webmanifest`
- `package.json`
- `src/core/state.js`
- `src/runtime/v55-mobile-feel-runtime.js`
- `assets/art/v55_mobile_feel_panel.svg`
- `tools/validate-static.mjs`
- `tools/audit-bundle.mjs`
- `tools/check-v49-action-mobile.mjs`
- `tools/check-v54-result-shop-polish.mjs`
- `tools/check-v55-mobile-feel.mjs`
- `.github/workflows/aqua-static-validate.yml`
- `PATCH_NOTES_v5.5.md`
- `V5_5_MOBILE_FEEL_CHECKLIST.md`
- `docs/CLEAN_BUNDLE_v5.5_MOBILE_FEEL.md`

## 배포 후 권장 확인

1. GitHub Pages 배포 뒤 모바일 브라우저에서 한 번 새로고침.
2. 홈 화면 PWA로 설치한 경우 앱을 완전히 종료 후 재실행.
3. 마을의 `MOBILE FEEL 5.5` 패널에서 `캐시 정리` 버튼 1회 실행.
4. 낚시 테스트: 던지기 → 입질 시 화면 아무 곳 터치 → 수면 길게 누르기/떼기 릴 조작 확인.
