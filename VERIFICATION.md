# Verification — 2026-11-07

Latest landscape redesign verification: see [UI-REDESIGN.md](docs/UI-REDESIGN.md), the updated [Vitest report](docs/test-results.json) and [Playwright report](docs/playwright-results.json). The sections below record the initial release verification before the landscape redesign.

## Automated

`npm run build`: PASS. Release is approximately 124 KiB, a single HTML containing the bundled GSAP runtime, application, CSS, inline SVG and Web Audio synthesis.

`npm test`: **35 tests passed, 3 files** (Vitest 5.1.0, Node 22.14.0, Windows).

- 24 engine tests: uniform mapping over 60,000 deterministic samples; rejection of all four modulo-bias tail values; secure RNG default; each of six possible fatal chambers; progression, immutable independent cylinders, duplicate trigger IDs, dead-player rejection, last survivor, name preservation, individual/full resets, storage failure, stale revisions, corrupted saves and refresh recovery.
- 9 DOM controller tests (happy-dom): 2/3/4 player setup and skins; blank/fatal shot commits and common 1.55-second anticipation; repeated clicks; automatic return; pending fatal result recovery; cancel; rename/reset confirmations; winner/replay; reduced effects/volume; corrupted-save replacement.
- 2 release checks: all runtime resources inline, no external resource tags/CSS URLs/imports; no placeholders; required secure RNG/audio code; GSAP copyright notices; identical static index and Windows launcher path.

DOM tests use a virtual clock and a GSAP scheduler mock to isolate application behavior. They do not prove actual animation rendering or speaker quality; native Chrome checks below complement them.

Machine-readable report: `test-results/vitest.json` (generated locally, ignored by Git). A portable copy is included in `docs/test-results.json`.

## Native Chrome verification

Used Windows computer-use UI automation against Google Chrome; browser DOM host was unavailable, so used native window controls and screenshots. Opened the release via **file:///C:/Users/VUONGLOCTRUONG/Documents/GitHub/liarsbarGun/dist/Liars-Deck.html**, without a dev server.

- Setup loads from disk; four players default; skin arrow visibly changes Wolf to Fox; START GAME creates the match.
- Desktop bar, execution selection, dimming/camera transition, SVG revolver and FIRE control render.
- Fatal shot: ELIMINATED displayed, character collapses, Chrome reports audio playing, automatic return marks player one eliminated and unselectable.
- Reload restores the same eliminated player and all other players at zero shots.
- Screenshot review found table labels obscured and the foreground name clipped; fixed seat stacking, moved rear-player labels above their heads and anchored the foreground seat/name inside the scene.
- Chrome responsive emulation **400 × 642**: names and controls render within width; table scrolls vertically without sideways clipping; execution FIRE and return controls fit.
- Set DevTools network to **Offline**, reloaded the local file successfully; Network panel contains only local HTML and an inline data SVG, no external requests.
- While offline and at phone width, selected player two and fired: common anticipation, SURVIVED text and Chrome audio indicator observed, followed by automatic table return.

## Limits

- No physical phone/device or other browser was available for hands-on checks. Phone file viewers may suppress JavaScript; use a full supporting browser or local static hosting.
- Audio generation is confirmed active by Chrome, and reveal callbacks synchronize effects in code; subjective loudness and speaker fidelity were not independently listened to or measured.
- Desktop internet was not disabled at OS level; the inspected tab used DevTools Offline and the artifact has no runtime network dependencies.
- Browser persistence depends on the browser/profile/file location and available localStorage. Local save contents can be inspected/edited by the device owner; this is a shared offline referee, not a tamper-proof gambling system.

## Tooling and specifications

OpenSpec 1.16.1 installed globally and initialized with `openspec init --tools codex`. Used the spec-driven propose/apply artifact structure; the user's explicit end-to-end instruction overrides the generated propose skill's stop-after-planning boundary. Strict change validation passed. Completed artifacts are archived and new specifications synchronized to `openspec/specs`.

Reference repository was cloned outside application source, licensing reviewed, and no reference code/assets reused. GSAP installed and used for actual transitions; Vitest and esbuild are local development dependencies. All runtime art/sound generation is original. See THIRD-PARTY-NOTICES.md.


Latest executed tool/browser audit: [docs/QA_AUDIT.md](docs/QA_AUDIT.md). Includes the 44px management-field correction, final 36/36 Vitest and 10/10 Playwright results, four-state visual review at four sizes, retained trace and deployment blockers.


## Mobile character studio verification

The later mobile/customization update passed 39 Vitest and 16 Playwright tests, with five-size opened screenshot review and original eight-size regression. See [MOBILE_QA_REPORT.md](docs/MOBILE_QA_REPORT.md) for actual evidence, corrected geometry/collapse defects and the Responsively installation-policy blocker.
