# AquaFantasia v2.1.32

## v2.1.32 Change Log

- Removed the unnecessary root `APP_VERSION` file from the full package. Runtime version data now stays in `src/data.ts`, and human-readable version history stays in `README.md`.
- Added a premium aqua-card UI stabilization layer for cards, borders, buttons, inputs, close buttons, HUD, top controls, and the fixed right-bottom menu.
- Added a fishing director panel with step states for cast, bite, reel, and catch so mobile portrait gameplay has a clear flow.
- Rebalanced the fishing tension loop to be smoother and less suddenly punishing while preserving reel wind/release decision making.
- Preserved the v2.1.29/v2.1.30/v2.1.31 player and NPC direction locks, opening-video first-start-only policy, and construction preview/confirm flow.

## v2.1.32 변경사항

- v2.1.29 `player.zip` 기반 플레이어 8방향 32프레임을 해시까지 다시 검증 고정했습니다.
  - `public/assets/v2129/characters/player`
  - 8방향 × 4프레임 = 32개 PNG 유지
  - `east → player_east_frame_*.png`, `west → player_west_frame_*.png` 등 파일명 identity 매핑 유지
  - 플레이어 방향을 flip/alias/swap으로 뒤집지 않도록 validate에서 고정합니다.
- NPC 방향 로직을 플레이어 로직과 분리해 다시 잠갔습니다.
  - `chief`, `merchant`, `guild`, `captain`, `tourist`, `vip` 8방향 PNG 존재 검사
  - NPC 방향 alias는 identity 매핑만 허용합니다.
- 우측 상단 메뉴바를 더 우측에 붙이고, 전체 박스/테두리 잔상을 제거했습니다.
  - `＋ / － / 건설 / 원점 / 상점 / 출항` 순서 유지
  - 버튼 간격을 넓히고 잘림/겹침 방지
- 우측 하단 메뉴바를 모든 마을/메뉴 페이지에서 동일 위치와 크기로 고정했습니다.
  - `홈 / 가방 / 퀘스트 / 지도` 유지
  - 아이콘/텍스트 크기 통일
  - 눌렀을 때 밀림/흔들림 방지
- HUD와 개척 바 간격을 안전영역 기준으로 다시 보정했습니다.
- 가방, 퀘스트, 지도, 상점, 건물상세, 캐릭터 정보, 개척정보, 종료팝업 계열 카드 톤을 공통 아쿠아 UI로 한 번 더 정리했습니다.
  - X 닫기 버튼 위치/형태 통일
  - 검은 입력창, 흐릿한 글씨, 잘림/겹침 방지 보강
- 건설/이동 UX를 v2.1.30 구조 그대로 유지하면서 안내와 상태를 강화했습니다.
  - 건물/오브젝트 선택 → 반투명 프리뷰 → 타일 선택 → 중앙 확인창 → 건설/취소
  - 기존 건물 이동도 동일한 확인 플로우 사용
  - 배치 불가 타일 안내 메시지 명확화
  - 장식물 이름은 띄우지 않고 주요 건물/NPC/본캐릭터 중심 표기 유지
- 낚시게임 UI/흐름을 재정리했습니다.
  - 첫 화면 안내 카드와 단계 표시 개선
  - 상단 HUD 겹침 완화
  - 포획/텐션/저항 게이지를 명확히 배치
  - 캐스팅/입질/릴링 메시지를 자연스러운 피드백으로 교체
  - 릴 패널/릴 콘솔/터치존/버튼 겹침 방지
  - 낚시 화면에서 마을 하단 메뉴가 나오지 않는 정책 유지
- 오프닝 영상은 최초 게임 시작 로딩 전용 정책을 유지합니다.
  - 홈/닫기/메뉴 복귀/마을 이동과 연결하지 않음
  - 큰 카드 테두리/프레임/장식 오버레이 재도입 금지
- 로그인 유지 토글은 현재 확정 스타일을 유지합니다.
  - 이미지 배경 금지
  - 작은 CSS 아쿠아 토글
  - 선택 상태는 `✓` 표시로만 구분

## 검증

- `npm run validate`는 다음 검증을 실행합니다.
  - `tools/clean-old-patch-docs.mjs`
  - `tools/validate-clean.mjs`
  - `tools/check-v2132-premium-ui-fishing-stability.mjs`
- v2.1.32 검증 항목:
  - 버전 동기화
  - CSS 괄호/중괄호/대괄호 균형
  - 플레이어 v2129 8방향 32프레임 존재 및 해시 불변
  - 플레이어 방향 파일명 identity 매핑 유지
  - NPC 8방향 자산/identity 매핑 검사
  - 오프닝 영상 최초 시작 전용 토큰 유지
  - 우측 상단/하단 메뉴 고정 클래스 검사
  - 낚시 UI 핵심 클래스/게이지/버튼/상태 검사
  - 건설 프리뷰/확인 팝업 플로우 검사
  - 금지 registry/internal 문자열 부재
