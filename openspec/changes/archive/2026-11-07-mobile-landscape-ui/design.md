# Design

## Context
Baseline Playwright at 844×390 measures document height 861px. Existing width breakpoints retain fixed table/portrait heights and execution minimum heights, while absolute labels escape their seat allocations. There are no existing Playwright dependencies or saved screenshots in the checkout.

## Goals / Non-Goals
Fit the complete landscape game, including setup and utility dialogs, into the dynamic viewport. Keep the engine, schema, artwork and shot timing. No runtime dependencies or backend changes.

## Decisions
- A fixed safe-area shell uses grid rows for a compact toolbar and remaining screen. Main pages consume remaining height with min-height:0, not a scrolling document.
- A uniform stage coordinate system is fitted to the scene via ResizeObserver using both width and height. Four disjoint seat allocations surround a smaller central table; 2/3 player arrangements use the same scale. Names occupy reserved bands below each character.
- Execution uses a header plus two-column content: a contained character/revolver on the left and trigger/result/action on the right. FIRE is disabled during entry to prevent tap-through; back/settings remain in the header, disabled during shooting. Results reuse the action region.
- Desktop artwork is capped at 520px inside a centered 660px subject group so the revolver and character stay together. Art margins do not add to the allocated grid height.
- Camera zoom is bounded to 1.16 and derives focus from the selected seat; reduced motion skips movement. Stage fitting and camera transforms use separate elements.
- Setup uses four compact columns with flexible portrait space. Landscape utility dialogs use wider grid layouts rather than tall mobile cards. Portrait phones get a rotation prompt; no forced orientation lock. Fullscreen is an optional explicit button with failure feedback.
- Playwright uses installed Chrome, isolated contexts and local file:// releases. Screenshots and actual bounding-box, hit-test and scroll assertions cover every requested size; tests also preserve pending shots and verify unchanged save schema.

## Risks / Trade-offs
- OS virtual keyboard shrinks available height → focused setup/management fields have a compact keyboard layout; safe-area sizing follows dynamic viewport.
- Extremely small windows or large accessibility zoom → portrait guidance and readable controls take priority over decoration. Landscape targets start at 667×360.
- Fullscreen browser support varies → feature detection and graceful feedback; no dependency on it for layout.
