# AquaFantasia

세로 전용 2.5D 모바일 웹 낚시 게임입니다.

## 현재 버전

- v8.2.0 V13 Tab Composition Rebuild

## 현재 구조

- GitHub Desktop + GitHub Pages 배포
- Vite + TypeScript
- PixiJS 8 낚시 스테이지
- Howler.js 사운드
- Firebase 무료 Spark 플랜 연동 준비
- PWA manifest / service worker

## v8.2.0 핵심

- 사용자가 제공한 v13 탭별 전체 UI 구성도를 런타임 화면 기준으로 적용
- 마을 / 낚시 / 장비 / 가방 / 도감 / 상점 / 미션 / 랭킹 8탭 구성
- 화면 위 DOM 텍스트 중복과 겹침 제거
- 보이는 UI는 v13 구성도 WebP, 동작은 투명 hotspot 버튼으로 연결
- 낚시 화면은 v13 화면 위에 실제 PixiJS 스테이지 유지
- 시작 화면의 `이 기기에서 로그인 유지` 버튼형 UI 유지

## 검증

```bash
npm install
npm run typecheck
npm run validate
npm run build
```
