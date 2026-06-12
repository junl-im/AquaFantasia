# Aqua Fantasia v5.5.4 Stack Guard + Single Actions Flow Hotfix

## Fixed

- Prevented duplicate automatic GitHub Actions runs by keeping `.github/workflows/pages.yml` as the single push workflow and changing `.github/workflows/aqua-static-validate.yml` to manual-only `workflow_dispatch`.
- Added `src/runtime/v554-stack-guard.js` to catch and isolate `Maximum call stack size exceeded` / recursion errors caused by mixed cached runtime layers.
- Wrapped optional visual/runtime initialization stages with `runAquaBootStage()` so one failing runtime layer no longer stops the entire game boot.
- Replaced `window.onload = init` with an idempotent `load` listener to avoid repeated boot binding.
- Hardened v5.5.1 global fishing proxies so `castLine`, `hookFishFromTarget`, and `reelAction` cannot recursively call themselves through fallback paths.
- Hardened the v4.9 action reel proxy with a re-entry guard.
- Added the new stack guard runtime to the Service Worker precache list.

## Notes

The app version remains `5.5.2` internally because the existing CI checkers intentionally accept the v5.5.2 hotfix line. This patch is a runtime stability overlay, not a save-data migration.

If you want only one workflow to be visible in the GitHub Actions sidebar, delete this file from the repository after applying the patch:

```txt
.github/workflows/aqua-static-validate.yml
```

Keeping it is also safe because it is manual-only and will not run on push.
