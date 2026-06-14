# AquaFantasia v8.1.0 최종 정리 통파일

## 버전

- 버전: `8.1.0`
- 패치명: `ASSET_FIT_START_KEEP`
- 기준 구조: Vite / TypeScript / PixiJS 8 / Howler.js / Firebase Spark / PWA / GitHub Pages
- 핵심 방향: 모바일 세로 전용 2.5D/3D 렌더드 낚시 웹게임

## 이번 패치의 핵심 판단

v8.0.0에서 시작 화면 겹침을 해결하는 과정에서 `이 기기에서 로그인 유지`가 실제 버튼처럼 보이지 않는 문제가 있었다. 이번 v8.1.0에서는 이 버튼을 없애지 않고, 배경 이미지에 구워져 있던 원형 체크와 글씨만 제거한 뒤 실제 DOM 버튼으로 다시 복구했다.

즉, 이번 패치의 기준은 다음과 같다.

- 글씨가 구워진 이미지와 실제 DOM 텍스트가 겹치면 이미지를 다듬는다.
- 실제 조작이 필요한 UI는 투명 hitbox가 아니라 보이는 버튼으로 만든다.
- SVG/벡터 느낌이 아니라 렌더드 PNG/WebP 기반으로 보이게 한다.
- 장비 / 상점 / 미션 화면은 하단 네비게이션에 가려지지 않고 세로 화면에서 읽혀야 한다.

## 사용한 신규 첨부 에셋

이번 패치에서 새로 분석하고 반영한 파일은 다음과 같다.

```text
AquaFantasia_asset_pack_split_plus.zip
AquaFantasia_v12_exact_reference_fishing_style_assets.zip
```

반영 결과는 아래 런타임 폴더로 정리했다.

```text
public/assets/v12/
├─ bg/
├─ buttons/
├─ characters/
├─ fish/
├─ fx/
├─ icons/
├─ screens/
└─ ui/
```

## 시작 화면 수정 내역

### 수정 전 문제

- `익명 서버연동` 아래 영역과 `이 기기에서 로그인 유지`가 겹쳐 보일 수 있었다.
- v8.0.0에서는 겹침 방지를 위해 버튼이 너무 투명 hitbox 쪽으로 정리되어 실제 버튼처럼 보이지 않았다.

### 수정 후

- 시작 화면 배경에서 구워진 `이 기기에서 로그인 유지` 원형 체크/글씨 영역을 제거했다.
- 새 시작 화면 파일을 만들었다.

```text
public/assets/v12/screens/start_screen_clean_v810.webp
```

- 실제 버튼은 다음 클래스로 복구했다.

```html
<button class="start-hotspot hit-keep v810-keep-button" data-action="keep">
  <span class="keep-indicator"></span>
  <span class="keep-text">이 기기에서 로그인 유지</span>
</button>
```

- 기본 상태는 민트 렌더드 버튼, 체크 상태는 골드 렌더드 버튼을 사용한다.

```text
public/assets/v12/buttons/btn_mint_normal_wide_blank.webp
public/assets/v12/buttons/btn_gold_normal_wide_blank.webp
```

## UI 화면 수정 내역

### 공통

- `v810-screen` 클래스를 각 게임 화면에 추가했다.
- 하단 네비게이션 높이를 고려한 safe padding을 추가했다.
- 카드/패널은 blank 렌더드 에셋 기반으로 잡고, 텍스트는 DOM으로만 출력하게 했다.
- 글씨가 구워진 버튼/패널을 직접 쓰지 않아 텍스트 겹침을 줄였다.

### 장비 화면

- 카드 최소 높이 증가
- 장비 아이콘 영역과 설명 영역 분리
- 강화/장착 버튼의 시각 안정성 보강
- 배경: `pier_portrait.webp`

### 상점 화면

- 상품 카드 높이와 버튼 영역 정리
- 가격 배지와 구매 버튼 가독성 보강
- 배경: `ocean_portrait.webp`

### 미션 화면

- 미션 카드 최소 높이 증가
- 진행도/상태/보상 버튼 간격 정리
- 배경: `lake_portrait.webp`

### 도감/마을 화면

- v12 렌더드 배경 적용
- 카드와 아이콘 스타일을 새 UI 톤에 맞게 정리

## 낚시 화면 수정 내역

- PixiJS에서 사용하는 주요 에셋을 v12 기준으로 교체했다.

```text
캐릭터: public/assets/v12/characters/chibi_fisher_01.png
찌: public/assets/v12/icons/bobber.png
물고기: public/assets/v12/fish/fish_01.png ... fish_30.png
배경: public/assets/v12/bg/*_portrait.webp
```

- v12 물고기 이미지 크기가 이전보다 커서 잡힘 연출 스케일 기준을 `/720`으로 재조정했다.
- 지역 배경은 720x1280 세로 WebP로 재가공해 모바일 성능과 시각 안정성을 함께 고려했다.

## 코드 변경 핵심 파일

```text
src/main.ts
src/data.ts
src/styles.css
public/sw.js
package.json
tools/validate-clean.mjs
tools/check-v810-asset-fit-start-keep.mjs
README.md
PATCH_NOTES_v8.1.0.md
CLEAN_REPLACE_GUIDE_v8.1.0.md
reports/v8.1.0-asset-fit-start-keep-audit.md
```

## 버전/캐시

```ts
APP_VERSION = '8.1.0'
CACHE_NAME = 'aqua-fantasia-v8.1.0-asset-fit-start-keep'
```

서비스워커도 같은 캐시명으로 갱신했다.

## 검증 결과

아래 명령을 모두 통과했다.

```bash
npm run validate
npm run typecheck
npm run build
```

검증 결과 요약:

```text
[validate-clean] Aqua Fantasia v8.1.0 asset-fit start keep OK
[check-v810] asset-fit UI + visible keep-login button OK
vite build OK
```

## 적용 방법

1. 기존 GitHub Desktop 프로젝트 루트에 패치 ZIP을 덮어쓴다.
2. 아래 명령을 실행한다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

3. GitHub Desktop에서 commit/push 한다.
4. GitHub Actions와 GitHub Pages 배포 결과를 확인한다.

## 다음 단계 추천

v8.1.0은 사용자가 지적한 UI 붕괴/겹침/버튼 누락을 우선 복구하는 패치다. 다음 대규모 단계는 다음 순서가 좋다.

1. UI 패널을 9-slice 규칙으로 더 정교하게 분리
2. PixiJS 8 Atlas 로더로 v12 물고기/FX를 묶어 로딩 최적화
3. 낚시 액션에 물결, 낚싯줄, 장력, 히트스톱, 카메라 흔들림 추가
4. 장비/상점/미션을 실제 Firebase 저장 구조와 연결
5. G123식 초반 30초 온보딩과 보상 흐름 추가
