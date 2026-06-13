# Aqua Fantasia v5.9.0 UI State Router + 2.5D Fish Dex Rework

## 핵심 수정
- 로그인/마을/도감 등 낚시 화면이 아닌 곳에서 `던지기`, `챔질`, `가방`, `상점` 전역 HUD가 따라다니는 문제를 화면 상태 라우터로 차단했습니다.
- `body[data-screen]` 기준으로 로그인/마을/낚시/가방/도감 화면별 허용 UI만 남기도록 정리했습니다.
- 기존 v5.3/v5.4/v5.5 개발용 패널과 고정 FAB를 플레이어 화면에서 숨깁니다.
- 도감과 가방 물고기 카드를 2.5D 원화풍 카드/포트레이트/수면 하이라이트로 재스킨했습니다.
- v5.9.0 PWA 캐시 버전을 적용해 이전 UI 캐시가 남아 덮어보이는 문제를 줄였습니다.

## 주의
GitHub Actions가 2개 보이면 저장소에 남아 있는 `.github/workflows/aqua-static-validate.yml` 파일을 삭제하세요. 이번 패치는 `.github/workflows/pages.yml` 단일 자동 실행 구조를 기준으로 합니다.
