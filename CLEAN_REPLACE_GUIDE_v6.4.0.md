# Aqua Fantasia v6.4.0 Clean Replace Guide

v6.4.0은 2.5D 그래픽 확장, 낚시 손맛, 시스템 연관성, 모바일 호환성, PWA 캐시 안정성을 함께 정리한 클린 교체 버전입니다.

## 권장 적용 방식

1. GitHub Desktop에서 저장소 폴더를 엽니다.
2. `.git` 폴더만 남기고 기존 파일을 삭제합니다.
3. `AquaFantasia_v6.4.0_MASSIVE_2_5D_SYSTEM_POLISH_FULL_PROJECT.zip`을 저장소 루트에 풉니다.
4. GitHub Desktop에서 커밋/푸시합니다.
5. 모바일에 설치된 기존 PWA 아이콘은 삭제 후 다시 설치합니다.

덮어쓰기 방식은 예전 통파일, 디버그 HUD, 오래된 service worker 파일이 남을 수 있습니다. 화면에 오래된 `낚시 준비`, `이전 디버그 배지`, 버전 배지가 보였던 문제를 끊으려면 전체 교체가 가장 안전합니다.

## 핵심 변경

- v6.4.0 버전 및 service worker 캐시 갱신
- 신규 수역: 얼음 낚시터, 폭풍 외해
- 도감 물고기 확장: 23종 이상
- 낚싯줄 강화 추가
- 상점 아이템 2.5D 아이콘 추가
- 낚시 결과 카드, 콤보, 안전지대 진행바 추가
- 지역 난이도, 물결 속도, 보상, 장비 성장 연계
- PWA 캐시 자동 정리와 HTML 네트워크 우선 전략
- GitHub Actions Node 24 유지, npm cache lockfile 의존 제거
