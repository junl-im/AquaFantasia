# AquaFantasia v2.1.27

## v2.1.27 변경사항

- v2.1.26의 CSS 빌드 문법 복구 상태를 유지하면서, 추가 회귀 감사 패치를 적용했습니다.
- 플레이어 3시/9시 시각 방향을 현재 제공된 PNG 세트 기준으로 다시 고정했습니다.
  - 동쪽 이동은 현재 화면에서 올바르게 보이는 `west` 라벨 프레임을 사용합니다.
  - 서쪽 이동은 현재 화면에서 올바르게 보이는 `east` 라벨 프레임을 사용합니다.
  - 1시/11시 대각선 보정은 유지합니다.
- 걷기 모션 속도를 낮춰 빠르게 떨리는 느낌을 줄였습니다.
- 조이스틱은 기본 위치만 중앙이고, 조작 중에는 `--v2127-joystick-transform`으로 정상 이동하도록 유지했습니다.
- 오프닝 영상 위에 구형 큰 테두리/카드 프레임이 다시 얹히지 않도록 v2.1.27 오프닝 전용 레이어를 추가했습니다.
- 우측 상단 조작 메뉴의 외곽 테두리를 투명화하고 아이콘 간격을 조금 넓혔습니다.
- 우측 하단 `홈 / 가방 / 퀘스트 / 지도` 아이콘을 살짝 키우고, 누를 때 버튼이 밀리지 않도록 고정했습니다.
- 가방, 퀘스트, 지도, 상점, 건설, 개척, 캐릭터 정보창, 건물 정보창, 종료 팝업의 공통 아쿠아 카드 규칙을 다시 묶었습니다.
- 낚시 화면에서 릴 패널/터치존/감기·풀기 UI가 중앙에서 벗어나거나 구형 프레임/소품이 덮지 않도록 보정했습니다.
- `tools/check-v2127-regression-audit.mjs`를 추가해 다음 항목을 validate에서 함께 확인합니다.
  - CSS 괄호/중괄호/대괄호 균형
  - v2.1.27 버전 동기화
  - 오프닝 영상 전용 클래스와 테두리 제거 규칙
  - 플레이어 방향 매핑과 8방향 32프레임 존재
  - 걷기 모션 속도 고정
  - 조이스틱 v2.1.27 transform 변수
  - 상단/하단 메뉴와 낚시 안정화 클래스
- `이 기기에서 로그인 유지` 토글은 현재 스타일을 유지하며 이미지 배경을 다시 입히지 않습니다.
- 기존 캐릭터 방향 보호 토큰은 유지합니다.
  - `ACTOR_DIRECTION_TEXTURE_FIX`
  - `ACTOR_DIRECTION_TEXTURES`
  - `actorDirectionFromVector`
  - `actorTextureUrl`
  - `actorDirectionQaPasses`

## 검증 기준

- `npm run validate`가 통과해야 합니다.
- v2.1.27 통파일 ZIP을 새로 풀어 `npm run validate`가 통과해야 합니다.
- v2.1.26 통파일에 v2.1.27 패치 ZIP을 덮어쓴 뒤 `npm run validate`가 통과해야 합니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge/version이 `2.1.27`로 동기화되어야 합니다.
- `node_modules`, `dist`, `reports`, 백업 폴더, 임시 로그, `*_NOTES.md`는 ZIP에 포함하지 않습니다.
- 루트 Markdown 파일은 이 `README.md` 하나만 유지합니다.
- 금지 registry/internal 문자열은 포함하지 않습니다.

## 환경 메모

현재 작업 컨테이너에서는 public npm registry DNS 조회가 불안정할 수 있습니다. `node_modules`가 없는 환경에서는 `npm run typecheck`와 `npm run build`가 모듈 부재로 실패할 수 있습니다.
