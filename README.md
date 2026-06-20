# AquaFantasia v2.0.52

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

## v2.0.52 변경사항

- 앞서 요청했던 타일/건설 기준점 문제를 본격 패치했습니다. 타일 좌표, 건물 풋프린트, 장식 바닥점, 캐릭터 발밑 앵커를 분리해 이미지가 타일 우측/모서리에 떠 보이는 회귀를 줄였습니다.
- 기존 저장 건물의 `x/y/w/h`를 건물 정의 크기와 다시 맞추고, 바다/겹침/맵 가장자리 쪽으로 밀린 저장 건물은 가까운 안전 타일로 보정하는 저장 데이터 정규화 단계를 추가했습니다.
- 건물 렌더링은 전역 좌표에 이미지를 직접 꽂는 방식 대신 컨테이너의 바닥 중심점에 배치하고, 내부 스프라이트를 `anchor(0.5, 1)`로 세우도록 정리했습니다.
- 건설 프리뷰와 실제 건물은 같은 풋프린트 기준을 공유하며, 초록/빨강 타일 표시와 반투명 건물 고스트가 같은 기준으로 움직이도록 재정리했습니다.
- 장식 오브젝트는 하단 anchor가 타일의 시각적 바닥점에 맞도록 보정하고, z-index도 보정된 배치 좌표 기준으로 계산해 뒤앞 정렬이 어긋나는 문제를 줄였습니다.
- 건물 터치 판정은 과하게 넓은 좌우 1칸 판정을 줄이고, 실제 풋프린트와 정면 문 앞 1줄을 중심으로 잡아 옆 타일을 눌렀는데 건물이 열리는 문제를 완화했습니다.
- 루프/개척 캡슐은 HUD와 우측 상단 메뉴 사이에 더 작게 고정하고, 조이스틱 영역과 겹치지 않도록 v2.0.52 전용 위치 보정을 추가했습니다.
- 우측 하단 도크는 v2.0.51의 4버튼 2줄 구조를 유지하되, 빈칸 프레임이 다시 생기지 않도록 `:empty`/비버튼 슬롯 숨김 규칙을 추가했습니다.
- 낚시 장력 UI는 기존 입력 시스템을 유지하면서 게이지 최소 가시 폭과 `손을 떼면 장력 ↓` 안내를 추가해 입력 상태가 더 분명히 보이도록 했습니다.
- v2.0.51 검증 스크립트는 v2.0.52 이후에도 회귀 검사용으로 동작하도록 버전 판정을 완화했습니다.
- v2.0.52 전용 정적 검증 스크립트 `check-v2052-tile-anchor-content-audit.mjs`를 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.52`로 동기화했습니다.

## v2.0.51 변경사항

- 새로 추가된 루프/개척 정보 보드가 화면과 조이스틱을 가리는 문제를 줄이기 위해 HUD와 우측 상단 조작바 사이의 소형 캡슐형 카드로 재배치했습니다. 필요할 때만 `루프`/`개척` 버튼으로 펼칠 수 있습니다.
- HUD를 더 작게 줄이고 우측 상단 조작바의 위쪽 빈 공란을 최소화해 마을 시야를 넓혔습니다.
- 우측 하단 메뉴 도크를 다시 `마을` 상단 1칸 + `가방/퀘스트/지도` 하단 3칸의 4버튼 구조로 고정하고, 없는 빈칸 테두리가 보이지 않도록 flex 2줄 구조로 복구했습니다.
- 낚시 장력 시스템은 실제 입력이 보이도록 장력 % 숫자, 입력 ON/OFF 상태, 안전 구간 진행률, 위험 흔들림, 안전 펄스, 진동 강약 피드백을 추가했습니다.
- 낚시 성공창을 큰 프레임 이미지 의존도 낮은 아쿠아 카드형 결과창으로 재정리해 화면 중앙에서 물고기/보상/연속 성공 정보를 읽기 쉽게 만들었습니다.
- 캐릭터 이동 모션을 더 크게 보이도록 걷기 바운스, 좌우 발걸음 느낌, 그림자 펄스를 강화했습니다.
- 물결, 물고기 그림자, 오리, 갈매기, 나비, 깃발, 나무, 램프 등 움직임이 있어야 자연스러운 오브젝트에 저부하 패시브 모션을 추가했습니다.
- v2.0.51 전용 정적 검증 스크립트 `check-v2051-hud-dock-fishing-motion-polish.mjs`를 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.51`로 동기화했습니다.

## v2.0.50 변경사항

- 초기 계획의 다음 단계가 보이도록 `다른 섬 개척 준비 보드`를 마을과 월드맵에 추가했습니다.
- 개척 준비 보드는 발전도 1000, 시설 8채, 돌길 16칸, 수역 8곳, 도감 20종, 개척 항로 허가서 보유 여부를 한 카드에서 보여줍니다.
- 상점에 1회성 `개척 항로 허가서`를 추가했습니다. 이미 보유한 경우 다시 구매되지 않고 `보유` 상태로 표시됩니다.
- 퀘스트에 `섬 개척 준비 3단계`, `개척 항로 허가서 확보` 목표를 추가해 낚시 → 판매 → 마을 성장 → 항로 개척 흐름을 강화했습니다.
- 마을 오브젝트 일부를 더 정리해 금색 등불, 반짝이, 나비, 넓은 계단류가 동선/성장 보드 시야를 과하게 방해하지 않도록 했습니다.
- 낚시 화면은 v2.0.48~v2.0.49의 중앙 시작 버튼, 릴 패널, 홀드 버튼, 도크 분리 구조를 유지하면서 v2.0.50 고정 스타일을 추가했습니다.
- 우측 하단 메뉴 도크는 자연스러운 하단 위치, 빈칸 제거, 얇은 아쿠아 프레임 규칙을 유지합니다.
- v2.0.49 검증 스크립트가 v2.0.50 이후 버전에서도 회귀 검사용으로 동작하도록 버전 판정을 완화했습니다.
- v2.0.50 전용 정적 검증 스크립트 `check-v2050-content-expansion-asset-polish.mjs`를 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.50`로 동기화했습니다.

## v2.0.49 변경사항

- 초기 계획의 핵심 루프가 마을에서 더 잘 보이도록 `해양 제국 성장 보드`를 추가했습니다. 낚시/판매/시설/자동수익 상태와 다음 추천 목표를 한 카드에서 확인할 수 있습니다.
- 마을 성장 보드는 발전도 100/500/1000 단계에 따라 `첫 관광객`, `관광버스`, `VIP 관광섬`, `다른 섬 개척 준비` 흐름을 안내합니다.
- 상점에 `마을 장식 키트`를 추가해 골드를 마을기금으로 전환하고 건설/성장 루프를 더 빠르게 체감할 수 있게 했습니다.
- 퀘스트에 마을 발전도, 시설 수, 돌길 수, 관광객, 자동수익 관련 목표를 추가해 낚시 외 성장 콘텐츠를 강화했습니다.
- 마을 하단/항구 가장자리의 중복 물가 장식, 새, 부표, 선착장 반복 오브젝트를 한 번 더 정리해 반쯤 잘리거나 과밀하게 보일 가능성을 줄였습니다.
- 자동수익이 발생하면 성장 보드 위에 작은 `자동수익 +nG` 피드백이 표시되도록 했습니다.
- 낚시 릴 패널과 홀드 버튼의 아쿠아 프레임/가시성을 재보강하고, 릴링 중 안내 카드가 사라져 조작법을 놓치는 문제를 줄였습니다.
- 우측 하단 메뉴 도크는 v2.0.48의 자연 배치/빈칸 제거 구조를 보존하면서 v2.0.49 아쿠아 프레임 검증을 추가했습니다.
- v2.0.49 전용 정적 검증 스크립트 `check-v2049-content-asset-system-polish.mjs`를 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.49`로 동기화했습니다.

## v2.0.48 변경사항

- v2.0.47에서 만족스럽게 잡힌 캐릭터 8방향 전용 에셋 구조는 그대로 보존했습니다.
- 우측 하단 메뉴 도크가 전체 화면에서 지나치게 위로 올라오던 문제를 일반 화면/낚시 화면 별도 safe-area 값으로 분리해 자연스럽게 낮췄습니다.
- 우측 하단 메뉴 도크를 `마을` 1칸 상단, `가방/퀘스트/지도` 3칸 하단의 실제 2줄 구조로 재구성해 빈칸이 버튼이나 프레임처럼 보이지 않도록 했습니다.
- 우측 상단 조작바와 우측 하단 도크는 얇은 아쿠아 프레임과 은은한 배경을 유지하되, 빈 셀 프레임은 제거했습니다.
- 낚시 화면의 `낚시 시작` 버튼이 좌측 구석으로 밀리지 않도록 fixed 중앙 하단 배치로 고정했습니다.
- 낚시 릴 시스템은 누르면 게이지가 올라가고 떼면 내려가는 방식이 실제 체감되도록 입력 이벤트, touch fallback, 장력 변화량, 안내 문구, 상태 표시를 다시 설계했습니다.
- 릴 패널에는 `누르면 장력 ↑ · 떼면 장력 ↓` 상태 표시를 추가하고, 버튼/바다 화면 모두 hold 입력을 받도록 보강했습니다.
- 낚시 안전 구간과 성공 유지 시간을 조정해 초반 낚시가 멍하게 실패하는 흐름을 줄였습니다.
- 마을 건물/장식/캐릭터 렌더링 기준점을 바닥 중심 기준으로 정리해 타일 옆이나 모서리에 뜨는 느낌을 줄였습니다.
- 건설 프리뷰와 실제 건물 배치도 같은 바닥 중심 anchor를 공유하도록 보정했습니다.
- v2.0.48 전용 정적 검증 스크립트 `check-v2048-dock-fishing-anchor-system.mjs`를 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.48`로 동기화했습니다.

## v2.0.47 변경사항

- 캐릭터 8방향 중 1시/5시가 계속 반대로 보이는 문제를 파일명 매핑 대신 전용 시각 보정 에셋으로 처리했습니다.
- `public/assets/v2047/characters`에 7개 역할 x 8방향, 총 56개의 clock-corrected 캐릭터 PNG를 생성했습니다.
- 1시 방향은 오른쪽 위를 보는 후방 대각선, 5시 방향은 오른쪽 아래를 보는 전방 대각선으로 별도 PNG를 사용합니다.
- 기존 v2023 대각선 파일명 혼동을 피하기 위해 런타임 캐릭터 텍스처 경로를 v2047 전용 폴더로 변경했습니다.
- 낚시 화면 루트에 누락되어 있던 v2046/v2047 플레이 가능 클래스를 보강해 릴 패널 위치/버튼 스타일이 실제 적용되도록 했습니다.
- 낚시 화면 우측 하단 도크는 body 고정 상태에서 한 번 더 강제 lift 값을 넣어 하단 잘림 회귀를 줄였습니다.
- 릴 감기 버튼을 더 크게 보이게 하고, 안내 문구에 큰 버튼을 누르라는 내용을 명확히 추가했습니다.
- 릴 게이지 성공 조건을 3초에서 2.4초로 완화하고 안전 구간을 넓혀 초반 낚시 실패율을 줄였습니다.
- 우측 상단/우측 하단 메뉴바는 투명했던 상태에서 얇은 아쿠아 프레임과 은은한 배경을 다시 유지합니다.
- v2.0.47 전용 정적 검증 스크립트 `check-v2047-direction-fishing-final-repair.mjs`를 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.47`로 동기화했습니다.

## v2.0.46 변경사항

- 우측 상단 조작바와 우측 하단 메뉴 도크에 완전 투명 대신 얇은 아쿠아 톤 테두리/배경을 다시 적용해 버튼 묶음이 허전하게 보이지 않도록 했습니다.
- 우측 하단 메뉴 도크를 앱 내부가 아닌 body 고정 오버레이로 마운트해 낚시 화면에서 하단 절반이 잘려 보이는 문제를 회피하도록 보강했습니다.
- 낚시 릴링 단계에 큰 `누르는 동안 릴 감기` 버튼과 설명을 추가하고, 릴 버튼뿐 아니라 바다 화면을 누르고 있어도 장력 입력이 들어가도록 전체 낚시 화면 홀드 입력을 추가했습니다.
- `물었다!` 콜아웃에 `릴링 시작` 버튼을 추가하고, 사용자가 놓쳐도 짧은 지연 후 릴 패널이 자동으로 뜨도록 해 멍하게 기다리다 실패하는 흐름을 줄였습니다.
- 낚시 릴 패널 위치를 새 도크 높이 기준으로 다시 계산하고, 패널/버튼/콜아웃의 z-index와 pointer-events를 재잠금했습니다.
- v2.0.46 전용 정적 검증 스크립트 `check-v2046-fishing-dock-reel-repair.mjs`를 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.46`으로 동기화했습니다.

## v2.0.45 변경사항

- v2.0.44 기준으로 전체 에셋/기능/성능 회귀 가능성을 다시 점검했습니다.
- 캐릭터 8방향 에셋은 `player/chief/merchant/guild/captain/tourist/vip` 전부 `south/southeast/east/northeast/north/northwest/west/southwest` 파일이 존재하는지 검증하도록 추가했습니다. 1시/5시 방향용 대각선 PNG는 누락이 아니라 존재하며, 현재 1시는 시각 기준 보정 매핑, 5시는 `southeast` 직접 매핑을 유지합니다.
- 마을 장식 오브젝트 중 하단 물가/가장자리에서 반쯤 잘려 보일 수 있는 중복 물결, 물고기 그림자, 스플래시, 교량/산호 계열을 숨기거나 더 안쪽으로 클램프했습니다. 큰 나무/야자/등대/교량류는 추가 축소와 비충돌 보정을 적용했습니다.
- 마을 Pixi 엔진은 런타임 품질값을 참고해 DPR 상한을 낮추고, 저사양/좁은 화면에서는 low-power 모드로 초기화되도록 보완했습니다. 장식 컨테이너는 이벤트 비활성화 처리해 불필요한 포인터 비용을 줄였습니다.
- 낚시 화면은 v2.0.45 전용 safe-area 값을 추가해 우측 하단 도크를 한 번 더 위로 올리고, 릴 패널을 도크 스택 위 중앙 안전 영역에 고정했습니다. 릴 패널/버튼/결과창의 pointer-events와 z-index도 최종 우선순위로 다시 잠갔습니다.
- 메뉴 페이지 공통 중앙 아쿠아 카드 폭을 v2.0.45 클래스에서도 유지하고, lite 품질에서는 일부 물결/버블/어류 그림자 애니메이션을 줄여 성능을 보완했습니다.
- v2.0.45 전용 정적 검증 스크립트 `check-v2045-direction-asset-engine-audit.mjs`를 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.45`로 동기화했습니다.
- README.md만 수정했고 별도 `*_NOTES.md` 파일은 생성하지 않았습니다.

## v2.0.44 변경사항

- 첫 시작 로딩 문구를 `Aqua Fantasia 접속 중`으로 변경했습니다.
- 캐릭터명 변경 시 HUD/정보창뿐 아니라 마을 캐릭터 머리 위 이름표도 즉시 동기화되도록 했습니다.
- 상점 무료 보상은 `shop_free_YYYY-MM-DD` 저장 플래그로 하루 1회만 받을 수 있게 수정했습니다.
- 낚시 화면 우측 하단 메뉴 도크를 safe-area보다 더 위로 고정하고, 릴 패널/결과창/터치 영역 z-index를 재정리했습니다.
- 건설한 건물은 영구 저장되며, 건물을 터치한 뒤 `건물 이동` 버튼으로 비용 없이 다시 배치할 수 있게 했습니다.
- 우측 상단 조작바의 최상단 여백을 줄이고 버튼/아이콘/라벨 크기를 다시 고정했습니다.
- 잘려 보이던 큰 마을 가장자리 오브젝트를 안쪽으로 옮기고 축소/비충돌화했습니다.
- v2.0.44 전용 낚시/상점/마을 정적 검증 스크립트를 추가하고, v2.0.43 검증은 이후 버전에서도 기능 회귀를 확인하도록 보정했습니다.


## v2.0.43 변경사항

- 누적 패치가 겹치며 다시 흔들릴 수 있는 UI/건설/조작바 구조를 꼼꼼히 재점검했습니다.
- 우측 상단 `+ / - / 원점 / 건설 / 상점 / 출항` 조작바를 HTML 구조부터 통일했습니다. 모든 버튼은 같은 아이콘 슬롯과 같은 글자 슬롯을 사용하고, 아이콘/라벨/버튼 크기를 v2.0.43 CSS에서 한 번 더 고정합니다.
- 건설 설치 모드는 손가락 위치를 건물의 좌상단이 아니라 건물 바닥 중심 기준으로 해석하도록 보정했습니다. 반투명 건물 프리뷰가 실제 설치될 자리 위에서 따라오고, 초록/빨강 판정은 최소 바닥 표시로만 유지합니다.
- 건설 목록 모달의 중앙 고정, safe-area 최대 높이, 스크롤, 닫기 버튼, 투명 배경 규칙을 v2.0.43에서 다시 잠갔습니다.
- 상점/가방/퀘스트/지도/장비/도감/랭킹 계열 메뉴 페이지의 HUD 지갑 영역과 본문 카드 폭을 같은 중앙 아쿠아 카드 기준으로 재정리했습니다.
- 토스트 알림을 HUD와 더 멀어지도록 한 단계 아래로 내리고, 팝업·릴 패널·결과창과 겹치지 않는 z-index/safe-area 규칙을 추가했습니다.
- 건물 내부 화면에서 v2.0.43 상태 클래스까지 함께 부여해 우측 상단 조작바와 우측 하단 도크가 다시 따라오는 회귀를 막았습니다.
- 캐릭터 8방향 PNG 파일 존재와 v2.0.42 시각 기준 대각선 매핑을 유지 검증합니다. 이름표는 텍스처 교체와 무관하게 뒤집히지 않는 구조를 유지합니다.
- `check-v2043-stability-ui-build-control-audit.mjs` 검증을 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.43`으로 동기화했습니다.
- README.md만 수정했고 별도 `*_NOTES.md` 파일은 생성하지 않았습니다.

## v2.0.42 변경사항

- 건설 목록 팝업이 모바일 화면 왼쪽 밖으로 밀리지 않도록 중앙 고정 모달로 다시 배치했습니다.
- 설치 모드에서 전체 화면이 어둡거나 불투명하게 덮이지 않도록 수정했습니다. 건물을 선택하면 팝업은 닫히고, 반투명 건물 프리뷰만 바닥 위에서 따라다니며 드래그 후 손을 떼면 설치됩니다.
- 우측 상단 `+ / - / 원점 / 건설 / 상점 / 출항` 조작바의 버튼 크기, 아이콘 박스, 글자 기준선을 다시 통일했고 외곽 테두리는 완전 투명으로 유지했습니다.
- 우측 하단 메뉴 도크의 투명 외곽 규칙을 v2.0.42에서도 유지했습니다.
- 상점 화면을 다른 메뉴 페이지와 같은 중앙 정렬 아쿠아 카드 UI로 재구성하고, 상점 카드/가격 배지/상단 골드·가방 표기 영역이 밀리지 않도록 넓혔습니다.
- 건물 내부 화면도 아쿠아 카드 톤으로 맞추고, 내부 액션 버튼의 남은 이미지형 버튼 느낌을 줄였습니다.
- 토스트 알림 팝업을 HUD와 덜 겹치도록 조금 아래로 내렸습니다.
- 캐릭터 대각선 PNG를 실제 모양 기준으로 다시 확인했습니다. 1시 입력은 시각적으로 더 upper-right에 가까운 `player_northwest.png`를 사용하고, 11시는 `player_northeast.png`를 사용하도록 상단 대각선만 보정했습니다. 5시와 7시는 하단 대각선 파일을 직접 유지합니다.
- `check-v2042-build-placement-shop-direction-polish.mjs` 검증을 추가하고, 이전 방향 검증 스크립트가 v2.0.42의 시각 기준 대각선 보정을 허용하도록 정리했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, README를 `2.0.42`로 동기화했습니다.
- README.md만 수정했고 별도 `*_NOTES.md` 파일은 생성하지 않았습니다.

## v2.0.41 변경사항

- Polished the right-top village control stack so every button keeps the same square size, icon box, text baseline, tiny gap, and fully transparent outer frame.
- Kept the right-bottom menu dock layout identical across village, fishing, and menu pages, while making the outer dock frame transparent and strengthening safe-area bottom spacing.
- Removed the HUD click-to-open copy and added an in-profile player-name editor that is stored with the save data. The profile panel no longer includes CAPTAIN PROFILE or the long explanatory note.
- Re-centered inventory, quest, map, village, and shop runtime menu pages on the mobile viewport, widened the top wallet/status strip, and added extra bottom padding so page buttons do not collide with the dock.
- Rebuilt the fishing reel panel as a fixed center-bottom, touch-safe DOM panel: reel gauge, hold button, panel pointer events, result card center position, cast button position, and callout/bobber-image cleanup are all guarded by v2.0.41 CSS and JS tokens.
- Building interior panels now hide the right-top controls and right-bottom dock through both class and hidden-attribute guards, then restore them on exit.
- Rechecked the v2023 8-direction player files and removed the diagonal cross-map: 1 o'clock uses northeast, 5 o'clock uses southeast, 7 o'clock uses southwest, and 11 o'clock uses northwest.
- Added `check-v2041-ui-fishing-profile-polish.mjs` and relaxed the v2.0.40 audit so future v2.0.40+ patches can keep the validation lineage without forcing the old diagonal cross-map.
- Synchronized `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge, and README to `2.0.41`.
- README.md remains the only root Markdown file; no `*_NOTES.md` file was created.

## v2.0.40 변경사항

- 낚시게임 릴 감기 게이지를 실제 터치 가능 DOM 게이지 중심으로 재구성했습니다.
  - 릴 패널 전체와 `꾹 눌러 릴 감기` 버튼 모두에서 누름이 인식되도록 포인터 입력을 보강했습니다.
  - 세로 장력 게이지에는 현재 장력 마커와 안전 구간 표시를 추가했습니다.
  - 릴 패널/성공 결과창/낚시 시작 버튼을 중앙 하단 safe-area 기준으로 다시 고정했습니다.
- `퐁!` 캐스팅 액션 글씨 옆에 찌처럼 보이는 장식 이미지가 같이 뜨지 않도록 캐스팅 trail과 bite callout 이미지를 제거하고 텍스트 중심으로 정리했습니다.
- 캐릭터 1시/5시 방향을 현장 관찰 기준으로 다시 보정했습니다.
  - 1시 입력이 7시처럼 보이는 문제를 막기 위해 `northeast` 이동은 `southwest` 텍스처를 사용합니다.
  - 5시 입력이 11시처럼 보이는 문제를 막기 위해 `southeast` 이동은 `northwest` 텍스처를 사용합니다.
  - 좌/우/상/하 방향은 기존 보정을 유지합니다.
- 건물 내부 화면이 열리면 우측 상단 조작바와 우측 하단 도크가 사라지도록 상태 클래스를 추가했습니다.
- 우측 상단 `+ / - / 원점 / 건설 / 상점 / 출항` 조작바를 버튼 테두리 기준으로 거의 붙지만 겹치지 않는 2px 간격으로 재조정했습니다.
- 각 메뉴 페이지에서 우측 하단 도크 근처 버튼이 겹치지 않도록 본문 우측/하단 safe padding을 보강했습니다.
- 가방/지도/퀘스트/상점 화면의 남은 비아쿠아 버튼 이미지와 과한 프레임을 숨기고 밝은 아쿠아 카드 톤으로 통일했습니다.
- 마을 타일/오브젝트 짤림, 팝업 z-index, HUD 정보 라벨, 도크 안전 여백, service worker 캐시 버전을 다시 점검했습니다.
- `check-v2040-full-screen-engine-ui-audit.mjs` 검증을 추가했습니다.
- `package.json`, `package-lock.json`, `APP_VERSION`, service worker cache, offline badge를 `2.0.40`로 동기화했습니다.
- README.md만 수정했고 별도 `*_NOTES.md` 파일은 생성하지 않았습니다.

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
