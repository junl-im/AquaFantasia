# AquaFantasia

## Current patch: v1.0.8 Home / Shop / Mission Polish

This overwrite patch continues from v1.0.7 and focuses on practical UI cleanup requested during mobile testing.

### Main changes

- Version naming continues as `1.0.x`.
- Village/home screen now uses the supplied bright island background.
- Supplied Aqua Fantasia banner is placed at the top of the village home screen.
- The old large quick buttons on the village screen were removed.
- The village title card was moved below the banner.
- Today's tide card was moved lower and now acts as the main home CTA section.
- Swipe tab navigation was rebuilt with both pointer and touch handlers.
- Fishing screen remains excluded from swipe navigation to prevent accidental input.
- Fishing start button was moved higher so it no longer overlaps the recent catch strip.
- Gear cost buttons were shortened.
- Inventory, Dex, Shop, and Mission CTA buttons were shortened.
- Shop items now use a compact two-column layout.
- Shop item icons were resized so they stay inside the card frame.
- Mission progress bars were rebuilt as aqua gradient gauges.
- Mission action buttons are shorter.
- Ranking now includes compact practice-bot rows so the page does not feel empty during solo testing.
- Ranking rows use bright text and compact one-line stats.
- `README.md` remains the only project patch document.

### Validation

Run:

```bash
npm install
npm run validate
npm run typecheck
npm run build
npm run audit
```

Expected result: all commands pass. Existing Vite warnings about old CSS public asset paths may still appear, but they are non-blocking warnings.

### Notes

- This patch keeps PixiJS fishing, DOM UI, and the WebGL underwater background layer.
- It does not use `requestFullscreen()` in Kakao/in-app browser paths where rotation bugs were previously observed.
- Browser fullscreen still depends on platform rules and user interaction.
