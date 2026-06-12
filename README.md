# AquaFantasia v4.9 Pixi Runtime Connect

# Aqua Fantasia v4.7 Pixi Fishing Renderer

모바일 웹 낚시 게임 최적화 엔진 전환 패치입니다. 기존 정적 PWA를 유지하면서 낚시 화면을 Canvas/PixiJS 브릿지로 점진 이전합니다.

# AquaFantasia

GitHub Pages 무료 배포용 모바일 웹 낚시 RPG입니다. 현재 패치: **v4.3 Fullscreen Performance Boost

- 실행: `index.html`
- 데이터: `data/fish.json`
- PWA: `manifest.webmanifest`, `sw.js`
- 자동 검증: `npm run validate`, `npm run audit`
- 모듈 분리 준비: `src/`, `docs/ARCHITECTURE_v3.6.md`


## v3.7 Masterpiece Art & Performance
원화풍 SVG 아트팩, v3.7 Art Director, 모바일 렉 저감 캐시 정책이 적용되었습니다.

## v3.8 Action Fishing UI
실전 낚시 화면의 터치 위치, 릴 감기 액션, UI 겹침 정리, 모바일 성능 보호 패치가 적용되었습니다.


## v4.6 Engine Atlas Optimization

이번 패치는 기존 정적 PWA를 깨지 않으면서 Vite, TypeScript, PixiJS 8, Howler.js, Firebase modular SDK, WebP Atlas 기반 엔진 전환을 준비합니다.

현재 GitHub Pages 배포는 계속 `index.html` 중심으로 안정 실행됩니다. `src/` 폴더와 `vite.config.ts`는 다음 단계에서 낚시 렌더러와 오디오/상태 로직을 실제 모듈로 분리하기 위한 스캐폴드입니다.

검증:

```bash
npm run validate
npm run audit
npm run atlas:check
```

개발 모드:

```bash
npm install
npm run dev
```
