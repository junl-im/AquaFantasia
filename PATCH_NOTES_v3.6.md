# AquaFantasia Patch 25 - v3.6 Core Navigator Mega Stabilization

대형 분석/정리 패치입니다. v3.5 패키지를 기준으로 실행 구조, UI 누적, 에셋, 저장 호환, PWA 캐시, GitHub Actions 검증을 다시 점검했습니다.

## 핵심
- Core Navigator 3.6 최상위 추천 패널 추가
- Tide Master 3.5는 세부 분석 카드로 이동
- v36 SVG 아트 에셋 22종 추가
- 어종 30종 추가, 총 150종
- src/ 모듈 분리 준비 스캐폴드 추가
- Service Worker, manifest, validate/audit 기준 v3.6으로 갱신

## 호환
런타임은 여전히 index.html 중심으로 유지해 GitHub Pages 무료 배포 안정성을 유지합니다. src/ 폴더는 다음 단계에서 점진 분리할 준비용입니다.
