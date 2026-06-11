# AquaFantasia v3.6 Architecture Plan

현재 배포 안정성을 위해 런타임은 index.html 단일 파일로 유지합니다. 다만 다음 대형 리팩터링을 위해 src/ 스캐폴드를 추가했습니다.

## 분리 목표
- src/core: 저장, 상태, 밸런스 공통 로직
- src/ui: HUD, Core Navigator, 화면 렌더링
- src/systems: 낚시, 인벤토리, 장비, 미션
- src/integrations: Firebase, PWA, GitHub Pages 대응
- src/data: fish schema와 데이터 검증

## 다음 단계
1. 순수 함수부터 src/로 이동
2. index.html에서 import하도록 점진 전환
3. validate-static에서 모듈 문법 검사 추가
4. GitHub Pages 빌드 없이도 동작하는 ESM 구조 유지
