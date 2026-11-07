## Why

Existing gameplay needs an evidence-based full regression pass and durable quality gates. Accessibility and reviewed screenshot comparisons are not currently automated.

## What Changes

- Verify DevTools MCP, axe, ESLint and existing browser/unit tooling against the built app.
- Reproduce and repair confirmed correctness, interaction and accessibility defects without redesigning working scenes or changing randomness.
- Add deterministic reviewed visual baselines, accessibility regression tests and CI; record actual evidence and release verification.
- Double the shared FIRE anticipation from 2.85 to 5.7 seconds, as requested during QA, and remove the local project directory only after source/release publication is verified.

## Capabilities

### Modified Capabilities

- `shared-bar`: a 5.7-second common anticipation before either shot outcome; saved pending results still recover directly.

## Impact

Focused source corrections, development dependencies, browser tests, CI, AGENTS.md and QA documentation. Offline artifacts remain self-contained.
