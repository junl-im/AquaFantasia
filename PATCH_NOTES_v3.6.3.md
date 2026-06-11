# AquaFantasia Patch 25.3 - v3.6.3 Painterly Performance Hotfix

## 목적
- 투톤 느낌을 줄이고 원화풍 색층/질감을 강화
- 모바일 랙 원인인 숨겨진 과거 대형 패널 반복 렌더링 감축
- 대용량 이미지 대신 가벼운 SVG 아트팩 추가
- Service Worker 선캐시를 핵심 에셋만 유지

## 주요 변경
- `art-v363` 런타임 클래스 추가
- v363 painterly SVG 에셋 16종 추가
- Core Navigator를 원화풍 팔레트로 재스킨
- 지역 카드/낚시 화면/메인 배경의 색상층 확장
- 세부 분석 카드가 열릴 때만 v30~v35 패널 렌더링
- `aqua_v3.6.3` 저장 키 추가, 기존 저장 호환 유지

## 성능 원칙
- 모바일/카카오/저메모리 환경은 계속 `perf-lite` 우선
- 애니메이션은 최소화하고 색층/정적 SVG 질감으로 보는맛 확보
- Service Worker는 핵심 3개 v363 아트만 선캐시하고 나머지는 런타임 캐시
