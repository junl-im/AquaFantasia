# AquaFantasia v2.1.126

## v2.1.126 변경사항

- 코드 꼬임/예전 보정 코드 재개입 문제를 한 단계 더 점검하고, v2.1.23 runtime deconflict observer와 v2.1.25 legacy debt reducer observer가 최신 UI 기준을 다시 흔들 수 있는 부분을 줄였습니다.
- 새 패스 `installV21126StaleCodePrunerPass()`를 추가했습니다. 이 패스는 v2.1.23/v2.1.25 감시 루프가 `v21126StaleCodePruner === active` 상태에서 물러나도록 하고, v2.1.126 단일 finalizer가 최종 UI 소유권을 갖습니다.
- `v21126-stale-code-pruner-root`, `v21126-owned-final`, `data-v21126Owner`, `v21126ObserverOwner` 토큰을 추가해 다음 AI가 최신 UI 소유권과 observer handoff 상태를 바로 확인할 수 있게 했습니다.
- 하단 메뉴는 `v21126-bottom-nav-final`로 마을/상점/가방/퀘스트/지도/도감/장비/랭킹에서 같은 우측 하단 기준을 유지하고, 낚시 화면에서는 확실히 숨깁니다.
- 초반 마을 가이드는 `v21126-village-guide-popup`와 새 localStorage 키 `aqua-v21126-guide-dismissed`로 제공합니다. 기존 v21122/v21124/v21125 가이드 DOM은 제거해 중복과 미노출 혼선을 줄입니다.
- 상점, 가방, 퀘스트, 지도, 도감, 장비, 랭킹은 `v21126-runtime-page-final`, `v21126-page-column-final`로 safe-area 중앙 컬럼을 유지합니다.
- 개척 팝업과 건설/확인 모달은 `v21126-expedition-final`, `v21126-village-modal-final`로 중앙 fixed, 내부 스크롤, overscroll containment를 유지합니다.
- 낚시 물길/수중 효과는 `v21126-water-final`로 animation/transition/filter를 끄고, bite/reeling/result/success/fail 단계에서는 `display:none`으로 숨겨 성공 중 물길 깜박임을 막습니다.
- 낚싯대·미끼 strip, 연속 성공 표기, `물었다!` 팝업, 성공 결과창은 `v21126-loadout-final`, `v21126-combo-final`, `v21126-bite-final`, `v21126-result-final`로 최신 기준을 유지합니다.
- 신규 검증 스크립트 `tools/check-v21126-stale-code-pruner.mjs`를 추가해 버전 동기화, stale observer handoff, 단일 finalizer, UI 토큰, 성능 budget, 문서 계약, SVG 금지, 패키징 청결을 확인합니다.
- 낚시 판정/보상/밸런스, 물고기 데이터, 마을 좌표/충돌/건설 설치 로직, Firebase fallback, 오프닝 video-only 정책, 플레이어 8방향 파일명/flip 금지 정책은 변경하지 않았습니다.
- 작업본 `npm run validate`는 통과했습니다. 샌드박스에서는 DNS/네트워크와 `node_modules` 부재로 `ci:registry:check`, `ci:install`, `typecheck`, `build`가 최종 완료되지 않았으므로 GitHub Actions에서 `npm ci` 후 확인합니다.

## v2.1.126 분석/인수인계 기록 - 2026-07-01 KST

- 사용자가 특히 우려한 부분은 코드 꼬임과 예전 코드가 계속 살아나 최신 UI 보정이 반영되지 않는 문제입니다.
- 확인한 구조는 여러 세대의 observer가 동일 DOM의 `class`와 inline `style`을 반복 보정하는 형태입니다. v2.1.125는 같은 값 반복 쓰기를 줄였지만, v2.1.23과 v2.1.25 observer 루프 자체는 여전히 스케줄될 수 있었습니다.
- v2.1.126은 v2.1.23/v2.1.25를 삭제하지 않고 guard로 handoff합니다. GitHub Desktop에서 변경 추적과 되돌리기가 쉬운 안전 패치입니다.
- 최신 finalizer는 CSS 우선, inline style은 마지막 수단으로 사용하며, 이미 맞는 값은 다시 쓰지 않습니다.
- 사용 환경은 GitHub Desktop과 Firebase 무료 플랜입니다. Firebase 설정이 없으면 로컬 저장 fallback이 계속 살아 있어야 하며, 유료 서버 기능이나 필수 서버 의존성을 추가하지 않습니다.
- 다음 AI는 작업 후 반드시 `npm run validate`를 먼저 확인하고, 가능하면 GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build`까지 확인합니다.

## 운영/산출 고정 규칙

- 기록 파일은 `README.md`와 `AI_HANDOFF_CARDVILLE.md`만 유지합니다. 패치 노트, 임시 보고서, 분석 메모 같은 별도 `.md` 파일은 만들지 않습니다.
- 산출물은 항상 통파일 zip과 패치 zip 두 개입니다. 파일명은 짧게 쓰되 버전 숫자를 포함합니다. 예: `AF-v2.1.126-full.zip`, `AF-v2.1.126-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크 순서로 작성합니다.
- 로컬 결과 확인 기본 명령:

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

- zip 내부 점검 명령:

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
PY AF-v2.1.126-full.zip AF-v2.1.126-patch.zip
```

# AquaFantasia v2.1.125

## v2.1.125 변경사항

- 코드 꼬임/예전 보정 코드 재개입 문제를 다시 점검하고, v2.1.124의 `style` mutation finalizer가 예전 observer와 서로 다시 쓰기를 반복할 수 있는 부분을 줄였습니다.
- 새 패스 `installV21125LegacyDebtReducerPass()`를 추가했습니다. 이 패스는 v2.1.124 감시를 최신 경량 finalizer에게 인수인계하고, 동일 값 반복 쓰기를 `WeakMap` signature와 실제 inline style 확인으로 줄입니다.
- `v21125-legacy-debt-reducer-root`, `v21125-owned-final`, `data-v21125Owner` 토큰을 추가해 다음 AI가 최신 UI 소유권을 쉽게 확인할 수 있게 했습니다.
- 하단 메뉴는 `v21125-bottom-nav-final`로 마을/상점/가방/퀘스트/지도/도감/장비/랭킹에서 같은 우측 하단 기준을 유지하고, 낚시 화면에서는 확실히 숨깁니다.
- 초반 마을 가이드는 `v21125-village-guide-popup`와 새 localStorage 키 `aqua-v21125-guide-dismissed`로 다시 제공합니다. 내용은 낚시 → 보상 확인 → 개척 순서이며 중앙 고정입니다.
- 상점, 가방, 퀘스트, 지도, 도감, 장비, 랭킹은 `v21125-runtime-page-final`, `v21125-page-column-final`로 safe-area 중앙 컬럼을 다시 유지합니다.
- 개척 팝업과 건설/확인 모달은 `v21125-expedition-final`, `v21125-village-modal-final`로 중앙 fixed, 내부 스크롤, overscroll containment를 유지합니다.
- 낚시 물길/수중 효과, 낚싯대·미끼 strip, 연속 성공 표기, `물었다!` 팝업, 성공 결과창은 `v21125-water-final`, `v21125-sea-lane-final`, `v21125-loadout-final`, `v21125-combo-final`, `v21125-bite-final`, `v21125-result-final`로 한 번 더 최신 기준을 부여했습니다.
- 신규 검증 스크립트 `tools/check-v21125-legacy-debt-reducer.mjs`를 추가해 버전 동기화, v2.1.124 observer handoff, 최신 경량 finalizer, UI 토큰, 문서 계약, SVG 금지, 패키징 청결을 확인합니다.
- 낚시 판정/보상/밸런스, 물고기 데이터, 마을 좌표/충돌/건설 설치 로직, Firebase fallback, 오프닝 video-only 정책, 플레이어 8방향 파일명/flip 금지 정책은 변경하지 않았습니다.
- 작업본 `npm run validate`는 통과했습니다. 샌드박스에서는 DNS/네트워크와 `node_modules` 부재로 `ci:registry:check`, `ci:install`, `typecheck`, `build`가 최종 완료되지 않았으므로 GitHub Actions에서 `npm ci` 후 확인합니다.

## v2.1.125 분석/인수인계 기록 - 2026-07-01 KST

- 사용자가 특히 우려한 부분은 코드 꼬임과 예전 코드가 계속 살아나 최신 UI 보정이 반영되지 않는 문제입니다.
- 확인한 구조는 여러 세대의 observer가 동일 DOM의 `class`와 inline `style`을 계속 건드리는 형태입니다. v2.1.124는 `style` 재개입을 잡았지만, 그 감시 자체가 다시 style 쓰기를 유발해 랙/깜박임 체감이 남을 수 있습니다.
- v2.1.125는 v2.1.124를 삭제하지 않고, v2.1.124 normalize/observer가 `v21125LegacyDebtReducer === active`일 때 물러나도록 인수인계했습니다. GitHub Desktop에서 되돌리기 쉬운 안전 패치입니다.
- 최신 `setImportant`는 캐시된 signature와 실제 style 적용 상태를 둘 다 확인합니다. 그래서 예전 코드가 값을 바꿨을 때만 복구하고, 이미 맞는 값은 다시 쓰지 않아 불필요한 mutation churn을 줄입니다.
- 사용 환경은 GitHub Desktop과 Firebase 무료 플랜입니다. Firebase 설정이 없으면 로컬 저장 fallback이 계속 살아 있어야 하며, 유료 서버 기능이나 필수 서버 의존성을 추가하지 않습니다.
- 다음 AI는 작업 후 반드시 `npm run validate`를 먼저 확인하고, 가능하면 GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build`까지 확인합니다.

## 운영/산출 고정 규칙

- 기록 파일은 `README.md`와 `AI_HANDOFF_CARDVILLE.md`만 유지합니다. 패치 노트, 임시 보고서, 분석 메모 같은 별도 `.md` 파일은 만들지 않습니다.
- 산출물은 항상 통파일 zip과 패치 zip 두 개입니다. 파일명은 짧게 쓰되 버전 숫자를 포함합니다. 예: `AF-v2.1.125-full.zip`, `AF-v2.1.125-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크 순서로 작성합니다.
- 로컬 결과 확인 기본 명령:

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

- zip 내부 점검 명령:

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

## v2.1.124 변경사항

- 사용자가 지적한 “앞전 요청이 반영되지 않아 보임” 문제를 루트 원인 기준으로 다시 점검했습니다.
- 확인한 핵심 원인은 v2.1.123 final owner 패스가 `class`/화면 전환은 감시했지만, 예전 런타임 observer들이 나중에 다시 쓰는 inline `style` 재개입은 감시하지 않아 최신 보정이 재적용되지 않을 수 있다는 점입니다.
- 새 패스 `installV21124RootCauseUxRepairPass()`를 추가했습니다. 이 패스는 `style` mutation까지 감시하고, 하단 메뉴/페이지 shell/개척 팝업/낚시 물길 바/낚싯대·미끼/연속 성공/`물었다!`/결과창을 최신 기준으로 다시 고정합니다.
- 초반 마을 가이드는 기존 `aqua-v21122-guide-dismissed` 영향으로 안 보일 수 있어, 새 키 `aqua-v21124-guide-dismissed`와 새 UI `v21124-village-guide-popup`로 다시 제공합니다. 내용은 낚시 → 가방·퀘스트 → 개척 순서입니다.
- 상점, 가방, 퀘스트, 지도, 도감, 장비, 랭킹 화면은 `v21124-runtime-page-final`, `v21124-page-column-final`로 우측 쏠림을 다시 잡고, safe-area 안 중앙 컬럼을 강제합니다.
- 개척 팝업은 `v21124-expedition-final`로 fixed center, safe-area max-height, 내부 scroll, overscroll containment를 다시 적용해 반절만 보이는 회귀를 막습니다.
- 마을과 각 메뉴 페이지의 우측 하단 메뉴바는 `v21124-bottom-nav-final`로 같은 right/bottom/width/z-index 기준을 사용합니다. 낚시 화면에서는 메뉴바를 확실히 숨깁니다.
- 낚시 물길 바와 수중 효과는 `v21124-water-final`, `v21124-sea-lane-final`로 animation/transition을 차단하고, bite/reeling/result/success/fail 단계에서는 물길 바를 display none으로 숨깁니다.
- 낚싯대·미끼 strip과 내부 요소는 `v21124-loadout-final`, `v21124-loadout-child-final`로 transform/scale/animation/transition을 차단해 커졌다 작아졌다 하는 깜박임을 다시 막습니다.
- 연속 성공 표기는 `v21124-combo-final`로 캐스팅 버튼 근처 하단에 gap을 두고 배치합니다.
- `물었다!` 팝업과 성공 결과창은 `v21124-bite-final`, `v21124-result-final`로 중앙 fixed, no animation/transition 기준을 적용합니다.
- 신규 검증 스크립트 `tools/check-v21124-root-cause-ux-repair.mjs`를 추가해 버전 동기화, style mutation finalizer, 초반 가이드, 페이지 중앙 정렬, 개척 팝업, 낚시 UI 고정, 문서 계약, SVG 금지, 패키징 청결을 확인합니다.
- 낚시 판정/보상/밸런스, 물고기 데이터, 마을 좌표/충돌/건설 설치 로직, Firebase fallback, 오프닝 video-only 정책, 플레이어 8방향 파일명/flip 금지 정책은 변경하지 않았습니다.

## v2.1.124 분석/인수인계 기록 - 2026-07-01 KST

- v2.1.123 기준으로 사용자가 체감한 미반영 의심 사항을 다시 분석했습니다.
- v2.1.123은 최신 anchor를 부여했지만 observer의 `attributeFilter`에 `style`이 없어, 예전 보정 코드가 inline style을 나중에 다시 쓰면 최신 기준이 재적용되지 않을 수 있었습니다.
- 이번 v2.1.124는 기존 패스를 대량 삭제하지 않고, 최신 패스가 `style` 재개입까지 감지하여 다시 마지막 기준을 갖도록 보강했습니다.
- 체감 랙 완화는 불필요한 애니메이션/transition/scale churn을 줄이는 쪽으로 우선 처리했습니다. WebGL/Pixi/Firebase/Vite 같은 엔진 메이저 변경은 GitHub Actions 검증 전에는 보류합니다.
- 사용 환경은 GitHub Desktop과 Firebase 무료 플랜입니다. Firebase 설정이 없으면 로컬 저장 fallback이 계속 살아 있어야 하며, 유료 서버 기능이나 필수 서버 의존성을 추가하지 않습니다.
- 다음 AI는 작업 후 반드시 `npm run validate`를 먼저 확인하고, 가능하면 GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build`까지 확인합니다.

## 운영/산출 고정 규칙

- 기록 파일은 `README.md`와 `AI_HANDOFF_CARDVILLE.md`만 유지합니다. 패치 노트, 임시 보고서, 분석 메모 같은 별도 `.md` 파일은 만들지 않습니다.
- 산출물은 항상 통파일 zip과 패치 zip 두 개입니다. 파일명은 짧게 쓰되 버전 숫자를 포함합니다. 예: `AF-v2.1.124-full.zip`, `AF-v2.1.124-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크 순서로 작성합니다.
- 로컬 결과 확인 기본 명령:

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

- zip 내부 점검 명령:

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

## v2.1.123 변경사항

- 코드 꼬임/예전 보정 코드 재개입 문제를 줄이기 위해 `installV21123RuntimeDeconflictPass()`를 추가했습니다.
- v2.1.122까지 누적된 UI 보정 패스는 유지하되, 최신 패스가 마지막 소유권을 갖도록 `v21123-owned-anchor`, `data-v21123-owner`, `data-v21123-latest-anchor` 토큰을 부여했습니다.
- 하단 메뉴는 `v21123-bottom-nav-final`로 낚시 외 모든 화면에서 동일한 우측 하단 fixed anchor를 쓰고, 낚시 화면에서는 확실히 숨기도록 정리했습니다.
- 상점, 가방, 퀘스트, 지도, 도감, 장비, 랭킹 화면은 `v21123-runtime-page-final`과 `v21123-page-column-final`로 safe-area 안의 중앙 컬럼을 다시 고정해 우측 쏠림과 페이지 shell 흔들림을 줄였습니다.
- 개척 팝업은 `v21123-expedition-final`로 중앙 fixed panel, safe-area max-height, 내부 스크롤, overscroll containment를 한 번 더 고정했습니다.
- 건설 확인/건설 트레이 계열은 `v21123-village-modal-final`로 최대 높이와 내부 스크롤을 보강하고, 모달이 열렸을 때 첫 마을 가이드가 뒤에서 겹치지 않도록 `v21123-guide-final`을 제어했습니다.
- 낚시 물길/수중 효과는 `v21123-water-budget-final`, `v21123-sea-lane-final`로 animation/transition churn을 차단하고, 입질/릴링/결과/성공/실패 단계에서는 물길 바를 display none 기준으로 숨겨 성공 중 깜박임 재발을 줄였습니다.
- 낚싯대/미끼 장비 strip은 `v21123-loadout-final`, 내부 요소는 `v21123-loadout-child-final`로 transform/scale/transition/animation을 차단해 커졌다 작아졌다 보이는 현상을 줄였습니다.
- 연속 성공 표기는 `v21123-combo-final`로 캐스팅 버튼 가까운 하단 기준으로 다시 잡고, `물었다!` 팝업과 성공 결과창은 `v21123-bite-final`, `v21123-result-final`로 중앙 고정/무전환 기준을 적용했습니다.
- 새 패스는 visualViewport 변수 `--v21123-visual-width`, `--v21123-visual-height`와 signature guard, RAF + 80ms 후행 보정을 사용해 예전 observer가 늦게 개입해도 최신 앵커가 다시 마지막 기준이 되도록 했습니다.
- 신규 검증 스크립트 `tools/check-v21123-runtime-deconflict.mjs`를 추가해 버전 동기화, 최신 runtime/CSS 토큰, 문서 계약, SVG 금지, 패키징 청결, player 방향/오프닝 video-only 회귀 방지를 확인합니다.
- 낚시 판정/보상/밸런스, 물고기 데이터, 마을 좌표/충돌/건설 설치 로직, Firebase fallback, 오프닝 video-only 정책, 플레이어 8방향 파일명/flip 금지 정책은 변경하지 않았습니다.

## v2.1.123 분석/인수인계 기록 - 2026-07-01 KST

- v2.1.122 기준 `npm run validate` 통과와 `README.md`/`AI_HANDOFF_CARDVILLE.md` 외 불필요 문서가 없음을 먼저 확인했습니다.
- 사용자가 특히 우려한 내용은 코드 꼬임, 예전 보정 코드가 계속 살아나 최신 UI를 다시 흐트러뜨리는 문제입니다.
- 확인한 구조적 원인은 여러 세대의 런타임 UI 보정 패스가 같은 DOM 요소에 서로 다른 inline important 좌표와 CSS 좌표를 반복 적용하는 점입니다. 특히 하단 메뉴, runtime page shell, 개척 팝업, 낚시 물길 바, 장비 strip, `물었다!` 팝업, 성공 결과창은 누적 패스의 충돌 후보입니다.
- v2.1.123는 기존 패스 삭제가 아니라 최신 final owner 패스를 추가하는 방식입니다. 대량 삭제보다 안전하고, GitHub Desktop으로 되돌리기도 쉽습니다.
- 사용 환경은 GitHub Desktop과 Firebase 무료 플랜입니다. Firebase 설정이 없으면 로컬 저장 fallback을 유지해야 하며, 유료 서버 기능이나 필수 서버 의존성을 추가하지 않습니다.
- 다음 AI는 작업 후 반드시 `npm run validate`를 먼저 확인하고, 가능하면 GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build`까지 확인합니다.

## 운영/산출 고정 규칙

- 기록 파일은 `README.md`와 `AI_HANDOFF_CARDVILLE.md`만 유지합니다. 패치 노트, 임시 보고서, 분석 메모 같은 별도 `.md` 파일은 만들지 않습니다.
- 산출물은 항상 통파일 zip과 패치 zip 두 개입니다. 파일명은 짧게 쓰되 버전 숫자를 포함합니다. 예: `AF-v2.1.123-full.zip`, `AF-v2.1.123-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크 순서로 작성합니다.
- 로컬 결과 확인 기본 명령:

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

- zip 내부 점검 명령:

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

# AquaFantasia v2.1.121

## v2.1.121 변경사항

- 모바일 세로 화면의 버튼 라벨/초점 표시/터치 피드백, 스크롤 하단 여백, 카드 렌더링 비용을 다듬는 `installV21121MicroUiA11yPerfPass()`를 추가했습니다.
- 새 런타임 패스는 기존 게임 로직을 재작성하지 않고 활성 화면의 패널/건설창/낚시 입질창/결과창/카드/버튼에 `v21121-shell-polish`, `v21121-scroll-reserve`, `v21121-card-perf`, `v21121-control-a11y` 토큰을 부여합니다.
- 접근성 보강으로 라벨이 비어 있는 조작 요소에 안전한 `aria-label` fallback을 부여하고, `focus-visible` 링과 active 터치 피드백을 마지막 CSS 스코프에서 고정했습니다.
- 메뉴/상점/가방/미션/도감 카드 계열에 `content-visibility:auto`, `contain-intrinsic-size`, `contain:layout paint style`을 적용해 긴 목록의 렌더링 부담과 스크롤 흔들림을 줄였습니다.
- 하단 내비가 있는 메뉴 화면은 `--v21121-scroll-reserve` 기준 scroll-padding/padding-bottom을 확보해 마지막 카드와 액션 버튼이 내비 뒤에 숨어 보이는 위험을 낮췄습니다.
- `AI_HANDOFF_CARDVILLE.md`와 `README.md` 상단 운영 규칙, 결과 확인 명령, GitHub Desktop/Firebase 무료 플랜 기록, full/patch 산출 규칙을 v2.1.121 기준으로 갱신했습니다.
- 신규 검증 스크립트 `tools/check-v21121-micro-ui-a11y-perf.mjs`를 추가해 버전 동기화, 런타임/CSS 토큰, 운영 계약, SVG 금지, 문서 2개 제한을 확인합니다.
- 낚시 판정/보상/밸런스, 물고기 데이터, 마을 좌표/충돌/건설 로직, Firebase fallback, 오프닝 video-only 정책, 플레이어 8방향 파일명/flip 금지 정책은 변경하지 않았습니다.

## v2.1.121 분석/인수인계 기록 - 2026-07-01 KST

- v2.1.120 기준 `npm run validate` 통과와 `README.md`/`AI_HANDOFF_CARDVILLE.md` 외 불필요 문서가 없음을 먼저 확인했습니다.
- 확인한 실제 불안정 후보는 작은 화면에서 마지막 카드/액션 버튼이 하단 내비 뒤로 가려질 수 있는 점, 누적 UI 패스가 많은 구조에서 버튼 focus/active/라벨 일관성이 화면마다 달라질 수 있는 점, 카드가 많은 목록에서 스크롤 중 렌더링 부담이 체감될 수 있는 점입니다.
- 이번 패치는 UI/UX·성능·접근성 micro polish입니다. 수치/밸런스/플레이 루프를 건드리지 않고 DOM 토큰과 마지막 CSS 스코프로만 보정했습니다.
- 새 패스는 RAF batching, visualViewport 변수, signature guard를 사용합니다. 화면/viewport/대상 개수가 변할 때만 스타일 토큰을 다시 써 성능 부담을 줄였습니다.
- 사용 환경은 GitHub Desktop과 Firebase 무료 플랜입니다. Firebase 설정이 없으면 로컬 저장 fallback을 유지해야 하며, 유료 서버 기능이나 필수 서버 의존성을 추가하지 않습니다.
- 다음 AI는 작업 후 반드시 `npm run validate`를 먼저 확인하고, 가능하면 GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build`까지 확인합니다.

## 운영/산출 고정 규칙

- 기록 파일은 `README.md`와 `AI_HANDOFF_CARDVILLE.md`만 유지합니다. 패치 노트, 임시 보고서, 분석 메모 같은 별도 `.md` 파일은 만들지 않습니다.
- 산출물은 항상 통파일 zip과 패치 zip 두 개입니다. 파일명은 짧게 쓰되 버전 숫자를 포함합니다. 예: `AF-v2.1.121-full.zip`, `AF-v2.1.121-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크 순서로 작성합니다.
- 로컬 결과 확인 기본 명령:

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

- zip 내부 점검 명령:

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
PY AF-v2.1.121-full.zip AF-v2.1.121-patch.zip
```

# AquaFantasia v2.1.120

## v2.1.120 변경사항

- 모바일 세로 UI 전체를 다시 훑어 화면 구성, 카드 텍스트 줄바꿈, 미디어 containment, 하단 내비 safe-area 폭을 보강하는 `installV21120ScreenCompositionHandoffPass()`를 추가했습니다.
- 새 런타임 패스는 기존 게임 로직을 재작성하지 않고 활성 화면의 카드/패널/건설창/낚시 입질창/결과창/하단 내비에 `v21120-readable-panel`, `v21120-safe-nav`, `v21120-action-button`, `v21120-contained-media` 토큰을 부여합니다.
- `src/styles.css` 마지막 스코프에 읽기 쉬운 텍스트 줄바꿈, 카드 경계선, 미디어 카드 밖 튐 방지, 초소형 화면 하단 내비 폭 보정, reduced-motion/contrast 대응을 추가했습니다.
- `AI_HANDOFF_CARDVILLE.md`와 `README.md` 상단에 다음 AI가 바로 이어갈 수 있는 산출/검수/작업환경 계약을 고정했고, 결과 확인용 명령 묶음을 문서에 포함했습니다.
- 검증 스크립트 `tools/check-v21120-screen-composition-handoff.mjs`를 추가해 버전 동기화, UI shell 토큰, 인수인계 필수 섹션, 결과 명령, GitHub Desktop/Firebase 무료 플랜 기록, SVG 금지, 문서 2개 제한을 함께 확인합니다.
- 낚시 판정/보상/밸런스, 물고기 데이터, 마을 좌표/충돌/건설 로직, Firebase fallback, 오프닝 video-only 정책, 플레이어 8방향 파일명/flip 금지 정책은 변경하지 않았습니다.

## v2.1.120 분석/인수인계 기록 - 2026-07-01 KST

- v2.1.119 기준 `npm run validate` 통과와 `README.md`/`AI_HANDOFF_CARDVILLE.md` 외 불필요 문서가 없음을 먼저 확인했습니다.
- 사용자가 요청한 “모든 구석구석 체크, UI/UX/디자인 중점, 다음 AI가 문서만 보고 이어갈 수 있는 기록”을 반영해, 이번 패치는 기능 수치보다 화면 구성 안정성과 기록 계약을 우선했습니다.
- 확인한 실제 불안정 후보는 누적 보정 패스가 많은 구조에서 카드 내부 긴 한글 문구, 이미지/비디오 containment, 하단 내비 폭, 초소형 viewport safe-area가 다시 흔들릴 수 있는 점입니다.
- 새 패스는 RAF batching, visualViewport 변수, signature guard를 사용합니다. 화면/viewport/대상 개수가 변할 때만 스타일 토큰을 다시 써 성능 부담을 줄였습니다.
- 사용 환경은 GitHub Desktop과 Firebase 무료 플랜입니다. Firebase 설정이 없으면 로컬 저장 fallback을 유지해야 하며, 유료 서버 기능이나 필수 서버 의존성을 추가하지 않습니다.
- 다음 AI는 작업 후 반드시 `npm run validate`를 먼저 확인하고, 가능하면 GitHub Actions에서 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build`까지 확인합니다.

## 운영/산출 고정 규칙

- 기록 파일은 `README.md`와 `AI_HANDOFF_CARDVILLE.md`만 유지합니다. 패치 노트, 임시 보고서, 분석 메모 같은 별도 `.md` 파일은 만들지 않습니다.
- 산출물은 항상 통파일 zip과 패치 zip 두 개입니다. 파일명은 짧게 쓰되 버전 숫자를 포함합니다. 예: `AF-v2.1.120-full.zip`, `AF-v2.1.120-patch.zip`.
- 결과 공유 형식은 `작업중인 내용` → `기록` → `다음 업데이트 예상 내역` → 마지막에 버전 숫자 파일명 링크 순서로 작성합니다.
- 로컬 결과 확인 기본 명령:

```bash
npm run validate
npm run ci:registry:check
npm run ci:install
npm run typecheck
npm run build
```

- zip 내부 점검 명령:

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
PY AF-v2.1.120-full.zip AF-v2.1.120-patch.zip
```

# AquaFantasia v2.1.119


## v2.1.119 변경사항

- 모바일 세로 화면에서 모달/카드/건설창/결과창을 누를 때 배경 스와이프나 페이지 스크롤이 섞이는 위험을 줄이는 interaction safety 패스를 추가했습니다.
- `src/main.ts`에 `installV21119InteractionSafetyPass()`를 추가해 활성 화면의 모달, 카드 목록, 건설 확인창, 낚시 입질/결과창에 `data-no-swipe`, touch shield, scroll-safe 토큰을 런타임으로 부여합니다.
- visual viewport 높이를 `--v21119-visual-height`로 동기화해 키보드/주소창 변화가 있는 모바일 브라우저에서도 입질창, 결과창, 건설 확인창의 최대 높이가 safe-area 안에 머물도록 했습니다.
- `src/styles.css` 마지막 스코프에 터치 하이라이트 제거, overscroll containment, stable scrollbar gutter, 버튼 터치 타겟 최소값, compact viewport 보정을 추가했습니다.
- 낚시 판정/보상/물고기 데이터, 마을 좌표/충돌/건설 로직, Firebase 저장 fallback, 오프닝 video-only 정책, 플레이어 8방향 파일명/flip 금지 정책은 변경하지 않았습니다.
- 신규 검증 스크립트 `tools/check-v21119-interaction-safety.mjs`로 버전 동기화, 런타임 토큰, CSS safe-area/scroll 토큰, SVG 금지, README/handoff 보존을 확인합니다.

## v2.1.119 분석/인수인계 기록 - 2026-07-01 KST

- v2.1.118 기준 `npm run validate` 통과를 먼저 확인한 뒤 작업했습니다.
- 이번 패치는 사용자 제보가 없던 정상 기능을 재작성하지 않고, 누적 UI 보정이 많은 모바일 웹 게임에서 자주 생기는 터치/스크롤 전파 문제만 마지막 런타임 패스와 CSS 스코프로 보강했습니다.
- 새 패스는 MutationObserver와 RAF batching, signature guard를 사용해 화면/viewport/대상 개수가 바뀔 때만 스타일 토큰을 다시 씁니다.
- 건설창, 건설 확인창, 낚시 `물었다!` 창, 성공 결과창, 카드형 메뉴에 `data-no-swipe`를 부여해 하단 내비 스와이프 및 배경 제스처와 충돌할 가능성을 낮췄습니다.
- `npm run validate` 통과와 신규 검증 스크립트 단독 실행을 확인했습니다. `npm run typecheck`/`npm run build`는 현재 샌드박스에 `node_modules`가 없어 GitHub Actions의 `npm ci` 이후 결과를 최종 기준으로 봅니다.

# AquaFantasia v2.1.118


## v2.1.118 변경사항

- v2.1.117의 마을 우측 상단 아이콘 개선을 실제 런타임 기준으로 한 번 더 고정했습니다. 특히 기존 누적 보정의 `inline important` 스타일이 CSS 보정을 다시 덮을 수 있는 위험을 줄였습니다.
- 마을 우측 상단 버튼은 계속 34px 2x3 배치와 3px gap을 유지하고, 아이콘만 일반 화면 25px/초소형 화면 24px로 명확히 고정했습니다.
- 메뉴 컨테이너/버튼/아이콘에 `contain`, `clip-path`, `isolation`, pseudo 제거, object-position 중앙 고정을 적용해 아이콘 주변에 다른 그림이 비치는 현상을 추가 방지했습니다.
- 상점/가방/장비/미션/도감/모달 계열 카드 안의 이미지는 `v21118-contained-image`로 non-drag/lazy/contain 처리해 카드 밖으로 튀거나 긴 문구와 겹치는 위험을 줄였습니다.
- SVG 금지, README/handoff만 기록, 정상 기능 불필요 수정 금지 정책을 유지했습니다.
- 신규 검증 스크립트 `tools/check-v21118-ui-asset-containment.mjs`로 버전 동기화, 마을 메뉴 런타임 hard-lock, 카드 이미지 containment, SVG 금지, CSS 자산 존재 여부를 확인합니다.

## v2.1.118 분석/인수인계 기록 - 2026-06-30 KST

- 이번 작업은 사용자의 광범위 개선 요청에 대해 실제 불안정 후보를 먼저 찾는 방식으로 진행했습니다.
- 확인한 후보: 마을 우측 상단 메뉴는 v2.1.117에서 CSS와 런타임 보정이 들어갔지만, 프로젝트에 누적된 이전 보정 패스가 inline important 스타일을 여러 번 쓰는 구조입니다. 일부 기기/렌더 순서에서 CSS 마지막 레이어보다 런타임 inline important 값이 체감상 우선될 수 있어, v2.1.118에서 별도 런타임 hard-lock을 추가했습니다.
- 새 패스 `installV21118UiAssetContainmentPass()`는 RAF 예약과 signature guard를 사용해 같은 viewport/screen 상태에서는 불필요한 반복 스타일 쓰기를 줄입니다.
- 마을 메뉴 버튼의 실제 이벤트, 좌표, 개수, 위치, 34px 셀, 2x3 배치는 유지했습니다. 아이콘 시인성/bleed/containment만 보강했습니다.
- 카드 이미지 containment는 화면 장식/아이콘/상품/도감 이미지를 카드 안에 가두는 UI 보정이며, 물고기 데이터/장비 수치/보상/마을 좌표/Firebase 저장 흐름은 변경하지 않았습니다.
- 작업본 `npm run validate`, `tools/*.mjs` 문법 검사, v2.1.118 full zip 새 압축 해제본 `npm run validate`, v2.1.117 full + v2.1.118 patch 덮어쓰기본 `npm run validate`를 확인했습니다. `npm run typecheck`는 현재 샌드박스에 `node_modules`가 없어 `howler`, `pixi.js`, `firebase`, `vite` 모듈 해석 실패로 완료하지 못했습니다. GitHub Actions의 `npm ci` 이후 결과를 최종 기준으로 봅니다.

## v2.1.117 변경사항

- 마을 화면 우측 상단 2x3 조작 버튼의 전체 셀 크기는 34px 그대로 유지하면서 내부 아이콘만 24~25px로 키웠습니다.
- 아이콘과 테두리 사이 여백을 줄여 시인성을 높이되, 버튼이 더 커져 보이거나 HUD를 더 많이 가리지 않도록 했습니다.
- 버튼/아이콘에 `overflow:hidden`, `clip-path`, `isolation:isolate`, pseudo-element 제거를 적용해 아이콘 위쪽에 다른 그림이 비쳐 보이는 현상을 막았습니다.
- 기존 마을 이동, 건설, 확대/축소, 원점 이동, 상점, 출항 동작은 변경하지 않았습니다.
- SVG 금지, README/handoff만 기록, 정상 기능 불필요 수정 금지 정책을 유지했습니다.
- 신규 검증 스크립트 `tools/check-v21117-village-menu-icon-clarity.mjs`로 버전 동기화, 우측 상단 메뉴 아이콘 토큰, bleed 방지 CSS, SVG 금지, CSS 자산 존재 여부를 확인합니다.

## v2.1.117 분석/인수인계 기록 - 2026-06-30 KST

- 사용자 제보: 마을 우측 위 버튼 아이콘이 작아 잘 안 보이고, 아이콘 위쪽에 다른 그림이 보이는 느낌이 있음.
- 기존 메뉴 계열은 누적 보정 패스에서 34px 버튼에 21~22px 아이콘을 쓰고 있었고, 투명/반투명 배경과 여러 pseudo/프레임 레이어가 겹쳐 상단 가장자리에서 다른 이미지가 비치는 체감이 생길 수 있었습니다.
- v2.1.117은 버튼 전체 크기와 2x3 배치, 터치 타겟 위치는 유지하면서 내부 아이콘 변수와 마지막 런타임 보정만 추가했습니다.
- 새 패스 `installV21117VillageMenuIconClarityPass()`는 마을 화면에서만 작동하며, 기존 정상 기능/게임 수치/마을 좌표/건설 로직/Firebase/낚시 판정은 건드리지 않습니다.
- 작업본 `npm run validate`, `tools/*.mjs` 문법 검사, v2.1.117 full zip 새 압축 해제본 `npm run validate`, v2.1.116 full + v2.1.117 patch 덮어쓰기본 `npm run validate`를 확인했습니다.
- `npm run typecheck`는 현재 샌드박스에 `node_modules`가 없어 `howler`, `pixi.js`, `firebase`, `vite` 모듈 해석 실패로 완료하지 못했습니다. GitHub Actions의 `npm ci` 이후 결과를 최종 기준으로 봅니다.

## v2.1.116 변경사항

- 낚시 화면에서 낚싯대/미끼 장비칸이 혼자 꿈틀거리던 증상을 막기 위해 `fishing-loadout-strip`과 내부 장비 셀의 animation/transform/will-change를 마지막 스코프에서 고정했습니다.
- 연속 성공 배지가 구버전 테이블처럼 보이던 문제를 보정해 Aqua premium hud capsule PNG 스킨을 적용하고, 한 줄 고정/말줄임/흔들림 방지 스타일을 추가했습니다.
- `물었다!` 창이 1.2초 뒤 자동 릴링으로 전환되며 열렸다 닫히는 느낌을 주던 흐름을 제거했습니다. 이제 플레이어가 바다 화면 또는 `릴링 시작` 버튼을 눌러 전환하며, 창 자체는 단일 인스턴스로 안정적으로 유지됩니다.
- 성공 결과창은 Aqua panel PNG 스킨을 적용하고 fixed center, 고정 폭/최대 높이, fish image 크기, 버튼 그리드, idle animation 제거를 적용해 커졌다 작아지는 느낌을 줄였습니다.
- 게임 판정, 낚시 보상/밸런스, 물고기 데이터, 마을 이동/건설, Firebase 저장 흐름, 오프닝 video-only 정책은 건드리지 않았습니다.
- 신규 검증 스크립트 `tools/check-v21116-fishing-ui-stability-hotfix.mjs`로 위 네 가지 사용자 제보 증상과 SVG 금지, README/handoff 보존, CSS 자산 존재 여부를 함께 확인합니다.

## v2.1.116 분석/인수인계 기록 - 2026-06-30 KST

- 사용자 제보 증상: 낚싯대/미끼 버튼 꿈틀거림, 연속 성공 테이블 구버전 스킨, Aqua 스킨 미적용, `물었다!` 창 흔들림/자동 닫힘 느낌, 성공창 크기 흔들림.
- 실제 코드상 `triggerBite()`에 1.2초 후 자동 `startReeling()` 타이머가 있어 `물었다!` 창이 사용자가 읽기 전에 닫히는 체감이 생길 수 있었습니다. v2.1.116에서 자동 전환을 제거하고 플레이어 입력으로만 릴링이 시작되게 했습니다.
- `.bite-callout` 내부 터치를 루트 낚시 터치 처리에서 제외해, 창을 누르는 것과 바다 화면을 누르는 것이 충돌하지 않게 했습니다. 실제 릴링 시작은 `릴링 시작` 버튼이 처리합니다.
- `showBiteCallout()`은 기존 stage 내부 callout이 있으면 재사용하고, stage 밖에 남은 잔상만 제거하도록 바꿨습니다. 이로써 동일 state에서 remove/create가 반복되는 위험을 줄였습니다.
- `showResultCard()`는 이미 결과창이 열려 있으면 기존 창을 지우고 빈 상태로 return하지 않도록 순서를 바꿨고, `v21116-result-card-stable` 데이터 토큰을 추가했습니다.
- 이번 패치는 UI/UX 안정화 hotfix이며, 수치/밸런스/성장 루프는 변경하지 않았습니다.
- 작업본 `npm run validate`, `tools/*.mjs` 문법 검사, v2.1.116 full zip 새 압축 해제본 `npm run validate`, v2.1.115 full + v2.1.116 patch 덮어쓰기본 `npm run validate`를 확인했습니다. `npm run ci:registry:check`는 샌드박스 DNS 제한으로 `EAI_AGAIN registry.npmjs.org` 실패했습니다.



## v2.1.115 변경사항

- 모바일 주소창/키보드 변화, in-app 브라우저 viewport 흔들림, 입력창 focus 시 패널 높이 계산이 잦아지는 문제를 줄이기 위해 `RuntimeQualityManager`에 v2.1.115 런타임 viewport/input 가드를 추가했습니다.
- `visualViewport` resize/scroll, orientationchange, pageshow, input focus 이벤트를 즉시 스타일 쓰기로 처리하지 않고 `requestAnimationFrame`으로 묶고, 이전 값과 같으면 CSS 변수를 다시 쓰지 않도록 했습니다.
- 루트에 `v21115-runtime-viewport-input-root`, `v21115-keyboard-visible`, `v21115-compact-viewport` 상태를 부여하고, CSS 마지막 레이어에서 입력창 scroll-margin, 패널 max-height, safe-area 하단 여백, 터치 조작 안정성을 보강했습니다.
- 서비스워커는 같은 출처 요청만 앱 캐시에 저장하고, 성공 응답만 캐시하도록 정리했습니다. Firebase/외부 요청을 앱 오프라인 캐시에 섞지 않는 안정성 보강입니다.
- 신규 검증 스크립트 `tools/check-v21115-runtime-viewport-input-guard.mjs`로 버전 동기화, viewport/input 가드 토큰, 서비스워커 same-origin 캐시 정책, SVG 금지, CSS 자산 존재, README/handoff 보존을 확인합니다.
- 게임 로직, 낚시 판정/보상 수치, 물고기 데이터, 마을 좌표/충돌/건설, Firebase 저장 흐름, 오프닝 video-only 정책은 건드리지 않았습니다.

## v2.1.115 분석/인수인계 기록 - 2026-06-30 KST

- v2.1.114 기준 `npm run validate` 통과를 먼저 확인한 뒤 작업했습니다.
- 이번 패치의 실제 개선 대상은 기능 밸런스가 아니라 모바일 런타임 안정성입니다. 특히 키보드가 올라올 때 입력창/모달/목록 스크롤 위치가 흔들리거나, 주소창 변화로 viewport 이벤트가 반복되며 스타일 재계산이 늘어나는 위험을 줄였습니다.
- `src/core/RuntimeQualityManager.ts`에 한정해 viewport 이벤트를 RAF batching + signature 비교 방식으로 바꿨고, 기존 품질 티어 판정/낚시 FPS downshift 로직은 유지했습니다.
- `src/styles.css`는 `v21115-runtime-viewport-input-root` 스코프 안에서만 작동하는 마지막 레이어를 추가했습니다. 전역 UI 재작성이나 기존 정상 레이어 삭제는 하지 않았습니다.
- `public/sw.js`는 v2.1.115 캐시명으로 동기화하면서 same-origin 성공 응답만 캐시하도록 정리했습니다. 이 변경은 앱 내부 정적 자산 캐시 안정화 목적이며, Firebase/외부 네트워크 흐름을 가로채지 않게 하기 위한 것입니다.
- `npm run validate` 통과와 `tsc --noEmit --target ES2022 --lib DOM,DOM.Iterable,ES2022 src/core/RuntimeQualityManager.ts` 단독 문법/타입 검사를 확인했습니다.
- v2.1.115 full zip을 새로 풀어 `npm run validate` 통과, v2.1.114 full에 v2.1.115 patch zip을 덮어씌운 뒤 `npm run validate` 통과를 확인했습니다.
- 네트워크 제한 때문에 `npm run ci:registry:check`는 `EAI_AGAIN registry.npmjs.org`로 실패했고, 전체 `npm run ci:install`, `npm run typecheck`, `npm run build`는 GitHub Actions에서 최종 확인해야 합니다.



## v2.1.114 변경사항

- 상점/가방/미션/도감/건설/결과창 계열 카드의 폭, 최대 높이, safe-area 기준을 한 번 더 다듬었습니다. 정상 작동 가능성이 높은 게임 로직, 낚시 수치, 마을 이동/건설, Firebase 저장 흐름은 건드리지 않았습니다.
- `src/main.ts`에 `v21114-interaction-layout-design-root` 루트 클래스를 추가해 v2.1.114 보정 CSS가 명확한 스코프 안에서만 작동하도록 했습니다.
- `src/styles.css` 마지막 레이어에 긴 문구 줄바꿈, 버튼 터치 피드백, 하단 내비 폭 보정, 낚시 결과창 스크롤 경계, 좁은 화면 반응형 카드 반경/버튼 크기 보정을 추가했습니다.
- 신규 검증 스크립트 `tools/check-v21114-interaction-layout-design-sweep.mjs`로 버전 동기화, SVG 금지, CSS 자산 존재, README/handoff 보존, v2.1.114 UI/UX 토큰을 확인합니다.
- 엔진/의존성 업그레이드는 현재 샌드박스에서 `npm ci`, `typecheck`, `build`를 확인할 수 없어 이번 패치에서는 보류했습니다. 작동 중인 기능을 깨지 않기 위해 검증 가능한 CSS/검증/기록 중심으로만 진행했습니다.

## v2.1.114 분석/인수인계 기록 - 2026-06-30 KST

- v2.1.113 통파일 기준 `npm run validate`가 먼저 통과하는 것을 확인한 뒤 작업했습니다.
- 이번 패치 후보 중 실제 런타임 상태머신, 보상 수치, 좌표/충돌, Firebase 흐름, 패키지 의존성 업그레이드는 위험도가 높아 수정하지 않았습니다.
- 안전 개선 범위는 UI/UX 마지막 CSS 스코프입니다. 목표는 모바일 세로 화면에서 카드/목록/하단 내비/결과창이 화면 밖으로 밀리거나 긴 한글 문구가 버튼과 겹치는 문제를 줄이는 것입니다.
- `npm run validate` 통과를 확인했습니다. 네트워크 제한 때문에 `npm run ci:registry:check`, `npm run ci:install`, `npm run typecheck`, `npm run build`는 GitHub Actions 결과를 최종 기준으로 봅니다.
- 다음 패치 후보는 실제 모바일 화면 캡처 기반 낚시/상점/가방/미션 겹침 점검, 마을 조이스틱/건설 프리뷰 터치감 점검, 검증 가능한 범위 안의 콘텐츠 루프 보상 분석입니다.


## v2.1.113 변경사항

- 모바일 세로 화면 UI/UX 안정성 스윕을 추가했습니다. 게임 시스템 수치, 낚시 판정, 마을 이동/건설, Firebase 저장 흐름은 건드리지 않았습니다.
- `src/main.ts`에 `v21113-ui-ux-stability-root` 루트 클래스를 추가해 v2.1.113 보정 CSS가 명확한 스코프 안에서만 작동하도록 했습니다.
- `src/styles.css` 마지막 레이어에 카드 폭, 터치 타겟, focus-visible, 입력창 가독성, 이미지/캔버스/비디오 폭 제한, 낚시 결과창 스크롤 경계, 하단 도크 safe-area 보정을 추가했습니다.
- 신규 검증 스크립트 `tools/check-v21113-ui-ux-stability-sweep.mjs`로 버전 동기화, SVG 금지, CSS 자산 존재, README/handoff 보존, v2.1.113 UI/UX 토큰을 확인합니다.
- v2.1.112에서 해결한 `AI_HANDOFF_CARDVILLE.md` 삭제 재발 방지와 `README.md`/`AI_HANDOFF_CARDVILLE.md` 외 문서 금지 정책을 유지했습니다.

## v2.1.113 분석/인수인계 기록 - 2026-06-30 KST

- 안전한 개선 범위로 판단한 항목만 적용했습니다. 이번 패치는 마지막 CSS/루트 토큰 중심이며, 정상 작동 가능성이 높은 런타임 상태머신과 콘텐츠 수치는 수정하지 않았습니다.
- UI/UX 개선 핵심은 좁은 모바일 세로 화면에서 카드가 화면 밖으로 밀리는 문제, 버튼 터치 영역이 작게 느껴지는 문제, 결과창/모달 내부 스크롤이 배경 스크롤과 섞이는 문제, 입력창 확대/가독성 문제를 줄이는 것입니다.
- `npm run validate` 통과를 확인했습니다. `npm run ci:registry:check`는 현재 샌드박스 DNS 제한으로 `EAI_AGAIN registry.npmjs.org` 실패했고, `node_modules`가 없어 `typecheck`/`build`는 GitHub Actions에서 최종 확인해야 합니다.
- 다음 패치 후보는 실제 모바일 낚시 UI 스크린샷 기준 겹침 점검, 마을 조이스틱/건설 프리뷰 터치감 점검, 콘텐츠 루프 보상/성장 밸런스 검토입니다.

# AquaFantasia v2.1.112


## v2.1.112 변경사항

- GitHub Actions `validate` 실패 원인을 수정했습니다. 이전 패치 zip에 `tools/clean-old-patch-docs.mjs`, `tools/validate-clean.mjs`가 빠져 있어, 저장소의 구버전 정리 스크립트가 `AI_HANDOFF_CARDVILLE.md`를 오래된 문서로 오판해 삭제했습니다.
- `tools/clean-old-patch-docs.mjs`를 루트의 `README.md`와 `AI_HANDOFF_CARDVILLE.md`만 보존하도록 명시적으로 고쳤습니다.
- `tools/validate-clean.mjs`를 `README.md`와 `AI_HANDOFF_CARDVILLE.md`가 둘 다 있어야 통과하도록 강화했습니다. 이제 인수인계 파일이 삭제되면 더 이른 단계에서 명확히 실패합니다.
- 신규 검증 스크립트 `tools/check-v21112-ci-handoff-clean.mjs`를 추가해 버전 동기화, SVG 금지, CSS 자산 존재, 인수인계 삭제 재발 방지, 정리/검증 스크립트 동기화를 확인합니다.
- 게임 로직, 낚시 수치, 마을 이동/건설, Firebase 저장 흐름, 정상 작동 가능성이 높은 런타임 기능은 수정하지 않았습니다.

## v2.1.112 GitHub Actions 실패 원인/해결 기록 - 2026-06-30 KST

- 실패 로그 핵심: `clean-old-patch-docs`가 `AI_HANDOFF_CARDVILLE.md`를 삭제했고, 이후 `check-v21111-asset-policy-handoff.mjs`가 같은 파일을 읽으려다 `ENOENT`로 실패했습니다.
- 직접 원인: v2.1.111 패치 zip에 신규 검증 스크립트는 들어갔지만, 이 스크립트와 짝이 되는 `clean-old-patch-docs.mjs`, `validate-clean.mjs` 수정본이 포함되지 않았습니다. 따라서 GitHub 저장소에는 구버전 정리 로직이 남아 있었습니다.
- 해결: v2.1.112 패치 zip에는 `tools/clean-old-patch-docs.mjs`, `tools/validate-clean.mjs`, `tools/check-v21112-ci-handoff-clean.mjs`를 반드시 포함합니다. 또한 v2.1.111 CSS 자산 경로 수정 누락 가능성까지 막기 위해 `src/styles.css`도 패치 zip에 포함합니다.
- 재발 방지: 앞으로 `AI_HANDOFF_CARDVILLE.md`를 요구하는 검증을 추가할 때는, 그보다 먼저 실행되는 정리 스크립트가 해당 파일을 보존하는지 함께 패치해야 합니다.
- 검수 완료: `npm run validate` 2회 연속 통과, cleanup smoke test에서 임시 `.md`/`.log`/`reports`는 삭제하고 `README.md`/`AI_HANDOFF_CARDVILLE.md`는 보존됨을 확인했습니다.
- 제한 사항: 현재 샌드박스는 `registry.npmjs.org` DNS 접근이 `EAI_AGAIN`으로 실패하고 `node_modules`가 없어 `npm run typecheck`는 의존성 해석 실패 상태입니다. GitHub Actions에서 `npm ci` 이후 재검수해야 합니다.
- 절대 유지: SVG 이미지 금지, 잘 작동되는 기능 불필요 수정 금지, 산출물 zip 파일명 버전 숫자 포함.


## v2.1.111 변경사항

- 사용자 추가 원칙을 고정했습니다: 잘 작동되는 기능은 불필요하게 건드리지 않고, SVG 이미지는 절대 사용하지 않습니다.
- 이전 분석에서 발견한 CSS 누락 자산 참조 3개만 실제 존재하는 PNG/WEBP 자산으로 교정했습니다. 게임 로직, 낚시 수치, 마을 이동, Firebase 흐름은 수정하지 않았습니다.
- 신규 검증 스크립트 `tools/check-v21111-asset-policy-handoff.mjs`를 추가해 버전 동기화, SVG 파일/런타임 참조 금지, CSS 자산 존재 여부, package-lock 레지스트리 청결, 인수인계 규칙을 확인합니다.
- 서비스워커/오프라인 페이지/패키지 버전을 v2.1.111로 동기화하고, 산출물 zip 파일명에는 앞으로 버전 숫자를 포함하도록 기록했습니다.
- `README.md`와 `AI_HANDOFF_CARDVILLE.md` 외 불필요한 문서 생성 금지 정책을 유지했습니다.

## v2.1.111 분석/인수인계 기록 - 2026-06-30 KST

- 이번 패치는 기능 확장이 아니라 안전 패치입니다. 기존 정상 작동 가능성이 높은 런타임 기능은 건드리지 않았습니다.
- 수정한 CSS 경로는 `/assets/v12/buttons/btn_orange_wide_blank.webp` → `/assets/v12/buttons/btn_orange_normal_wide_blank.webp`, `./assets/v2110/ui/main_aqua_cards/ui_card_001.png` → `./assets/v2110/ui/main_aqua_cards/ui_main_001.png`, `./assets/v2110/ui/buttons_and_badges/ui_badge_001.png` → `./assets/v2110/ui/buttons_and_badges/ui_button_001.png`입니다.
- `npm run validate`는 v2.1.111 기준으로 통과해야 합니다. 네트워크가 막힌 환경에서는 `npm ci`, `typecheck`, `build`를 끝까지 확인하지 못할 수 있으므로 GitHub Actions에서 최종 확인합니다.
- 다음 패치 후보는 GitHub Actions 결과 확인, 실제 모바일 세로 화면 낚시 UI 검수, 마을 건설/조이스틱 터치 검수입니다.


## v2.1.110 분석/인수인계 기록 - 2026-06-30 KST

- 업로드된 통파일을 기준으로 구조, GitHub Actions, Firebase fallback, 서비스워커, 버전 동기화, 정적 자산 참조를 1차 분석했습니다.
- 앞으로 진행 기록은 `README.md`와 `AI_HANDOFF_CARDVILLE.md`에만 남기도록 문서 허용 정책을 조정했습니다.
- `npm run validate`는 통과했습니다. 현재 샌드박스 DNS 제한으로 `npm ci`, `typecheck`, `build`는 완료하지 못했으므로 GitHub Actions에서 재확인이 필요합니다.
- 다음 패치 후보는 CSS 누락 자산 참조 3개 확인, 낚시 UI 실기기 겹침 재검수, 마을 건설/조이스틱 터치 검수입니다.

## v2.1.110 변경사항

- 낚시 실전 안전 구간을 0.5 단위로 양자화해 게이지/코치 문구가 프레임마다 미세하게 떨리는 체감을 더 줄였습니다.
- 물고기 피로도 기반 저항 완화와 회복 보정값을 추가해 같은 물고기도 초반/후반 텐션, 광폭화 빈도, 복구 난이도가 더 자연스럽게 변하도록 보강했습니다.
- `물었다!` 콜아웃, 액션 배지, 배틀 게이지, 릴 콘솔, 결과창을 v2.1.110 전용 safe-area 레인으로 다시 고정해 좁은 모바일 세로 화면의 화면 밖 밀림과 겹침을 줄였습니다.
- 공통 카드, 모달, 닫기 버튼, 이미지, 터치 타겟에 프리미엄 오션 글래스 위생 가드를 추가해 UI 디자인 톤과 가독성을 한 번 더 다듬었습니다.
- 오프닝 poster/controls 차단, 플레이어 8방향 파일명/flip 금지, 장비 50% / 50% 바, 루트 README 단일 정책을 계속 유지했습니다.


## v2.1.109 변경사항

- 낚시 실전 안전 구간을 프레임 단위로 안정화해 텐션/저항 게이지와 코치 문구가 미세하게 흔들리는 체감을 줄였습니다.
- `물었다!` 콜아웃, 액션 배지, 배틀 게이지, 릴 콘솔, 결과창을 v2.1.109 전용 safe-area 레인으로 다시 고정해 작은 세로 화면의 겹침과 화면 밖 밀림을 줄였습니다.
- 낚시 준비 UI와 실전/입질/결과 UI가 서로 남아 보이지 않도록 phase cleanup 범위를 좁히고, 장비바/최근 포획/가이드 카드 잔상 차단을 보강했습니다.
- 공통 카드, 모달, 버튼, 입력창, 이미지에 프리미엄 오션 글래스 디자인 가드를 추가해 긴 텍스트·검은 입력창·터치 타겟 흔들림을 방지했습니다.
- v2.1.108의 물고기별 텐션/저항 패턴, v2.1.107의 터치/햅틱 스로틀링, 오프닝 poster/controls 차단, 플레이어 8방향 파일명/flip 금지, 루트 README 단일 정책을 계속 유지했습니다.


## v2.1.108 변경사항

- 본게임 낚시 입질 단계의 `물었다!` 콜아웃을 기존 공통 알림 앵커에서 분리해 더 아래쪽 안전 위치로 내리고, 작은 세로 화면에서도 화면 밖으로 나가지 않도록 fixed safe-area 앵커를 추가했습니다.
- 액션 배지와 입질 콜아웃을 별도 top 변수로 분리해 `광폭화`, `도주 압박`, `릴링 시작` 같은 알림이 `물었다!` 팝업과 서로 밀거나 겹치지 않도록 정리했습니다.
- 물고기별 `잔잔형 / 질주형 / 중량형 / 파도형 / 보스형` 텐션·저항 프로필을 추가해 같은 수역 안에서도 장력 변화, 저항 체력, 광폭화 주기, 안전 구간 폭, 포획 속도가 다르게 느껴지도록 확장했습니다.
- 낚시 실전 UI에 물고기 패턴 라벨을 반영해 현재 물고기의 저항 성향을 텐션/저항 안내에서 읽을 수 있도록 보강했습니다.
- v2.1.107의 터치 링/햅틱 스로틀링, 오프닝 poster/controls 차단, 플레이어 8방향 파일명/flip 금지, 루트 README 단일 정책을 계속 유지했습니다.

## v2.1.107 변경사항

- 본게임 낚시에서 터치 링과 햅틱 피드백이 짧은 간격으로 반복되어 화면/알림 떨림처럼 느껴질 수 있는 부분을 스로틀링했습니다.
- 낚시 준비/입질/실전/결과 단계별 UI 보정 범위를 더 좁혀 장비바, 바다물길, 배틀 게이지, 릴 콘솔, 결과창이 서로 밀고 당기지 않도록 정리했습니다.
- 낚싯대/미끼 50% / 50% 장비바는 준비 단계에서만 얇게 보이고, 입질/실전/결과 단계에서는 잔상처럼 남지 않도록 phase deconflict를 보강했습니다.
- 공통 카드/모달/버튼/이미지에 v2.1.107 오션 글래스 디자인 가드를 추가해 긴 텍스트, 좁은 모바일 세로 화면, 안전영역에서의 잘림과 겹침을 줄였습니다.
- visualViewport 기반 변수, reduced-motion, lazy/async/no-drag 이미지 정책, MutationObserver 스케줄 스로틀을 유지해 누적 보정 레이어의 성능 부담을 낮췄습니다.
- 오프닝 영상 poster/controls 차단, 플레이어 8방향 파일명/flip 금지, 루트 README 단일 정책을 계속 유지했습니다.

## v2.1.106 변경사항

- 본게임 낚시의 찌 움직임을 프레임 누적 이동에서 고정 앵커 기반 비누적 모션으로 바꿔 화면/찌 떨림 체감을 줄였습니다.
- 릴링 중 햅틱/위험 알림 펄스 간격을 완화하고, 액션 배지 중복 생성과 팝 애니메이션을 줄여 알림 흔들림을 안정화했습니다.
- 낚시 실전 게이지, 릴 콘솔, 입질 콜아웃, 결과창에 안정화 클래스를 추가해 배치 보정이 서로 밀고 당기지 않도록 정리했습니다.
- 토스트를 상단 안전영역 기준 단일 앵커 카드로 고정하고 오션 글래스 톤을 유지해 낚시 화면에서도 중앙 흔들림/겹침을 줄였습니다.
- 오프닝 영상 poster/controls 차단, 플레이어 8방향 파일명/flip 금지, 루트 README 단일 정책을 계속 유지했습니다.

## v2.1.105 변경사항

- 화면별 무결성 패스를 추가해 낚시, 마을, 건설, 공통 메뉴가 서로 다른 UI 보정 레이어를 과하게 침범하지 않도록 정리했습니다.
- 낚시 준비 단계에서는 바다물길과 낚싯대/미끼 50% / 50% 장비바를 더 안정적으로 좌측 안전영역 안에 고정하고, 입질/실전/결과 단계에서는 준비 UI와 구형 릴/터치존 잔상을 더 좁은 조건으로 정리했습니다.
- 낚시 `물었다!` 콜아웃, 실전 게이지, 하단 감기 버튼, 성공 결과창의 등급 배지/리본/버튼 영역을 작은 세로 화면 기준으로 다시 압축해 겹침과 하단 밀림을 줄였습니다.
- 마을 화면에서는 플레이어 좌표와 방향 매핑은 건드리지 않고, 캔버스 paint 안정화, 우측 상단 2 x 3 메뉴바, HUD/개척 바 간격, 조이스틱 글자 제거 유지 가드만 보강했습니다.
- 건설 확인형 플로우는 기존 선택 → 반투명 프리뷰 → 타일 선택 → 중앙 작은 확인 팝업 → 건설/취소 구조를 유지하면서 확인 카드 폭, 버튼 간격, 설치 불가 안내 가독성을 다듬었습니다.
- 상점, 가방, 퀘스트, 지도, 건물상세, 캐릭터/개척 정보, 종료 팝업, 낚시 결과창에 공통 오션 글래스 카드 톤과 밝은 입력창/통일 X 닫기/긴 텍스트 말줄임 규칙을 추가 보강했습니다.
- 오프닝 영상은 poster 없이 최초 게임 시작 전용 video-only 계약을 유지하고, 네이티브 컨트롤/PIP/remote playback 차단과 첫 프레임 보호 쉘을 v2.1.105 기준으로 다시 확인했습니다.

## v2.1.104 변경사항

- 활성 화면 기준 겹침/배치 정리 패스를 추가해 낚시, 메뉴, 상점, 건설, 결과창의 카드/버튼/입력창이 모바일 세로 안전영역 안에서 더 안정적으로 보이도록 보강했습니다.
- 낚시 준비 단계의 바다물길과 낚싯대/미끼 50% / 50% 장비바 사이 간격을 자동 계산하고, 입질/실전/결과 단계에서는 준비 UI와 구형 릴/게이지 조각이 남지 않도록 phase cleanup을 추가했습니다.
- 낚시 성공 결과창의 이미지, 등급/리본, 보상, 버튼 영역을 compact 2열 액션 구조와 내부 스크롤 예산으로 정리해 하단 밀림과 겹침을 줄였습니다.
- 공통 오션 글래스 카드, 우측 상단 X 닫기, 입력창 밝은 배경, 긴 텍스트 말줄임/줄바꿈, 이미지 lazy/async/no-drag 정책을 한 번 더 정리했습니다.
- 오프닝 영상은 poster 없이 최초 시작 전용 video-only 계약을 유지하고, 네이티브 미디어 컨트롤/PIP/remote playback 차단과 첫 프레임 쉘을 v2.1.104 기준으로 재검증했습니다.

## v2.1.103 변경사항

- 오프닝 영상 시작 전 브라우저 네이티브 플레이 마크/컨트롤 잔상을 더 강하게 차단하도록 controls 속성 제거, PIP/remote playback 차단, 첫 프레임 쉘 상태를 재점검했습니다.
- 오프닝 중 HUD/우측 메뉴/하단 도크/조이스틱/토스트/말풍선/비네트/스킵 UI가 영상 위에 남지 않도록 video-only 가드를 v2.1.103 기준으로 보강했습니다.
- 낚시 준비 화면의 낚싯대/미끼 장비바를 더 얇은 50% / 50% 2분할 구조로 고정하고, 아이콘을 마이크로 크기로 줄여 텍스트 우선 가독성을 유지했습니다.
- 입질 단계의 `물었다!` 콜아웃과 게임 설명/보조 배지 겹침을 줄이고, 성공 결과창의 등급/리본/보상/버튼 영역이 모바일 세로 화면 안에 들어오도록 compact guard를 추가했습니다.
- 상점/메뉴/건설/결과창 공통 오션 글래스 카드 톤과 입력창 가독성, visualViewport/safe-area/containment 성능 가드를 유지하며 v2.1.103 전용 검증 스크립트를 추가했습니다.

## v2.1.102 변경사항

- 활성 화면에서만 작동하는 프리미엄 오션 글래스 디자인 시스템 연속성 패스를 추가했습니다.
- 오프닝 영상 첫 프레임 전 브라우저 기본 플레이 마크/컨트롤 잔상 차단을 유지하고, 영상 외 HUD/도크/조이스틱/토스트 노출을 다시 막았습니다.
- 낚시 화면의 낚싯대 50% / 미끼 50% 얇은 2분할 장비바, 입질 콜아웃, 결과창 compact 레이아웃, 게이지/릴 콘솔 잔상 cleanup을 보강했습니다.
- 상점/메뉴/건설/결과창 카드의 텍스트 대비, 터치 타겟, 입력창 가독성, visualViewport/safe-area/containment 성능 가드를 정리했습니다.
- v2.1.102 전용 검증 스크립트를 추가했습니다.


## v2.1.100 변경사항

- 100단위 마일스톤 패치로 누적된 프리미엄 오션 글래스 디자인 가드를 가볍게 정리하고, 활성 화면 기준으로만 카드/버튼/입력창 보정이 돌도록 다듬었습니다.
- 오프닝 영상은 첫 실제 프레임 전 브라우저 네이티브 플레이 마크나 중간 UI가 보이지 않도록 first-frame shield와 video-only 계약을 재확인했습니다. `poster` 정지 이미지는 계속 사용하지 않습니다.
- 낚시 준비 화면의 낚싯대/미끼 정보는 상단 얇은 2분할 바를 유지하면서 텍스트 우선, 마이크로 아이콘, 자동 높이 측정, 좌우 안전영역 보정을 강화했습니다.
- 입질/실전/결과 단계에서는 준비 정보, 게임 설명, 최근 포획, 게이지/릴 콘솔 잔상이 서로 겹치지 않도록 cleanup을 보강했습니다.
- visualViewport, reduced-motion, image lazy/async/no-drag, layout/paint containment를 유지하고 v2.1.100 전용 검증 스크립트를 추가했습니다.

# AquaFantasia v2.1.99

## v2.1.99 변경사항

- 디자인 우선 패치로 활성 화면에서만 작동하는 v2.1.99 프리미엄 오션 글래스 보정 패스를 추가해 카드 광택, 버튼 대비, 텍스트 예산을 가볍게 정리했습니다.
- 첫 인트로 영상 전 브라우저 기본 플레이 마크/컨트롤 잔상이 다시 보이지 않도록 오프닝 마스크와 비디오 속성 hard lock을 한 번 더 강화했습니다.
- 낚시 장비 2분할 바는 얇고 긴 낚싯대 50% / 미끼 50% 구조를 유지하면서, 아이콘은 마이크로 크기로 고정하고 텍스트 우선 가독성을 보강했습니다.
- 입질 콜아웃, 낚시 성공 결과창, 실전 게이지/릴 콘솔 잔상 cleanup을 유지하면서 모바일 세로 화면 안전영역과 내부 스크롤 예산을 재정리했습니다.
- visualViewport, reduced-motion, image lazy/async/no-drag, layout/paint containment를 유지하고 v2.1.99 전용 검증 스크립트를 추가했습니다.

- 디자인 우선 패치로 활성 화면 기준의 v2.1.98 프리미엄 오션 글래스 엔진을 추가해 상점/메뉴/건설/결과창 카드의 광택, 테두리, 텍스트 대비, 버튼 터치감을 한 번 더 정리했습니다.
- 오프닝 영상 첫 프레임 전에는 별도 마스크 레이어로 브라우저 네이티브 플레이 마크/컨트롤 잔상이 보일 여지를 추가 차단하고, 영상만 단독으로 보이는 계약을 유지했습니다. `poster` 정지 이미지는 계속 사용하지 않습니다.
- 낚시 준비 화면의 낚싯대/미끼 정보는 위쪽 얇은 2분할 바를 유지하면서 아이콘을 더 작게 고정하고, 텍스트 우선 배치/자동 높이 측정으로 글자 잘림과 좌측 밀림을 줄였습니다.
- 입질/실전/결과 단계에서는 준비 정보, 게임 설명, 최근 포획, 게이지 잔상이 서로 겹치지 않도록 focused phase cleanup을 보강하고 결과창을 compact modal 예산 안에 맞췄습니다.
- visualViewport, reduced-motion, image lazy/async/no-drag, layout/paint containment, long-frame 경량 플래그를 유지하면서 v2.1.98 전용 검증 스크립트를 추가했습니다.

# AquaFantasia v2.1.97

## v2.1.97 변경사항

- 활성 화면 기준으로만 작동하는 v2.1.97 프리미엄 디자인 연속성 패스를 추가해 상점/메뉴/결과창/건설 카드의 오션 글래스 톤, 버튼 대비, 텍스트 예산을 더 정돈했습니다.
- 오프닝 영상은 첫 실제 프레임 전까지 네이티브 플레이 마크나 중간 UI가 보일 여지를 줄이는 first-frame shield를 유지/보강했습니다. `poster` 정지 이미지는 계속 사용하지 않습니다.
- 낚시 장비 정보는 위쪽 얇은 2분할 바 구조를 유지하면서 아이콘을 더 작게 잠그고, 텍스트 우선 배치와 장비 바 실제 높이 측정을 보강했습니다.
- 낚시 입질/실전/결과 단계에서 준비 정보, 보조 설명, 게이지 잔상이 겹치지 않도록 phase cleanup과 compact result guard를 추가했습니다.
- visualViewport, reduced-motion, image lazy/async/no-drag, layout/paint containment 가드를 유지하면서 v2.1.97 전용 검증을 추가했습니다.

## v2.1.96 변경사항

- 첫 인트로 영상이 실제 첫 비디오 프레임을 넘기기 전까지 브라우저 기본 동영상 플레이 마크/컨트롤이 보일 여지를 줄이도록 v2.1.96 first-frame 오프닝 쉘을 추가했습니다.
- 오프닝 중 말풍선, 비네트, 스킵, HUD, 우측 메뉴, 도크, 조이스틱, 토스트가 절대 영상 위에 뜨지 않도록 video-only 계약을 한 번 더 보강했습니다. `poster` 정지 이미지는 계속 사용하지 않습니다.
- 낚시 준비 화면의 낚싯대/미끼는 위쪽 얇은 긴 2분할 바로 유지하되, 아이콘을 8~9px급 마이크로 인라인 크기로 더 줄이고 텍스트가 우선 보이도록 정리했습니다.
- 낚시 입질 콜아웃과 성공 결과창은 더 작은 compact premium modal 예산으로 다시 정리해 게임 설명/보조 배지/결과 등급 영역과 겹치거나 아래로 밀리는 회귀를 줄였습니다.
- 상점/메뉴/건설/결과창 카드의 프리미엄 오션 글래스 톤, 이미지 lazy/async/no-drag, visualViewport, reduced-motion, containment 가드를 유지하면서 v2.1.96 전용 검증을 추가했습니다.

## v2.1.95

## v2.1.95 변경사항

- 오프닝 영상 시작 전 브라우저 네이티브 플레이 마크/컨트롤 잔상이 보이지 않도록 `v2195` 오프닝 쉘을 추가했습니다.
- 낚시 준비 UI의 낚싯대/미끼 정보를 상단 얇은 2분할 바로 다시 압축하고, 아이콘을 11~12px급으로 줄여 텍스트 가독성을 우선했습니다.
- 낚시 입질 콜아웃, 게이지/버튼 레인, 성공 결과창을 active-screen 기준으로 다시 정리해 겹침과 하단 밀림 회귀를 줄였습니다.
- 상점/가방/퀘스트/지도/건설/도감/개척/결과창에 프리미엄 오션 글래스 카드 톤, 버튼 터치감, 입력창 대비 가드를 추가했습니다.
- v2.1.95 전용 검증 스크립트로 버전 동기화, 오프닝 poster 미사용, 낚시 슬림 장비 바, 플레이어 8방향 매핑, ZIP 청결성을 확인합니다.

## v2.1.94 변경사항

- 시작 인트로 영상 전에 브라우저 동영상 플레이어의 재생 마크처럼 보이는 네이티브 컨트롤 잔상을 차단하기 위해, 오프닝 비디오는 실제 재생 이벤트 전까지 투명 처리하고 controls/remote/picture-in-picture 계열 UI를 모두 비활성화했습니다.
- 오프닝은 계속 최초 게임 시작 로딩 전용이며, poster 정지 이미지는 사용하지 않고 말풍선/비네트/스킵/마을 HUD/우측 메뉴/도크/조이스틱/토스트가 영상 위에 나오지 않도록 유지했습니다.
- 낚시 준비 화면의 낚싯대/미끼 카드를 큰 세로 카드가 아니라 상단 얇은 가로 2분할 바 형태로 재배치해, 왼쪽 50% 낚싯대 / 오른쪽 50% 미끼 정보가 작고 읽기 좋게 보이도록 수정했습니다.
- 낚싯대/미끼 아이콘은 15~16px급 작은 인라인 아이콘으로 축소하고, 텍스트는 한 줄 요약으로 정리해 이전처럼 아이콘이 너무 크게 보이거나 정보 카드가 화면을 밀어내지 않도록 했습니다.
- v2.1.94 전용 검증 스크립트로 버전 동기화, 오프닝 네이티브 플레이 마크 차단, 낚시 2분할 얇은 장비 바, poster 미사용, 플레이어 8방향 매핑과 ZIP 청결성을 확인합니다.

# AquaFantasia v2.1.93

## v2.1.93 변경사항

- 디자인 우선 패치로 상점/메뉴/건설/결과창 카드에 프리미엄 오션 글래스 톤, 얇은 광택 테두리, 높은 텍스트 대비, 입력창 아쿠아 톤을 한 번 더 통일했습니다.
- 새 v2.1.93 디자인/배치 엔진은 활성 화면 기준으로만 동작하도록 정리해, 불필요한 전체 DOM 재스캔을 줄이고 마을 화면 떨림을 유발하지 않는 paint-safe 방식으로 유지했습니다.
- 오프닝은 시작 버튼 직후 영상만 먼저 보이는 계약을 유지하면서, 말풍선/비네트/스킵/마을 HUD/우측 메뉴/도크/조이스틱/토스트가 영상 첫 프레임 위에 나오지 않도록 video-only first-frame 가드를 추가했습니다.
- 낚시 준비 화면의 낚싯대/미끼 아이콘을 더 작게 조정하고, 바다물길 카드의 실제 높이를 측정해 장비 선반이 화면 왼쪽 밖으로 밀리거나 글자가 잘리지 않도록 compact readable shelf를 보강했습니다.
- `물었다!` 콜아웃과 게임 설명/보조 배지/최근 포획 UI를 더 강하게 분리하고, 낚시 성공 결과창은 등급/이미지/보상/버튼이 모바일 세로 화면 안에서 밀리지 않도록 compact premium modal 예산을 다시 잡았습니다.
- v2.1.93 전용 검증 스크립트로 버전 동기화, 오프닝 video-only 계약, 낚시 장비/입질/결과창 배치, 프리미엄 디자인 가드, 플레이어 8방향 매핑과 ZIP 청결성을 확인합니다.

# AquaFantasia v2.1.92

## v2.1.92 변경사항

- 게임 시작 버튼을 누른 뒤 몰입 모드 대기 화면이 먼저 남지 않도록, `enterImmersiveMode()`보다 오프닝 비디오 DOM을 먼저 띄우는 video-first handoff로 순서를 정리했습니다.
- 오프닝 영상은 계속 최초 시작 로딩 전용이며, 말풍선/비네트/스킵/마을 UI/토스트가 영상 위에 나오지 않도록 v2.1.92 오프닝 계약을 보강했습니다. `poster` 정지 이미지는 계속 사용하지 않습니다.
- 낚시 준비 화면의 낚싯대/미끼 아이콘을 더 작게 줄이고, 텍스트는 별도 copy 영역에서 잘리지 않도록 compact readable loadout 레이어를 추가했습니다.
- `물었다!` 콜아웃, 낚시 성공 결과창, 상점/메뉴/건설 카드에는 프리미엄 오션 글래스 디자인 톤과 모바일 safe-area 가드를 한 번 더 적용했습니다.
- v2.1.92 전용 검증 스크립트로 버전 동기화, 오프닝 video-first 계약, 낚시 compact 아이콘, 결과창/디자인 가드, 플레이어 방향 매핑을 확인합니다.

# AquaFantasia v2.1.91

## v2.1.91 변경사항

- 게임 시작 오프닝 영상 전에 보이던 말풍선/비네트/스킵/마을 UI 잔상 가능성을 제거하고, 로딩 진입 시 `aqua_opening_v2120.mp4` 영상만 전체화면으로 보이도록 `v2191` 오프닝 영상 단독 계약을 추가했습니다.
- 오프닝 영상은 계속 최초 시작 로딩 전용이며, `poster` 정지 이미지는 사용하지 않습니다.
- 낚시 준비 화면의 낚싯대/미끼 아이콘을 기존보다 작게 조정하고, 텍스트 영역은 잘리지 않도록 별도 가독성 레이어와 safe-left 선반 가드를 보강했습니다.
- `물었다!` 콜아웃, 낚시 성공 결과창, 상점/메뉴 카드에 프리미엄 오션 글래스 디자인 가드를 한 번 더 적용해 겹침과 화면 밀림을 줄였습니다.
- v2.1.91 전용 검증 스크립트로 버전 동기화, 오프닝 영상 단독 계약, 낚시 아이콘 축소, 결과창/디자인 가드, 플레이어 방향 매핑을 확인합니다.

# AquaFantasia v2.1.90


## v2.1.90 변경사항

- 디자인 우선 패치로 상점/가방/퀘스트/지도/건설/도감/개척/결과창 카드에 프리미엄 오션 글래스 톤, 얇은 광택 테두리, 높은 텍스트 대비, 44px 터치 타겟을 한 번 더 통일했습니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 선반을 v2.1.90 전용 `safe-left + measured shelf` 기준으로 다시 배치해, 아이콘 옆 글씨가 잘리거나 화면 밖으로 밀리는 회귀를 줄였습니다.
- 입질 단계의 `물었다!` 콜아웃을 상단 전용 레인으로 분리하고 게임 설명/보조 배지/최근 포획 UI를 숨겨 미세 겹침을 추가 차단했습니다.
- 낚시 성공 결과창은 등급 배지, 물고기 이미지, 보상 그리드, 액션 버튼을 compact premium modal로 재정리해 모바일 세로 화면에서 아래로 밀리지 않게 보강했습니다.
- 마을 화면 떨림 완화는 플레이어 좌표를 건드리지 않는 paint-only 방식으로 유지하고, 조이스틱 라벨 제거, HUD/개척 간격, 인트로 영상 단독 시작, 오프닝 poster 미사용 계약을 유지했습니다.
- v2.1.90 전용 검증 스크립트로 버전 동기화, ZIP 청결성, 낚시/디자인/성능 가드, 오프닝 poster 미사용, 플레이어 방향 매핑을 확인합니다.

## v2.1.89 변경사항

- 프리미엄 오션 글래스 디자인 레이어를 추가해 상점/메뉴/결과창 카드의 광택, 테두리, 그림자, 텍스트 대비를 한 단계 더 통일했습니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 정보 선반을 v2.1.89 전용 safe-left 기준으로 재배치하고, 장비/미끼 텍스트가 잘리지 않도록 DOM copy 영역과 최소 높이 측정을 보강했습니다.
- 입질 단계의 `물었다!` 콜아웃을 더 위쪽 전용 레인으로 분리하고 게임 설명/보조 배지/최근 포획과 겹치지 않도록 focused phase hide 가드를 강화했습니다.
- 낚시 성공 결과창의 등급 배지, 물고기 이미지, 보상 그리드, 버튼 영역을 compact premium modal로 정리해 모바일 세로 화면에서 아래로 밀리는 현상을 줄였습니다.
- 마을 화면 떨림 완화는 플레이어 좌표를 건드리지 않는 paint-only 방식으로 유지하고, 조이스틱 라벨 제거/오프닝 영상 단독 시작/poster 미사용 계약을 유지했습니다.
- v2.1.89 전용 검증 스크립트로 버전 동기화, ZIP 청결성, 낚시/디자인/성능 가드, 오프닝 poster 미사용, 플레이어 방향 매핑을 확인합니다.

## v2.1.88 변경사항

- 프리미엄 아쿠아 아틀리에 디자인 레이어를 추가해 상점/메뉴/결과창 카드의 광택, 테두리, 그림자, 텍스트 대비를 더 통일했습니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 정보 선반을 화면 폭 안에서 자동 재배치하고, 텍스트가 잘리거나 좌측으로 밀리는 회귀를 더 강하게 막았습니다.
- 입질 단계의 `물었다!` 콜아웃을 전용 상단 레인으로 분리하고, 게임 설명/보조 배지와 겹치지 않도록 focused phase hide 가드를 보강했습니다.
- 낚시 성공 결과창의 등급/이미지/보상/버튼을 compact premium modal로 정리해 작은 세로 화면에서도 아래로 밀리지 않게 했습니다.
- 마을 화면은 플레이어 좌표를 건드리지 않는 paint-only 안정화만 유지하고, 조이스틱 라벨 제거/인트로 영상 단독 시작/poster 미사용/플레이어 8방향 매핑을 계속 보호합니다.
- v2.1.88 전용 검증 스크립트로 버전 동기화, ZIP 청결성, 낚시/디자인/성능 가드, 오프닝 poster 미사용, 플레이어 방향 매핑을 확인합니다.

## v2.1.87 변경사항

- 프리미엄 아쿠아 스킨 카드 디자인 레이어를 추가해 상점/메뉴/결과창의 광택, 테두리, 텍스트 대비, 터치 타겟을 더 통일했습니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 정보 선반을 viewport 안전 폭 기준으로 다시 잡고, 텍스트가 잘리지 않도록 DOM/CSS/런타임 가드를 보강했습니다.
- 입질 콜아웃과 게임 설명/보조 배지가 겹치지 않도록 bite 단계 전용 숨김 및 중앙 상단 레인 배치를 강화했습니다.
- 낚시 성공 결과창은 등급/물고기/보상/버튼 영역이 모바일 세로 화면 안에서 밀리지 않도록 compact premium layout으로 재정리했습니다.
- 마을 화면 떨림을 줄이기 위해 플레이어 좌표를 건드리지 않는 paint-only 안정화와 조이스틱 라벨 제거 회귀 방지, HUD/개척 간격 유지 가드를 추가했습니다.
- v2.1.87 전용 검증 스크립트로 버전 동기화, ZIP 청결성, 인트로 poster 미사용, 플레이어 방향 매핑, 낚시/디자인/성능 가드를 확인합니다.

## v2.1.86 변경사항

- v2.1.85를 기준으로 낚시 준비 화면의 바다물길/낚싯대/미끼 정보가 화면 폭과 실제 텍스트 높이에 맞춰 다시 배치되도록 `v2186` 선반 가드를 추가했습니다. 작은 세로 화면에서도 카드 안 글자가 잘리지 않도록 셀별 최소 높이를 런타임에서 재계산합니다.
- 입질 단계에서는 `물었다!` 콜아웃과 게임 설명/보조 배지가 겹치지 않도록 설명 레이어를 더 강하게 숨기고, 콜아웃의 상단 위치와 내부 스크롤 예산을 재조정했습니다.
- 포획 성공 결과창은 물고기 이미지, 등급 배지, 보상 그리드, 버튼 영역이 한 화면 안에서 더 안정적으로 보이도록 compact-safe 레이아웃과 내부 스크롤을 보강했습니다.
- 낚시 종료 후 남는 게이지/릴 콘솔/터치존 잔상은 낚시 화면 밖에서도 cleanup 되도록 전역 stale UI 정리 패스를 추가했습니다.
- 마을 화면 떨림을 줄이기 위해 캔버스/스테이지에는 위치를 바꾸지 않는 paint 안정화만 적용하고, 조이스틱 글자 제거, HUD/개척 바 간격, 인트로 영상 단독 시작 계약은 유지했습니다.
- v2.1.86 전용 검증 스크립트로 버전 동기화, 패키지 청결성, 낚시 선반/입질/결과창/잔상 cleanup, 플레이어 방향 매핑, 오프닝 poster 미사용 상태를 확인합니다.

## v2.1.85 변경사항

- v2.1.84를 기준으로 낚시 준비 화면의 낚싯대/미끼 정보가 잘리는 문제를 더 근본적으로 줄였습니다. 아이콘 옆 텍스트를 `v2185-loadout-copy` 영역으로 감싸고, 직접 자식 텍스트가 그리드 셀 밖으로 밀리지 않도록 DOM 정규화 패스를 추가했습니다.
- `물었다!` 입질 콜아웃을 중앙보다 조금 더 위쪽의 전용 레인으로 재배치하고, 입질 단계의 게임 방법/보조 설명/최근 포획/액션 배지를 숨겨 작은 겹침까지 줄였습니다.
- 포획 성공 결과창은 등급/리본/물고기 이미지/보상 그리드를 더 compact하게 정리해 모바일 세로 화면에서 아래로 밀리지 않도록 보강했습니다.
- 마을 화면 떨림 완화를 위해 진입 안정화 이후에는 스테이지/캔버스 UI transition을 최소화하고, 조이스틱 글자 제거와 HUD/개척 바 간격 안정화를 유지했습니다.
- visualViewport 기반 레이아웃 변수, 이미지 lazy/async/no-drag, scroll/paint containment, 낚시 잔상 cleanup watchdog을 v2.1.85 전용 검증 스크립트에 추가했습니다.

## v2.1.84 변경사항

- v2.1.83을 기준으로 낚시 준비 화면의 낚싯대/미끼 카드 글자 잘림을 직접 보강했습니다. 이전 작은 칩 규칙의 `height`, `max-height`, `line-clamp`, `overflow hidden`을 후순위 v2.1.84 레이어에서 해제하고, 아이콘과 텍스트를 세로 여유가 있는 프리미엄 아쿠아 카드로 다시 배치했습니다.
- 바다물길 카드와 장비 스택은 safe-left와 visualViewport 폭을 기준으로 다시 계산해 좌측 화면 밖으로 밀리지 않도록 했습니다. 물길 카드의 실제 높이를 측정해 낚싯대/미끼 카드가 그 아래에서 충분한 간격을 확보합니다.
- `물었다!` 입질 콜아웃은 중앙보다 조금 더 위로 올리고, 입질 단계의 게임 방법/보조 설명/액션 배지를 숨겨 신호, 설명, 릴링 시작 버튼이 서로 겹치지 않도록 정리했습니다. 작은 세로 화면에서는 콜아웃 높이와 내부 버튼 크기를 compact 모드로 낮춥니다.
- 낚시 성공 후 결과창은 게임 화면 안에 맞도록 폭/높이/스크롤 예산을 다시 잡았습니다. 물고기 등급 배지와 리본을 작게 정리하고, 보상/마을기금/발전도/관광 영역을 compact 2열 그리드로 낮춰 버튼이 아래로 밀리는 문제를 완화했습니다.
- 낚시 실전이 끝난 뒤 게이지/릴 콘솔/입질 콜아웃 잔상이 남지 않도록 v2.1.84 lifecycle cleanup marker를 추가했습니다. reeling 단계가 아니면 게이지 레인과 릴 콘솔은 숨김 상태를 유지합니다.
- 상점/공통 메뉴/결과창의 아쿠아 카드 톤, 44px 터치 타겟, 입력창 검은 배경 방지, visualViewport 변수, 이미지 lazy/async/no-drag, layout/paint containment 성능 가드를 유지/확장했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 영상 최초 시작 전용 및 poster 미사용 정책을 계속 보존했습니다.

## v2.1.83 변경사항

- v2.1.82를 기준으로 전체 UI 품질과 엔진 안정화를 다시 훑는 quality/system upgrade pass를 추가했습니다. 마을, 낚시, 상점, 결과창, 공통 메뉴의 겹침과 배치 회귀를 한 루프에서 점검합니다.
- 낚시 준비 화면에서 바다물길 카드의 실제 높이를 측정해 낚싯대/미끼 정보 스택의 top 값을 자동으로 다시 잡도록 했습니다. 고정 위치 때문에 장비 카드가 물길 카드와 겹치거나 일부만 보이는 문제를 줄였습니다.
- 낚시 실전 단계가 아닐 때 포획/텐션/저항 게이지, 릴 콘솔, 구형 릴 패널, 터치존, 입질 콜아웃을 숨기는 lifecycle cleanup guard를 보강했습니다. 낚시 후 게이지가 남는 회귀를 한 번 더 막습니다.
- `물었다!` 단계는 중앙보다 약간 높은 위치에 두되, 작은 세로 화면에서는 높이와 내부 스크롤을 제한해 게임 방법/설명/버튼이 서로 겹치지 않도록 했습니다.
- 물고기 포획 결과창은 중앙 고정, 내부 스크롤, 버튼 2열 그리드, 44px 터치 타겟을 유지하면서 긴 물고기명/보상 문구가 버튼을 밀어내지 않도록 카드 예산을 추가했습니다.
- 마을 화면 떨림 방지는 플레이어 좌표를 건드리지 않고 캔버스/스테이지의 불필요한 transition, animation, will-change 잔상을 줄이는 쪽으로 보강했습니다. 조이스틱 글자 제거와 WASD 이동은 그대로 유지합니다.
- 시스템/성능/기술 쪽으로 visualViewport 변수, layout/paint containment, lazy/async/no-drag 이미지 정책, reduced motion 대응, long-frame dataset 플래그를 v2.1.83 레이어로 정리했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 영상 최초 시작 전용 및 poster 미사용 정책을 계속 보존했습니다.

## v2.1.82 변경사항

- v2.1.81을 기준으로 마을 화면 떨림을 줄이는 no-tremble pass를 추가했습니다. 오프닝/마을 진입 직후 카메라 중앙 보정이 soft-follow 타이머를 다시 켜지 않도록 정리해, 플레이어가 중앙에 잡힌 뒤 화면이 미세하게 흔들리는 회귀를 완화했습니다.
- 가상 조이스틱의 `MOVE · WASD` 글씨를 실제 마크업에서 제거하고, 남아 있을 수 있는 이전 힌트 span/가상 라벨도 런타임에서 숨기도록 정리했습니다. WASD 이동 기능은 유지하지만 조이스틱에는 글자 없이 조작판만 남습니다.
- HUD와 개척 바 사이에는 기존보다 +1px 여백을 추가하고, 우측 상단 메뉴바 예약 폭은 유지해 HUD/개척/메뉴가 붙어 보이거나 겹쳐 보이는 문제를 다시 점검했습니다.
- 낚시 준비 화면의 바다물길 정보, 낚싯대 아이콘, 미끼 정보가 좌측 화면 밖으로 밀리지 않도록 safe-left 고정값과 `--v2182-loadout-width`를 적용했습니다. 정보 카드의 2줄 clamp를 풀고 세로 카드 폭/높이를 키워 내용을 보여주다 잘리는 문제를 완화했습니다.
- 낚시를 한 번 끝낸 뒤에도 포획/텐션/저항 게이지나 릴 콘솔이 남는 회귀를 막기 위해, `reeling` 단계가 아닐 때는 battle strip, reel console, reel panel, touch zone을 강제로 숨기는 v2.1.82 gauge cleanup guard를 추가했습니다.
- `물었다!` 입질 단계는 콜아웃을 약간 위로 올리고, 액션 배지/게임 방법 카드/최근 포획/보조 설명을 숨겨 신호와 설명이 겹치지 않게 했습니다. 작은 세로 화면에서는 콜아웃 높이와 위치를 추가로 줄입니다.
- 물고기 포획 결과창은 화면 중앙 고정, 최대 높이 제한, 내부 스크롤, 2열 버튼 그리드, 44px 터치 타겟을 적용해 `계속/가방/도감/마을` 버튼이 서로 어긋나거나 화면 밖으로 나가지 않도록 정리했습니다.
- 게임 시스템/성능/기술 쪽으로 visualViewport 기반 레이아웃 변수, long-frame 플래그, layout/paint containment, motion-reduce 규칙을 유지하면서 이번 낚시/마을 안정화 검증 스크립트를 추가했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 영상 최초 시작 전용 및 poster 미사용 정책을 계속 보존했습니다.

## v2.1.81 변경사항

- v2.1.80을 기준으로 화면 전환 중 UI 겹침을 다시 훑는 content engine upgrade 패스를 추가했습니다. 인트로 영상 단독 시작, 마을 중앙 카메라 안정화, 낚시 실전 레인, 상점/공통 카드 예산을 한 루프에서 점검합니다.
- 오프닝 중에는 영상 외 말풍선, 비네트, 스킵 버튼, 우측 메뉴바, HUD, 하단 도크, 조이스틱이 다시 나타나지 않도록 v2.1.81 video-only contract를 보강했습니다. poster 정지 이미지는 계속 사용하지 않습니다.
- 마을 진입 후 플레이어 중앙 보정은 유지하되, 반복 보정이 이동 조작감을 건드리지 않도록 실제 조작 UI와 분리된 entry-safe 상태만 표시합니다. 플레이어 좌표, 방향 파일명, 8방향 매핑은 변경하지 않았습니다.
- 우측 상단 메뉴바는 2열 x 3행, 34px 버튼, 22px 아이콘, 3px 간격으로 다시 잠그고, HUD/개척 바가 메뉴 아래로 겹쳐 보이지 않도록 폭 예약과 안전 여백을 보강했습니다.
- 낚시 실전 화면은 DOM 측정 기반 v2.1.81 lane collision guard를 추가해 포획/텐션/저항 게이지와 하단 감기 버튼 사이에 최소 간격을 다시 확인합니다. 입질/실전 중 구형 프레임과 최근 포획 조각도 계속 차단합니다.
- 상점, 가방, 퀘스트, 지도, 건설, 도감, 개척, 결과창 계열은 텍스트 title, 2줄 예산, 44px 터치 타겟, 하단 스크롤 안전영역, 입력창 아쿠아 톤을 보강했습니다.
- 게임 시스템/성능/기술 쪽으로 visualViewport 변수, layout/paint containment, 이미지 lazy/async/no-drag, long-frame 플래그, motion-reduce 친화 규칙을 유지/확장했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 영상 최초 시작 전용 정책을 계속 보존했습니다.

## v2.1.80 변경사항

- v2.1.79를 기준으로 마을 진입 후 플레이어가 화면 중앙에서 벗어나는 회귀를 막는 camera stability guard를 유지하되, 반복 보정이 조작감을 건드리지 않도록 진입 직후 1회성 확인 패스로 정리했습니다.
- 시작 로딩 진입 시 오프닝 영상만 전체화면으로 보이는 계약을 계속 유지했습니다. 말풍선, 비네트, 스킵 버튼, 우측 메뉴바, HUD, 하단 도크, 조이스틱은 오프닝 중 차단하고 `poster`는 사용하지 않습니다.
- 낚시 실전 화면은 v2.1.80 stability content engine lane watchdog으로 게이지 영역과 하단 감기 버튼 예약 영역을 다시 계산합니다. 작은 세로 화면에서도 포획/텐션/저항 게이지가 감기 버튼과 겹치지 않도록 `--v2180-gauge-top`, `--v2180-reel-console-height`, `--v2180-safe-lane-height`를 동기화합니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 카드와 입질 중앙 콜아웃은 읽기 폭, 텍스트 예산, z-index를 다시 정리해 상단 HUD나 설명 배지와 겹치지 않게 했습니다.
- 상점, 가방, 퀘스트, 지도, 건설, 도감, 개척, 결과창 계열은 premium aqua card budget을 한 번 더 적용해 긴 이름/설명/태그/가격 버튼이 서로 가리지 않도록 보강했습니다.
- 게임 시스템/성능/기술 쪽으로 visualViewport 기반 모바일 안전 변수, requestAnimationFrame 배치 감사, long-frame 플래그, 이미지 lazy/async/no-drag, layout/paint containment, 터치 타겟 안정화 레이어를 유지/확장했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 영상 최초 시작 전용 정책을 계속 보존했습니다.

## v2.1.79 변경사항

- 마을 진입 후 플레이어 중앙 재정렬 가드를 추가해 오프닝 영상 종료/직접 진입/리사이즈 뒤 캐릭터가 화면 중앙에서 밀리는 문제를 보정했습니다.

- v2.1.78을 기준으로 시작 로딩 진입 시 오프닝 영상만 전체화면으로 보이는 계약을 다시 보존했습니다. 오프닝 중 말풍선, 비네트, 스킵 버튼, 우측 메뉴바, HUD, 하단 도크, 조이스틱은 계속 숨기고 `poster`는 사용하지 않습니다.
- 낚시 실전 화면은 v2.1.79 premium interaction engine으로 한 번 더 분리했습니다. 포획/텐션/저항 게이지는 중앙 위쪽 안전 레인에, 단일 감기 버튼은 하단 안전영역에 고정하고 visualViewport 높이에 따라 버튼 예약 높이와 게이지 여유 공간을 다시 계산합니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 정보 스택은 왼쪽 위에 넓게 유지하고, 입질/실전 단계에서는 최근 포획, 장비칩, 구형 프레임, 예전 게이지 조각이 신호나 게이지를 덮지 않도록 추가 차단했습니다.
- 상점, 가방, 퀘스트, 지도, 건설, 도감, 개척, 결과창 계열은 프리미엄 아쿠아 카드 톤과 텍스트 예산을 재정리했습니다. 긴 이름/설명/태그/가격 버튼이 서로 겹치지 않도록 title, 2줄 가독성, 스크롤 하단 안전영역을 보강했습니다.
- 게임 시스템/성능/기술 쪽으로 `document.hidden` 상태에서는 후순위 레이아웃 감사를 건너뛰고, 이미지 lazy/async/no-drag, contain, overscroll containment, 44px 터치 타겟 안정화 레이어를 유지했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 영상 최초 시작 전용 정책을 계속 보존했습니다.

## v2.1.78 변경사항

- v2.1.77을 기준으로 시작 로딩 진입 시 인트로 영상만 보이는 계약을 그대로 유지했습니다. 오프닝 중 말풍선, 비네트, 스킵 버튼, 우측 메뉴바, HUD, 하단 도크, 조이스틱은 계속 차단하고 `poster`도 사용하지 않습니다.
- 낚시 실전 화면의 포획/텐션/저항 게이지와 하단 단일 감기 버튼 사이에 v2.1.78 adaptive lane guard를 추가했습니다. visualViewport 높이에 따라 게이지 상단 위치와 버튼 예약 높이를 계산해 작은 세로 화면에서도 서로 겹치지 않도록 보강했습니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 정보 스택은 왼쪽 위에 넓게 고정하고, 실전/입질 단계에서는 장비칩, 최근 포획, 액션 배지, 구형 게이지 조각이 신호나 실전 게이지를 덮지 않도록 숨김 규칙을 다시 정리했습니다.
- 상점, 가방, 퀘스트, 지도, 건설, 도감, 개척, 결과창 계열 카드는 `premium mobile readable budget`을 적용해 긴 이름/설명/태그/가격 버튼이 서로 겹치지 않도록 title, 2줄 텍스트 예산, 스크롤 하단 안전영역을 보강했습니다.
- 게임 시스템/성능/기술 쪽으로 화면 상태 dataset, long-frame 감지 플래그, 이미지 lazy/async/no-drag, content-visibility/containment, overscroll containment, 터치 타겟 안정화 레이어를 추가했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 영상 최초 시작 전용 정책을 계속 보존했습니다.

## v2.1.77 변경사항

- 시작 인트로를 로딩 진입 즉시 전체화면 영상만 보이도록 복구했습니다.
- 오프닝 중 말풍선, 비네트, 스킵 버튼, 우측 메뉴바, HUD, 하단 도크, 조이스틱이 보이지 않도록 차단했습니다.
- `게임 진입중` 상태 말풍선이 화면 밖으로 밀리는 회귀를 막기 위해 숨김/안전 폭 규칙을 추가했습니다.
- 오프닝 영상은 poster 없이 `aqua_opening_v2120.mp4`만 사용하며, `preload`를 추가해 첫 프레임 지연을 줄였습니다.
- 낚시/상점/공통 카드/입력창/이미지 정책의 v2.1.76 안정화 레이어는 유지했습니다.

## v2.1.76 변경사항

- v2.1.75를 기준으로 전체 화면의 겹침/배치/배정 문제를 다시 훑는 quality composition sweep을 추가했습니다. 오프닝/마을/낚시/메뉴 전환 중 UI 크롬이 잘못 남지 않도록 후순위 게이트를 한 번 더 보강했습니다.
- 낚시 실전 화면은 포획/텐션/저항 게이지와 하단 감기 버튼 사이에 `no-overlap reserve`를 적용했습니다. 버튼 높이를 CSS 변수로 잡고 게이지 레인은 중앙 위쪽에 고정해 작은 세로 화면에서도 서로 겹치지 않게 했습니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 스택은 왼쪽 위 정보 블록으로 유지하되, 카드 폭/아이콘/글자 줄바꿈 예산을 더 넓혀 테두리 안에서 내용이 잘리지 않도록 다듬었습니다.
- 상점/가방/퀘스트/지도/건설/도감/개척/종료 팝업 계열은 카드 제목, 설명, 배지, 가격 버튼이 서로 덮지 않도록 `title` 보강과 2줄 텍스트 예산, 하단 스크롤 안전영역을 다시 적용했습니다.
- 게임 시스템/성능/기술 쪽으로 visualViewport 기반 `--v2176-reel-console-height`, `--v2176-gauge-top`, `--v2176-scroll-safe-bottom` 변수를 추가하고, 이미지 decode/no-drag/lazy 정책과 layout/paint containment를 유지했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 poster 미사용 정책은 계속 보존했습니다.

## v2.1.75 변경사항

- v2.1.74를 기준으로 전체 화면 전환과 UI 레이어를 다시 훑는 polish engine sweep을 추가했습니다. 오프닝 잔상, 마을 진입 전 조작 UI 노출, 낚시 화면 하단 메뉴 노출을 후순위 런타임 게이트에서 한 번 더 차단합니다.
- 낚시 실전 화면은 포획/텐션/저항 게이지가 중앙 위쪽 전용 레인에 남고, 단일 감기 버튼은 하단 안전영역에만 위치하도록 v2.1.75 lane watchdog을 추가했습니다. 작은 세로 화면에서는 게이지 높이와 버튼 높이를 함께 줄여 서로 밀리지 않게 했습니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 정보 스택은 왼쪽 위에서 더 넓고 읽기 쉬운 카드로 보정했습니다. 입질 단계에서는 물었다 신호와 설명/시작 버튼만 중앙 콜아웃에 남고 주변 보조 UI가 겹치지 않도록 정리했습니다.
- 상점/가방/퀘스트/지도/건설/건물상세/개척/종료 팝업 계열 메뉴 페이지에 프리미엄 아쿠아 카드 톤, 우측 상단 닫기 버튼, 하단 스크롤 안전영역, 가격/태그/텍스트 가림 방지 규칙을 다시 보강했습니다.
- 게임 시스템/성능/기술 쪽으로 requestAnimationFrame 기반 레이아웃 감사 루프, visualViewport CSS 변수, 이미지 lazy/async/no-drag 정책, content-visibility/contain, 긴 프레임 감지용 dataset, pointer state 정리 보조 레이어를 추가했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 poster 미사용 정책은 계속 보존했습니다.

## v2.1.74 변경사항

- v2.1.73을 기준으로 오프닝 종료 후 남을 수 있는 영상 레이어 잔상을 제거했습니다. 마을 준비 완료 시 `.v2173-opening-cinematic`을 정리하고, 우측 상단 메뉴/HUD/도크는 오프닝 중에만 숨겼다가 마을 화면에서만 복구되도록 v2.1.74 gate sweep을 추가했습니다.
- 낚시 실전 화면은 게이지 전용 중앙 위 레인과 하단 단일 감기 버튼 레인을 다시 분리했습니다. 작은 세로 화면에서도 포획/텐션/저항 게이지가 버튼 위로 눌려 내려오지 않게 v2.1.74 safe lane 값을 보강했습니다.
- 낚시 준비 화면의 바다물길, 낚싯대, 미끼 카드는 왼쪽 위 정보 스택으로 유지하되 글자 영역을 넓히고 아이콘/텍스트가 좁은 테두리에 묻히지 않도록 카드 높이와 줄바꿈 예산을 늘렸습니다.
- `물었다!` 입질 신호, 설명, 릴링 시작 버튼은 중앙 콜아웃 하나 안에서만 보이도록 정리하고, 입질 중에는 장비칩/최근 포획/상단 보조 설명이 겹치지 않게 추가 차단했습니다.
- 상점, 가방, 퀘스트, 지도, 건설, 건물상세, 캐릭터/개척 정보 페이지의 하단 스크롤 안전영역, 아쿠아 카드 톤, 닫기 버튼, 입력창 검은 배경 방지, 하단 도크 아이콘 클리핑을 한 번 더 보강했습니다.
- 게임 시스템/성능/엔진 쪽으로 requestAnimationFrame 기반 layout sweep, 이미지 lazy/async/no-drag 정책, content-visibility/containment, opening overlay cleanup, safe viewport CSS 변수를 추가해 모바일 세로 화면의 전환 흔들림과 과도한 재배치를 줄였습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산, 타일 픽셀 크기 유지, 오프닝 poster 미사용 정책은 계속 보존했습니다.

## v2.1.73 변경사항

- v2.1.72을 기준으로 시작 인트로 영상 앞에 잠깐 보이던 어두운 프리프레임을 밝은 아쿠아 게이트로 교체했습니다. 영상 태그의 poster는 계속 사용하지 않으며, 첫 프레임이 준비되기 전에는 검은 화면 대신 산뜻한 물빛 배경만 보이도록 했습니다.
- 최초 마을 진입 전 오프닝 중에는 우측 상단 2열 x 3행 메뉴바, HUD, 개척 바, 조이스틱, 하단 도크가 나타나지 않도록 opening gate hard lock을 추가했습니다. 마을 로딩이 끝난 뒤에만 마을 조작 UI가 복구됩니다.
- 오프닝 영상은 최초 시작 로딩 전용 정책을 유지하고, 홈/닫기/메뉴 복귀/마을 이동과 연결하지 않았습니다. 큰 카드 테두리/프레임/장식 오버레이와 poster 정지 이미지는 다시 넣지 않았습니다.
- 낚시 실전 게이지/하단 감기 버튼 분리, 낚싯대/미끼 카드, 입질 중앙 콜아웃, 상점 구매 토스트, WASD 8방향 이동, 상점/공통 카드 톤, 건설 확인 플로우를 유지하면서 전체 겹침/배치 회귀 방지 규칙을 보강했습니다.
- 게임 시스템/성능/엔진 쪽으로 오프닝 미디어 ready/fallback 상태 분기, MutationObserver 기반 village chrome gate, viewport CSS 변수, 이미지 decode async/no-drag 정책을 추가해 모바일 세로 화면에서 전환 흔들림을 줄였습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, east/west 및 대각 방향 flip/alias 금지, NPC 방향 자산 검사, 타일 픽셀 크기 유지 정책을 계속 보존했습니다.

## v2.1.72 변경사항

- v2.1.71을 기준으로 낚시 실전 레이어를 한 번 더 분리했습니다. 포획/텐션/저항 게이지는 중앙 위쪽 전용 안전 레인에 고정하고, 단일 감기 버튼은 하단 안전영역에 고정해 서로 겹치지 않도록 v2.1.72 hard lock을 추가했습니다.
- 바다물길 카드와 낚싯대/미끼 장비칩은 준비 단계에서 왼쪽 위 정보 스택으로 정돈하고, 실전/입질 단계에서는 불필요한 상단 카드가 신호와 게이지를 덮지 않도록 숨김 규칙을 강화했습니다.
- 입질 신호는 중앙 콜아웃 하나만 보이도록 `물었다!` 제목/설명/릴링 시작 버튼의 줄바꿈과 z-index를 정리해 설명이 겹쳐 나오는 문제를 차단했습니다.
- 상점, 가방, 퀘스트, 지도, 건설, 건물상세, 캐릭터/개척 정보 페이지에 공통 아쿠아 카드 텍스트 예산과 하단 스크롤 안전영역을 다시 적용했습니다. 상점 태그/이름/설명/가격 버튼은 서로 덮지 않도록 v2.1.72 카드 그리드로 보정했습니다.
- 게임 시스템/성능/엔진 쪽으로 requestAnimationFrame 기반 UI 감사 루프, viewport CSS 변수, 카드 content-visibility/containment, 이미지 lazy/async/no-drag, 터치 조작 overscroll 차단, 낚시 레이어 paint 격리를 추가했습니다.
- 건설 확인형 플로우, 하단 도크 아이콘 클리핑, 우측 상단 2열 x 3행 메뉴바, WASD 8방향 이동, 구매 완료 토스트, 플레이어 8방향 32프레임 방향 파일명/매핑, NPC 방향 자산, 오프닝 영상 최초 시작 전용 및 poster 제거 상태를 유지했습니다.

## v2.1.71 변경사항

- v2.1.70을 기준으로 낚시 실전 자리 배치를 다시 설계했습니다. 감기 버튼은 하단 안전영역에 고정하고, 포획/텐션/저항 게이지는 중앙 위쪽 전용 레이어로 올려 버튼과 겹치지 않도록 분리했습니다.
- 낚시 준비 화면의 바다물길 카드를 왼쪽 위에 넓게 고정하고, 낚싯대/미끼 아이콘 칩을 그 아래 한 줄씩 읽히는 카드로 재배치했습니다. 작은 테두리 때문에 글자가 안 보이는 회귀를 막도록 칩 높이와 텍스트 예산을 늘렸습니다.
- 입질 단계의 `물었다!` 신호와 설명이 서로 겹치지 않도록 하나의 중앙 아쿠아 콜아웃으로 통합하고, 입질 중에는 장비칩/상단 설명/액션 배지를 숨겨 신호만 또렷하게 보이도록 했습니다.
- 낚시 화면의 구형 프레임, 예전 게이지 이미지, 소품 조각, 하단 마을 메뉴는 v2.1.71 레이어에서 다시 차단했습니다.
- 시스템/성능 쪽으로 viewport 지표 CSS 변수, 이미지 async/no-drag 처리, 카드 단위 layout/paint/style containment, 낚시 스테이지 레이어 격리를 추가해 모바일 세로 화면에서 불필요한 재배치와 흔들림을 줄였습니다.
- 상점 구매 토스트, WASD 8방향 이동, 상점/공통 카드 톤, 건설 확인 플로우, 플레이어 8방향 32프레임 방향 파일명/매핑, NPC 방향 자산, 오프닝 영상 최초 시작 전용 및 poster 제거 상태를 유지했습니다.

## v2.1.70 변경사항

- v2.1.69를 기준으로 상단 메뉴, 낚시 실전, 상점 카드, 공통 메뉴 페이지, 건설 확인 팝업을 한 번 더 훑는 프리미엄 아쿠아 레이아웃 정리 레이어를 추가했습니다.
- 우측 상단 메뉴바는 2열 x 3행, 34px 버튼, 22px 아이콘, 3px 간격을 v2.1.70 hard lock으로 다시 고정하고 큰 배경 프레임/3중 테두리/터치 흔들림 회귀를 차단했습니다.
- 낚시 준비 화면에서는 낚싯대/미끼 칩을 상단 HUD와 분리한 안전 스택으로 유지하고, 실전 단계에서는 준비 UI를 숨긴 뒤 포획/텐션/저항 게이지와 단일 감기 버튼 사이 간격을 더 확보했습니다.
- 상점 카드의 태그, 아이템명, 설명, 가격 버튼을 v2.1.70 텍스트 예산으로 다시 분리해 긴 문구가 버튼이나 배지를 덮지 않도록 했습니다.
- 가방, 퀘스트, 지도, 상점, 건설, 건물상세, 캐릭터/개척 정보 계열 공통 메뉴 페이지의 아쿠아 카드 톤, 스크롤 하단 안전영역, 입력창 검은 배경 방지를 재보강했습니다.
- 건설 트레이와 중앙 확인 팝업은 기존 선택 → 반투명 프리뷰 → 타일 선택 → 작은 확인 팝업 → 건설/취소 플로우를 유지하면서 카드 폭, 버튼 간격, 텍스트 가독성을 정리했습니다.
- 하단 홈/가방/퀘스트/지도 도크는 아이콘 PNG 조각 노출을 막도록 overflow/contain/clip과 눌림 transform 차단을 다시 적용했습니다. 낚시 화면에서는 계속 숨깁니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, flip/alias 금지, NPC 방향 자산, 오프닝 영상 최초 시작 전용 및 poster 제거 상태를 유지했습니다.

## v2.1.69 변경사항

- 마을 조이스틱과 동일한 이동 벡터로 WASD 키보드 이동을 추가했습니다. A/D/W/S 단독 이동과 AW 11시, WD 1시, AS 7시, SD 5시 대각 이동을 지원하며 플레이어 8방향 파일명/매핑은 그대로 유지합니다.
- 상점 물품 구매 시 긴 액션 버튼이 붙은 알림 대신 간략한 중앙 아쿠아 토스트로 `구매 완료`가 즉시 표시되도록 조정했습니다. 태그/이름/가격 버튼의 가림 방지도 유지합니다.
- 낚시 준비 화면의 낚싯대/미끼 아이콘 칩을 상단 HUD와 겹치지 않는 2칩 그리드로 재배치하고, 작은 세로 화면에서 줄임/간격을 보강했습니다.
- 캐스팅 메시지 액션 배지를 화면 정중앙 아쿠아 카드 톤으로 이동하고, 낚시 실전의 포획/텐션/저항 게이지를 감기 버튼보다 더 위로 올려 버튼과 겹치지 않게 했습니다.
- 물고기 포획 결과창의 계속/가방/도감/마을 버튼을 같은 아쿠아 버튼 계열로 통일하고, 마을 버튼만 이질적으로 보이는 회귀를 차단했습니다.
- 낚시 화면의 하단 마을 메뉴 차단, 플레이어 8방향 32프레임 방향 파일명/매핑, NPC 방향 자산, 오프닝 영상 최초 시작 전용 및 poster 제거 상태를 유지했습니다.

## v2.1.68 변경사항

- v2.1.67을 기준으로 작은 세로 화면에서 낚시 실전 게이지와 단일 감기 버튼이 아래 안전영역에 몰리지 않도록 v2.1.68 compact cockpit 레이어를 추가했습니다. 포획/텐션/저항 게이지는 버튼 위에 고정하고, 실전 단계에서는 준비 UI와 구형 조각을 계속 차단합니다.
- 우측 상단 메뉴바는 2열 x 3행, 34px 버튼, 22px 아이콘, 3px 간격 기준을 유지하면서 실제 DOM inline lock과 CSS 변수를 v2.1.68에서 다시 동기화했습니다. 큰 배경 프레임과 3중 테두리는 계속 제거합니다.
- 하단 홈/가방/퀘스트/지도 도크는 모든 메뉴 페이지에서 같은 위치와 크기를 유지하도록 클릭/터치 transform, PNG 여백, overflow/contain/clip 회귀 방지 속성을 한 번 더 보강했습니다. 낚시 화면에서는 계속 숨깁니다.
- 상점/가방/도감/최근 포획/자동 판매 카드에 긴 이름과 설명이 들어와도 가격 버튼, 배지, 이미지와 겹치지 않도록 줄바꿈·말줄임·title 텍스트 예산을 확장했습니다.
- 개척/HUD/건설 확인 팝업/공통 메뉴 페이지에는 아쿠아 스킨 카드 톤과 닫기 버튼/입력창/스크롤 하단 여백을 v2.1.68 레이어로 재정리했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, NPC 방향 자산, 오프닝 영상 최초 시작 전용 및 poster 제거 상태를 유지했습니다.

## v2.1.67 변경사항

- 우측 상단 메뉴바를 2열 x 3행 구조로 유지하면서 34px 버튼, 22px 아이콘, 3px 간격의 v2.1.67 hard lock 레이어로 정리해 큰 배경 프레임과 3중 테두리 회귀를 차단했습니다. 작은 화면에서는 32px/21px 기준으로 자동 보정합니다.
- 낚시 준비 단계는 바다물길/낚싯대/미끼/캐스팅 중심으로 분리하고, 실전 단계에서는 포획/텐션/저항 게이지와 하나의 큰 `누르고 찌 감기 / 떼면 자동 풀기` 버튼이 하단 안전영역 안에 고정되도록 다시 정리했습니다. 낚시 화면에서는 마을 하단 메뉴를 계속 차단합니다.
- 상점 카드의 추천/강화/안정/안전 태그를 골드 배지 레이어로 고정하고 아이템명/설명/가격 버튼의 줄바꿈·말줄임 예산을 재조정해 서로 덮이지 않도록 했습니다.
- 가방, 퀘스트, 지도, 상점, 건설, 건물상세, 캐릭터/개척 정보 등 공통 메뉴 페이지에 프리미엄 아쿠아 카드 톤, 닫기/입력/스크롤/하단 도크 안전영역 보강 레이어를 추가했습니다.
- 하단 홈/가방/퀘스트/지도 도크는 PNG 조각이 새지 않도록 overflow/contain/clip을 재고정하고, 페이지 전환/터치 시 밀림이 생기지 않도록 transform 흔들림을 차단했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, NPC 방향 자산, 오프닝 영상 최초 시작 전용 및 poster 제거 상태를 유지했습니다.

## v2.1.66 변경사항

- 우측 상단 메뉴바가 마을 일반 화면에서 사라지는 회귀를 보정했습니다. 건설/개척/설치 확인 패널이 실제로 열렸을 때만 숨기고, 닫힌 상태에서는 inline style까지 복구해 2열 x 3행 메뉴가 다시 보이도록 했습니다.
- 우측 상단 메뉴바를 38px 버튼, 25px 아이콘 기준으로 소폭 확대하고 큰 배경 프레임 없이 1중 반투명 테두리만 남겼습니다.
- HUD 바 색감을 더 프리미엄 아쿠아 카드 톤으로 다듬고, 개척 접이식 바와의 간격을 조밀하게 다시 정리했습니다.
- 가방의 최근 포획 원장과 자동 판매 루프에서 긴 물고기명/정산 문구/도감 이미지가 영역을 벗어나지 않도록 카드 그리드, 줄바꿈, 이미지 크기 예산을 보강했습니다.
- 낚시 준비 화면의 낚싯대/미끼 표기와 중앙 토스트, 상점 구매 알림의 표시 안정성을 유지했습니다.
- 플레이어 8방향 32프레임 방향 파일명/매핑, NPC 방향 자산, 오프닝 영상 poster 제거 상태를 유지했습니다.

## v2.1.65 변경사항

- v2.1.64 후속 품질 스윕으로 HUD와 개척 접이식 바 사이의 시각적 여백을 더 조밀하게 정리하고, 우측 상단 메뉴바의 2열 x 3행 구조와 36px 버튼/24px 아이콘 기준을 유지했습니다.
- 건설 트레이, 설치 확인 팝업, 개척 패널 상태를 MutationObserver와 실제 DOM 표시 상태로 다시 확인해 우측 상단 메뉴바가 열린 패널 위에 남지 않도록 숨김 가드를 보강했습니다.
- 낚시 준비 화면의 바다물길/낚싯대/미끼 영역은 작은 세로 화면에서도 줄바꿈과 말줄임이 안정적으로 동작하도록 loadout 셀 텍스트 예산을 다시 잡았습니다.
- 가방 최근 포획 원장, 자동 판매 루프, 물고기 도감은 긴 물고기명과 정산 문구가 카드 밖으로 나가지 않도록 2줄 표시, 툴팁 title, 이미지 크기 예산을 보강했습니다.
- 상점 카드의 태그/이름/설명/가격 버튼은 서로 덮지 않도록 grid 폭, 배지 위치, 가격 버튼 최소 폭을 재정리하고 구매/보상 중앙 토스트 줄바꿈 안정성을 유지했습니다.
- 런타임 메뉴 페이지의 공통 아쿠아 카드, 닫기 버튼, 하단 스크롤 안전영역, 이미지 lazy/async 정책을 v2.1.65 레이어에서 다시 정리했습니다.
- 플레이어 8방향 32프레임, 방향 파일명 매핑, flip/alias 금지, NPC 방향 자산, 오프닝 영상 최초 시작 전용 및 poster 제거 상태는 유지했습니다.

## v2.1.64 변경사항

- v2.1.63 후속 품질 스윕으로 HUD와 개척 접이식 바의 상단 간격을 다시 조밀하게 정리하고, 우측 상단 메뉴바는 2열 x 3행 구조를 유지한 채 버튼 36px, 아이콘 24px로 한 단계만 더 보정했습니다.
- 건설 트레이, 개척 패널, 설치 확인 팝업 상태에서 우측 상단 메뉴바가 다시 보이지 않도록 body/root 클래스와 실제 DOM 상태를 함께 보는 v2.1.64 런타임 숨김 가드를 추가했습니다.
- 낚시 준비 화면의 낚싯대/미끼/바다물길 영역이 작은 세로 화면에서도 잘리지 않게 상단 안전영역, 줄바꿈, 셀 최소 폭을 재정리했습니다.
- 가방 최근 포획 원장과 자동 판매 루프는 긴 물고기명, 긴 정산 문구, 골드 배지가 서로 밀지 않도록 카드 grid와 글자 줄바꿈 규칙을 보강했습니다.
- 물고기 도감과 자동판매 카드의 물고기 이미지를 조금 더 줄이고 이미지 렌더링 예산을 제한해 텍스트 영역을 더 안정적으로 확보했습니다.
- 상점 구매/무료 보상 토스트는 중앙 아쿠아 카드 톤을 유지하면서 문구가 길어도 카드 밖으로 나가지 않도록 최대 폭과 줄바꿈을 보강했습니다.
- 플레이어 8방향 32프레임, 방향 파일명 매핑, flip/alias 금지, 오프닝 영상 최초 시작 전용 및 poster 제거 상태는 유지했습니다.

## v2.1.63 변경사항

- HUD와 개척 바 사이의 빈 여백을 줄이고, 우측 상단 메뉴바는 2열 x 3행 구조를 유지하면서 버튼을 35px, 아이콘을 23px로 조금 키웠습니다.
- 건설 트레이와 개척 패널이 열린 상태에서는 우측 상단 마을 메뉴바가 사라지도록 v2.1.63 숨김 가드를 추가했습니다.
- 낚시 준비 화면에서 낚싯대/미끼 표기가 잘리지 않도록 장비 스트립 폭, 셀 구조, 글자 말줄임을 다시 정리했습니다.
- 미끼 부족, 보충, 구매 완료 등 안내 토스트를 상단이 아니라 화면 중앙의 작은 아쿠아 카드로 표시하도록 토스트 매니저를 복구했습니다.
- 가방의 최근 포획 원장에서 긴 물고기명이 잘리지 않도록 2줄 표시와 카드 그리드를 보강하고, 자동 판매 루프의 글자 범위 이탈과 물고기 이미지 과대 표시를 줄였습니다.
- 물고기 도감 카드의 물고기 이미지를 한 단계 더 줄여 카드 글자와 설명 영역을 더 안정적으로 확보했습니다.
- 플레이어 8방향 32프레임, 방향 파일명 매핑, 오프닝 영상 최초 시작 전용 및 poster 제거 상태는 유지했습니다.

## v2.1.62 변경사항

- 낚시게임 UI 폼과 멘트를 다시 점검해 `물었다! 뿅!`, `캐스팅 시작`, `누르고 찌 감기`, `떼면 자동 풀기`, `포획/텐션/저항` 문구가 단계별로 더 명확하게 보이도록 정리했습니다.
- 낚시 준비/실전 화면의 겹침을 줄이기 위해 v2.1.62 후순위 레이어를 추가하고, 실전 게이지와 단일 감기 버튼이 하단 안전영역 안에서 우선 보이도록 다시 고정했습니다.
- HUD, 개척 바, 우측 상단 메뉴바, 하단 메뉴 아이콘의 배치/간격/테두리 회귀를 점검하고 2열 x 3행, 32px 버튼, 21px 아이콘, 3px 간격 메뉴바 기준을 v2.1.62에서도 유지합니다.
- 가방, 퀘스트, 지도, 상점, 건설, 건물상세, 캐릭정보, 개척정보, 종료팝업 계열 공통 메뉴 페이지에 아쿠아 카드 톤, 스크롤 하단 여백, 닫기 버튼, 입력창/버튼 가독성 보강 레이어를 추가했습니다.
- 물고기 도감의 물고기 이미지를 한 단계 더 줄이고 `loading=lazy`, `decoding=async`, 드래그 방지 속성을 적용해 카드 안에서 이미지가 글자와 겹치지 않게 조정했습니다.
- 시스템/엔진 품질 스윕 가드를 추가해 화면 리사이즈, 복귀, 숨김 전환, 낚시 화면 진입 시 입력 잔상과 하단 메뉴 노출을 정리하고 이미지 디코딩/로딩 정책을 보강했습니다.
- 플레이어 8방향 32프레임, 방향 파일명, flip/alias 금지, NPC 방향 자산, 오프닝 최초 시작 전용 및 poster 제거 상태는 그대로 유지합니다.

## v2.1.61 변경사항

- 낚시게임 입질 순간에 `물었다!`와 `뿅!` 멘트가 화면 중앙에 확실히 뜨도록 v2.1.61 전용 중앙 콜아웃을 추가했습니다.
- 낚시 UI 폼 문구를 `캐스팅 시작`, `물었다!`, `누르고 찌 감기`, `떼면 자동 풀기`, `포획/텐션/저항` 흐름으로 다시 맞춰 실전 단계에서 읽기 쉽게 정리했습니다.
- 낚시 실전 게이지와 단일 감기 버튼은 하단 안전영역 안에 고정하고, 구형 카드/소품/게이지 조각이 중앙 멘트 위로 올라오지 않도록 후순위 레이어를 보강했습니다.
- 시스템 점검용 v2.1.61 안정성 가드를 추가해 화면 복귀/리사이즈/숨김 전환 시 입력 상태를 정리하고 불필요한 릴 입력 잔상을 줄였습니다.
- 물고기 도감 카드의 물고기 이미지를 더 작고 균형 있게 표시하도록 카드 이미지 크기, 여백, object-fit 규칙을 재조정했습니다.
- HUD와 우측 상단 메뉴바는 기존 2열 x 3행, 32px 버튼, 21px 아이콘, 3px 간격을 유지하면서 v2.1.61에서도 겹침/테두리/프레임 회귀를 막도록 재확인했습니다.
- 플레이어 8방향 32프레임, 방향 파일명, flip/alias 금지, NPC 방향 자산, 오프닝 최초 시작 전용 및 poster 제거 상태는 그대로 유지합니다.

## v2.1.60 변경사항

- 낚시 실전 단계에서 포획/텐션/저항 게이지와 단일 감기 버튼이 모바일 세로 안전영역 안에 항상 보이도록 v2.1.60 후순위 레이어를 추가했습니다.
- 낚시 준비 단계는 바다물길/장비/캐스팅 정보만 남기고, 입질 후 실전 단계에서는 구형 카드/게이지/소품 조각이 새 UI 위로 올라오지 않도록 차단했습니다.
- HUD와 개척 바는 우측 상단 메뉴바와 겹치지 않도록 폭, 간격, z-index를 다시 정리하고 아쿠아 스킨 카드 톤을 유지했습니다.
- 우측 상단 메뉴바는 2열 x 3행, 32px 버튼, 21px 아이콘, 3px 간격을 유지하면서 실제 DOM 클래스와 inline hard lock을 v2.1.60으로 재확인했습니다. 큰 배경/테이블 프레임은 계속 제거하고 1중 반투명 테두리만 남깁니다.
- 메뉴/상점/하단 아이콘은 overflow/contain/clip과 텍스트 줄바꿈 규칙을 보강해 겹침, 흔들림, 아이콘 조각 노출을 줄였습니다.
- 플레이어 8방향 32프레임, 방향 파일명, flip/alias 금지, NPC 방향 자산, 오프닝 최초 시작 전용 및 poster 제거 상태는 그대로 유지합니다.

## v2.1.59 변경사항

- 전체 UI에 프리미엄 아쿠아 스킨 카드 톤을 추가 보강했습니다. 메뉴 페이지, 닫기 버튼, 입력창, 카드/탭/스크롤 영역이 같은 청량한 판타지 MMORPG 톤으로 보이도록 후순위 CSS 레이어를 추가했습니다.
- 우측 상단 메뉴바는 기존 v2.1.58 기준을 유지하되, 실제 DOM에 v2.1.59 hard lock 클래스를 추가해 2열 x 3행, 32px 버튼, 21px 아이콘, 3px 간격, 큰 배경 프레임 제거, 1중 반투명 테두리를 다시 고정했습니다.
- 낚시 준비 UI는 바다물길/장비/캐스팅만 보이게 정리하고, 실전 단계에서는 포획/텐션/저항 게이지와 하나의 큰 감기 버튼이 안전영역 안에 항상 보이도록 보강했습니다. 낚시 화면에서는 마을 하단 메뉴를 계속 차단합니다.
- 상점 카드는 추천/강화/안정/안전 태그, 아이템명/설명, 가격 버튼이 서로 덮지 않도록 grid 폭과 배지 레이어를 재정리했습니다.
- 하단 홈/가방/퀘스트/지도 메뉴는 모든 페이지에서 같은 위치/크기/간격을 유지하고, 아이콘 조각이 새지 않도록 overflow/contain/clip을 다시 고정했습니다.
- 개척/HUD/페이지 카드 영역은 덩그러닌 텍스트가 보이지 않도록 배지/카드/버튼 톤을 보강했습니다.
- 플레이어 8방향 32프레임, 방향 파일명, flip/alias 금지, 오프닝 최초 시작 전용 및 poster 제거 상태는 그대로 유지합니다.

## v2.1.58 변경사항

- 우측 상단 메뉴바를 너무 작아진 20px 마이크로 상태에서 2열 x 3행 균형형으로 재조정했습니다. 버튼은 32px, 아이콘은 21px, 버튼 간격은 3px 기준으로 정리합니다.
- 뒤쪽 큰 테이블/배경 프레임은 계속 제거하고, 아이콘 주변 얇은 반투명 1중 셀만 유지합니다.
- 상점 카드의 추천/강화/안정/안전 태그가 배경에 묻히지 않도록 상단 고정 배지 레이어와 텍스트/가격 영역 분리를 보강했습니다.
- 낚시터 준비 화면의 상단 UI를 줄여 바다물길/장비/캐스팅 중심으로 정리하고, 릴링 실전 단계는 게이지와 단일 조작 버튼 중심으로 단순화했습니다.
- 낚시 실전 조작은 '누르고 찌 감기, 떼면 자동 풀기' 흐름으로 보이게 정리했습니다. 별도 풀기 버튼은 실전 UI에서 숨깁니다.
- 게임 접속 오프닝에서 영상 전에 보이던 poster 정지 이미지를 제거했습니다. 오프닝은 최초 시작 전용 영상만 표시합니다.
- 타일 픽셀 크기는 유지합니다. v2.1.58은 다이아몬드 터치 점수만 `0.926`으로 소폭 조정하며, 타일 축소는 세이브 좌표/건물 footprint/NPC 이동/충돌/카메라 경계 마이그레이션 전까지 보류합니다.
- 루트 버전 파일 `APP_VERSION`은 만들지 않습니다. 버전 기록은 README와 런타임 상수에서 관리합니다.

