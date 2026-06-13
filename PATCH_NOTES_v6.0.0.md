# Aqua Fantasia v6.0.0 Interaction Balance Patch

## 목표
- 모든 알림/토스트를 탭 또는 좌우 스와이프로 닫을 수 있게 통일합니다.
- 미션/퀘스트/보상 알림은 탭하면 미션 화면으로 이동합니다.
- 낚시 난이도를 살짝 올리고 장력/릴링 밸런스를 조정합니다.
- v5.7 원화풍 배경 위에 수면 깊이감과 반짝임 레이어를 추가합니다.
- GitHub Actions는 pages.yml 단일 자동 실행 구조를 유지합니다.

## 변경 파일
- `src/runtime/v60-interaction-balance.js`
- `assets/art/v60_water_depth_overlay.webp`
- `assets/art/v60_caustic_sparkle_overlay.webp`
- `tools/check-v60-interaction-balance.mjs`
- `index.html`, `sw.js`, `manifest.webmanifest`, `package.json`, `src/core/state.js`

## 플레이 변경
- 일반 알림: 탭하면 즉시 닫힘.
- 미션/퀘스트/출석/보상 알림: 탭하면 `미션` 화면으로 이동하고 알림 닫힘.
- 알림을 좌우로 54px 이상 밀면 닫힘.
- 희귀 이상 어종은 입질 반응 시간이 기존보다 약간 짧아짐.
- 릴 타이밍 판정 구간이 소폭 좁아지고 커서 속도가 조금 빨라짐.
- 릴 파워와 장력 회복량이 살짝 낮아져 장비 강화의 체감 가치가 올라감.

## PWA 캐시
- 캐시 버전: `aqua-fantasia-v6.0.0-interaction-balance-20260612`
- v5.9 캐시는 legacy marker로 남기고 자동 캐시 sweep 대상에 포함합니다.
