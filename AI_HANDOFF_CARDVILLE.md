# AquaFantasia AI HANDOFF CARDVILLE

## 현재 기준

- 프로젝트명: AquaFantasia / 아쿠아 판타지아
- 기준 패키지 버전: `2.1.111`
- 기준 기록일: `2026-06-30 KST`
- 실행 형태: Vite + TypeScript 모바일 세로 전용 웹 게임
- 주요 배포 흐름: GitHub Actions `validate-and-deploy`에서 `npm ci` → `npm run validate` → `npm run typecheck` → `npm run build` → GitHub Pages 배포
- 사용자 작업 환경: GitHub Desktop, Firebase 무료 플랜
- 업로드 원본: `.git` 폴더 제외 통파일 zip
- 산출물 zip 파일명 규칙: 짧게 쓰되 버전 숫자를 반드시 포함한다. 예: `AF-v2.1.111-full.zip`, `AF-v2.1.111-patch.zip`

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
- v2.1.111 핵심: 기능/게임 로직은 건드리지 않고, 누락 자산 참조와 인수인계/검증 정책만 보강
- 마을 핵심: Pixi 월드, 80 x 80 계열 타일, 건물 설치/이동, 경로 탐색, NPC, 수동 조이스틱/키보드 이동
- 저장 핵심: `localStorage` 키 `aqua-fantasia-save-v650`, 이전 키 일부 마이그레이션, 저장값 sanitize 후 저장
- Firebase 핵심: `window.AQUA_FIREBASE_CONFIG`에 `apiKey`가 있을 때만 `firebase/app`, `firebase/auth`를 동적 import하고 익명 로그인 시도. 설정이 없으면 로컬 저장으로 진행

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
