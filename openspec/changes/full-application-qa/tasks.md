## 1. Tool and source audit

- [x] 1.1 Run actual DevTools MCP diagnostics, axe baseline and ESLint; record source/runtime findings and tool limitations.

## 2. Confirmed repairs and quality gates

- [x] 2.1 Reproduce confirmed defects, repair source with focused regression checks, and review before/after rendered evidence.
- [x] 2.2 Add and visually review nine clock-controlled screenshot states at five sizes; confirm comparison tests pass without updating baselines.
- [x] 2.3 Add accessibility/state recovery regressions, lint command, CI and future-change AGENTS rule; verify checks execute.

## 3. Release integration

- [x] 3.1 Run full unit/browser/axe/lint/build and offline checks, inspect fractional rig/return frames, and document actual results in FINAL_QA_REPORT.md.
- [x] 3.2 Refresh offline archive, commit/push/deploy only after critical checks pass, then verify public artifact and browser gameplay; record release evidence.

- [x] 3.3 Verify remote source and Pages before deleting the exact local project directory requested by the user.
- [ ] 3.4 Delete the requested local project directory and verify absence. BLOCKED: execution policy rejected the guarded PowerShell deletion before execution with "blocked by policy"; Test-Path still returns True. User/environment action is required.
