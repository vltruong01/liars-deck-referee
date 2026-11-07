# Cinematic table polish — 2026-11-07

## Scope and baseline

Continued the existing vanilla game. The initial working tree was clean at `7c78ec5`; local index/standalone HTML and the live Pages response matched. [Comparison evidence](cinematic-qa/source-comparison.json). The entire `src/engine.js` file is unchanged in this update: six-chamber sampling, independent revolvers, durable shot state and duplicate protection retain their existing implementation.

Read the current OpenSpec contracts, AGENTS.md, previous QA reports and the five requested implementation files. Applied the installed UI UX Pro Max guidance for hierarchy, restrained motion, touch targets and content priority; tracked the work in `cinematic-table-polish`. Responsively installation was **not retried**: its previously documented policy/desktop-bridge blocker has not changed. Playwright/Chrome is the actual multi-device evidence.

## Specific corrections

- **Seating:** replaced the row and accumulated seat offsets with one normalized map per player count in `src/staging.js`; consolidated stage rules in `src/stage.css`. In four-player games P1/P2 occupy the upper-left/upper-right rear seats, P3 the left end and P4 the right end. The tabletop is above rear bodies and below end portraits, with labels above those scene layers. End portraits lean inward and the right portrait mirrors as a whole. Two-player games use opposite ends; three-player games add one rear seat. No two guests sit directly in front.
- **HUD:** removed the alive counter and table Manage Players button. New Match remains protected by confirmation, and **Edit current players** inside that dialog preserves existing name/appearance/reset operations without discarding progress. Fullscreen, settings and branding remain compact.
- **Art:** classic suit, vest/rolled-sleeve and western silhouettes are selectable independently of color/tie options. Species shoulder widths, brows, highlights and collar/body proportions differ. Existing saves normalize missing `outfit` to `classic`; other cosmetics remain intact.
- **Mouth pieces:** moved SVG geometry to a local mouth-corner origin with species-specific x/y and upward outward tilt. Cigarette paper/filter, cigar band and glowing distal tips remain on the outward piece. Only gun art is mirrored in the execution rig; inward-facing table portraits mirror the entire animal, preserving the relative mouth direction.
- **Arm/hand:** replaced the long curve with a shoulder-anchored upper arm, elbow joint, nested forearm and hand/gun group. Shoulder and elbow rotate together during raising. The hand covers the grip with distinct thumb/finger strokes. Execution omits the redundant resting right arm/hand while retaining the idle left arm; table portraits keep both resting arms.
- **Anticipation:** both durable outcomes share the same 2.05-second GSAP timeline: grip/cock at 0, shaped breathing at .45, heartbeat cues at .50/1.08, breath finished by approximately 1.47, then near-silence before trigger/reveal. Breathing uses locally generated bandpass noise with inhale/exhale envelopes and the existing volume path.
- **Results:** blank CLICK gets a flinch and gradual arm relaxation. Fatal BANG synchronizes a short muzzle flash, brief stage impulse, red/black full-scene vignette, recoil, shoulder/elbow release and a visible body collapse. Muffled/ringing synthesized aftermath remains offline. Eliminated seats return desaturated/slumped with explicit status. The result name/text remains readable before automatic return, and pending-result recovery remains tested.

Visual corrections during review included removing a hard rectangular spotlight edge from the fatal scene and removing the duplicate resting arm beneath the animated arm. Screenshot probes were moved ahead of expensive image capture and pre-reveal assertions are now scheduled inside the page at 1.6 seconds; this prevents screenshot overhead from masquerading as animation timing.

## Actual browser and image review

Started the real local HTTP game. Ran/read `agent-browser skills get core`, then executed native headed Chrome commands in an isolated existing QA session: load fixture → snapshot/table → select P3 → ready pose → FIRE → full result → automatic return → browser error check. [Command log](cinematic-qa/agent-browser.jsonl); errors were empty. This exploratory session measured **1036×703**; it is not presented as mobile-size evidence. The exact target-size checks below use Playwright.

Playwright used four independently customized players, all living-seat interactions, deterministic isolated fatal/blank fixtures and the real GSAP/WebAudio implementation. Production randomness was not patched. Checks cover seat roles, non-overlapping touch regions, point hit-testing, complete painted arm/hand/gun bounds during motion, reveal timing, two/three-player layouts, named results and automatic return. Original eight-size, customization, legacy-save, offline/recovery and settings regressions remain in the suite.

The review sheets below were opened using the image-viewing capability, including their before/after and intermediate frames. Each contains four-player before/after, two/three-player tables, arm raise, ready pose, breathing, blank relief, fatal impact/collapse and eliminated-table view. Individual full-resolution PNGs remain in `docs/cinematic-qa/`.

| Size | Opened visual evidence | Findings |
|---|---|---|
| 667×375 | [review](cinematic-qa/review-667x375.png) | Rear pair and both ends distinct; long name ellipsizes within a small plate; temple pose and result fit. |
| 740×360 | [review](cinematic-qa/review-740x360.png) | Shortest target retains tall headwear, bent arm, essential controls and complete collapse. |
| 844×390 | [review](cinematic-qa/review-844x390.png) | Table is the gathering point; plate and face regions stay separate; both reactions remain in frame. |
| 932×430 | [review](cinematic-qa/review-932x430.png) | More headroom without a flat row; all characters and accessories remain visible. |
| 1366×768 | [review](cinematic-qa/review-1366x768.png) | Same seating roles and articulated poses scale to desktop; no oversized website headings/HUD. |

Also opened [six species × three mouth accessories and three clothing styles](cinematic-qa/mouth-species-contact.png), with mirrored cigar examples, and [the same combinations in execution rigs](cinematic-qa/mouth-execution-contact.png). Existing all-six-species/all-hats checks still verify padded accessory bounds. Main four-player before images use the previous outfits; new images deliberately demonstrate the new wardrobe silhouettes as well as the seating change.

## Audio and limitations

[OfflineAudioContext evidence](cinematic-qa/breathing-render.json) contains nonzero inhale/exhale RMS and zero tail RMS after the breath envelope. This verifies generated samples and silence, not subjective speaker quality. The live browser runs the synchronized audio path; no independent listening or physical-phone/Safari validation was available. Reduced motion/flashing and volume controls retain their existing contracts. Styling is original lightweight SVG rather than photorealistic animation.

## Final local verification

- Vitest: **39 passed**, zero failures ([JSON](cinematic-qa/vitest-results.json)).
- Playwright: **23 passed**, zero failures, skips or retries; 3.1 minutes ([summary](cinematic-qa/test-summary.json), [full JSON](playwright-results.json)). This includes the five cinematic sizes and existing eight-size regression.
- All **23 trace ZIPs** passed archive integrity checks; retained [667x375 cinematic trace](cinematic-qa/cinematic-trace.zip).
- Opened all four customized execution seats at [667x375](cinematic-qa/all-seats-667x375.png), [740x360](cinematic-qa/all-seats-740x360.png), [844x390](cinematic-qa/all-seats-844x390.png), [932x430](cinematic-qa/all-seats-932x430.png) and [1366x768](cinematic-qa/all-seats-1366x768.png).
- Production build, index/standalone byte equality and offline ZIP integrity passed ([release evidence](cinematic-qa/release-integrity.json)). Both HTML files are 152309 bytes; SHA256 `4274f6b6f7265bf4fda7461e92f56af8bbe64af25621457059ae12ccccd7f8a6`.
- OpenSpec strict validation passed ([output](cinematic-qa/openspec-validation.txt)); main shared-bar requirements were synchronized.

## Verified deployment

- Implementation commit: [`626b2bcbbf677e11195a76b1b9a647bf4d00c2ff`](https://github.com/vltruong01/liars-deck-referee/commit/626b2bcbbf677e11195a76b1b9a647bf4d00c2ff), pushed to the existing main branch.
- Existing dist subtree deployment: `8d942b5904b0d7fa8800983d250ce94184ba5aaf` on gh-pages. GitHub reports **built**, HTTPS enforced and no build error ([API evidence](cinematic-qa/deployment-pages.json)).
- Verified [public game](https://vltruong01.github.io/liars-deck-referee/) with **headed Chrome at 844x390**, HTTP 200. The actual response bytes match the tested dist SHA256 above ([live evidence](cinematic-qa/live-verification.json)).
- Typed a name, saved western outfit/top hat/sunglasses/cigar, started a match, selected the seat and fired once. The random live outcome was SURVIVED. Automatic return, exactly one shot, appearance edits preserving progress and reload persistence passed; JavaScript errors were empty. Both fatal/blank outcomes are exercised deterministically in local regression.
- Opened actual live screenshots: [customization](cinematic-qa/live-customization.png), [table](cinematic-qa/live-table.png), [ready](cinematic-qa/live-execution.png), [result](cinematic-qa/live-result.png). The released offline ZIP remains identical to dist.

All six cinematic-table-polish tasks are complete. The change remains available for review without archiving. Physical-device/Safari testing and subjective audio listening remain outside this verification.
