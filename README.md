# Aqua Fantasia v6.4.0

2.5D 모바일 캐주얼 낚시 웹게임 프로토타입입니다.

## 구조

```txt
index.html
src/main.ts
src/styles.css
src/data.ts
src/storage.ts
src/audio.ts
src/toast.ts
public/assets/
public/sw.js
public/manifest.webmanifest
.github/workflows/pages.yml
tools/
```

## 기술

- Vite
- TypeScript
- PixiJS 8
- Howler.js
- Firebase 익명 서버연동 준비 구조
- WebP/PNG Atlas
- PWA Service Worker
- GitHub Actions + GitHub Pages

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

## v6.4.0 핵심

- 시작 화면 전용 UI 분리 유지
- 기기 시작 방향 유지와 전체화면 시도
- 신규 수역과 2.5D 도감 자산 확장
- 콤보, 결과 카드, 동적 안전지대, 보상/장비/수역 해금 연계
- 모바일 저사양 대응과 PWA 캐시 자동 정리
