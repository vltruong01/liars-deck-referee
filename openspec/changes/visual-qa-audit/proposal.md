# Proposal

## Why
Existing evidence does not cover a running HTTP app with all four game states at every audit size. Audit found management name fields below the existing 44px touch-control requirement.

## What Changes
- Re-audit all seven installed tools and inspect the real HTTP app using an isolated agent-browser session.
- Bring management name fields up to the existing touch-size contract without adding scrolling.
- Save table, execution, survival and elimination screenshots, browser logs/trace, and inspect images directly.
- Strengthen existing browser assertions and produce docs/QA_AUDIT.md with actual statuses.

## Capabilities
### New Capabilities
None.
### Modified Capabilities
None. This restores the already-specified 44px behavior and audits existing contracts; skip_specs is explicit.

## Impact
CSS for management only, QA tooling/tests and evidence. No engine, save format, assets or runtime dependency changes. Publication is gated on verification and a known authorized GitHub destination.
