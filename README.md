# AquaFantasia v9.5.0 Cute UI Harmony

AquaFantasia is a portrait-only mobile web fishing game built for GitHub Pages, Firebase Spark-friendly storage, PWA install flow, PixiJS fishing gameplay, and a safe WebGL underwater background layer.

## v9.5.0 focus

- Kept the v9.3/v9.4 cute action fishing loop and WebGL underwater layer.
- Polished the whole menu UI toward a softer cute 2.5D mobile-game style.
- Added a cute HUD mascot and more consistent HUD/wallet treatment.
- Improved village tide card with character face, compact status chips, and clearer departure CTA.
- Reworked gear cards with item orbs, compact stat bars, and cleaner price buttons.
- Reworked inventory cards with visible quantity badges.
- Reworked shop cards with recommendation/safety/upgrade tags.
- Reworked mission cards with ready/event emphasis while keeping sizes stable.
- Reworked ranking card with avatar and test-league chip; fake ranking data remains removed.
- Reduced active bottom-nav frame intensity again so the selected menu fits inside its cell.
- Kept the single-document policy: this README replaces old CLEAN_REPLACE_GUIDE / PATCH_NOTES / FINAL_CONSOLIDATED files.

## Validation

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

## Deployment

This ZIP is an overwrite patch for the project root. `node_modules` and `dist` are intentionally excluded. GitHub Actions should install dependencies, validate, typecheck, build, and publish the Pages artifact.

## Notes

- Kakao/in-app browser rotation protection remains in place.
- Fullscreen API is still separated from Kakao/in-app paths to avoid the previous rotation regression.
- WebGL underwater layer is a background-only enhancement. PixiJS fishing gameplay and DOM UI are still the stable main runtime.
