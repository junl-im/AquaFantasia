# Patch 35: v4.6 Engine Atlas Optimization

## Summary

This patch prepares Aqua Fantasia for a real optimized mobile web-game engine stack while keeping the current static PWA stable.

## Added

- Vite configuration.
- TypeScript engine scaffold under `src/`.
- PixiJS 8 stage bridge.
- Howler.js audio bus scaffold.
- Firebase modular TypeScript integration scaffold.
- WebP atlas file and atlas JSON.
- v4.6 engine runtime panel.
- v4.6 Service Worker cache update.
- Engine migration document.

## Performance

- Core runtime still uses static DOM for stability.
- v4.6 frame sampler automatically applies `perf-lite` when mobile FPS falls.
- WebP Atlas is preloaded and runtime cached.
- PixiJS is introduced as a gradual migration path, not forced into the current runtime yet.

## Safety

- Existing saves are read from v4.5 and older keys.
- New saves use `aqua_v4.6`, `aqua_v4.5`, and `aqua_latest_state`.
- Existing Firebase CDN runtime remains compatible.
