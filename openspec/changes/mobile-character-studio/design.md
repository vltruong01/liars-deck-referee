# Context
The existing fixed stage and oversized heading/footer reduce mobile art space. See proposal for motivation.

# Goals / Non-Goals
Keep complete silhouettes and essential controls visible in one viewport. Retain original SVG, durable shots and offline bundling; no 3D or external character assets.

# Decisions
- Use percentage-based character slots with HUD clearance and a shared camera coordinate space, replacing the fixed design-stage scale.
- Normalize optional cosmetics through allowlisted choices; legacy version-1 saves receive defaults without changing cylinders or tokens. Leave randomChamber/fire unchanged.
- Compose accessories in one padded SVG with per-animal anchors; contain character, arm and gun in a shared rig.
- Native editor dialog: large preview, six category tabs, option grid, randomize/cancel/save. Only Save commits the draft.
- Responsively desktop installation is distinct from MCP registration. A policy/access blocker must be documented; Playwright provides continued QA.

# Risks / Trade-offs
Tall hats/ears require padded bounds and all-species checks. Compact controls need measured 44px targets and screenshot review. Optional appearance fields must not invalidate saves.

# Migration Plan
Keep save version/key. Publish tested dist using existing gh-pages subtree; main retains source and QA evidence. Prior commits support rollback.
