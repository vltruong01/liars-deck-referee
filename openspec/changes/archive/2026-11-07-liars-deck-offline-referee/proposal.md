# Proposal

## Why
Physical Liar's Deck groups need a shared offline referee that remembers independent revolvers and makes each consequence cinematic. This empty project will deliver a browser-only game without accounts or installation for players.

## What Changes
- Add 2–4 player setup with names and original character skins.
- Add a responsive bar, execution scenes, synthesized audio and accessibility controls.
- Add unbiased six-chamber revolvers, durable shot commits, eliminations and match management.
- Ship one self-contained HTML file and Windows launcher, with automated tests.

## Capabilities
### New Capabilities
- `roulette-engine`: Independent fair revolvers and durable match lifecycle.
- `shared-bar`: Offline setup, cinematic execution, controls and management.
### Modified Capabilities
None.

## Impact
New vanilla JS/CSS/SVG application. GSAP is the only runtime dependency; esbuild bundles it inline and Vitest validates behavior. No network services, reused reference assets or physical card rules.
