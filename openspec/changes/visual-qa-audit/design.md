# Design

## Context
The two prior changes are archived and main specifications validate. The project has no .git, remote or gh executable. Existing tools are installed; no reinstall is needed.

## Decisions
- Reuse the existing HTTP server, agent-browser and test runners. Use synthetic match fixtures in a separate browser session; never alter production randomness.
- Capture/inspect A/B/C/D states at 667×375, 844×390, 932×430 and 1366×768. Record actual headed/headless behavior and limitations rather than inferring it from a launch flag.
- Compact landscape management uses two columns, each with a 44px name field and vertically grouped 44px save/reset actions. Remove decorative mini portraits only inside this dialog to recover space.
- Add min-height checks for management fields to the existing eight-size Playwright regression. Keep roulette engine byte-identical.

## Risks
Headed browser viewport changes may reset navigation; always navigate after setting viewport. If a visible window cannot be verified, explicitly record headless evidence. GitHub publication requires a repository URL and access; do not guess an account or create a repository.
