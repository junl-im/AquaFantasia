# AquaFantasia

세로 전용 2.5D 모바일 웹 낚시 게임입니다.

## 현재 버전

- v8.3.0 UI Polish Audit Fix

## 현재 구조

- GitHub Desktop + GitHub Pages 배포
- Vite + TypeScript
- PixiJS 8 낚시 스테이지
- Howler.js 사운드
- Firebase 무료 Spark 플랜 연동 준비
- PWA manifest / service worker

## v8.3.0 핵심

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
