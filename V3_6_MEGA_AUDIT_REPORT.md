# v3.6 Mega Audit Report

## 발견한 문제
1. index.html이 6,400줄 이상으로 커져 장기 유지보수 위험이 증가했습니다.
2. v30~v35 대형 패널이 누적되어 첫 화면의 시선 흐름이 분산될 수 있습니다.
3. 에셋 수는 늘었지만 최신 v36 레이어 기준 검증 항목이 없었습니다.
4. fish.json이 120종까지 확장되었으나 장기 콘텐츠 확장 기준 검증이 부족했습니다.

## 조치
- Core Navigator 3.6을 최상위 카드로 추가했습니다.
- Tide Master 3.5를 세부 분석 카드로 이동했습니다.
- src/core, src/ui, src/systems, src/integrations, src/data 스캐폴드를 추가했습니다.
- v36 전용 SVG 에셋 22종과 신규 어종 30종을 추가했습니다.
- npm validate/audit 기준을 150종과 v36 런타임 기준으로 올렸습니다.
