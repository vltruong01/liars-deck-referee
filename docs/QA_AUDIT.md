# QA audit — 2026-11-07

**VERIFIED:** local application, focused touch-control correction, visual inspection and full regression. **FAILED:** agent-browser trace export. Valid Playwright traces provide the recorded regression evidence. **FAILED:** GitHub deployment is blocked by missing repository metadata/destination; nothing was published.

## Tools actually checked

| Tool | Installation/configuration and actual use | Result/evidence |
|---|---|---|
| OpenSpec 1.16.1 | Existing `openspec/config.yaml`, two main specs and archived implementation/redesign changes inspected. Current `visual-qa-audit` documents the correction and checks. `openspec validate --all --strict --no-interactive` executed. | **VERIFIED:** 3 items passed, 0 failed; [validation output](qa-audit/openspec-validation.txt). `skip_specs` is explicit: this fix restores the existing 44px requirement, adding no behavior contract. |
| UI UX Pro Max 2.15.0 | Read `.agents/skills/ui-ux-pro-max/SKILL.md`; local Python UX search executed. Applied touch-target, viewport, hierarchy, contrast and motion guidance to rendered screens. | **VERIFIED:** readable local skill/data; found and corrected undersized management fields. No tool reinstall. |
| agent-browser 0.27.0 | Ran and read `agent-browser skills get core`; doctor passed 7 checks. Used native Windows executable, isolated sessions, installed stable Chrome, `--headed --executable-path` on each command; config enables local files/dark mode. | **VERIFIED:** actual HTTP navigation, snapshots, selection, FIRE, both results, automatic return, screenshots and empty browser errors/console. [Final command log](qa-audit/agent-commands.jsonl), [fixture runner](../scripts/audit-ui.mjs). Trace subfeature **FAILED**, described below. |
| Playwright Test 1.65.0 | Existing Chrome/touch config, eight landscape sizes and two additional recovery/accessibility flows. Ran `npx playwright test --trace on`. | **VERIFIED:** 10 passed, 0 failed/skipped/flaky; [JSON results](playwright-results.json), [trace manifest](qa-audit/trace-manifest.json). |
| Vitest 5.1.0 | Existing engine/application/release tests. Ran `node node_modules/vitest/vitest.mjs run --reporter=json --outputFile=docs/test-results.json`. | **VERIFIED:** 36 passed, 0 failed; [JSON results](test-results.json). |
| GSAP 3.15.1 | Dependency resolves; imported and bundled in `src/app.js`. Timelines drive camera entry, anticipation, recoil and reactions; browser tests inspect actual transforms/phase locks. | **VERIFIED:** animated entry, shot and return executed in Chrome; all camera/duplicate-action checks passed. |
| Simsz/russian-roulette | Existing external reference clone readable at `%TEMP%/liarsdeck-roulette-reference`, commit `345e4e576fe505296d30f0238c4478740f17de9d`; README/license/provenance reviewed. | **VERIFIED** accessible. **NOT USED** as runtime dependency or copied assets/code: original SVG/WebAudio and the project's independent six-chamber engine are retained. See [notices](../THIRD-PARTY-NOTICES.md). |

Versions, dependency resolution, doctor, reference commit and Git failures: [environment output](qa-audit/environment.txt). Source inspection and installed skill reads are distinguished from browser execution above; installation alone was not counted as integration.

## Browser inspection and visual findings

Started `npm run dev`; `http://127.0.0.1:4173/` returned HTTP 200. The exploratory runner used that actual URL. Production `createMatch` seeded isolated localStorage fixtures with chamber 0 (fatal) or 5 (blank); it does not patch production RNG or alter the engine. Each outcome used normal player selection, ready-state wait, FIRE, result inspection and automatic return. A second FIRE attempt left exactly one committed shot. All eight outcome measurements have document dimensions equal to their viewport and a visible 48px return button: [measurements](qa-audit/measurements.json).

Opened all four review sheets with the image-viewing tool and inspected all 16 constituent screenshots, including desktop. These are observations of rendered images in addition to DOM assertions:

| Viewport | Four-state sheet actually opened | Visual observation |
|---|---|---|
| 667×375 | [table / execution / survival / elimination](qa-audit/review-667x375.png) | Four seats remain distinct, foreground bear stays inside stage; FIRE and return fit. Full execution name fits; result subtitle wraps without colliding with button. |
| 844×390 | [four states](qa-audit/review-844x390.png) | Table remains centered; character and revolver occupy the left execution panel, action/result the right; no severe overlap. |
| 932×430 | [four states](qa-audit/review-932x430.png) | Larger characters retain seat spacing and readable status; nameplate bounds do not cover adjacent characters. |
| 1366×768 | [four states](qa-audit/review-1366x768.png) | Scene scales up coherently; revolver stays within the character panel; hierarchy and essential controls remain clear. |

Individual full-resolution images use `qa-audit/{table,execution,survival,elimination}-WIDTHxHEIGHT.png`. Post-elimination table images are also retained. Nameplates deliberately ellipsize a long fixture name; execution shows it fully. Cream/gold text separates from the dark room; large FIRE/result headings lead the eye. Cinematic quality remains stylized SVG rather than realistic art. Tiny decorative labels are secondary; no full WCAG certification or physical-device readability claim is made.

### Corrected defect: management name fields

**Root cause:** utility dialog CSS set mobile fields to 32px and desktop fields to 36px despite the existing essential-control minimum of 44px. Increased fields to 44px; compact landscape rows now place Save/Reset vertically beside the input and omit redundant mini portraits. Updated the browser assertion to cover inputs as well as action buttons; no assertion was weakened.

- [Before, 667×375](qa-audit/manage-before-667x375.png), [after, 667×375](qa-audit/manage-after-667x375.png): both opened and visually inspected. The before image comes from the prior offline ZIP, extracted as `qa-audit/baseline.html` before refreshing the release.
- Geometry: [before](qa-audit/manage-before-geometry.json), [after](qa-audit/manage-after-geometry.json). After: all four fields 44px; dialog bottom 350.08px within 375px viewport; scroll/client height both 323px. Long input contents can be navigated while editing.
- Source: `src/style.css`; regression: `tests/browser/landscape.spec.js`. One focused correction cycle, focused 667×375 check passed, then the complete regression passed.

## Regression and trace evidence

36 Vitest tests cover six chambers, uniform/rejection sampling, independent revolvers, survival/elimination, duplicates, resets, names, storage and interrupted shots. Ten Playwright tests cover setup/skin selection for 2–4 players, all four seats/camera origins, both outcomes, duplicate FIRE, persistence, recovery/reset/winner, dialogs, reduced effects/motion, portrait prompt, fullscreen fallback, all eight specified landscape dimensions, essential-control visibility and offline file execution/assets.

Ten Playwright trace ZIPs were integrity-checked with Python `zipfile.testzip()`; all passed. [Retained fatal/recovery trace](qa-audit/playwright-fatal-trace.zip) is a complete recording from the final suite; the manifest lists all ten original files under ignored `test-results/playwright/`. Open locally with `npx playwright show-trace docs/qa-audit/playwright-fatal-trace.zip`.

**FAILED — agent trace export:** repeated `trace stop` attempts timed out with daemon RPC/OS error 10060 and produced incomplete ZIPs. They are not accepted as evidence; incomplete exports were isolated under ignored `test-results/qa-agent-incomplete/`. [Failure log](qa-audit/failed-agent-trace-commands.jsonl) is retained. Final exploration does not request that broken export; it retains screenshots, commands and measurements, plus valid Playwright recordings.

The first resize/headed attempt reset navigation to `about:blank` and later fell back to a HeadlessChrome session; [initial image](qa-audit/initial-headed-667x375.png) is explicitly not a passing screenshot. Integration was corrected using the native executable, stable Chrome and consistent headed flags, with navigation repeated after viewport changes. Final command logs record Chrome/156 user agents without `HeadlessChrome`; a Windows game-window title was also observed during headed setup. Initial and failure logs remain separate from final evidence.

## Release and remaining limits

`dist/Liars-Deck.html`, `dist/index.html` and `Liars-Deck-Offline.zip` contain the corrected UI. ZIP integrity, ZIP-to-dist contents and identical standalone/index HTML were verified: [release integrity](qa-audit/release-integrity.json). Engine SHA-256 remains `7794D868D385FAA44E142C977A979859028FE4D1CDDB23D0F3C28F202BB032F3`. No framework, tool reinstall, reference asset import or roulette-logic change was introduced.

**FAILED — deployment prerequisite:** `git status --short` and `git remote -v` report that this workspace is not a Git repository; `gh` is absent. No target GitHub URL or verified write access is available. A destination request was sent; no response has arrived. No repository was guessed/created and nothing was published. The audit change remains unarchived, with deployment follow-up explicitly pending.

**NOT USED:** physical phone, Safari/Firefox hands-on verification and subjective speaker/audio assessment; unavailable in this run. Chrome viewport emulation does not verify phone browser chrome, virtual keyboard or device safe-area behavior. Some Windows CLI text logs contain encoding artifacts; screenshots are the rendering evidence. These limits and the agent trace failure must accompany any later publishing decision.
