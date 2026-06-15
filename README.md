# AquaFantasia

세로 전용 2.5D 모바일 웹 낚시 게임입니다.

## 현재 버전

- v8.4.0 UI Polish Audit Fix

## 현재 구조

- GitHub Desktop + GitHub Pages 배포
- Vite + TypeScript
- PixiJS 8 낚시 스테이지
- Howler.js 사운드
- Firebase 무료 Spark 플랜 연동 준비
- PWA manifest / service worker

## v8.4.0 핵심

- v13 탭별 전체 UI 구성도를 무작정 화면에 늘리지 않고, 원본 1080x1920 디자인 비율을 유지하는 `v13-design-surface`로 재배치
- 시작 화면도 원본 1024x1536 디자인 비율을 유지하는 `start-design-surface`로 재배치
- 시작 화면 `이 기기에서 로그인 유지`는 삭제하지 않고 실제 버튼형 UI로 유지
- 투명 hotspot / 하단 탭 / 낚시 PixiJS 스테이지가 같은 디자인 좌표계를 쓰도록 정리
- 낚시 화면의 PixiJS stage / CAST 버튼 / 릴 패널 / 콤보 배지를 v13 구성도 좌표에 맞춰 정렬
- 가방의 CTA hotspot 최소 터치 높이를 모바일 기준 44px 이상으로 확대
- `check-v830-ui-polish.mjs` 검증 추가: 에셋 크기, 버전, 캐시명, 디자인 표면, 터치 타겟 검사

## 검증

```bash
npm install
npm run validate
npm run typecheck
npm run build
```


## v8.4.0 Fullscreen Fishing UI Polish
- 낚시터는 v13 구운 구성도에서 분리하고, 전체 화면 PixiJS 배경/게임 영역으로 재구성했습니다.
- 낚싯대/미끼/오늘 목표 카드와 낚시 화면 내 불필요한 핫스팟을 제거했습니다.
- 최근 포획 패널을 하단 메뉴 바로 위로 내렸습니다.
- 하단 탭은 안 어울리던 투명 핫스팟 방식 대신 실제 아이콘 버튼 네비로 교체했습니다.
- 랭킹은 가짜 유저 데이터를 제거하고 현재 실제 저장 기록의 내 계정만 표시합니다.
- 카카오/인앱 브라우저에서 메뉴/액션 시 몰입형 세로 화면을 재시도합니다.


## v8.5.0 HD Image Fidelity
- `public/assets/v85` 고화질 런타임 에셋 레이어 추가.
- 과압축 v13 구성도 이미지를 원본 기반 고품질 WebP로 재생성.
- 낚시 배경을 1440×2560 세로 텍스처로 교체.
- 물고기/네비 아이콘/버튼/패널을 v85 경로로 연결.
- PixiJS 렌더러 DPR 상한과 텍스처 선명도 힌트 개선.
- 검증: `npm run validate`, `npm run typecheck`, `npm run build` 통과.
