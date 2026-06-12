# AquaFantasia v4.9 Action Mobile Patch

기준: 업로드 ZIP은 v4.8 설명과 달리 v4.9~v5.4 누적 런타임이 포함되어 있었습니다. 이번 패치는 기존 v5.4 통파일 검증을 유지한 상태에서 v4.9 우선순위인 모바일 성능, 낚시 액션감, UI 겹침, PWA 캐시 안정성을 오버레이 방식으로 보강합니다.

## 적용 내용

- `src/runtime/v49-action-mobile-patch.js` 추가
  - 낚시 화면 Sprite 오버레이: 찌 포물선, 수면 물결, 입질 `!` 말풍선, 터치 링, 릴 꾹누르기 패드.
  - 기존 `castLine`, `hookFishFromTarget`, `reelAction` 흐름을 깨지 않는 비침투형 런타임 패치.
  - 릴 버튼과 수면 조작에 pointer hold를 연결하여 모바일에서 연속 탭 피로를 줄임.
  - Save-Data, 저메모리, 저코어, Reduce Motion 환경에서 자동 `perf-lite` 및 Canvas DPR 라이트 모드 유도.

- UI 겹침 정리
  - 낚시 중 하단 네비게이션/원핸드/몰입 버튼/구형 도크 숨김.
  - 낚시 가이드와 상태 텍스트를 안전 영역 기준으로 재배치.
  - 릴 단계에서 30~70 안전지대 안내를 별도 코치 카드로 노출.

- PWA 캐시 개선
  - Service Worker 버전: `aqua-fantasia-v5.4.0-v49-action-20260612`.
  - 신규 v4.9 액션 런타임을 CORE_ASSETS에 포함.
  - 설치 시 `cache: reload` 요청을 사용해 GitHub Pages의 오래된 캐시 잔존 가능성을 줄임.
  - `AQUA_CLEAR_RUNTIME_CACHE`, `SKIP_WAITING` 메시지 지원.

- 검증 유지
  - 기존 `npm run validate`, `npm run audit`, `npm run runtime:check` 흐름 유지.
  - `tools/check-v49-action-mobile.mjs` 추가 및 GitHub Actions의 runtime check 경로에 연결.

## 파일 정리 관찰

- ZIP에는 `.git` 전체와 과거 v1.2~v5.4 패치 노트/체크리스트가 모두 포함되어 배포 아티팩트가 커져 있습니다.
- `assets/art`에는 세대별 SVG가 296개 이상 남아 있으나, Service Worker precache는 비교적 가볍게 제한되어 있습니다.
- URL 인코딩이 깨진 `assets/ui-kit/panels/panel_#U...png` 계열이 존재합니다. 현재 런타임에서는 `panel_1.png` 중심으로 사용하는 것이 안전합니다.
- `tools/script0.js`는 0바이트, `tools/script2.js`는 대형 보조 스크립트입니다. GitHub Pages 배포에는 필수는 아니며, 개발 보관용으로만 유지하는 편이 좋습니다.
