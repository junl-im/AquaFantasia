# AquaFantasia v8.2.0 최종 정리 통파일

## 버전

- 버전: v8.2.0
- 패치명: V13 Tab Composition Rebuild
- 기준 입력 에셋: `AquaFantasia_v13_tab_full_ui_compositions.zip`, `AquaFantasia_asset_pack_split_plus.zip`
- 런타임 기준: Vite / TypeScript / PixiJS 8 / Howler.js / Firebase Spark / GitHub Pages / PWA

## 문제 인식

이전 v8.0~v8.1 패치에서는 사용자가 원하는 2.5D 렌더드 모바일 게임 화면과 다르게, DOM 카드와 텍스트가 레퍼런스 이미지 위에 어색하게 겹치거나 장비/상점/미션 화면의 가독성이 떨어지는 문제가 있었습니다.

이번 v8.2.0은 사용자가 직접 만든 탭별 전체 UI 구성도를 기준으로 삼아 화면 안정성을 먼저 복구했습니다.

## 핵심 방향

1. 사용자가 만든 v13 전체 화면 구성도를 시각적 원본으로 사용
2. DOM 텍스트 중복 표시 제거
3. 실제 버튼/탭/CTA는 투명 hotspot으로 동작 연결
4. 하단 탭 네비게이션을 8개 탭으로 확장
5. 낚시 화면은 v13 배치 위에 실제 PixiJS 스테이지 유지
6. 시작 화면의 로그인 유지 버튼은 삭제하지 않고 실제 버튼형 UI 유지

## 적용된 탭 구조

- 마을
- 낚시
- 장비
- 가방
- 도감
- 상점
- 미션
- 랭킹

## 런타임 에셋 구조

신규 폴더:

```text
public/assets/v13/compositions/
  town.webp
  fishing.webp
  gear.webp
  inventory.webp
  dex.webp
  shop.webp
  mission.webp
  ranking.webp

public/assets/v13/reference/
  tab_ui_layout_map.json
  UI_LAYOUT_GUIDE_KO.md
  preview_index.html
```

v13 전체 화면 PNG는 모바일 로딩을 위해 WebP로 변환했습니다. 원본 레이아웃 좌표 기준은 reference 폴더에 보관했습니다.

## 주요 코드 변경

### `src/types.ts`

`Screen` 타입에 신규 화면을 추가했습니다.

```ts
'inventory'
'ranking'
```

### `src/data.ts`

앱 버전과 캐시명을 갱신했습니다.

```ts
APP_VERSION = '8.2.0'
CACHE_NAME = 'aqua-fantasia-v8.2.0-v13-tab-composition'
```

하단 네비게이션을 8탭으로 확장했습니다.

### `src/main.ts`

신규 v13 화면 렌더링 구조를 추가했습니다.

- `V13_BG`
- `createV13Screen`
- `addV13Hotspot`
- `renderInventory`
- `renderRanking`
- v13 전용 투명 하단 네비게이션 hotspot

기존 장비/상점/미션/도감/마을 화면은 v13 구성도 기반 화면으로 재작성했습니다.

### `src/styles.css`

v13 전용 최종 오버라이드 레이어를 추가했습니다.

- `.v13-screen`
- `.v13-bg`
- `.v13-hot-layer`
- `.v13-hotspot`
- `.v13-bottom-nav-hotspots`
- `.v13-fishing-stage`
- `.v13-stage-ui`
- `.v13-reel-panel`

## 시작 화면 처리

`이 기기에서 로그인 유지`는 삭제하지 않았습니다.

- 배경에 구워진 원형/글씨와 겹치지 않도록 기존 v8.1 버튼형 UI 유지
- `익명 서버연동` 아래에 실제 클릭 가능한 버튼으로 유지
- localStorage `aqua-login-keep`에 상태 저장

## 낚시 화면 처리

v13 낚시 화면 구성도 위에 실제 PixiJS 스테이지를 배치했습니다.

- v13 기준 좌표: `70, 290, 940, 570`
- 화면 비율 기반 CSS percentage로 변환
- PixiJS 배경/캐릭터/찌/물고기 렌더링 유지
- 캐스트 CTA는 v13 이미지 버튼 위치에 투명 실제 버튼으로 연결
- 릴 패널은 reeling 상태에서만 표시

## 검증 결과

통과 명령:

```bash
npm run typecheck
npm run validate
npm run build
```

검증 스크립트:

```bash
node tools/validate-clean.mjs
node tools/check-v820-v13-tab-composition.mjs
```

## 남은 다음 단계

v8.2.0은 화면 안정성 회복을 위한 구조 패치입니다. 이후 단계에서는 아래를 권장합니다.

1. v13 구성도를 단순 배경이 아니라 9-slice UI 파츠 기반으로 점진 분해
2. 각 탭의 텍스트/재화/진행도를 실제 데이터로 다시 연결
3. 낚시 화면의 PixiJS stage를 v13 배경과 완전히 맞춘 애니메이션 씬으로 확장
4. 가방/랭킹의 실제 기능 데이터 구현
5. Firebase Auth/Firestore 연결을 Spark 플랜 범위에서 단계적으로 연결

## 주의

이번 패치는 “완성형 기능 UI”가 아니라 “실망이 컸던 화면 안정성 문제를 우선 복구하는 대규모 기준선 패치”입니다. 화면은 v13 구성도를 그대로 따르고, 실제 동작은 hotspot으로 연결했습니다. 다음 패치부터 각 UI 파츠를 더 작게 잘라 진짜 데이터 바인딩형 UI로 개선할 수 있습니다.
