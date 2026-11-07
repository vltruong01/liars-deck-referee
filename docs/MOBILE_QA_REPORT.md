# Mobile character studio QA — 2026-11-07

## Implemented and inspected

The existing game now uses a 44px header and an in-stage management HUD. Removed the table heading, instruction footer and separate decorative descriptions. Four large character slots use the available stage dimensions instead of shrinking a fixed 960×400 canvas. Essential name/status plates remain separate from faces and controls.

Each player can edit six existing animals, six headwear options, five eyewear options, four mouth options, six suit palettes, five tie colors and a bow tie. A native dialog provides a large preview, category tabs, randomize, cancel and Save. Setup drafts and active matches both persist. Manage Players → Style preserves cylinders, shot counts, elimination state, other players and trigger tokens. Version-1 saves without cosmetic data load with safe defaults.

Accessories use allowlisted original SVG and species head/mouth anchors inside padded bounds. The execution rig contains the animal, illustrated arm and mirrored revolver in one coordinate space. The arm raises toward the temple before FIRE unlocks; both outcomes retain the same anticipation. Results remain fully visible for at least two seconds before automatic return. No new runtime dependency or external assets were added.

## Responsively: exact integration result

- **VERIFIED:** located the official `v2.0.0-beta.0` Windows installer through the upstream release repository: [official release](https://github.com/responsively-org/responsively-app-releases/releases/tag/v2.0.0-beta.0). No existing desktop installation was found in the inspected install locations/processes.
- **VERIFIED:** executed `codex mcp add responsively -- npx -y @responsively/mcp` and `codex mcp list`; server registration is enabled.
- **FAILED — environment policy:** the command to obtain/install/launch the official installer was rejected before execution with **“blocked by policy”**. No successful download, installation or desktop launch is claimed.
- **FAILED — desktop bridge:** an actual JSON-RPC `initialize` request to `npx -y @responsively/mcp` returned error `-32000`: “Responsively App is not installed, or an installed version predates the MCP bridge.” [Raw evidence](mobile-qa/responsively-mcp.json). Consequently app state, device listing, navigation and screenshots through that bridge could not be executed. Registration alone is not integration success.
- **NOT AVAILABLE:** this running session exposes no newly registered Responsively tools. Actual multi-viewport verification therefore used existing Playwright/Chrome, as authorized by the task fallback. No parallel browser agents were introduced.

To resume Responsively later:

1. Install the official Windows beta from the release above, then launch Responsively once so it records its installation location. The current automated installation policy must first permit that action, or the user must install it themselves.
2. Close and reopen Codex, reopen this existing project, run `codex mcp list`; `responsively` should remain enabled. Registration does not need repeating. For a custom install set `RESPONSIVELY_APP_PATH` as documented by the MCP package.
3. Run `npm run dev`. Ask Codex to call `get_app_state`, `list_devices`, `set_active_devices`, `navigate` to `http://127.0.0.1:4173/`, then `screenshot`; retain returned evidence in this directory. Do not mark those calls verified until they return successfully.

## Rendered defects and corrections

| Defect / root cause | Correction and verification |
|---|---|
| Small or apparently missing skins: fixed header/heading/footer bands consume short viewport height; a fixed canvas scales all art down together. | Full-height responsive slots, compact header and HUD, padded SVG bounds. [Before/after sheet](mobile-qa/review-before-after.png); all four characters were clicked and inspected at every target size. |
| Older seat-specific rules retained pixel top offsets and translated 2/3-player slots, pushing them outside the frame. | Replaced positions/transforms for every player count in the same camera coordinate space. Kept existing geometry assertions; the 2/3/4-player regression caught and verified the correction. |
| Entrance translated the now-full-height stage below the viewport. | Opacity-only stage entry; camera motion remains intentionally framed within the scene. No characters are removed to fit the viewport. |
| Floating revolver had no connection to the character. | Shared SVG rig, shoulder anchor, illustrated bent arm/hand, mirrored gun and common raising/anticipation sequence. Four different accessories remain attached in each execution view. |
| Death rotation/translation exceeded the lower edge and dimmed the outfit too much. | Reduced collapse angle/displacement, scaled the whole rig to 90% and retained 45% opacity. [Before](mobile-qa/before-death-frame-667x375.png), [corrected result](mobile-qa/elimination-667x375.png). Both visual inspection and the existing fatal-effect bounds test verified the fix. |
| Setup Save previously existed only in memory until a match started. | Separate normalized setup draft storage; browser tests reload before starting and after later cosmetic edits. |
| Setup's player-count handler also matched the entire player grid, so a tap on a name could rebuild the form and lose focus. | Bind only the three `.count-button` controls. Added actual touch → focus → keyboard typing verification; the name input keeps focus and accepts text. |

## Screenshots actually opened

Playwright navigated to the real local HTTP app, configured four independent outfits through the UI, saved them, selected every seat, fired isolated deterministic survival/death fixtures, checked result duration and waited for automatic return. No production RNG hook was added. Initial baseline images were captured from the prior build before editing.

The following sheets were opened with the image-viewing tool, not merely generated. Each states sheet contains setup, customization, table, selection transition, execution, survival and elimination. Each seats sheet contains all four customized execution views. Individual full-resolution files use `{state}-WIDTHxHEIGHT.png` and `execution-p1` through `execution-p4` in `docs/mobile-qa/`.

| Viewport | Main states | All four seats | Observed result |
|---|---|---|---|
| 667×375 | [states](mobile-qa/review-states-667x375.png) | [seats](mobile-qa/review-seats-667x375.png) | Large distinct silhouettes; tall hat, rabbit ears, glasses and mouth pieces visible; wrapped result subtitle clears return control. |
| 740×360 | [states](mobile-qa/review-states-740x360.png) | [seats](mobile-qa/review-seats-740x360.png) | Shortest target retains editor actions, all four nameplates and the complete execution rig. |
| 844×390 | [states](mobile-qa/review-states-844x390.png) | [seats](mobile-qa/review-seats-844x390.png) | HUD clears heads; each outfit remains aligned in the left execution panel. |
| 932×430 | [states](mobile-qa/review-states-932x430.png) | [seats](mobile-qa/review-seats-932x430.png) | Larger stage preserves character spacing and plate readability without scrolling. |
| 1366×768 | [states](mobile-qa/review-states-1366x768.png) | [seats](mobile-qa/review-seats-1366x768.png) | Same composition scales to desktop; complete hats/antlers and controls remain visible. |

Also opened [all six animals with top hats/glasses/cigars](mobile-qa/review-species.png) and the before/after comparison. Automated painted accessory checks use `getBBox()` transformed through `getScreenCTM()`, not only the outer SVG box. The test iterates all six animals against every hat; this complements visual review rather than replacing it. Transition screenshots intentionally capture the brief crossfade with the camera moving behind the execution layer.

UI UX Pro Max's installed skill and UX search were actually read/run; applied priorities include content hierarchy, viewport `dvh`, readable contrast, 44px essential controls, semantic tabs, reduced motion and preserving editing state. Decorative tiny labels are secondary; this is not a full accessibility certification.

## Regression and release evidence

- Production build: `npm run build` — self-contained HTML, locally bundled GSAP, SVG and WebAudio.
- Vitest: `node node_modules/vitest/vitest.mjs run --reporter=json --outputFile=docs/mobile-qa/vitest-results.json`. [Final result](mobile-qa/vitest-results.json).
- Playwright: `npx playwright test --trace on`. [Final result](playwright-results.json); includes original eight-size layout/offline/recovery checks plus five customized viewport flows and all-species coverage. Existing timing budgets were extended to cover the requested raising/result durations; geometry and duplicate-action assertions were retained.
- `randomChamber` and `fire` function text is unchanged from pre-change commit `3fce3be`; [integrity evidence](mobile-qa/roulette-integrity.json). The engine file changes only import/normalize optional cosmetics and expose a guarded cosmetic edit. Existing six-chamber/progress tests still run.
- OpenSpec delta/main specs and tasks updated; `AGENTS.md` now requires real browser interaction, opened screenshots and preservation of cosmetic/roulette state for future UI changes.

Final regression: **39/39 Vitest, 16/16 Playwright**, zero failures, skips or flaky tests. Strict OpenSpec validation: **4 passed, 0 failed** ([output](mobile-qa/openspec-validation.txt)). All sixteen final trace ZIPs passed `zipfile.testzip()` ([manifest](mobile-qa/trace-manifest.json)); a complete [667×375 customization trace](mobile-qa/customization-trace.zip) is retained with this report. Open with `npx playwright show-trace docs/mobile-qa/customization-trace.zip`.

The corrected standalone HTML and index match exactly; ZIP integrity and ZIP-to-dist contents passed ([release evidence](mobile-qa/release-integrity.json)).

### Live deployment verified

Source commit `67576a8` and `gh-pages` commit `1dee5310a799406c378644e95f846ec6e40ce2fd` were pushed to the existing repository. [Pages API evidence](mobile-qa/deployment-pages.json) reports `built`, HTTPS enforced, no build error. [Live HTTP evidence](mobile-qa/deployment-http.json) confirms HTTP 200 and 149,555 bytes matching the tested HTML exactly (SHA-256 `9b39de69c6a008617871a696ae15da145abd50a678fd8ae817be97bbd4d45388`).

Executed `node scripts/verify-live.mjs` against [the public website](https://vltruong01.github.io/liars-deck-referee/) in **headed Chrome at 844×390**. Actual touch/keyboard name entry, cosmetic Save, four-player setup, FIRE, survival feedback, automatic return, appearance editing after a shot and reload persistence passed; shot count remained one and browser errors were empty. [Machine-readable result](mobile-qa/live-verification.json). Opened and visually inspected all four live images: [editor](mobile-qa/live-customization.png), [table](mobile-qa/live-table.png), [execution](mobile-qa/live-execution.png), [result](mobile-qa/live-result.png). Both deterministic outcomes and all five viewport sizes were verified locally in the full suite.

## Remaining limits

Responsively desktop/MCP inspection remains blocked as described above; Playwright is the actual responsive evidence. No physical phone, mobile Safari or virtual-keyboard check was available. Cigarette/cigar smoke is optional and was not added; there is no ambient smoke animation to conflict with reduced motion. Existing reduced-motion/flashing controls remain tested. Offline file viewing still requires a browser that runs local JavaScript.
