# Aqua Fantasia v5.6.1 UI State Cleanup

## Goal
Clean up player-facing mobile UI after the v5.6.0 background art pass.

## Fixed
- Hid the fixed v5.3 fishing navigator outside the real fishing screen.
- Removed the leftover QUICK ACTION label from the legacy smart dock.
- Hid the Node24 / STACK SAFE runtime badge from the live game UI.
- Hid Pixi bridge text overlays in production presentation.
- Added a screen-state sweeper so login, village, and fishing screens only show their own HUD.
- Bumped Service Worker cache target to `aqua-fantasia-v5.6.1-ui-cleanup-20260612` so old UI cache is swept automatically.

## Player impact
Login and village screens are no longer covered by fishing controls. The build/debug version pill is hidden from normal players.
