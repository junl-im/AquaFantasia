# v3.3 Mega Audit Report

## 확인한 문제와 조치
1. 첫 화면에 Director/Ocean/Atlas 카드가 나란히 보여 시선 흐름이 분산됨 → v3.3 Nexus Forge 단일 상위 카드로 압축하고 기존 카드는 접이식으로 이동.
2. 차원의 바다 지역 카드가 중복 표시됨 → 중복 DOM 제거 및 validator 검사 추가.
3. `APP_VERSION >= '3.10.0'` 같은 문자열 비교가 장기적으로 위험함 → 숫자 기반 `versionAtLeast()` 추가.
4. 지역별 시각 분위기가 아직 약함 → v3.3 지역별 SVG 파노라마 6종 추가.
5. fish.json 확장 검증 기준이 v3.2에 고정됨 → v3.3 기준 82종 이상 검사로 갱신.

## 권장 다음 단계
단일 `index.html`이 350KB 이상으로 커졌으므로, 다음 대형 패치에서는 `src/core`, `src/ui`, `src/fishing`, `src/data` 모듈화를 준비하는 것이 좋습니다.
