# AquaFantasia Patch 41 - v5.2 Casual Pixi Refactor

## 핵심 방향
- 기존 진지한 대시보드형 낚시 UI에서 **아기자기하고 통통 튀는 캐주얼 낚시 게임** 방향으로 핵심 파일을 리팩토링했습니다.
- 요청한 에셋 경로를 실제 코드에 정확히 반영했습니다.
- 통파일은 만들지 않고, 기존 저장소에 덮어쓰기 가능한 패치 ZIP만 제공합니다.

## 수정된 핵심 파일
- `src/engine/fishingPixiRuntime.ts`
- `src/systems/fishing.js`
- `src/systems/inventory.js`
- `src/ui/navigator.js`
- `src/core/state.js`
- `src/runtime/v52-casual-runtime.js`

## 주요 변경
1. Pixi.js 런타임 구조
   - Sprite/Container 중심 구조로 재작성
   - 찌 포물선 캐스팅 Tween
   - 입질 시 ripple 확산 및 camera shake
   - 모바일 반응형 스케일 레이아웃

2. 낚시 메커니즘
   - READY/CASTING/WAITING/BITE/REELING/CATCH/FAIL 상태 분리
   - 릴 게이지 안전 구간 30~70 유지 게임 루프
   - 3초 안전 유지 시 포획 성공
   - 위험 구간 진입 시 붉은 깜빡임과 진동
   - 성공 시 fish_1~fish_6 아이콘 Victory 연출

3. 인벤토리
   - `panel_1.png` 기반 하단 팝업
   - Elastic/Back 느낌의 튀어 오르는 모션
   - 4x3 물고기 아이콘 그리드

4. UI 내비게이터
   - 던지기 / 챔질 / 가방 버튼을 상단 캐주얼 HUD로 통합
   - 현재 상태에 맞는 다음 행동 안내

5. 에셋 보강
   - `assets/art/v363_painterly_ocean.png` 추가
   - `water_ripple.png`, `tension_gauge.png`, `fish_1~6.png`, `panel_1.png` 경로 보강

## 검증
- `npm run validate` 통과
- `npm run audit` 통과
- `npm run runtime52:check` 통과
- JS 문법 검사 통과
