# 아쿠아 판타지아 v6.6.0

세로 전용 2.5D 모바일 캐주얼 낚시 웹게임 프로토타입입니다.

## v6.6.0 핵심

- 사용자가 제공한 레퍼런스 이미지 스타일을 기준으로 핵심 자산 재제작/크롭 반영
- `START` 글씨가 박힌 버튼 제거, 텍스트 없는 2.5D 버튼 베이스로 교체
- `낚시터로 출항` 문구와 버튼 이미지 텍스트 겹침 제거
- 로그인/낚시/도감 핵심 이미지 자산 품질 보강
- 세로 전용 고정 유지: `portrait-primary`
- PixiJS 8 실패 시 HTML fallback 낚시 루프 유지
- Vite / TypeScript / PixiJS 8 / Howler.js / Firebase 준비 구조 유지
- GitHub Actions Node 24 검증/빌드/Pages 배포 유지

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run validate
npm run runtime:check
npm run audit
npm run typecheck
npm run build
```

## 적용 권장

기존 누적 파일이 섞이지 않도록 `.git` 폴더만 남기고 전체 교체 ZIP을 푸는 방식을 권장합니다.
