# Full application QA — 2026-11-07

Scope: inspect the existing offline application, repair confirmed defects and add regression gates. During this pass the user also requested twice the shooting suspense, online publication, then removal of the local project directory.

## Confirmed defects and repairs

| Priority | Reproduction / cause | Repair and evidence |
|---|---|---|
| P2, accessibility (axe impact: serious) | Start four players; axe reports `label-content-name-mismatch` on all seats. The explicit accessible name replaced the rendered name/status, including the generated separator. Merely adding `/6` did not fix the mismatch. | Use the button's visible content as its native accessible name; put the selection instruction in `aria-description`. [Before axe](final-qa/axe-before.json), [before table](final-qa/before-table.png); five-size accessibility regressions cover alive, recovered fatal and winner states. |
| P2, resource error | DevTools console/network inspection showed a request to `/favicon.ico` returning 404. | Embed an original SVG spade favicon as a data URL. Subsequent DevTools inspection has no console messages or failed requests. [Actual MCP calls](final-qa/devtools-mcp.json). |
| P2, help copy | Open House Rules: the navigation separator was a literal `?`. | Restore the arrow between New Match and Edit current players. Help is scanned by axe and inspected in the browser. |
| Static correctness cleanup | ESLint found unused presentation helpers, an unused living count, unused test/script bindings and undocumented empty catches. | Remove dead code and document optional-save fallbacks; retain substantive assertions and engine behavior. No undefined-reference or accidental-global error was found. |

No new P0 gameplay or P1 rig/camera defect was confirmed in this pass. Existing two-arm geometry, scoped reaction timelines and stable destination-table preparation remain intact. `src/engine.js` is unchanged: SHA256 `221817ca5abe8921e0dd2e6b95dedd4399f546681fe1fa6676f8137426ae2832`.

## Requested timing change

FIRE commits once immediately, then conceals either outcome for **5.7 seconds**, doubled from 2.85. Additional synthesized breaths and heartbeats sustain the wait, camera push lasts 4.6 seconds, and the final breath ends at 5.22 before the 5.54 trigger movement. Outcome reactions and readable result hold durations are preserved. Reduced effects keep the same suspense duration. Reloading during the extended wait recovers the committed result without consuming another chamber.

## Verified tools

- OpenSpec CLI: project root resolved, `full-application-qa` artifacts and validation used. UI UX Pro Max: local `keyboard focus modal` UX search applied to focus inspection.
- Chrome DevTools MCP **1.12.0**: actually initialized through the MCP SDK stdio client, listed tools, opened isolated Chrome, evaluated DOM/event-handler data, inspected console/network and captured screenshots. Run `npm run dev` then `npm run qa:devtools`. This is a working repository client, not a claim that a new connector hot-loaded into the chat runtime. [Runner](../scripts/devtools-audit.mjs), [evidence](final-qa/devtools-mcp.json).
- Playwright **1.65.0**: real Chrome interactions, timestamped actual SVG/GSAP frames, network-disabled local HTML and deterministic outcome fixtures.
- axe-core Playwright **4.14.0**: full default rules, no excluded violations. Eleven states per required viewport: setup, animal editor, tie options, settings, help, table, confirmation, management, execution, recovered fatal and winner.
- ESLint **10.14.0**: recommended correctness rules, browser globals for source, Node/browser context for test scripts; no formatting rewrite. Development-only minimatch override resolves the installed ESLint transitive advisory; lint verifies compatibility, npm audit reports zero vulnerabilities.
- Vitest **5.1.0** and GSAP **3.15.1** retained and actually exercised by controller/engine and rendered animation tests.
- Agent-browser **0.27.0**: read its core guide; `doctor --offline --quick` returned 8 passes, no failures. Opened the actual local app in an isolated headed session, inspected setup, opened settings, inspected controls and captured [settings](final-qa/agent-settings.png); browser errors were empty. An initial post-navigation snapshot was blank; doctor plus explicit navigation retried successfully. Closed only this owned session. No agent-browser browser ran concurrently with Playwright or DevTools.
- Responsively's prior installation-policy/desktop-bridge blocker remains unchanged; no reinstall was attempted. [Exact blocker and restart instructions](MOBILE_QA_REPORT.md#responsively-exact-integration-result).

Tool setup follows [official DevTools MCP documentation](https://github.com/ChromeDevTools/chrome-devtools-mcp), [Playwright axe integration](https://playwright.dev/docs/accessibility-testing) and [visual comparison guidance](https://playwright.dev/docs/test-snapshots).

## Visual review

Generated **45 reference images**: nine states at 667×375, 740×360, 844×390, 932×430 and 1366×768. Opened and visually reviewed all five contact sheets before accepting references. Setup/editor controls remain visible; tall hats/ears/antlers and mouth accessories stay present; table nameplates remain compact; selected names sit above the hat; the right arm remains attached through the raise; death shows the customized portrait, red X and DIED. Long desktop execution names truncate with the full name retained in the title, as in the existing UI.

- [667×375](final-qa/review-baselines-667x375.png)
- [740×360](final-qa/review-baselines-740x360.png)
- [844×390](final-qa/review-baselines-844x390.png)
- [932×430](final-qa/review-baselines-932x430.png)
- [1366×768](final-qa/review-baselines-1366x768.png)

[Snapshot assertions](../tests/browser/visual.spec.js) freeze the browser clock and dynamic content, preserve intermediate GSAP poses and compare using `toHaveScreenshot()` with a 30-pixel allowance. Baselines must be explicitly reviewed; CI never updates them. Real-clock cinematic tests independently measure suspense for both outcomes. Existing execution tests sample 0/25/50/75/100% raising, reactions, collapse, X and return frames, plus consecutive shots and reduced effects. Geometric tests sample actual painted paths rather than empty rotated bounding-box corners.

The first full comparison run exposed a **test-rendering instability**: 265 changed pixels along text edges in the 932×430 idle screenshot, while geometry and content matched. Opened expected, actual and [diff](final-qa/visual-lcd-diff.png); retained the [trace](final-qa/visual-lcd-trace.zip). Disable LCD subpixel text in the test browser to avoid compositor-dependent text rasterization during overlay opacity changes. Regenerated only after identifying that cause, then reopened all five sheets; the 30-pixel tolerance was not increased and production rendering was not altered.

Additional [muzzle audit](../scripts/muzzle-audit.mjs) samples 8ms intervals around reveal in all five sizes: the muzzle opacity first becomes nonzero at 5.730 seconds (`0.8704`) and returns to zero within 100ms. Opened the small and desktop frames to inspect gun/grip/impact alignment. [Measured data](final-qa/muzzle-checks.json), [phone frame](final-qa/muzzle-667x375.png), [desktop frame](final-qa/muzzle-1366x768.png).

## Automated coverage and integration

Coverage includes 2/3/4-player setup, long names, six animals and cosmetic choices, independent four-player customization, post-shot cosmetic edits, duplicate FIRE protection, early-entry cancellation, both predetermined outcomes, elimination/winner, player/table reset, corrupt-save preservation/replacement, pending-result recovery, repeated reloads, keyboard tab loops, reduced settings, safe viewport geometry and offline file play.

The Windows [quality workflow](../.github/workflows/quality.yml) runs clean dependency installation, lint, unit tests, build and the complete browser suite including axe and screenshot assertions. Windows is used to match reviewed reference fonts. It retains failure traces and actual/diff screenshots for 14 days. `AGENTS.md` now requires relevant regressions for every future code change and actual rendered verification for UI/animation edits.

Source, scripts, tests, dependency/configuration and workflow changes trigger CI; documentation-only updates do not repeat the slow suite. The fractional raise, reaction/collapse and return review sheets were also opened at all five required sizes: [raise example](execution-qa/review-raise-667x375.png), [reaction example](execution-qa/review-outcomes-667x375.png), [return example](execution-qa/review-return-667x375.png). Joints/grip remain connected; collapse preserves the customized silhouette; crossfade reveals a stable table rather than a scaled or offset destination.

## Final local results

- `npm run lint`: passed, no errors/warnings.
- `npm test`: **39/39 passed** across four files.
- `npm run test:browser`: **41/41 passed**, zero skips, failures or flaky tests, **240.57 seconds**. This run compared all 45 reviewed images without updating references.
- Axe: **55 scans, zero violations**, full default rules across eleven states and five sizes.
- Real-clock reveal: approximately **5.70–5.72 seconds** for both outcomes; pre-reveal probe still sees no outcome at 5.4 seconds. Clock-controlled unit/recovery tests assert concealment through 5.65 seconds, including reduced effects.
- Actual offline `file:` launch with network disabled: passed in the browser integration test, including save/reload. Production build requires no runtime downloads.
- `npm run build`: passed. Two HTML filenames are byte-identical; all five offline ZIP entries match dist and ZIP integrity passes. [Artifact integrity](final-qa/release-integrity.json).
- `npm audit`: zero vulnerabilities after the development-only minimatch override. Engine file hash unchanged; OpenSpec change validates.
- [Machine-readable summary](final-qa/test-summary.json), [full browser result](playwright-results.json), [reviewed baseline hashes](final-qa/reviewed-baselines.json).

## Publication and remote verification

Source implementation commit: `ab93fd77548eff532a1b4848825a27e09012b78c`. Pages subtree: `b45c2d184c1687f43942f8654586e62389926e69`. The GitHub Pages API reports **built**, correct `gh-pages` source, HTTPS enforced and no build error. Public HTML is **156803 bytes**, SHA256 `174525e3ce81cb0b10d0c97441f995b8625ae1e4091aca53dd186d7b05bdcaf4`, byte-identical to the tested dist. [Pages API](final-qa/deployment-pages.json).

Actual headed Chrome verification on [the live application](https://vltruong01.github.io/liars-deck-referee/) at 844×390 typed a name, customized the player, fired a normal shot (SURVIVED), observed automatic return, edited cosmetics without changing progress, reloaded, and exercised a separate deterministic fatal fixture with the customized portrait/X/DIED. Direct live suspense measured **5726.4ms** and **5724.9ms**. Two-arm count, overhead HUD gap/centering, stable return camera and single shot consumption passed; JavaScript errors were empty. Opened all five resulting live screenshots. The first live-verifier attempt stopped at its obsolete 5-second assertion timeout; corrected the helper to use the returned configured expect instance with an 8-second timeout and reran successfully. Production code and artifacts did not change. [Live evidence](final-qa/live-verification.json), [live table](final-qa/live-table.png), [live ready](final-qa/live-execution.png), [live death](final-qa/live-death.png).

**GitHub Actions external blocker:** the new workflow was actually triggered, but GitHub rejected the job before checkout or any test step. Its exact annotation is: “The job was not started because your account is locked due to a billing issue.” [Run](https://github.com/vltruong01/liars-deck-referee/actions/runs/42390567793), [API evidence](final-qa/github-actions-blocker.json). No remote CI pass is claimed. The account owner must resolve billing in GitHub, then rerun the workflow. Account/payment settings were not changed. Local checks passed independently, and the separate Pages publication succeeded.

The user explicitly requested deletion of `C:\Users\VUONGLOCTRUONG\Documents\GitHub\liarsbarGun` after publication. Source, offline ZIP, tests, reviewed baselines and this report are stored in the GitHub repository. Independently downloaded six committed files from GitHub (including app, engine, dependency lock and offline ZIP) and verified byte equality: [remote source evidence](final-qa/remote-source-verification.json). The exact local directory was checked to be a normal directory with no reparse points; local cleanup follows final remote synchronization and publication verification. Older QA reports describe historical releases; this report and its final-qa evidence cover the current timing change.

## Limitations

Chrome viewport emulation is not physical-device or Safari testing. Automated axe passes are not a full accessibility certification. Audio buffers/timing are tested, but subjective listening on separate speakers was not performed. Responsively desktop integration is unavailable as documented above. The art remains intentionally stylized SVG. Browser/OS rendering changes can require reviewed reference updates; never approve them solely because a test failed.
