# Aqua Fantasia v5.6.0 Background Art Pass

## 목적
낚시 화면에 보이던 텍스트 포함 임시 SVG 배경과 개발용 렌더러 오버레이를 실전 플레이용 지역별 원화풍 배경으로 교체합니다.

## 주요 변경
- `src/runtime/v56-background-art-pass.js` 추가
  - 지역 선택 시 호수/강/항구/심해/용궁/차원의 바다 배경 자동 전환
  - `selectRegion`, `selectRegionFromMap`, 낚시 지역명 DOM 변경 감시
  - `v47-renderer-overlay` 개발 텍스트 숨김
  - 기존 낚시 조작/Canvas/Pixi 레이어는 유지
- WebP 배경 6종 추가
  - `assets/art/v56_fishing_bg_lake.webp`
  - `assets/art/v56_fishing_bg_river.webp`
  - `assets/art/v56_fishing_bg_harbor.webp`
  - `assets/art/v56_fishing_bg_deep.webp`
  - `assets/art/v56_fishing_bg_palace.webp`
  - `assets/art/v56_fishing_bg_dimension.webp`
- Service Worker 버전 갱신
  - `aqua-fantasia-v5.6.0-background-art-20260612`
- PWA manifest 버전 갱신
- 정적 검증 추가
  - `tools/check-v56-background-art.mjs`
  - `runtime56:check`

## 기대 효과
- 낚시 화면에서 `AQUA FANTASIA`, `Pixi Fishing Stage`, `Performance Fishing Shell` 같은 임시 텍스트 배경 노출 방지
- 지역별 분위기 강화
- WebP 사용으로 모바일 다운로드/캐시 부담 최소화
