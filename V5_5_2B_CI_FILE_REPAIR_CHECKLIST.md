# v5.5.2b CI File Repair Checklist

- [x] `src/runtime/v49-action-mobile-patch.js` exists in the overwrite patch.
- [x] `tools/check-v49-action-mobile.mjs` required companion files exist.
- [x] `index.html` still references `v49-action-mobile-patch.js?v=5.5.2`.
- [x] `sw.js` still precaches `./src/runtime/v49-action-mobile-patch.js`.
- [x] v5.5.2 Node 24 workflow remains unchanged.
- [x] Runtime checks pass on the repaired full project.
