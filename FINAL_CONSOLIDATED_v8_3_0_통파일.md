# AquaFantasia v8.3.0 FINAL CONSOLIDATED 통파일

## 버전

- `APP_VERSION`: `8.3.0`
- `CACHE_NAME`: `aqua-fantasia-v8.3.0-ui-polish-audit`
- 패치명: **UI Polish Audit Fix**

## 이번 패치의 핵심 목표

v8.2.0에서 v13 탭별 전체 UI 구성도를 적용했지만, 실제 모바일 화면에서는 UI가 찌그러지거나 터치 영역이 보이는 그림과 어긋날 수 있는 구조가 남아 있었다. v8.3.0은 새 기능 추가보다 먼저 **UI 화면 안정성, 비율 유지, 터치 좌표 정렬, 시작 화면 버튼 복구 상태 점검**을 목표로 한다.

## 적용된 핵심 수정

### 1. v13 탭 화면 디자인 표면 분리

기존에는 1080x1920 구성도 이미지를 `.v13-bg`로 화면 전체에 직접 늘렸다. 이 방식은 9:16이 아닌 스마트폰에서 UI가 세로/가로로 찌그러질 수 있다.

v8.3.0에서는 다음 구조로 바꿨다.

```html
<div class="v13-design-surface" data-design="1080x1920">
  <img class="v13-bg" />
  <div class="v13-hot-layer"></div>
</div>
```

이제 v13 이미지, hotspot, 낚시 overlay가 같은 1080x1920 좌표계를 기준으로 움직인다.

### 2. 시작 화면 디자인 표면 분리

시작 화면 아트는 1024x1536이다. 기존에는 화면 비율과 아트 비율이 달라도 버튼 좌표가 화면 기준으로 잡혀 있었다.

v8.3.0에서는 다음 구조로 바꿨다.

```html
<div class="start-design-surface" data-design="1024x1536">
  <img class="start-art-image" />
  <button class="start-hotspot hit-depart"></button>
  <button class="start-hotspot hit-new"></button>
  <button class="start-hotspot hit-server"></button>
  <button class="start-hotspot hit-keep v810-keep-button"></button>
</div>
```

`이 기기에서 로그인 유지`는 삭제하지 않았다. 실제 버튼형 UI로 유지한다.

### 3. 낚시 화면 overlay 좌표 정렬

낚시 화면의 PixiJS stage, CAST 버튼 layer, reel panel, combo badge를 v13 design surface 내부로 이동했다. 이제 v13 낚시 구성도와 실제 낚시 런타임이 같은 기준 좌표를 쓴다.

### 4. 하단 탭 네비 좌표 정리

하단 8탭 transparent nav는 v13 구성도 하단 탭 그림과 맞도록 9:16 디자인 표면 기준 폭으로 정렬했다. 시각 UI는 v13 이미지가 담당하고, 실제 클릭은 투명 버튼이 담당한다.

### 5. 모바일 터치 타겟 보강

가방 탭의 CTA hotspot이 작은 기기에서 44px 아래로 내려갈 수 있어서 확대했다.

- 기존: `[710, 1450, 270, 90]`
- 변경: `[690, 1435, 310, 125]`

### 6. 검증 스크립트 추가

`tools/check-v830-ui-polish.mjs`를 추가했다.

검사 항목:

- v13 8개 구성도 이미지가 모두 1080x1920인지 확인
- 시작 화면 이미지가 1024x1536인지 확인
- `start-design-surface`, `v13-design-surface` 존재 확인
- v13 hotspot이 390x844 기준 최소 44px 이상인지 확인
- package/data/service worker 버전과 캐시명 일치 확인

## 검증 결과

아래 명령을 실행했고 모두 통과했다.

```bash
npm run validate
npm run typecheck
npm run build
```

결과 요약:

- validate 통과
- TypeScript typecheck 통과
- Vite production build 통과
- v13 hotspot 29개 검사 통과

## 현재 남은 한계

v13 화면은 아직 완전한 동적 UI가 아니라 **전체 구성도 이미지 + 투명 hotspot** 방식이다. 당장 화면을 안정화하는 기준선으로는 적합하지만, 장기적으로는 다음 단계가 필요하다.

1. v13 구성도를 9-slice 패널, 버튼, 아이콘, 배경 파츠로 더 잘게 분해
2. 장비/상점/미션/가방/도감의 실제 데이터 텍스트를 안전영역 안에 바인딩
3. 각 탭의 실제 스크롤/상세 팝업/보상 수령 애니메이션 연결
4. PixiJS 낚시 stage와 v13 UI 프레임 간 색감/광원 일치 보정

## 파일 변경 요약

- `src/main.ts`
  - 시작 화면을 `start-design-surface` 구조로 변경
  - v13 화면을 `v13-design-surface` 구조로 변경
  - 낚시 overlay를 v13 surface 내부로 이동
  - 가방 CTA hotspot 확대

- `src/styles.css`
  - v8.3.0 UI polish layer 추가
  - 시작/v13 디자인 표면 비율 유지
  - transparent nav 정렬 guard 추가
  - 모바일 최소 터치 타겟 보강

- `src/data.ts`
  - APP_VERSION / CACHE_NAME v8.3.0 갱신

- `public/sw.js`
  - CACHE_NAME v8.3.0 갱신

- `package.json`, `package-lock.json`
  - version v8.3.0 갱신
  - validate 스크립트를 v8.3.0 검사로 교체

- `tools/check-v830-ui-polish.mjs`
  - UI polish 전용 검증 스크립트 추가

- `PATCH_NOTES_v8.3.0.md`
  - 패치 노트 추가

- `CLEAN_REPLACE_GUIDE_v8.3.0.md`
  - 덮어쓰기 가이드 추가

- `reports/v8.3.0-ui-polish-audit.md`
  - UI 점검 보고서 추가

## 적용 방법

기존 프로젝트 루트에 ZIP을 덮어쓴 뒤 아래 순서로 확인한다.

```bash
npm install
npm run validate
npm run typecheck
npm run build
```

검증이 통과하면 GitHub Desktop에서 commit / push 한다.
