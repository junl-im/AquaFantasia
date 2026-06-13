# 아쿠아 판타지아 v6.3.0

2.5D 이미지 에셋 기반 모바일 캐주얼 낚시 웹게임 클린 런타임입니다.

## 핵심

- 시작 방향 보존: 세로로 열면 세로, 가로로 열면 가로 레이아웃을 유지합니다.
- 첫 터치 이후 전체화면 요청 및 PWA fullscreen manifest 적용.
- 로그인 화면의 개발/패치 문구 제거, 한글 로고 `아쿠아 판타지아` 적용.
- 시작 전 낚시 HUD, 상점 FAB, 버전 배지 미노출.
- 마을 진입 후 하단 메뉴, 장비, 도감, 상점, 미션 시스템 연결.
- PixiJS 8 낚시 액션, Howler 효과음, Firebase 익명 서버연동 준비 구조 유지.

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run validate
npm run typecheck
npm run build
```
