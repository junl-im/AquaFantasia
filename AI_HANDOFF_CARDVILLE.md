# AquaFantasia AI HANDOFF CARDVILLE

- 기준 패키지 버전: `2.1.125`

## 작업중인 내용

- 현재 작업 기준: `v2.1.125` legacy debt reducer / observer handoff 패치.
- 목표: 코드 꼬임과 예전 보정 코드 재개입으로 생기는 체감 랙, UI 흔들림, 하단 메뉴 기준 불일치, 개척 팝업 반절 표시, 페이지 우측 쏠림, 낚시 물길/장비/입질/결과 깜박임을 줄인다.
- 핵심 원인: v2.1.124는 style 재개입을 잡았지만, 그 감시가 예전 observer와 다시 style 쓰기를 주고받는 구조가 될 수 있었다. 여러 세대 패스를 대량 삭제하지 않고 최신 경량 finalizer가 마지막 소유권을 갖도록 인수인계한다.
- 원칙: 정상 동작하는 낚시 판정/보상/밸런스, 마을 좌표/충돌/건설 로직, Firebase fallback은 건드리지 않고 UI/UX/성능 흔들림만 수정한다.
- 작업 환경: GitHub Desktop, Firebase 무료 플랜. Firebase 설정이 없으면 로컬 저장 fallback으로 계속 동작해야 한다.
- 기록 파일은 반드시 `AI_HANDOFF_CARDVILLE.md`와 `README.md` 두 개만 사용한다.

## v2.1.125 legacy debt reducer 패치 기록

## 기록

- v2.1.124 기준 `npm run validate` 통과 상태에서 작업을 시작했다.
- 사용자가 특히 강조한 내용은 코드 꼬임, 예전 코드가 계속 살아나 최신 UI 보정이 안 먹는 문제다.
- v2.1.124의 observer는 `style` 속성을 감시하지만, 예전 보정 패스가 같은 요소에 계속 inline important style을 쓰면 최신 패스도 다시 style을 쓰고, 그 결과 mutation churn과 랙/깜박임이 남을 수 있다.
- 새 런타임 패스 `installV21125LegacyDebtReducerPass()`를 추가했다.
- v2.1.124 `normalize`와 observer는 `html.dataset.v21125LegacyDebtReducer === 'active'`일 때 물러나도록 했다. 삭제가 아니라 handoff 방식이라 GitHub Desktop에서 추적/되돌리기가 쉽다.
- 새 루트 스코프 `v21125-legacy-debt-reducer-root`, dataset `v21125LegacyDebtReducer`, 최신 소유권 `v21125-owned-final`, `data-v21125Owner`를 추가했다.
- 새 `setImportant`는 WeakMap signature와 실제 inline style 적용 상태를 함께 확인한다. 이미 맞는 값이면 다시 쓰지 않고, 예전 코드가 값을 바꾼 경우에만 복구한다.
- 하단 메뉴는 `v21125-bottom-nav-final`로 모든 비낚시 화면에서 같은 우측 하단 기준을 쓰고, 낚시 화면에서는 숨긴다.
- 초반 가이드는 `v21125-village-guide-popup`, `aqua-v21125-guide-dismissed`로 새로 제공한다. 기존 v21122/v21124 가이드 DOM은 제거해 중복 안내를 막는다.
- 상점/가방/퀘스트/지도/도감/장비/랭킹 페이지는 `v21125-runtime-page-final`, `v21125-page-column-final`로 중앙 컬럼과 safe-area padding을 유지한다.
- 개척 팝업은 `v21125-expedition-final`, 건설/확인 모달은 `v21125-village-modal-final`로 중앙 fixed, safe-area max-height, 내부 스크롤을 유지한다.
- 낚시 물길/수중 효과는 `v21125-water-final`, `v21125-sea-lane-final`로 animation/transition churn을 줄이고, 집중 단계에서는 물길/장비 strip을 숨긴다.
- 낚싯대/미끼 strip은 `v21125-loadout-final`, 내부 요소는 `v21125-loadout-child-final`로 transform/scale/transition/animation을 막는다.
- 연속 성공 표기는 `v21125-combo-final`, `물었다!` 팝업은 `v21125-bite-final`, 성공 결과창은 `v21125-result-final`로 중앙/하단 기준을 유지한다.
- `README.md`, `AI_HANDOFF_CARDVILLE.md`, `public/offline.html`, `public/sw.js`, `src/data.ts`, `package.json`, `package-lock.json`을 v2.1.125 기준으로 동기화했다.
- 신규 검증 스크립트 `tools/check-v21125-legacy-debt-reducer.mjs`를 추가해 버전/캐시/UI 토큰/observer handoff/문서 계약/SVG 금지/패키징 청결을 확인한다.
- 작업본 `npm run validate` 통과.
- `npm run ci:registry:check`는 샌드박스 DNS 제한으로 `EAI_AGAIN registry.npmjs.org` 실패.
- `npm run ci:install`은 샌드박스 네트워크 제한으로 timeout.
- `npm run typecheck`는 현재 `node_modules`가 없어 `howler`, `pixi.js`, `firebase`, `vite` 모듈 해석 실패. 문법 단계는 통과했고 의존성 설치 후 GitHub Actions에서 최종 확인한다.
- `npm run build`는 현재 `vite`가 설치되어 있지 않아 실패. GitHub Actions에서 `npm ci` 후 최종 확인한다.

## 다음 업데이트 예상 내역

- 실제 모바일에서 v2.1.125 이후 가이드, 개척 팝업, 메뉴 페이지, 낚시 UI가 이전 observer 때문에 다시 밀리지 않는지 캡처 기준으로 확인한다.
- 체감 랙이 여전히 남으면 RuntimeQualityManager, Pixi ticker, WebGL/DOM effect budget을 더 직접적으로 줄인다.
- 오래된 observer 패스를 실제로 하나씩 제거할 수 있는지 검토하되, 삭제는 GitHub Actions와 모바일 실기기 확인 후 진행한다.
- 상점/가방/퀘스트/지도/도감의 카드 폭, 하단 메뉴 여백, 긴 한글 문구 줄바꿈을 계속 다듬는다.
- Firebase/Pixi/Vite 업데이트는 GitHub Actions에서 `npm ci`, `typecheck`, `build` 확인 후 안전한 minor 범위만 검토한다. Firebase 무료 플랜과 로컬 fallback은 유지한다.

## 필수 결과 확인 명령

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

## 산출물 zip 점검 명령

```bash
python3 - <<'PY'
import zipfile, sys
for zpath in sys.argv[1:]:
    with zipfile.ZipFile(zpath) as z:
        names = z.namelist()
    md = [n for n in names if n.lower().endswith('.md')]
    banned = [n for n in names if '.git/' in n or 'node_modules/' in n or 'dist/' in n or 'reports/' in n or n.endswith('.log') or n.lower().endswith(('.svg', '.svgz'))]
    print(zpath)
    print('markdown:', md)
    print('banned:', banned[:20], 'count=', len(banned))
PY AF-v2.1.125-full.zip AF-v2.1.125-patch.zip
```

## 고정 작업환경/산출 규칙

- GitHub Desktop 사용 기준.
- Firebase는 무료 플랜 기준. 무료 한도를 벗어나는 서버 기능, 유료 의존, 필수 Cloud Functions 전제 금지.
- Firebase config가 없거나 익명 로그인이 실패해도 로컬 저장 fallback이 살아 있어야 한다.
- 문서 기록은 `README.md`, `AI_HANDOFF_CARDVILLE.md`만 사용한다. 추가 `.md`, 임시 리포트, 로그 파일을 산출물에 넣지 않는다.
- 결과물은 항상 두 개다: `AF-v2.1.125-full.zip`, `AF-v2.1.125-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크.

## 프로젝트/작업 구조

- 앱 버전: `src/data.ts`의 `APP_VERSION`
- 캐시 이름: `src/data.ts`의 `CACHE_NAME`, `public/sw.js`의 `CACHE_NAME`
- 진입점: `src/main.ts`
- 스타일: `src/styles.css`
- 마을 월드/플레이어 방향 처리: `src/villageWorld.ts`
- 저장/Firebase fallback: `src/storage.ts`
- 정적 자산: `public/assets/`
- 서비스워커: `public/sw.js`
- 오프라인 페이지: `public/offline.html`
- 검증 스크립트: `tools/`

## 현재 버전 핵심 기능 상태

- 낚시 상태: `idle`, `casting`, `waiting`, `bite`, `reeling`, `success`, `fail`
- v2.1.125 핵심: v2.1.124 style 감시를 경량 finalizer로 인수인계하고, 같은 값 반복 쓰기를 줄여 코드 꼬임/예전 보정 재개입/체감 랙/깜박임을 완화. 게임 수치와 판정은 건드리지 않음.
- v2.1.124 핵심: style 재개입을 감시해 초반 가이드, 페이지 중앙 정렬, 개척 팝업, 하단 메뉴, 낚시 물길 바, 낚싯대/미끼 strip, 연속 성공, `물었다!`, 성공 결과창을 최신 기준으로 재고정. v2.1.125에서 경량 handoff됨.

# 이전 인수인계 기록

- 기준 패키지 버전: `2.1.124`

## 작업중인 내용

- 현재 작업 기준: `v2.1.124` root-cause UX repair 패치.
- 목표: 사용자가 지적한 미반영 의심 사항을 루트 원인 기준으로 다시 잡는다. 특히 체감 랙, 초반 가이드, 개척 팝업 반절 표시, 페이지 우측 쏠림, 하단 메뉴 위치 불일치, 낚시 물길 바/낚싯대/미끼 깜박임, 연속 성공 위치, `물었다!` 팝업 흔들림을 최신 기준으로 고정한다.
- 핵심 원인: v2.1.123 final owner는 class/화면 전환 중심으로 보정했지만, 예전 observer가 inline `style`을 나중에 다시 쓰는 `style 재개입`은 감시하지 않아 최신 보정이 다시 적용되지 않을 수 있었다.
- 원칙: 정상 동작하는 낚시 판정/보상/밸런스, 마을 좌표/충돌/건설 로직, Firebase fallback은 건드리지 않고 UI/UX/성능 흔들림만 수정한다.
- 작업 환경: GitHub Desktop, Firebase 무료 플랜. Firebase 설정이 없으면 로컬 저장 fallback으로 계속 동작해야 한다.
- 기록 파일은 반드시 `AI_HANDOFF_CARDVILLE.md`와 `README.md` 두 개만 사용한다.

## v2.1.124 root-cause UX repair 패치 기록

## 기록

- v2.1.123 기준 `npm run validate` 통과 상태에서 사용자가 “앞전 요청건이 전혀 반영 안된 것 같다”고 피드백했다.
- 실제 구조를 다시 보니 여러 세대의 observer가 같은 DOM 요소에 inline important style을 반복 적용하고 있었다.
- v2.1.123 observer는 `style` 속성 변화를 감시하지 않았고, signature가 같으면 normalize를 건너뛰는 구조라 예전 보정이 나중에 살아나면 최신 위치가 다시 밀릴 수 있었다.
- 새 런타임 패스 `installV21124RootCauseUxRepairPass()`를 추가했다.
- 루트 스코프 `v21124-root-cause-ux-repair-root`, dataset `v21124RootCauseUxRepair`를 추가했다.
- 초반 가이드는 `v21124-village-guide-popup`와 새 localStorage 키 `aqua-v21124-guide-dismissed`로 다시 만든다. 기존 v21122 dismiss 상태 때문에 안 보이는 문제를 피한다.
- 하단 메뉴는 `v21124-bottom-nav-final`로 마을/상점/가방/퀘스트/지도/도감/장비/랭킹에서 같은 우측 하단 기준을 쓴다. 낚시 화면에서는 숨긴다.
- 상점/가방/퀘스트/지도/도감/장비/랭킹은 `v21124-runtime-page-final`, `v21124-page-column-final`로 safe-area 중앙 컬럼을 재고정한다.
- 개척 팝업은 `v21124-expedition-final`로 중앙 fixed, safe-area max-height, 내부 scroll, overscroll contain을 적용한다.
- 건설 확인/건설 트레이는 `v21124-village-modal-final`로 작은 화면 스크롤과 max-height를 보강한다.
- 낚시 물길 바/수중 효과는 `v21124-water-final`, `v21124-sea-lane-final`로 no animation/no transition 처리하고, bite/reeling/result/success/fail 단계에서는 display none으로 숨긴다.
- 낚싯대/미끼 strip은 `v21124-loadout-final`, 내부는 `v21124-loadout-child-final`로 transform/scale/animation/transition을 차단한다.
- 연속 성공 표기는 `v21124-combo-final`로 캐스팅 시작 버튼 근처 하단에 간격을 두고 배치한다.
- `물었다!` 팝업은 `v21124-bite-final`, 성공 결과창은 `v21124-result-final`로 중앙 fixed, no animation/no transition 기준을 적용한다.
- observer는 `style` attribute까지 감시하고 RAF + 45ms 후행 normalize로 예전 코드가 늦게 style을 다시 써도 최신 기준을 재적용한다.
- `README.md`, `AI_HANDOFF_CARDVILLE.md`, `public/offline.html`, `public/sw.js`, `src/data.ts`, `package.json`, `package-lock.json`을 v2.1.124 기준으로 동기화했다.
- 신규 검증 스크립트 `tools/check-v21124-root-cause-ux-repair.mjs`를 추가해 버전/캐시/UI 토큰/문서 계약/SVG 금지/패키징 청결을 확인한다.

## 다음 업데이트 예상 내역

- 실제 모바일에서 새 초반 가이드가 첫 마을 진입 시 중앙에 보이는지 확인한다.
- 개척 팝업이 작은 화면에서 반절만 보이지 않고 중앙/스크롤 상태를 유지하는지 확인한다.
- 상점/가방/퀘스트/지도/도감이 우측으로 쏠리지 않고 중앙 컬럼을 유지하는지 캡처 기준으로 확인한다.
- 낚시 물길 바가 bite/reeling/result/success/fail 단계에서 계속 깜박이지 않는지 확인한다.
- 낚싯대/미끼 strip의 커짐/작아짐, `물었다!` 팝업 상단 이동, 성공 결과창 중 물길 바 노출을 실제 플레이에서 재검수한다.
- 다음 패치에서는 RuntimeQualityManager, WebGL/DOM effect budget, Pixi ticker 부담을 더 직접적으로 줄이는 성능 패치를 검토한다.
- GitHub Actions 결과 확인 후 안전한 범위에서 Vite/Firebase/Pixi minor 업데이트 가능성 검토. 단, Firebase 무료 플랜과 로컬 fallback은 유지한다.

## 필수 결과 확인 명령

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

## 산출물 zip 점검 명령

```bash
python3 - <<'PY'
import zipfile, sys
for zpath in sys.argv[1:]:
    with zipfile.ZipFile(zpath) as z:
        names = z.namelist()
    md = [n for n in names if n.lower().endswith('.md')]
    banned = [n for n in names if '.git/' in n or 'node_modules/' in n or 'dist/' in n or 'reports/' in n or n.endswith('.log') or n.lower().endswith(('.svg', '.svgz'))]
    print(zpath)
    print('markdown:', md)
    print('banned:', banned[:20], 'count=', len(banned))
PY AF-v2.1.124-full.zip AF-v2.1.124-patch.zip
```

## 고정 작업환경/산출 규칙

- GitHub Desktop 사용 기준.
- Firebase는 무료 플랜 기준. 무료 한도를 벗어나는 서버 기능, 유료 의존, 필수 Cloud Functions 전제 금지.
- Firebase config가 없거나 익명 로그인이 실패해도 로컬 저장 fallback이 살아 있어야 한다.
- 문서 기록은 `README.md`, `AI_HANDOFF_CARDVILLE.md`만 사용한다. 추가 `.md`, 임시 리포트, 로그 파일을 산출물에 넣지 않는다.
- 결과물은 항상 두 개다: `AF-v2.1.124-full.zip`, `AF-v2.1.124-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크.

## 프로젝트/작업 구조

- 앱 버전: `src/data.ts`의 `APP_VERSION`
- 캐시 이름: `src/data.ts`의 `CACHE_NAME`, `public/sw.js`의 `CACHE_NAME`
- 진입점: `src/main.ts`
- 스타일: `src/styles.css`
- 마을 월드/플레이어 방향 처리: `src/villageWorld.ts`
- 저장/Firebase fallback: `src/storage.ts`
- 정적 자산: `public/assets/`
- 서비스워커: `public/sw.js`
- 오프라인 페이지: `public/offline.html`
- 검증 스크립트: `tools/`

## 현재 버전 핵심 기능 상태

- 낚시 상태: `idle`, `casting`, `waiting`, `bite`, `reeling`, `success`, `fail`
- v2.1.124 핵심: style 재개입을 감시해 초반 가이드, 페이지 중앙 정렬, 개척 팝업, 하단 메뉴, 낚시 물길 바, 낚싯대/미끼 strip, 연속 성공, `물었다!`, 성공 결과창을 최신 기준으로 재고정. 게임 수치와 판정은 건드리지 않음
- v2.1.123 핵심: 예전 UI 보정 코드가 다시 개입하는 회귀를 줄이기 위해 최신 final owner anchor를 부여. 단, style 재개입 감시는 v2.1.124에서 보강됨

# 이전 인수인계 기록

- 기준 패키지 버전: `2.1.123`

## 작업중인 내용

- 현재 작업 기준: `v2.1.123` runtime deconflict 패치.
- 목표: 코드 꼬임/예전 UI 보정 코드 재개입으로 하단 메뉴, 페이지 shell, 개척 팝업, 낚시 물길/장비/입질/결과 UI가 다시 흔들리는 문제를 줄인다.
- 원칙: 기존 정상 기능과 게임 수치는 건드리지 않고, 최신 런타임 final owner 패스와 마지막 CSS 스코프로 UI 기준점을 하나로 모은다.
- 작업 환경: GitHub Desktop, Firebase 무료 플랜. Firebase 설정이 없으면 로컬 저장 fallback으로 계속 동작해야 한다.
- 기록 파일은 반드시 `AI_HANDOFF_CARDVILLE.md`와 `README.md` 두 개만 사용한다.

## 기록

- v2.1.122 기준 `npm run validate` 통과 후 v2.1.123 작업을 시작했다.
- 구조 원인: 여러 세대의 런타임 UI 보정 패스가 같은 DOM 요소에 서로 다른 inline important 좌표/CSS 좌표를 다시 쓰는 구조라, 화면 상태 전환 시 예전 코드가 최신 UI를 다시 밀어내거나 깜박임을 만들 수 있다.
- 새 런타임 패스 `installV21123RuntimeDeconflictPass()`를 추가했다.
- 루트 스코프 `v21123-runtime-deconflict-root`, dataset `v21123RuntimeDeconflict`를 추가했다.
- 최신 소유권 토큰 `v21123-owned-anchor`, `data-v21123-owner`, `data-v21123-latest-anchor`를 추가해 다음 AI가 어떤 패스가 마지막 기준인지 바로 확인할 수 있게 했다.
- 하단 메뉴는 `v21123-bottom-nav-final`로 낚시 외 화면에서 동일한 우측 하단 fixed anchor를 사용하고, 낚시 화면에서는 display none으로 확실히 숨긴다.
- 상점/가방/퀘스트/지도/도감/장비/랭킹 페이지는 `v21123-runtime-page-final`, `v21123-page-column-final`로 중앙 컬럼과 safe-area padding을 다시 고정했다.
- 개척 팝업은 `v21123-expedition-final`로 fixed center, safe-area max-height, 내부 scroll, overscroll contain을 적용해 반절 표시 회귀를 방지한다.
- 건설 확인/건설 트레이는 `v21123-village-modal-final`로 max-height/scroll을 보강했고, 모달이 열리면 `v21123-guide-final` 가이드를 숨겨 겹침을 줄인다.
- 낚시 물길/수중 효과는 `v21123-water-budget-final`, `v21123-sea-lane-final`로 transition/animation churn을 막고, bite/reeling/result/success/fail 단계에서는 물길 바를 display none으로 숨긴다.
- 낚싯대/미끼 strip은 `v21123-loadout-final`, 내부 요소는 `v21123-loadout-child-final`로 transform/scale/animation/transition을 막아 크기 펌핑 회귀를 줄인다.
- `물었다!` 팝업은 `v21123-bite-final`, 성공 결과창은 `v21123-result-final`, 연속 성공 표기는 `v21123-combo-final`로 각각 중앙/하단 기준점을 고정한다.
- 새 패스는 visualViewport 변수 `--v21123-visual-width`, `--v21123-visual-height`, signature guard, RAF + 80ms 후행 보정을 사용해 예전 observer가 늦게 개입해도 최신 앵커가 마지막 기준이 되게 한다.
- `README.md`, `AI_HANDOFF_CARDVILLE.md`, `public/offline.html`, `public/sw.js`, `src/data.ts`, `package.json`, `package-lock.json`을 v2.1.123 기준으로 동기화했다.
- 신규 검증 스크립트 `tools/check-v21123-runtime-deconflict.mjs`를 추가해 버전/캐시/UI 토큰/문서 계약/SVG 금지/패키징 청결을 확인한다.
- 낚시 판정/보상/밸런스, 물고기 데이터, 마을 좌표/충돌/건설 로직, Firebase fallback, 오프닝 video-only 정책, 플레이어 8방향 파일명/flip 금지 정책은 변경하지 않는다.

## 다음 업데이트 예상 내역

- 실제 모바일에서 예전 보정 코드가 하단 메뉴/낚시 UI를 다시 흔드는지 캡처 기준으로 확인.
- 상점/가방/퀘스트/지도/도감 각 화면의 중앙 정렬, 카드 폭, 마지막 버튼과 하단 메뉴 간격 재검수.
- 개척 팝업과 건설 확인창이 작은 화면에서 중앙/스크롤 가능 상태를 유지하는지 확인.
- 낚시 물길 바 숨김 타이밍, `물었다!` 팝업/성공 결과창 중앙 고정, 연속 성공 표기 위치를 실제 플레이 기준으로 polish.
- 전체 체감 랙은 다음 패치에서 RuntimeQualityManager와 WebGL/DOM effect budget을 더 낮추는 방향으로 검토.
- GitHub Actions 결과 확인 후 안전한 범위에서 Vite/Firebase/Pixi minor 업데이트 가능성 검토. 단, Firebase 무료 플랜과 로컬 fallback은 유지.

## 필수 결과 확인 명령

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

## 산출물 zip 점검 명령

```bash
python3 - <<'PY'
import zipfile, sys
for zpath in sys.argv[1:]:
    with zipfile.ZipFile(zpath) as z:
        names = z.namelist()
    md = [n for n in names if n.lower().endswith('.md')]
    banned = [n for n in names if '.git/' in n or 'node_modules/' in n or 'dist/' in n or 'reports/' in n or n.endswith('.log') or n.lower().endswith(('.svg', '.svgz'))]
    print(zpath)
    print('markdown:', md)
    print('banned:', banned[:20], 'count=', len(banned))
PY AF-v2.1.123-full.zip AF-v2.1.123-patch.zip
```

## 고정 작업환경/산출 규칙

- GitHub Desktop 사용 기준.
- Firebase는 무료 플랜 기준. 무료 한도를 벗어나는 서버 기능, 유료 의존, 필수 Cloud Functions 전제 금지.
- Firebase config가 없거나 익명 로그인이 실패해도 로컬 저장 fallback이 살아 있어야 한다.
- 문서 기록은 `README.md`, `AI_HANDOFF_CARDVILLE.md`만 사용한다. 추가 `.md`, 임시 리포트, 로그 파일을 산출물에 넣지 않는다.
- 결과물은 항상 두 개다: `AF-v2.1.123-full.zip`, `AF-v2.1.123-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크.

## 프로젝트/작업 구조

- 앱 버전: `src/data.ts`의 `APP_VERSION`
- 캐시 이름: `src/data.ts`의 `CACHE_NAME`, `public/sw.js`의 `CACHE_NAME`
- 진입점: `src/main.ts`
- 스타일: `src/styles.css`
- 마을 월드/플레이어 방향 처리: `src/villageWorld.ts`
- 저장/Firebase fallback: `src/storage.ts`
- 정적 자산: `public/assets/`
- 서비스워커: `public/sw.js`
- 오프라인 페이지: `public/offline.html`
- 검증 스크립트: `tools/`

## 현재 버전 핵심 기능 상태

- 낚시 상태: `idle`, `casting`, `waiting`, `bite`, `reeling`, `success`, `fail`
- v2.1.123 핵심: 예전 UI 보정 코드가 다시 개입하는 회귀를 줄이기 위해 최신 final owner anchor를 부여. 하단 메뉴/페이지 중앙 정렬/개척 팝업/건설 모달/낚시 물길/장비/입질/결과/콤보 UI를 마지막 기준으로 고정. 게임 수치와 판정은 건드리지 않음
- v2.1.122 핵심: 초반 추적형 가이드, 개척 팝업 중앙 고정, 메뉴 페이지 중앙 정렬, 하단 메뉴 동일 앵커, 낚시 물길 바/낚싯대/미끼/`물었다!` 팝업/성공 결과창 흔들림 보정. 게임 수치와 판정은 건드리지 않음
- v2.1.121 핵심: 모바일 세로 버튼 라벨/focus/active, 스크롤 하단 reserve, 카드 content-visibility/containment를 보강. 낚시 판정, 보상, 마을 좌표, 건설 로직, Firebase fallback은 건드리지 않음
- v2.1.120 핵심: 모바일 세로 화면 구성/가독성/카드 미디어 containment/하단 내비 safe-area 폭/인수인계 검증 계약을 보강. 낚시 판정, 보상, 마을 좌표, 건설 로직, Firebase fallback은 건드리지 않음
- v2.1.119 핵심: 모바일 터치/모달/스크롤 safety 패스를 추가해 건설창, 건설 확인창, 낚시 입질창/결과창, 카드형 메뉴의 data-no-swipe, overscroll containment, visual viewport safe-area 최대 높이를 보강. 게임 로직과 버튼 이벤트는 건드리지 않음
- v2.1.118 핵심: v2.1.117 마을 우측 상단 메뉴 개선을 실제 런타임 inline important 기준으로 hard-lock하고, 카드/아이콘 이미지를 containment 처리해 다른 그림 비침/카드 밖 튐/긴 문구 겹침 위험을 줄임. 게임 로직과 버튼 이벤트는 건드리지 않음
- v2.1.117 핵심: 마을 우측 상단 메뉴 아이콘은 버튼 크기/2x3 배치를 유지한 채 내부 아이콘만 24~25px로 키우고, clipping/isolation/pseudo 제거로 위쪽 다른 그림 비침을 방지. 마을 이동/건설/상점/출항 동작은 건드리지 않음
- v2.1.116 핵심: 낚싯대/미끼 loadout 꿈틀거림, 연속 성공 구버전 스킨, `물었다!` 창 자동 전환/흔들림, 성공 결과창 크기 흔들림을 UI hotfix로 보정. 낚시 판정/보상/밸런스는 건드리지 않음
- 마을 핵심: Pixi 월드, 80 x 80 계열 타일, 건물 설치/이동, 경로 탐색, NPC, 수동 조이스틱/키보드 이동
- 저장 핵심: `localStorage` 키 `aqua-fantasia-save-v650`, 이전 키 일부 마이그레이션, 저장값 sanitize 후 저장
- Firebase 핵심: `window.AQUA_FIREBASE_CONFIG`에 `apiKey`가 있을 때만 `firebase/app`, `firebase/auth`를 동적 import하고 익명 로그인 시도. 설정이 없으면 로컬 저장으로 진행


## v2.1.123 runtime deconflict 패치 기록

### 사용자 요청과 확인한 불안정 후보

- 요청: 모든 구석구석을 꼼꼼히 체크하고, 특히 코드 꼬임이나 예전 코드가 계속 살아나는 문제를 확인한다.
- 확인한 구조 원인: 이전 버전들의 누적 UI 보정 패스가 같은 요소에 서로 다른 좌표/크기/animation/transform 값을 반복 적용하고 있었다. v2.1.123은 삭제보다 안전한 마지막 소유권 패스로 회귀를 줄인다.

### 적용 내용

- `src/main.ts`
  - 루트 스코프 `v21123-runtime-deconflict-root`와 `data-v21123-runtime-deconflict` 추가.
  - `installV21123RuntimeDeconflictPass()` 추가.
  - 최신 소유권 토큰 `v21123-owned-anchor`, `data-v21123-owner`, `data-v21123-latest-anchor` 추가.
  - 하단 메뉴 `v21123-bottom-nav-final` 추가.
  - 페이지 중앙 정렬 `v21123-runtime-page-final`, `v21123-page-column-final` 추가.
  - 개척/건설 모달 `v21123-expedition-final`, `v21123-village-modal-final` 추가.
  - 낚시 안정화 `v21123-water-budget-final`, `v21123-sea-lane-final`, `v21123-loadout-final`, `v21123-loadout-child-final`, `v21123-combo-final`, `v21123-bite-final`, `v21123-result-final` 추가.
  - visualViewport 변수, RAF, MutationObserver, signature guard, 80ms 후행 보정으로 예전 observer 개입 이후에도 최신 앵커가 다시 최종 적용되게 함.
- `src/styles.css`
  - `v2.1.123 runtime deconflict patch` 마지막 스코프 추가.
  - 하단 nav, runtime page shell, 개척/건설 모달, guide, 낚시 물길/장비/콤보/입질/결과 final anchor CSS 추가.
- `tools/check-v21123-runtime-deconflict.mjs`
  - 버전/캐시/README/handoff 동기화, v2.1.123 runtime/CSS 토큰, 운영 계약, SVG 금지, 문서 2개 제한, CSS 자산 존재, package-lock 레지스트리 청결을 확인한다.

### 절대 건드리지 않은 것

- 낚시 판정/보상/밸런스
- 물고기 데이터
- 마을 이동/좌표/충돌/조이스틱/건설 설치 로직
- 건설/확대/축소/상점/출항 버튼 이벤트
- Firebase 저장/익명 로그인 fallback
- 오프닝 video-only 정책
- 플레이어 방향 파일명/flip 금지 정책
- 의존성/엔진 메이저 업그레이드

### v2.1.123 필수 검수

1. `npm run validate` 통과.
2. GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build` 확인.
3. 하단 메뉴가 마을/상점/가방/퀘스트/지도/도감에서 같은 우측 하단 기준을 유지하는지 확인.
4. 낚시 화면에서는 하단 메뉴가 숨겨지고, 물길/장비/입질/결과/콤보가 흔들리지 않는지 확인.
5. 개척 팝업과 건설 확인창이 작은 화면에서 중앙/스크롤 가능 상태를 유지하는지 확인.
6. full/patch zip 내부에 `.git`, `node_modules`, `dist`, `reports`, `.log`, SVG 파일이 없는지 확인.
7. `.md`는 `README.md`, `AI_HANDOFF_CARDVILLE.md`만 있어야 한다.

현재 샌드박스에서는 작업본 `npm run validate`를 기준으로 확인한다. `node_modules`가 없으면 `typecheck`/`build`는 GitHub Actions의 `npm ci` 이후 결과를 최종 기준으로 본다.


## v2.1.121 micro UI/a11y/perf polish 패치 기록

### 사용자 요청과 확인한 불안정 후보

- 요청: 모든 구석구석을 꼼꼼하게 체크하고 UI/UX/디자인, 게임 시스템, 성능, 기술, 콘텐츠, 엔진 업그레이드를 계속 이어간다.
- 확인한 실제 후보: v2.1.120은 화면 구성/기록 계약을 보강했지만, 작은 모바일 화면에서 마지막 카드와 액션 버튼이 하단 내비 뒤에 숨어 보일 수 있고, 버튼 focus/active/aria-label 일관성과 카드 목록 렌더링 부담은 추가 보강 여지가 있다.

### 적용 내용

- `src/main.ts`
  - 루트 스코프 `v21121-micro-ui-a11y-perf-root`와 `data-v21121-micro-ui-a11y-perf` 추가.
  - `installV21121MicroUiA11yPerfPass()` 추가.
  - 패널/건설창/낚시 입질창/결과창에 `v21121-shell-polish`, 스크롤 영역에 `v21121-scroll-reserve`, 카드에 `v21121-card-perf`, 조작 요소에 `v21121-control-a11y`를 런타임으로 부여.
  - 라벨이 없는 조작 요소에는 안전한 `aria-label` fallback을 부여.
  - visual viewport 폭/높이를 `--v21121-visual-width`, `--v21121-visual-height`로 동기화.
  - RAF 예약, MutationObserver, signature guard로 반복 스타일 쓰기를 줄임.
- `src/styles.css`
  - `v2.1.121 micro UI/a11y/perf polish` 마지막 스코프 추가.
  - 하단 내비 뒤 가림 방지 scroll reserve, focus-visible 링, active 터치 피드백, 카드 render containment, tight-screen/reduced-motion 대응 적용.
- `README.md`, `AI_HANDOFF_CARDVILLE.md`
  - v2.1.121 작업중인 내용, 기록, 다음 업데이트 예상 내역, 결과 확인 명령, 산출물 zip 점검 명령, GitHub Desktop/Firebase 무료 플랜 환경, full/patch 산출 규칙을 상단에 갱신.
- `tools/check-v21121-micro-ui-a11y-perf.mjs`
  - 버전/캐시/README/handoff 동기화, v2.1.121 runtime/CSS 토큰, 운영 계약, SVG 금지, 문서 2개 제한, CSS 자산 존재, package-lock 레지스트리 청결을 확인한다.

### 절대 건드리지 않은 것

- 낚시 판정/보상/밸런스
- 물고기 데이터
- 마을 이동/좌표/충돌/조이스틱/건설 설치 로직
- 건설/확대/축소/상점/출항 버튼 이벤트
- Firebase 저장/익명 로그인 fallback
- 오프닝 video-only 정책
- 플레이어 방향 파일명/flip 금지 정책
- 의존성/엔진 메이저 업그레이드

### v2.1.121 필수 검수

1. `npm run validate` 통과.
2. GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build` 확인.
3. 실제 모바일 메뉴 화면에서 마지막 카드/버튼이 하단 내비 뒤로 숨지 않는지 확인.
4. 상점/가방/미션/도감 긴 목록에서 스크롤이 과하게 튀지 않는지 확인.
5. 버튼/링크 focus-visible 링과 active 피드백이 과하지 않고 알아보기 쉬운지 확인.
6. full/patch zip 내부에 `.git`, `node_modules`, `dist`, `reports`, `.log`, SVG 파일이 없는지 확인.
7. `.md`는 `README.md`, `AI_HANDOFF_CARDVILLE.md`만 있어야 한다.

현재 샌드박스에서는 작업본 `npm run validate`를 기준으로 확인한다. `node_modules`가 없으면 `typecheck`/`build`는 GitHub Actions의 `npm ci` 이후 결과를 최종 기준으로 본다.


## v2.1.120 화면 구성/인수인계 계약 패치 기록

### 사용자 요청과 확인한 불안정 후보

- 요청: 모든 구석구석을 꼼꼼하게 체크하고, UI/UX/디자인을 특히 신경 쓰면서 계속 패치한다.
- 요청: 작업 기록은 통파일 안의 `AI_HANDOFF_CARDVILLE.md`와 `README.md`만으로 다음 AI가 이어갈 수 있어야 하며, 결과 확인 명령과 작업환경도 매 패치 포함해야 한다.
- 확인한 실제 후보: v2.1.119는 터치/모달/스크롤 안전성은 보강했지만, 누적 UI 패스가 많은 구조라 카드 내부 긴 문구, 미디어 containment, 하단 내비 safe-area 폭, 산출물/검수 계약 누락이 다시 불안정해질 수 있다.

### 적용 내용

- `src/main.ts`
  - 루트 스코프 `v21120-screen-composition-handoff-root`와 `data-v21120-screen-composition-handoff` 추가.
  - `installV21120ScreenCompositionHandoffPass()` 추가.
  - 카드/패널/건설창/낚시 입질창/결과창에 `v21120-readable-panel`, 텍스트에 `v21120-readable-text`, 미디어에 `v21120-contained-media`, 내비에 `v21120-safe-nav`, 버튼에 `v21120-action-button`을 런타임으로 부여.
  - visual viewport 폭/높이를 `--v21120-visual-width`, `--v21120-visual-height`로 동기화.
  - RAF 예약, MutationObserver, signature guard로 반복 스타일 쓰기를 줄임.
- `src/styles.css`
  - `v2.1.120 screen composition handoff` 마지막 스코프 추가.
  - 긴 한글 문구 줄바꿈, 카드 경계선, 미디어 containment, 하단 내비 폭 안정화, 초소형 화면 보정, reduced-motion/contrast 대응 적용.
- `README.md`, `AI_HANDOFF_CARDVILLE.md`
  - 작업중인 내용, 기록, 다음 업데이트 예상 내역, 결과 확인 명령, 산출물 zip 점검 명령, GitHub Desktop/Firebase 무료 플랜 환경, full/patch 산출 규칙을 상단에 고정.
- `tools/check-v21120-screen-composition-handoff.mjs`
  - 버전/캐시/README/handoff 동기화, v2.1.120 runtime/CSS 토큰, 운영 계약, SVG 금지, 문서 2개 제한, CSS 자산 존재, package-lock 레지스트리 청결을 확인한다.

### 절대 건드리지 않은 것

- 낚시 판정/보상/밸런스
- 물고기 데이터
- 마을 이동/좌표/충돌/조이스틱/건설 설치 로직
- 건설/확대/축소/상점/출항 버튼 이벤트
- Firebase 저장/익명 로그인 fallback
- 오프닝 video-only 정책
- 플레이어 방향 파일명/flip 금지 정책
- 의존성/엔진 메이저 업그레이드

### v2.1.120 필수 검수

1. `npm run validate` 통과.
2. GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build` 확인.
3. 실제 모바일 마을 화면에서 하단 내비와 우측 상단 메뉴가 safe-area 안에 있고 버튼이 겹치지 않는지 확인.
4. 상점/가방/미션/도감 카드에서 긴 한글 문구와 이미지가 카드 밖으로 튀지 않는지 확인.
5. 낚시 `물었다!` 창과 성공 결과창이 화면 밖으로 밀리지 않고, 버튼 터치가 정확한지 확인.
6. full/patch zip 내부에 `.git`, `node_modules`, `dist`, `reports`, `.log`, SVG 파일이 없는지 확인.
7. `.md`는 `README.md`, `AI_HANDOFF_CARDVILLE.md`만 있어야 한다.

현재 샌드박스에서는 작업본 `npm run validate`를 기준으로 확인한다. `node_modules`가 없으면 `typecheck`/`build`는 GitHub Actions의 `npm ci` 이후 결과를 최종 기준으로 본다.


## v2.1.119 모바일 interaction safety 패치 기록

### 사용자 요청과 확인한 불안정 후보

- 요청: 이전 대화가 끊긴 뒤 인수인계 문서 기준으로 개발 계속 진행.
- 확인한 실제 후보: v2.1.118 기준 validate는 통과했고 정상 기능은 유지되어야 한다. 다음 안전 개선 후보는 모바일 세로 환경에서 모달/카드/건설창/낚시 결과창의 터치와 스와이프/스크롤 전파가 섞이는 문제다.
- 특히 하단 내비 스와이프, 건설창 스크롤, 낚시 입질/결과창 터치가 같은 화면 위에 겹치는 구조라 `data-no-swipe`, overscroll containment, visual viewport 기반 max-height 보강이 안전하다.

### 적용 내용

- `src/main.ts`
  - 루트 스코프 `v21119-interaction-safe-root`와 `data-v21119-interaction-safety` 추가.
  - `installV21119InteractionSafetyPass()` 추가.
  - 모달/카드/건설창/입질창/결과창에 `v21119-touch-shield`, `v21119-scroll-safe`, `v21119-safe-dialog-card`, `data-no-swipe`를 런타임으로 적용.
  - visual viewport 폭/높이를 `--v21119-visual-width`, `--v21119-visual-height`로 동기화.
  - RAF 예약, MutationObserver, `lastSignature` guard로 불필요한 반복 스타일 쓰기를 줄임.
- `src/styles.css`
  - `v2.1.119 interaction safety` 마지막 스코프 추가.
  - 터치 하이라이트 제거, overscroll containment, stable scrollbar gutter, safe-area dialog max-height, compact touch target 보정 적용.
- `tools/check-v21119-interaction-safety.mjs`
  - 버전/캐시/README/handoff 동기화, v2.1.119 root/runtime/CSS 토큰, SVG 금지, CSS 자산 존재, README/handoff만 문서 허용을 확인한다.

### 절대 건드리지 않은 것

- 낚시 판정/보상/밸런스
- 물고기 데이터
- 마을 이동/좌표/충돌/조이스틱/건설 설치 로직
- 건설/확대/축소/상점/출항 버튼 이벤트
- Firebase 저장/익명 로그인 fallback
- 오프닝 video-only 정책
- 플레이어 방향 파일명/flip 금지 정책
- 의존성/엔진 버전 업그레이드

### v2.1.119 필수 검수

1. GitHub Actions에서 `npm run validate` 통과.
2. 실제 모바일 마을 화면에서 건설창을 스크롤해도 배경/하단 내비 스와이프가 섞이지 않는지 확인.
3. 건설 확인창이 safe-area 안에 머물고 버튼 터치가 정확한지 확인.
4. 낚시 `물었다!` 창과 성공 결과창이 주소창/키보드 변화에도 화면 밖으로 밀리지 않는지 확인.
5. 하단 내비, 상점/가방/미션/도감 카드형 메뉴의 버튼 터치가 정상인지 확인.
6. `.svg`, `.svgz`, `image/svg`, 인라인 `<svg>` 런타임 참조가 추가되지 않았는지 확인.

현재 샌드박스 검수 결과 작업본 `npm run validate`와 `tools/check-v21119-interaction-safety.mjs` 단독 실행이 통과했다. full/patch zip 경로 안전성, `.git`/`node_modules`/`dist`/`reports`/`.log`/SVG 미포함, `.md`가 `README.md`와 `AI_HANDOFF_CARDVILLE.md`뿐인 것도 확인했다. `npm run typecheck`는 현재 샌드박스에 `node_modules`가 없어 완료하지 못했다. 전체 `npm ci`, `typecheck`, `build`는 GitHub Actions 결과를 최종 기준으로 본다.

## v2.1.118 UI 자산/아이콘 containment 패치 기록

### 사용자 요청과 확인한 불안정 후보

- 요청: 다양한 불안정, 겹침, 배치, 배정, 체크, 디자인/UX를 계속 다듬고 개선.
- 확인한 실제 후보: v2.1.117의 마을 우측 상단 메뉴 개선은 CSS와 런타임 패스가 모두 있었지만, 이전 누적 패스가 inline important 스타일을 많이 쓰는 구조라 일부 기기에서 마지막 CSS 의도와 실제 computed 값이 달라질 수 있다.
- 특히 아이콘 시인성 문제는 CSS만으로 끝내기보다 실제 런타임 inline important 값까지 같은 토큰으로 동기화하는 편이 안전하다.

### 적용 내용

- `src/main.ts`
  - 루트 스코프 `v21118-ui-asset-containment-root`와 `data-v21118-ui-asset-containment` 추가.
  - `installV21118UiAssetContainmentPass()` 추가.
  - 마을 우측 상단 메뉴 셀은 34px, 2x3, gap 3px 그대로 유지.
  - 아이콘은 일반 화면 25px, 초소형 화면 24px로 런타임 inline important 값까지 hard-lock.
  - 메뉴 버튼에 `clip-path`, `isolation`, `overflow:hidden`, pseudo 제거, object-position center를 다시 고정.
  - RAF 예약과 `lastSignature` guard로 같은 화면/viewport 상태에서 불필요한 반복 스타일 쓰기를 줄임.
  - 런타임 이미지에는 `v21118-contained-image`, `decoding=async`, `loading=lazy`, `draggable=false`를 적용.
- `src/styles.css`
  - `v2.1.118 UI asset containment` 마지막 스코프 추가.
  - 마을 메뉴 컨테이너/버튼/아이콘/라벨을 런타임 토큰과 같은 값으로 다시 고정.
  - 상점/가방/장비/미션/도감/모달 계열 카드의 이미지와 텍스트가 카드 밖으로 새거나 서로 겹치는 위험을 줄임.
- `tools/check-v21118-ui-asset-containment.mjs`
  - 버전/캐시/README/handoff 동기화, v2.1.118 root/runtime/CSS 토큰, SVG 금지, CSS 자산 존재, README/handoff만 문서 허용을 확인한다.

### 절대 건드리지 않은 것

- 낚시 판정/보상/밸런스
- 물고기 데이터
- 마을 이동/좌표/충돌/조이스틱
- 건설/확대/축소/상점/출항 이벤트
- Firebase 저장/익명 로그인 fallback
- 오프닝 video-only 정책
- 플레이어 방향 파일명/flip 금지 정책
- 의존성/엔진 버전 업그레이드

### v2.1.118 필수 검수

1. GitHub Actions에서 `npm run validate` 통과.
2. 실제 모바일 마을 화면 우측 상단 메뉴가 기존 위치/크기를 유지하는지 확인.
3. 메뉴 아이콘이 실제 화면에서 더 또렷하고, 위쪽에 다른 그림/프레임이 비치지 않는지 확인.
4. 상점/가방/장비/미션/도감 카드 이미지가 카드 밖으로 튀지 않는지 확인.
5. 확대/축소, 원점, 건설, 상점, 출항 버튼 이벤트가 정상인지 확인.
6. `.svg`, `.svgz`, `image/svg`, 인라인 `<svg>` 런타임 참조가 추가되지 않았는지 확인.

현재 샌드박스 검수 결과 작업본 `npm run validate`, `tools/*.mjs` 문법 검사, v2.1.118 full zip 새 압축 해제본 `npm run validate`, v2.1.117 full + v2.1.118 patch 덮어쓰기본 `npm run validate`가 통과했다. full/patch zip 경로 안전성, `.git`/`node_modules`/`dist`/`reports`/`.log`/SVG 미포함, `.md`가 `README.md`와 `AI_HANDOFF_CARDVILLE.md`뿐인 것도 확인했다. `npm run typecheck`는 현재 샌드박스에 `node_modules`가 없어 `howler`, `pixi.js`, `firebase`, `vite` 모듈 해석 실패로 완료하지 못했다. 전체 `npm ci`, `typecheck`, `build`는 GitHub Actions 결과를 최종 기준으로 본다.

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
