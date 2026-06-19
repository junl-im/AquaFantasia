# AquaFantasia v2.0.38

AquaFantasia는 Vite + TypeScript + PixiJS 8 기반의 모바일 세로모드 SD 해양 판타지 마을 RPG입니다.

## 실행

```bash
npm install
npm run typecheck
npm run build
npm run validate
```

CI 설치 검증:

```bash
npm run ci:install
npm run validate
npm run typecheck
npm run build
```

## v2.0.38 변경사항

- 캐릭터 1시/5시 방향을 다시 보정했습니다.
  - v2.0.35의 대각선 교차 보정이 실제 v2023 캐릭터 파일을 과하게 뒤집고 있었습니다.
  - 이제 8방향은 다시 `파일명 = 실제 표시 방향`으로 고정합니다.
  - 1시 입력은 `northeast`, 5시 입력은 `southeast` 텍스처를 그대로 사용합니다.
- 낚시게임 릴 게이지 UI를 작동/표시 기준으로 다시 정리했습니다.
  - 릴 패널을 중앙 하단 안전 위치에 고정하고, 세로 게이지/가로 장력 트랙/안전 진행바/서지 미터/릴 버튼이 모두 보이도록 `v2038-reel-panel` 레이어를 추가했습니다.
  - CSS 이미지 프레임 의존도를 줄이고 실제 움직이는 DOM 게이지가 눈에 보이도록 했습니다.
  - 성공 결과창은 중앙 safe-area 안에 유지됩니다.
- 우측 상단 `+ / - / 원점 / 건설 / 상점 / 출항` 조작바를 테두리 기준으로 다시 조정했습니다.
  - 서로 붙지 않도록 2px 간격을 두고, 버튼 테두리/배경은 투명에 가까운 아쿠아 톤으로 유지합니다.
- 가방/지도 메뉴 페이지의 남은 비아쿠아 프레임 잔여물을 정리했습니다.
  - `runtime-3d-bg`, 큰 캐릭터 배경, 월드맵 큰 이미지 프레임, 프리미엄 과장 프레임을 숨기고 실제 카드형 아쿠아 UI가 우선 보이게 했습니다.
- `check-v2038-gauge-direction-menu-polish.mjs` 검증을 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge를 `2.0.38`로 동기화했습니다.
- README.md만 수정했고 별도 `*_NOTES.md` 파일은 생성하지 않았습니다.

## v2.0.37 변경사항

- 특정 버전에서만 먹는 CSS 때문에 이전 UI 수정이 새 버전에서 꺼지는 회귀가 다시 생기지 않도록, 이번 패치도 지속형 guard와 검증을 함께 유지합니다.

- 우측 상단 `+ / - / 원점 / 건설 / 상점 / 출항` 조작바를 다시 조정했습니다.
  - v2.0.36에서 너무 좁아져 테두리 기준으로 겹쳐 보이던 문제를 줄였습니다.
  - 아이콘 기준이 아니라 버튼 테두리 기준으로 3~4px 여백을 두도록 보정했습니다.
  - 기존 아쿠아 톤과 흰 글씨를 유지했습니다.
- 낚시게임 릴 감기 게이지 UI를 다시 정리했습니다.
  - 릴 패널의 `overflow:hidden`과 작은 높이 제한으로 게이지가 반절만 보일 수 있던 문제를 보정했습니다.
  - 세로 장력 게이지, 가로 장력 트랙, 안전 진행바, 서지 미터, 릴 버튼이 패널 안에서 전체 표시되도록 `v2037-reel-panel` 레이어를 추가했습니다.
  - 낚시 시작 버튼과 성공 결과창은 화면 중앙 안전 영역에 유지됩니다.
- 낚시 화면 상단 UI를 다른 메뉴처럼 아쿠아 카드 톤으로 정리했습니다.
  - HUD 칩과 `낚시 준비` 안내 카드가 밝은 아쿠아 배경과 진한 해양색 글씨 조합을 사용합니다.
- 각 메뉴 페이지의 일부 이상한 그림/프레임 잔여물을 정리했습니다.
  - `runtime-3d-bg`, 큰 캐릭터 배경, 과한 프레임 계열을 메뉴 페이지에서 숨기고 읽기 쉬운 아쿠아 카드 톤을 우선 적용했습니다.
  - 가방/퀘스트/지도/상점 본문이 아래로 밀려 비어 보이지 않도록 여백을 다시 정리했습니다.
- 우측 하단 메뉴 도크는 홈/낚시/메뉴 공통 구조와 흰 글씨, 투명 테두리를 유지합니다.
- 캐릭터 정보창이 열리면 우측 하단 메뉴바가 숨겨지는 규칙을 `v2037-character-panel-open`에서도 유지합니다.
- `check-v2037-spacing-fishing-menu-polish.mjs` 검증을 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge를 `2.0.37`로 동기화했습니다.
- README.md만 수정했고 별도 `*_NOTES.md` 파일은 생성하지 않았습니다.

## 유지 규칙

- 루트 Markdown 파일은 README.md 하나만 유지합니다.
- `*_NOTES.md` 생성 금지.
- 캐릭터 이름표는 뒤집히면 안 됩니다.
- 8방향 캐릭터는 이동 방향과 표시 방향을 계속 검증합니다.
- 마을 뒤에 기존 원화 배경 이미지를 깔지 않습니다.
- 우측 하단 메뉴 도크 구조는 유지합니다.

```text
        [마을]
[가방] [퀘스트] [지도]
```

- 건설 흐름은 유지합니다.

```text
건설 버튼 → 건설 팝업 → 건물 선택 → 팝업 닫힘 → 반투명 프리뷰 → 초록/빨강 설치 판정 → 터치 설치
```

## GitHub Actions / npm registry 주의

`package-lock.json`에 아래 문자열이 들어가면 안 됩니다.

```text
packages.applied-caas
applied-caas-gateway
10.192.
internal.api.openai
```

현재 작업 컨테이너에서는 public npm registry DNS 조회가 `EAI_AGAIN`으로 실패할 수 있습니다. 이 경우 `typecheck`와 `build`는 의존성 미설치로 실패하지만, lockfile 오염과는 별개입니다.
