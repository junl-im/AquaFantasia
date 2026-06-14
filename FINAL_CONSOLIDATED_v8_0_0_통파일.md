# Aqua Fantasia v8.0.0 최종 정리 통파일

## 기준

- 배포 구조: GitHub Desktop + GitHub Pages
- 런타임 구조: Vite / TypeScript / PixiJS 8 / Howler.js / Firebase 준비 구조
- 저장 구조: 로컬 저장 + Firebase 무료 Spark 플랜 기준 익명 연동 준비
- UI 방향: SVG/벡터 느낌 배제, 2.5D/렌더드 PNG/WebP 중심
- 우선순위: 모바일 성능, 안정성, 실제 플레이 화면 가독성

## 이번 패치의 문제 인식

v7.6.0은 하단 네비게이션 fixed root 구조는 맞췄지만, 누적 CSS 레이어와 렌더드 에셋 적용 방식 때문에 장비/상점/미션 화면에서 글씨와 카드가 불안정하게 보였다. 또한 기존 v9 일부 런타임 이미지는 사용자가 원하는 2.5D/3D 렌더드 느낌보다 단순 벡터처럼 보였다.

v8.0.0에서는 새로 첨부된 `낚시.zip`과 `AquaFantasia_UI_MasterPlan.zip`의 방향성을 반영해, 기능 추가보다 UI 안정성과 렌더드 에셋 교체를 우선했다.

## 사용자 첨부 에셋 분석

### 낚시.zip

포함 이미지:

- `1781351360795.png`: 메인 프레임, 버튼, 상태 UI 시트
- `1781351581688.png`: 아이콘, 장비, 하단 nav, 게이지, 특수 효과, 레이블 시트
- `1781352432373.png`: 렌더드 물고기 도감 시트
- `1781353803971.png`: 캐릭터 포즈, 월드 배경, 수중 생태계 시트

반영 방식:

- 배경은 `public/assets/v9/bg/*.webp`로 재생성
- 물고기는 `public/assets/v9/fish/fish_01.png`부터 `fish_29.png`까지 재생성
- 장비/아이콘은 `public/assets/v9/equipment` 및 `public/assets/v9/icons`로 재생성
- 기존 경로를 유지해 런타임 연결을 깨지 않도록 했다.

### AquaFantasia_UI_MasterPlan.zip

핵심 방향:

- G123 + 수집형 RPG + 고급 모바일 게임 UI
- 메인 HUD 리빌드
- 물고기 카드 프레임
- SSR/UR 연출
- 배경 이펙트
- 아이콘 통일
- 장기 로드맵: 장비, 펫, 가챠, 거래소, 길드

v8.0.0 반영:

- 장비/상점/미션 화면을 카드 UI로 재정렬
- 렌더드 물고기 카드 표시 강화
- SSR/UR까지는 아직 데이터 구조를 추가하지 않고, 현재 RARE/EPIC/BOSS 구조에 먼저 시각 안정성을 적용

## 핵심 변경

### 1. 장비 / 상점 / 미션 화면 가시성 복구

- `.game-screen.v800-screen.scroll-screen`에 강제 세로 스크롤 적용
- `.gear-grid`, `.shop-list`, `.mission-list`의 max-height/overflow 충돌 제거
- 하단 nav만큼 padding-bottom 확보
- 카드 내부 텍스트 줄바꿈, 버튼, 가격 배지 크기 재정렬

### 2. 시작 화면 겹침 수정

- `익명 서버연동` hitbox를 화면 비율 기준으로 다시 계산
- `이 기기에서 로그인 유지`는 기존 이미지에 이미 글씨가 있으므로 DOM 텍스트를 숨김
- 체크 표시만 동작하도록 정리해 글씨 겹침을 제거

### 3. 렌더드 에셋 런타임 반영

- 기존 벡터풍 v9 배경을 새 렌더드 WebP 배경으로 덮어씀
- 기존 벡터풍 물고기를 새 렌더드 물고기 PNG로 덮어씀
- 장비/상점/nav 아이콘을 새 렌더드 PNG로 덮어씀

### 4. 낚시 화면 스케일 보정

- 새 보트/캐릭터 PNG가 이전 Sprite보다 작아 PixiJS 스케일을 조정
- 플레이어: `base / 260`
- 찌: `base / 520`
- 물고기: `base / 360`

### 5. 검증 구조 유지

- `tools/check-v800-ui-asset-rebuild.mjs` 추가
- `npm run validate`가 v8.0.0 기준으로 통과하도록 갱신
- `npm run typecheck`, `npm run build` 통과

## 검증 결과

```bash
npm run validate
npm run typecheck
npm run build
```

모두 통과.

## 다음 대규모 패치 제안

v8.1에서는 단순 이미지 교체가 아니라 `UI Atlas`를 실제 JSON 기반으로 묶고, 카드 프레임/버튼/아이콘을 컴포넌트화하는 것이 좋다. v8.5 이후에는 SSR/UR/LR 등급 연출, 보상 팝업, 가챠 UI, 장비 세트 효과를 추가하는 순서가 안정적이다.
