# AquaFantasia AI HANDOFF CARDVILLE

## 현재 기준

- 프로젝트명: AquaFantasia / 아쿠아 판타지아
- 기준 패키지 버전: `2.1.117`
- 기준 기록일: `2026-06-30 KST`
- 실행 형태: Vite + TypeScript 모바일 세로 전용 웹 게임
- 주요 배포 흐름: GitHub Actions `validate-and-deploy`에서 `npm ci` → `npm run validate` → `npm run typecheck` → `npm run build` → GitHub Pages 배포
- 사용자 작업 환경: GitHub Desktop, Firebase 무료 플랜
- 업로드 원본: `.git` 폴더 제외 통파일 zip
- 산출물 zip 파일명 규칙: 짧게 쓰되 버전 숫자를 반드시 포함한다. 예: `AF-v2.1.117-full.zip`, `AF-v2.1.117-patch.zip`

## 절대 유지 규칙

1. 잘 작동되는 기능은 건드리지 않는다. 기존 정상 기능은 근거 없이 재작성하지 않는다.
2. SVG 이미지 절대 금지. `.svg`, `.svgz`, `image/svg`, 인라인 `<svg>` 런타임 참조를 추가하지 않는다.
3. 불필요한 문서/임시 파일을 만들지 않는다.
4. 인수인계/진행상황 기록은 이 파일 `AI_HANDOFF_CARDVILLE.md`와 `README.md`에만 남긴다.
5. GitHub Actions가 자동 실행되므로 `package.json`의 검증 흐름을 깨지 않는다.
6. `node_modules/`, `dist/`, `reports/`, 로그, 백업 폴더, 임시 노트는 패키지/커밋에 포함하지 않는다.
7. Firebase 무료 플랜 기준으로, 명시적 설정 없이 유료 기능/서버 강제 의존 구조를 만들지 않는다.
8. 현재 앱은 Firebase 설정이 없으면 로컬 저장으로 동작하는 구조를 유지해야 한다.
9. 오프닝 영상은 poster 정지 이미지 없이 video-only 계약을 유지한다.
10. 플레이어 8방향 방향 파일명과 flip 금지 정책을 유지한다.
11. 낚시 UI는 모바일 세로 safe-area 기준으로 겹침, 화면 밖 밀림, 잔상 cleanup을 우선 검수한다.

## 현재 파일/구조 요약

- 루트 핵심 파일: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `firebase.json`, `index.html`, `README.md`, `AI_HANDOFF_CARDVILLE.md`
- GitHub Actions: `.github/workflows/pages.yml`
- 소스: `src/`
  - `src/main.ts`: 게임 전체 화면 전환, 낚시 루프, UI 보정 패스, 서비스워커 등록
  - `src/villageWorld.ts`: Pixi 기반 마을/건설/이동/카메라/조이스틱/타일/충돌
  - `src/data.ts`: 앱 버전, 캐시명, 지역/물고기/기본 저장 데이터
  - `src/storage.ts`: 로컬 저장, 저장값 정규화, Firebase 익명 연동 시도
  - `src/styles.css`: 누적 UI/레이아웃/모바일 세로 보정 CSS
  - `src/core/`: 세로 화면 가드, 런타임 품질 관리자, WebGL 수중 배경 레이어
- 정적 자산: `public/assets/`
- 서비스워커: `public/sw.js`
- 오프라인 페이지: `public/offline.html`
- 검증 스크립트: `tools/`

## 현재 버전 핵심 기능 상태

- 낚시 상태: `idle`, `casting`, `waiting`, `bite`, `reeling`, `success`, `fail`
- v2.1.110 핵심 기능은 유지됨: 낚시 안전 구간 0.5 단위 양자화, 물고기 피로도 기반 저항 완화, 입질/액션 배지/게이지/릴 콘솔/결과창 safe-area 재정렬
- v2.1.117 핵심: 마을 우측 상단 메뉴 아이콘은 버튼 크기/2x3 배치를 유지한 채 내부 아이콘만 24~25px로 키우고, clipping/isolation/pseudo 제거로 위쪽 다른 그림 비침을 방지. 마을 이동/건설/상점/출항 동작은 건드리지 않음
- v2.1.116 핵심: 낚싯대/미끼 loadout 꿈틀거림, 연속 성공 구버전 스킨, `물었다!` 창 자동 전환/흔들림, 성공 결과창 크기 흔들림을 UI hotfix로 보정. 낚시 판정/보상/밸런스는 건드리지 않음
- v2.1.115 핵심: 기능/게임 로직은 건드리지 않고, RuntimeQualityManager의 viewport 이벤트를 RAF batching/signature 비교로 가볍게 만들고, 키보드/주소창 변동 시 패널·입력창·safe-area 보정을 마지막 CSS 스코프와 검증 스크립트로 보강
- v2.1.114 핵심: 기능/게임 로직은 건드리지 않고, 상점/가방/미션/도감/건설/결과창 카드 폭, 긴 문구 줄바꿈, 하단 내비 safe-area, 낚시 결과창 스크롤 경계를 마지막 CSS 스코프와 검증 스크립트로 보강
- v2.1.113 핵심: 기능/게임 로직은 건드리지 않고, 모바일 세로 UI/UX 안정성 스윕을 마지막 CSS 스코프와 검증 스크립트로 보강
- v2.1.112 핵심: 기능/게임 로직은 건드리지 않고, GitHub Actions에서 AI_HANDOFF_CARDVILLE.md가 삭제되던 검증 순서/패치 누락 문제를 해결
- v2.1.111 핵심: 기능/게임 로직은 건드리지 않고, 누락 자산 참조와 인수인계/검증 정책만 보강
- 마을 핵심: Pixi 월드, 80 x 80 계열 타일, 건물 설치/이동, 경로 탐색, NPC, 수동 조이스틱/키보드 이동
- 저장 핵심: `localStorage` 키 `aqua-fantasia-save-v650`, 이전 키 일부 마이그레이션, 저장값 sanitize 후 저장
- Firebase 핵심: `window.AQUA_FIREBASE_CONFIG`에 `apiKey`가 있을 때만 `firebase/app`, `firebase/auth`를 동적 import하고 익명 로그인 시도. 설정이 없으면 로컬 저장으로 진행


## v2.1.117 마을 우측 상단 메뉴 아이콘 시인성 hotfix 기록

### 사용자 제보와 원인

- 제보: 마을 화면 우측 위 버튼들 아이콘 크기가 작아 잘 보이지 않음.
- 제보: 아이콘 위쪽에 다른 그림이 보이는 느낌이 있어 보정 필요.
- 원인 후보: 누적 메뉴 보정 패스가 34px 셀 안에 21~22px 아이콘을 쓰고 있었고, 버튼이 투명/반투명 단일 프레임으로 처리되어 월드 배경 또는 이전 pseudo 프레임이 상단에서 비쳐 보이는 체감이 생길 수 있었다.

### 적용 내용

- `src/main.ts`
  - 루트 스코프 `v21117-village-menu-icon-clarity-root`와 데이터 토큰 `data-v21117-village-menu-icon-clarity` 추가.
  - `installV21117VillageMenuIconClarityPass()` 추가. 이 패스는 마을 화면 우측 상단 메뉴에만 작동한다.
  - 메뉴 셀은 34px, 2x3 배치, 3px gap을 유지한다.
  - 아이콘은 일반 화면 25px, 매우 작은 화면 24px로 키워 아이콘과 테두리 간격을 줄인다.
  - 버튼에 `overflow:hidden`, `clip-path`, `isolation:isolate`, background-image 제거, pseudo-element 제거 토큰을 적용한다.
  - 메뉴 텍스트 라벨은 기존처럼 시각적으로 숨겨 아이콘 중심 배치를 유지한다.
- `src/styles.css`
  - `v2.1.117 village top-right menu icon clarity` 마지막 스코프 추가.
  - 우측 상단 메뉴 컨테이너/버튼/아이콘/라벨을 마을 화면에 한정해 보정한다.
  - SVG 이미지 추가 없음. 기존 PNG 아이콘만 사용.
- `tools/check-v21117-village-menu-icon-clarity.mjs`
  - 버전/캐시/README/handoff 동기화, v2.1.117 root/runtime/CSS 토큰, SVG 금지, CSS 자산 존재, README/handoff만 문서 허용을 확인한다.

### 절대 건드리지 않은 것

- 마을 이동/조이스틱/키보드 이동
- 확대/축소/원점/건설/상점/출항 이벤트
- 건설 좌표/충돌/경로 탐색/NPC/카메라
- 낚시 판정/보상/밸런스
- Firebase 저장/익명 로그인 fallback
- 오프닝 video-only 정책
- 플레이어 방향 파일명/flip 금지 정책

### v2.1.117 필수 검수

1. GitHub Actions에서 `npm run validate` 통과.
2. 실제 모바일 마을 화면에서 우측 상단 6개 버튼이 기존 위치/크기를 유지하는지 확인.
3. 아이콘이 이전보다 또렷하게 보이는지 확인.
4. 아이콘 위쪽에 다른 그림, 프레임, 잘린 잔상이 남지 않는지 확인.
5. 확대/축소, 건설, 원점, 상점, 출항 버튼이 정상 동작하는지 확인.
6. `.svg`, `.svgz`, `image/svg`, 인라인 `<svg>` 런타임 참조가 추가되지 않았는지 확인.

현재 샌드박스 검수 결과 작업본 `npm run validate`, `tools/*.mjs` 문법 검사, v2.1.117 full zip 새 압축 해제본 `npm run validate`, v2.1.116 full + v2.1.117 patch 덮어쓰기본 `npm run validate`가 통과했다. full/patch zip 경로 안전성, `.git`/`node_modules`/`dist`/`reports`/`.log`/SVG 미포함, `.md`가 `README.md`와 `AI_HANDOFF_CARDVILLE.md`뿐인 것도 확인했다. `npm run typecheck`는 현재 샌드박스에 `node_modules`가 없어 `howler`, `pixi.js`, `firebase`, `vite` 모듈 해석 실패로 완료하지 못했다. 전체 `npm ci`, `typecheck`, `build`는 GitHub Actions 결과를 최종 기준으로 본다.

## v2.1.116 낚시 UI 안정성 hotfix 기록

### 사용자 제보와 원인

- 제보: 낚시대/미끼 버튼이 혼자 꿈틀거림.
- 제보: 연속 성공 테이블이 구버전이고 Aqua 스킨 이미지가 적용되지 않음.
- 제보: `물었다!` 창이 너무 왔다갔다 열림.
- 제보: 성공창이 화면에서 커졌다 작아졌다 함.
- 확인한 핵심 원인: `triggerBite()`가 `showBiteCallout()` 직후 1.2초 자동 `startReeling()`을 실행해 callout이 사용자가 읽기 전에 사라질 수 있었다. 또한 누적 CSS/normalizer 레이어가 loadout/combo/result에 transform/animation/old skin을 섞어 줄 가능성이 있었다.

### 적용 내용

- `src/main.ts`
  - 루트 스코프 `v21116-fishing-ui-stability-hotfix-root`와 `data-v21116-fishing-ui-stability-hotfix` 추가.
  - 낚시 장비 strip/cell에 `v21116-loadout-stable`, `v21116-loadout-cell` 토큰 추가.
  - 연속 성공 badge에 `v21116-combo-badge` 토큰 추가.
  - 캐스팅 버튼에 `v21116-cast-button-stable` 토큰 추가.
  - `triggerBite()`의 1.2초 자동 릴링 전환 제거. 이제 `물었다!` 이후 플레이어가 직접 바다 화면 또는 `릴링 시작` 버튼으로 릴링을 시작한다.
  - 낚시 root/stage pointer/touch 처리에서 `.bite-callout`을 제외해 callout 터치와 바다 터치가 충돌하지 않게 했다.
  - `showBiteCallout()`은 stage 내부 기존 callout을 재사용하고 stage 밖 잔상만 제거한다. 버튼에는 1회성 pointerdown 리스너만 붙인다.
  - `showResultCard()`는 이미 결과창이 열려 있으면 기존 card를 제거하고 빈 화면으로 return하는 순서를 피하도록 수정했다. `v21116-result-card-stable` 토큰을 추가했다.
- `src/styles.css`
  - v2.1.116 마지막 스코프에서 낚싯대/미끼 loadout의 animation/transform/will-change를 고정.
  - loadout, combo badge, bite callout, result card에 PNG 기반 Aqua premium skin을 적용. SVG 금지 유지.
  - 결과창은 fixed center, 고정 폭, 최대 높이, stable scrollbar, 결과 물고기 이미지 크기, 버튼 2열 grid를 고정해 크기 흔들림을 줄였다.
- `tools/check-v21116-fishing-ui-stability-hotfix.mjs`
  - 버전/캐시/README/handoff 동기화, 사용자 제보 hotfix 토큰, 자동 릴링 제거, callout 재사용, result card 안정 순서, SVG 금지, CSS 자산 존재를 검사한다.

### 절대 유지한 것

- 낚시 판정/게이지 수치/보상/물고기 데이터는 수정하지 않았다.
- 마을 이동/좌표/충돌/건설 로직은 수정하지 않았다.
- Firebase 저장/익명 로그인 fallback 흐름은 수정하지 않았다.
- 오프닝 video-only, 플레이어 8방향 파일명/flip 금지 정책은 유지했다.
- 정상 작동 기능을 재작성하지 않고, 사용자 제보 UI 흔들림 지점만 직접 보정했다.

### v2.1.116 필수 검수

```bash
npm run validate
```

네트워크 가능한 환경에서는 이어서 아래를 확인한다.

```bash
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

현재 샌드박스 검수 결과 작업본 `npm run validate`는 통과했다. `tools/*.mjs` 문법 검사도 통과했다. v2.1.116 full zip 새 압축 해제본과 v2.1.115 full + v2.1.116 patch 덮어쓰기본 모두 `npm run validate`가 통과했다. full/patch zip 경로 안전성, `.git`/`node_modules`/`dist`/`reports`/`.log`/SVG 미포함, `.md`가 `README.md`와 `AI_HANDOFF_CARDVILLE.md`뿐인 것도 확인했다. `npm run ci:registry:check`는 DNS 제한으로 `EAI_AGAIN registry.npmjs.org` 실패했다. 전체 `npm ci`, `typecheck`, `build`는 GitHub Actions 결과를 최종 기준으로 본다.


## v2.1.115 런타임 viewport/input 가드 기록

### 적용 범위

- 이번 패치는 v2.1.114 기준 `npm run validate` 통과를 확인한 뒤 진행했다.
- 정상 작동 가능성이 높은 게임 시스템, 낚시 판정/보상 수치, 물고기 데이터, 마을 좌표/충돌/건설 로직, Firebase 저장/익명 연동 흐름은 수정하지 않았다.
- 엔진/의존성 업그레이드는 현재 샌드박스에서 `npm ci`, `typecheck`, `build`를 확인할 수 없어 보류했다. 대신 검증 가능한 런타임 viewport 처리, 입력 UI 안정성, 서비스워커 캐시 안정성만 적용했다.
- `src/core/RuntimeQualityManager.ts` 변경 내용:
  - `v21115-runtime-viewport-input-root` 루트 클래스와 `data-v21115-runtime-viewport-input` 토큰 추가
  - `visualViewport`/resize/orientation/pageshow/focusin/focusout 이벤트를 즉시 CSS 쓰기가 아닌 `requestAnimationFrame` batching으로 처리
  - viewport width/height/offset/keyboard inset 상태가 이전과 같으면 CSS 변수를 다시 쓰지 않는 signature guard 추가
  - `--v21115-visual-height`, `--v21115-visual-width`, `--v21115-keyboard-inset`, `v21115-keyboard-visible`, `v21115-compact-viewport` 상태 추가
- `src/styles.css` 마지막 레이어에 다음 UI/UX 보정을 추가했다.
  - 키보드 표시 상태에서 메뉴/모달/패널/상점/가방/도감/미션/결과창 최대 높이를 visual viewport 기준으로 보정
  - 입력창 focus 시 scroll-margin을 키보드 inset 기준으로 보정
  - 카드 목록에 stable scrollbar gutter와 overflow-anchor 방지 적용
  - 버튼/입력/CTA에 touch-action manipulation 적용
  - compact viewport에서 긴 제목/칩/버튼 높이와 줄간격을 한 번 더 보정
- `public/sw.js` 변경 내용:
  - `CACHE_NAME`을 v2.1.115로 동기화
  - 캐시 정리 함수를 중복 없이 분리
  - 같은 출처 요청만 앱 캐시에 저장
  - `response.ok` 성공 응답만 캐시해 외부/Firebase/실패 응답이 앱 캐시에 섞이지 않도록 보강
- 신규 검증 스크립트 `tools/check-v21115-runtime-viewport-input-guard.mjs`를 추가해 v2.1.115 토큰, 서비스워커 same-origin 캐시 정책, SVG 금지, CSS 자산 존재, README/handoff 보존, v2.1.112 삭제 재발 방지 정책을 함께 확인한다.

### 재발 방지/주의

- RuntimeQualityManager의 FPS 품질 티어 로직은 정상 작동 가능성이 높으므로 함부로 재작성하지 않는다. 이번 변경은 viewport 변수 쓰기 빈도와 키보드 상태 변수에 한정한다.
- `v21115-keyboard-visible` CSS는 입력창/모달/목록 보정용이다. 낚시 판정, 릴링 수치, 마을 이동 좌표에는 연결하지 않는다.
- 서비스워커는 앱 내부 정적 자산 캐시에 집중한다. Firebase/외부 API를 오프라인 캐시에 섞지 않는다.
- SVG 이미지 절대 금지는 계속 유지한다. 새 이미지가 필요하면 PNG/WEBP만 사용한다.
- `README.md`와 `AI_HANDOFF_CARDVILLE.md` 외 새 문서를 만들지 않는다.
- 패치 zip에는 `package.json`에서 참조하는 신규 검증 스크립트와 기존 cleanup/validate 스크립트를 함께 포함한다.

### v2.1.115 필수 검수

```bash
npm run validate
```

네트워크 가능한 환경에서는 이어서 아래를 확인한다.

```bash
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

현재 샌드박스 검수 결과 작업본 `npm run validate`는 통과했다. `tsc --noEmit --target ES2022 --lib DOM,DOM.Iterable,ES2022 src/core/RuntimeQualityManager.ts` 단독 검사는 통과했다. v2.1.115 full zip 새 압축 해제본과 v2.1.114 full + v2.1.115 patch 덮어쓰기본 모두 `npm run validate`가 통과했다. `npm run ci:registry:check`는 `EAI_AGAIN registry.npmjs.org`로 실패했으며, `node_modules` 미설치 때문에 전체 install/typecheck/build는 GitHub Actions 결과를 최종 기준으로 본다.


## v2.1.114 인터랙션 레이아웃/디자인 스윕 기록

### 적용 범위

- 이번 패치는 v2.1.113 기준 `npm run validate` 통과를 확인한 뒤 진행했다.
- 정상 작동 가능성이 높은 게임 시스템, 낚시 판정/보상 수치, 마을 좌표/충돌/건설 로직, Firebase 저장/익명 연동 흐름은 수정하지 않았다.
- 엔진/의존성 업그레이드는 현재 샌드박스에서 `npm ci`, `typecheck`, `build`를 확인할 수 없어 보류했다. 작동 중인 기능을 깨지 않기 위해 검증 가능한 UI/UX CSS와 검증 스크립트 중심으로만 패치했다.
- `src/main.ts`에는 루트 스코프용 `v21114-interaction-layout-design-root` 클래스와 `data-v21114-interaction-layout-design` 토큰만 추가했다.
- `src/styles.css` 마지막 레이어에 다음 UI/UX 보정을 추가했다.
  - 상점/가방/미션/도감/건설/프로필/결과창 계열 패널의 safe-area 기반 최대 폭/높이 제한
  - 목록/카드 내부 긴 한글 문구 줄바꿈과 overflow-x 차단
  - 버튼/CTA의 긴 문구 균형 줄바꿈, 터치 피드백, 좁은 화면 버튼 크기 보정
  - 낚시 입질 콜아웃/액션 배지/결과창의 폭과 내부 스크롤 경계 보강
  - 하단 내비게이션 폭을 좌우 safe-area 안으로 고정하고 각 버튼이 균등하게 줄어들도록 보정
  - `100svh` 미지원 환경 fallback과 reduced-motion 환경 피드백 완화
- `public/sw.js`, `public/offline.html`, `src/data.ts`, `package.json`, `package-lock.json`의 버전/캐시명을 v2.1.114로 동기화했다.
- 신규 검증 스크립트 `tools/check-v21114-interaction-layout-design-sweep.mjs`를 추가해 v2.1.114 토큰, SVG 금지, CSS 자산 존재, README/handoff 보존, v2.1.112 삭제 재발 방지 정책을 함께 확인한다.

### 재발 방지/주의

- UI/UX 스윕은 반드시 루트 클래스 스코프 안에서만 작동해야 한다. 전역 무차별 수정은 금지한다.
- SVG 이미지 절대 금지는 계속 유지한다. 새 이미지가 필요하면 PNG/WEBP만 사용한다.
- `README.md`와 `AI_HANDOFF_CARDVILLE.md` 외 새 문서를 만들지 않는다.
- 다음 AI는 실제 모바일 화면 캡처가 있을 때 v2.1.114 마지막 CSS 레이어가 상점/가방/미션/도감/낚시 결과창에서 스크롤을 과하게 숨기지 않는지 우선 확인한다.
- 패치 zip에는 `package.json`에서 참조하는 신규 검증 스크립트와 기존 cleanup/validate 스크립트를 함께 포함한다. v2.1.112 실패처럼 CI에 구버전 스크립트가 남는 상황을 다시 만들면 안 된다.

### v2.1.114 필수 검수

```bash
npm run validate
```

네트워크 가능한 환경에서는 이어서 아래를 확인한다.

```bash
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

현재 샌드박스 검수 결과 `npm run validate`는 통과했다. `npm run ci:registry:check`는 `EAI_AGAIN registry.npmjs.org`로 실패할 수 있고, `node_modules`가 없어 install/typecheck/build는 GitHub Actions 결과를 최종 기준으로 본다.


## v2.1.113 UI/UX 안정성 스윕 기록

### 적용 범위

- 이번 패치는 정상 작동 가능성이 높은 게임 시스템/낚시 수치/마을 이동/건설/Firebase 저장 흐름을 건드리지 않았다.
- `src/main.ts`에는 루트 스코프용 `v21113-ui-ux-stability-root` 클래스와 `data-v21113-ui-ux-stability` 토큰만 추가했다.
- `src/styles.css` 마지막 레이어에 모바일 세로 UI/UX 보정만 추가했다.
  - 카드/모달/상점/도감/미션/결과창의 최대 폭과 텍스트 줄바꿈 보호
  - 버튼/닫기/CTA의 최소 터치 높이와 focus-visible 표시
  - 입력창 16px 이상 유지로 모바일 확대/가독성 문제 완화
  - 이미지/캔버스/비디오 폭 제한과 이미지 드래그 방지
  - 낚시 결과창 내부 스크롤/overscroll containment
  - 하단 도크 safe-area 폭 보정
  - reduced-motion 환경에서 애니메이션 부담 완화
- `public/sw.js`, `public/offline.html`, `src/data.ts`, `package.json`, `package-lock.json`의 버전/캐시명을 v2.1.113으로 동기화했다.
- 신규 검증 스크립트 `tools/check-v21113-ui-ux-stability-sweep.mjs`를 추가해 v2.1.113 토큰, SVG 금지, CSS 자산 존재, README/handoff 보존, v2.1.112 삭제 재발 방지 정책을 함께 확인한다.

### 재발 방지/주의

- UI/UX 스윕은 반드시 루트 클래스 스코프 안에서만 작동해야 한다. 전역 무차별 수정은 금지한다.
- 정상 기능을 건드리지 않는 원칙 때문에 이번에는 낚시 상태머신, 보상 수치, 마을 좌표/충돌, Firebase 연동 로직을 수정하지 않았다.
- SVG 이미지 절대 금지는 계속 유지한다. 새 이미지가 필요하면 PNG/WEBP만 사용한다.
- `README.md`와 `AI_HANDOFF_CARDVILLE.md` 외 새 문서를 만들지 않는다.
- 다음 AI는 실제 모바일 화면 캡처가 있을 때 v2.1.113 CSS 마지막 레이어가 기존 v2.1.110 낚시 안전 레인을 과하게 덮지 않는지 우선 확인한다.

### v2.1.113 필수 검수

```bash
npm run validate
```

네트워크 가능한 환경에서는 이어서 아래를 확인한다.

```bash
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

현재 샌드박스 검수 결과 `npm run validate`는 통과했다. `npm run ci:registry:check`는 `EAI_AGAIN registry.npmjs.org`로 실패했고, `node_modules`가 없어 install/typecheck/build는 GitHub Actions 결과를 최종 기준으로 본다.


## v2.1.112 GitHub Actions validate 실패 원인 및 AI_HANDOFF_CARDVILLE.md 삭제 재발 방지 기록

### 발생한 실패

- GitHub Actions `validate`에서 다음 순서로 실패했다.
  1. `npm run validate` 실행
  2. `tools/clean-old-patch-docs.mjs` 실행
  3. 구버전 정리 로직이 `AI_HANDOFF_CARDVILLE.md`를 오래된 패치 문서로 오판해 삭제
  4. `tools/validate-clean.mjs`는 구버전 문구 기준으로 통과
  5. `tools/check-v21111-asset-policy-handoff.mjs`가 `AI_HANDOFF_CARDVILLE.md`를 읽으려다 `ENOENT` 발생

### 직접 원인

- v2.1.111 패치 zip에 `tools/check-v21111-asset-policy-handoff.mjs`는 포함됐지만, 그보다 먼저 실행되는 `tools/clean-old-patch-docs.mjs`와 `tools/validate-clean.mjs` 수정본이 포함되지 않았다.
- 따라서 GitHub 저장소에는 `AI_HANDOFF_CARDVILLE.md`를 보존하지 않는 구버전 정리 스크립트가 남아 있었다.
- 로컬 통파일 기준에서는 수정본이 있었더라도, 사용자가 실제로 적용한 패치 zip 기준으로는 필수 스크립트가 빠져 CI가 실패했다.

### v2.1.112 해결 내용

- `tools/clean-old-patch-docs.mjs`를 루트의 `README.md`와 `AI_HANDOFF_CARDVILLE.md`만 명시적으로 보존하도록 수정했다.
- `tools/validate-clean.mjs`를 `README.md`와 `AI_HANDOFF_CARDVILLE.md`가 둘 다 있어야 통과하도록 강화했다. 더 이상 handoff 문서는 optional이 아니다.
- `tools/check-v21112-ci-handoff-clean.mjs`를 추가해 다음을 확인한다.
  - `package.json` validate 흐름이 v2.1.112 검증 스크립트를 사용함
  - 정리 스크립트가 `AI_HANDOFF_CARDVILLE.md`를 보존함
  - validate-clean이 handoff 문서를 필수로 요구함
  - SVG 파일/런타임 참조 금지 유지
  - CSS 자산 참조 누락 없음 유지
  - 정상 동작 가능성이 높은 낚시/마을/오프닝 핵심 토큰이 유지됨
- v2.1.112 패치 zip에는 반드시 아래 파일을 포함한다. `src/styles.css`는 v2.1.111 CSS 자산 경로 수정이 누락된 저장소에도 안전하게 적용되도록 포함한다.
  - `package.json`
  - `package-lock.json`
  - `src/data.ts`
  - `src/styles.css`
  - `public/sw.js`
  - `public/offline.html`
  - `README.md`
  - `AI_HANDOFF_CARDVILLE.md`
  - `tools/clean-old-patch-docs.mjs`
  - `tools/validate-clean.mjs`
  - `tools/check-v21112-ci-handoff-clean.mjs`

### 재발 방지 규칙

- 인수인계 문서를 검사하는 스크립트를 추가하거나 변경할 때는, 반드시 그보다 먼저 실행되는 cleanup/validate 스크립트도 같이 확인하고 패치 zip에 포함한다.
- `AI_HANDOFF_CARDVILLE.md`는 삭제 대상이 아니라 필수 문서다.
- `README.md`와 `AI_HANDOFF_CARDVILLE.md` 외 새 `.md` 문서는 만들지 않는다.
- 게임 로직, 낚시 수치, 마을 이동/건설, Firebase 저장 흐름은 이번 hotfix에서 건드리지 않았다.
- SVG 이미지 절대 금지와 잘 작동되는 기능 불필요 수정 금지를 계속 유지한다.

## v2.1.112 검수 결과

### 통과한 항목

```bash
npm run validate
npm run validate
node tools/clean-old-patch-docs.mjs
node tools/validate-clean.mjs
node tools/check-v21112-ci-handoff-clean.mjs
```

- `npm run validate` 2회 연속 통과.
- 반복 validate 이후에도 `AI_HANDOFF_CARDVILLE.md`가 삭제되지 않는 것을 확인.
- 별도 smoke copy에서 `SOME_NOTES.md`, `npm-install.log`, `reports/`를 만든 뒤 cleanup 실행 시 임시 파일만 삭제되고 `README.md`, `AI_HANDOFF_CARDVILLE.md`는 보존되는 것을 확인.

### 현재 환경 제한으로 미완료/주의

- `npm run ci:registry:check`는 샌드박스 DNS 제한으로 `EAI_AGAIN registry.npmjs.org` 실패. package-lock 오염이 아니라 네트워크 접근 문제로 판단.
- `npm run typecheck`는 `node_modules` 미설치 상태라 `howler`, `pixi.js`, `firebase`, `vite` 모듈 해석 실패. GitHub Actions의 `npm ci` 성공 후 재확인 필요.
- GitHub Actions에서 `npm ci`, `npm run typecheck`, `npm run build`까지 최종 확인한다.

## v2.1.111 이번 패치에서 실제 변경한 항목

- 패키지/앱/캐시/오프라인 버전을 `2.1.111`로 동기화
- `package.json` 검증 흐름을 `tools/check-v21111-asset-policy-handoff.mjs` 기준으로 갱신
- 신규 검증 스크립트 `tools/check-v21111-asset-policy-handoff.mjs` 추가
  - 버전 동기화 확인
  - SVG 파일/런타임 참조 금지 확인
  - CSS `url(...)` 자산 존재 확인
  - package-lock 내부 금지 레지스트리 토큰 확인
  - README/handoff 필수 원칙 확인
  - player 8방향 파일명/flip 금지, 오프닝 poster 제거 정책 확인
- CSS 누락 자산 참조 3개를 실제 존재하는 PNG/WEBP 자산으로 교정
  - `/assets/v12/buttons/btn_orange_wide_blank.webp` → `/assets/v12/buttons/btn_orange_normal_wide_blank.webp`
  - `./assets/v2110/ui/main_aqua_cards/ui_card_001.png` → `./assets/v2110/ui/main_aqua_cards/ui_main_001.png`
  - `./assets/v2110/ui/buttons_and_badges/ui_badge_001.png` → `./assets/v2110/ui/buttons_and_badges/ui_button_001.png`
- `README.md` 상단에 v2.1.111 변경사항/분석 기록 추가
- 이 파일에 사용자 추가 원칙 반영: 버전 숫자 포함 zip 파일명, 정상 기능 불필요 수정 금지, SVG 이미지 절대 금지
- 게임 로직, 낚시 수치, 마을 이동/건설 로직, Firebase 저장 흐름은 수정하지 않음

## v2.1.111 검수 결과

### 통과해야 하는 기준

```bash
npm run validate
```

### 네트워크 가능한 환경에서 추가 확인

```bash
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

### 현재까지 확인된 항목

- `npm run validate`: 통과
- `.svg`/`.svgz` 실제 파일 없음
- 앱 런타임 대상 파일의 `.svg`, `image/svg`, `<svg`, `svg(` 참조 없음
- CSS `url(...)`에서 `/assets`, `./assets`, `../assets` 기준 실제 파일 미존재 참조 0개가 되도록 교정
- package-lock 내부 금지 레지스트리 토큰 `applied-caas`, `artifactory`, `internal.api.openai`, `10.192.` 없음
- `.git` 폴더는 패키지 zip에 포함하지 않음
- `npm run ci:registry:check`: 현재 샌드박스 DNS 제한으로 `EAI_AGAIN registry.npmjs.org` 실패. package-lock 오염이 아니라 네트워크 접근 문제로 판단
- `npm run typecheck`: `node_modules` 미설치 상태라 `howler`, `pixi.js`, `firebase`, `vite` 모듈 해석 실패. GitHub Actions의 `npm ci` 성공 후 재확인 필요

## v2.1.110 이전 분석에서 확인한 검증 결과

### 통과

- zip 경로 안전성: 절대경로/상위경로 침범 없음
- `.git` 폴더: 업로드 zip 안에 없음
- 루트 버전 동기화: `package.json`, `package-lock.json`, `src/data.ts`, `public/sw.js`, `public/offline.html`, `README.md`가 `2.1.110` 기준으로 맞았음
- `npm run validate`: 통과
- `tools/check-v21110-fishing-feel-design-stability.mjs`: 통과
- package-lock 내부 금지 레지스트리 토큰 검사: `applied-caas`, `artifactory`, `internal.api.openai`, `10.192.` 검출 없음

### 미완료/주의

- 현재 샌드박스 DNS/network 제한으로 `registry.npmjs.org` 접근이 `EAI_AGAIN`으로 실패할 수 있어 `npm ci`, `npm run typecheck`, `npm run build`는 GitHub Actions에서 다시 확인해야 한다.
- GitHub Actions 환경에서는 `.github/workflows/pages.yml`이 Node 22와 공개 npm registry를 강제하므로, 실제 CI에서 install/typecheck/build를 확인해야 한다.

## 다음 업데이트 예상 작업

1. GitHub Actions 또는 네트워크 가능한 로컬 환경에서 `npm ci`, `npm run typecheck`, `npm run build` 결과 확인
2. 모바일 세로 실기기 기준으로 낚시 준비 → 입질 → 릴링 → 성공/실패 결과창 UI 겹침 재검수
3. 마을 화면 조이스틱, 건설 프리뷰, 건물 이동/설치 확인 팝업 터치 영역 검수
4. Firebase 무료 플랜 기준 `window.AQUA_FIREBASE_CONFIG` 주입 방식 문서화 또는 설정 예시를 코드 밖에서 정리
5. 다음 코드 패치 시에도 정상 작동 기능을 건드리지 않는 최소 수정 원칙 유지

## 현재 알려진 위험 지점

- `src/main.ts`와 `src/styles.css`가 매우 크고 누적 보정 레이어가 많다. 다음 AI는 작은 UI 수정도 전체 검색 후 기존 v2.1.xxx 보정과 충돌하는지 확인해야 한다.
- `tools/clean-old-patch-docs.mjs`는 허용되지 않은 `.md` 파일을 삭제한다. 새 문서를 만들면 안 되고, 반드시 이 파일과 README만 사용한다.
- `tools/validate-clean.mjs`는 문서 허용 정책, 버전 동기화, cache 이름, offline badge, README 제목을 강하게 검사한다.
- 서비스워커 캐시명과 `src/data.ts`의 `CACHE_NAME`은 같이 움직여야 한다.
- GitHub Pages 배포는 `vite build --base=./` 기준이므로 절대경로 추가 시 주의한다. 기존 절대 `/assets/...` 참조는 이미 다수 존재하므로, 바꾸려면 전체 Pages base 영향을 별도 검토해야 한다.
- Firebase는 현재 코드상 익명 인증까지만 동적 시도한다. Firestore/DB 저장으로 확장할 때는 무료 플랜 읽기/쓰기 횟수, 보안 규칙, 실패 시 로컬 저장 fallback을 반드시 유지한다.

## 이어받는 AI에게

사용자가 원하는 결과물 형식은 다음 순서다.

1. 작업중인 내용
2. 기록
3. 다음 업데이트 예상 내역
4. 그대로 사용 가능한 통파일 zip
5. 단순 패치 적용 가능한 패치 zip

항상 사용자가 받은 zip 안에 `AI_HANDOFF_CARDVILLE.md`와 `README.md`가 최신 상태인지 확인한다. zip 파일명은 짧게 하되 버전 숫자를 포함한다.
