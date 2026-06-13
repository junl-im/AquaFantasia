# Aqua Fantasia v6.2.0

2.5D 그래픽 우선주의 모바일 캐주얼 낚시 웹게임 클린 런타임입니다.

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

## 구조

- `index.html`: Vite 진입점
- `src/`: TypeScript 런타임
- `public/assets/art/`: 낚시 핵심 이미지 에셋
- `public/assets/atlas/`: WebP Atlas
- `public/sw.js`: PWA Service Worker
- `.github/workflows/pages.yml`: GitHub Pages 검증/배포

## Firebase 무료 구조

`window.AQUA_FIREBASE_CONFIG`를 배포 환경에서 주입하면 익명 서버연동이 활성화됩니다. 설정 전에는 로컬 저장으로 안전하게 동작합니다.
