# Aqua Fantasia v5.7.0 Water Art Direction Pass

## 목표
낚시 화면의 배경을 플레이 감성에 맞는 지역별 원화풍 배경으로 교체하고, 수면/반사광/입자 애니메이션을 실제 런타임에 연결한다.

## 변경 사항
- 지역별 신규 WebP 마스터 배경 6종 추가
  - `v57_fishing_bg_lake_master.webp` — 잔잔한 호수와 산 능선
  - `v57_fishing_bg_river_master.webp` — 숲 사이 강물과 원근 수류
  - `v57_fishing_bg_harbor_master.webp` — 노을 항구, 돛배, 부두 반사광
  - `v57_fishing_bg_deep_master.webp` — 심해 광선, 산호, 부유 입자
  - `v57_fishing_bg_palace_master.webp` — 용궁 실루엣과 황금 수중광
  - `v57_fishing_bg_dimension_master.webp` — 차원 균열, 포털, 환상 수면
- 수면 애니메이션 오버레이 2종 추가
  - `v57_water_ripple_overlay.webp`
  - `v57_water_caustics_overlay.webp`
- 신규 런타임 `src/runtime/v57-water-art-direction.js` 추가
  - 지역 변경 시 배경과 색조 자동 전환
  - 물결 drift, caustics, ripple, floating particles 연결
  - `prefers-reduced-motion` 및 `perf-lite` 대응
- Service Worker 캐시 버전 갱신
  - `aqua-fantasia-v5.7.0-water-art-20260612`
- v5.6.1 UI 정리는 유지하고, 플레이어에게 개발용 배지는 노출하지 않음.

## 적용 방법
덮어쓰기 ZIP을 저장소 루트에 풀고 GitHub Desktop에서 커밋/푸시한다.
