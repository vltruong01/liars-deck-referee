## Context

The built single-file app already has deterministic engine tests and clock-controlled animation tests. See proposal.md for motivation.

## Goals / Non-Goals

Confirm and repair existing defects; preserve six-chamber randomness and durable shot guards. No new gameplay, visual redesign or framework.

## Decisions

- Use a repository MCP SDK client with isolated Chrome for actual DevTools tools; this works without falsely claiming runtime connector registration.
- Axe checks real dialogs and game states. ESLint scopes browser and Node globals separately and checks correctness without formatting churn.
- Pause Playwright's browser clock for nine screenshot states at all five required sizes. Keep real-clock timing tests separately. Review generated images before accepting reference snapshots.
- Run CI on Windows to match reviewed Windows font rendering; do not generate baselines automatically in CI.

## Risks / Trade-offs

- Platform/browser font differences → Windows reference environment and explicit limited pixel tolerance; inspect any failed diff.
- Automated accessibility is incomplete → inspect rendered images and keyboard focus alongside axe.
- Desktop tool integration unavailable → report exact blocker and use the operational browser tools sequentially.

## Migration Plan

Run focused repairs, then the full suite and offline artifact checks. Commit, publish existing dist subtree and verify exact public bytes plus real gameplay. Roll back to the prior verified release if a critical regression appears.
