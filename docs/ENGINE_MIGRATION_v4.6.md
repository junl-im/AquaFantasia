# Aqua Fantasia v4.6 Engine Migration Plan

v4.6 keeps the existing static GitHub Pages build safe while preparing the real mobile-web-game engine stack:

- Vite for development/build bundling.
- TypeScript for safer long-term refactors.
- PixiJS 8 for future WebGL/WebGPU fishing scenes.
- WebP Atlas for lightweight mobile texture loading.
- Howler.js for reliable audio bus and future audio sprites.
- Firebase modular SDK for Auth/Firestore.
- PWA shell and Service Worker for install/offline reuse.

## Why bridge mode?

The live game is still a large single `index.html`. Replacing it in one patch would risk breaking saves, Firebase login, PWA cache, and GitHub Pages. v4.6 adds the engine scaffold and runtime bridge first, then future patches can migrate systems one at a time:

1. Fishing renderer to PixiJS stage.
2. Tackle/FX sprites to WebP atlas frames.
3. Audio events to Howler sprites.
4. Inventory/equipment UI to TypeScript state modules.
5. Firebase save/ranking to typed integration functions.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run atlas:check
npm run build
```

The current production path remains static and can still be deployed by GitHub Pages directly.
