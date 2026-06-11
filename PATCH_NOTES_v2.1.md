# AquaFantasia Patch v2.1 - Reward Vault Visual Max

## 핵심
- 주간 랭킹 보상함 추가
- 시즌 랭킹/보스 랭킹 예상 보상 수령 시스템 추가
- 보상 파티클, 보상함 스캔, Visual Lab 카드 추가
- IntersectionObserver 기반 가시 영역 최적화 추가
- FPS 측정 결과를 Visual Lab에 저장/표시
- PWA Service Worker 캐시 버전 v2.1.0 갱신
- 기존 v1.1~v2.0 저장 데이터 호환 유지

## 운영 메모
- 무료 Firebase/GitHub Pages 환경을 유지하기 위해 보상 수령은 로컬 저장 기반입니다.
- 경쟁 랭킹 제출은 v2.0의 Firebase leaderboard/bossLeaderboard 구조를 그대로 사용합니다.
