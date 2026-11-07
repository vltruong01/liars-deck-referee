# Proposal

## Why
The current 490–610px table and stacked execution scene exceed phone landscape heights. Fixed portrait heights and independently positioned nameplates cause overlap instead of a coherent stage composition.

## What Changes
- Fit setup, table and execution into a safe-area-aware viewport shell.
- Use a proportionally scaled table stage and a two-region execution composition.
- Add portrait guidance and optional fullscreen, with accessible touch controls.
- Verify eight exact landscape sizes using real Chromium/Playwright screenshots and geometry assertions.

## Capabilities
### New Capabilities
None.
### Modified Capabilities
- `shared-bar`: single-viewport landscape framing, bounded camera, responsive controls and orientation/fullscreen support.

## Impact
Only presentation/controller files, build artifacts and development tests. Keep engine.js, secure RNG, saved-state schema, skins and shooting semantics unchanged. Add Playwright as a dev dependency because the checkout has no existing Playwright setup.
