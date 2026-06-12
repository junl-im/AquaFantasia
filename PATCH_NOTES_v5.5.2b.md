# Aqua Fantasia v5.5.2b CI File Repair Hotfix

## Purpose

This hotfix repairs an overwrite-patch packaging error from v5.5.2. The v5.5.2 `index.html`, `sw.js`, and runtime validation scripts referenced the v4.9 action mobile bridge, but the overwrite ZIP did not include `src/runtime/v49-action-mobile-patch.js`. GitHub Actions therefore failed at:

```txt
[check-v49-action-mobile] missing src/runtime/v49-action-mobile-patch.js
```

Browsers could also show a 404 for the same module when launching the game.

## Fixed

- Restored `src/runtime/v49-action-mobile-patch.js` in the overwrite patch.
- Restored the v4.9 action validation support files required by `tools/check-v49-action-mobile.mjs`:
  - `PATCH_NOTES_v4.9_ACTION.md`
  - `V4_9_ACTION_RUNTIME_CHECKLIST.md`
  - `docs/CLEAN_BUNDLE_v4.9_ACTION.md`
  - `AquaFantasia_v4.9_standalone_phaser.html`
- Kept the v5.5.2 runtime/cache/CI version markers unchanged to avoid a second validator migration.
- Repacked the overwrite ZIP as an additive repair patch so it can be applied directly over v5.5, v5.5.1, or v5.5.2.

## Apply

Extract this ZIP into the repository root, overwrite existing files, commit, and push.
