# Execution rig, HUD and camera correction — 2026-11-07

Continued the existing `cinematic-table-polish` OpenSpec change from `10672b9`. No framework, dependency, save schema or roulette algorithm changed. `src/engine.js` retains SHA256 `221817ca5abe8921e0dd2e6b95dedd4399f546681fe1fa6676f8137426ae2832`.

## Root causes and fixes

- **Extra-arm composition:** the prior execution renderer added an external arm with a shoulder at a different coordinate from the portrait's real shoulder. CSS concealed one idle arm, but broad shirt panels still resembled sleeves. The shared portrait now owns exactly two anatomical arm groups. Its existing right arm contains upper arm → elbow/forearm → wrist/hand/grip/gun. Idle and armed portraits use the same hierarchy, shoulder coordinates and resting transforms. Narrowed torso panels distinguish the body from sleeves. There is no arm-hiding CSS. Species scaling applies to the body and arms together.
- **Continuous raise:** right shoulder and forearm rotate from the same resting SVG transforms toward aiming over .8 seconds. The left arm stays attached. Hand and gun belong to one group, with grip tightening around the wrist pivot. Recovery and collapse use the same joints. Tween targets are scoped to `#execution-portrait`, so the separate centered death portrait retains its idle arms and cannot inherit reaction transforms.
- **Camera bug:** selection previously scaled `.room-camera` to 1.16 behind a fading execution overlay. That transform survived until the overlay finished fading and table DOM was rebuilt, exposing a zoomed table. Table camera motion is removed; suspense push-in belongs solely to `.execution-stage`. Entry, suspense, reaction and transition timelines have explicit owners and cancellation. Generation guards reject stale callbacks. Return sets `returning`, completes the durable result, cancels old owners, renders/resets the destination underneath a fully opaque overlay, then fades execution out. Inputs stay locked until completion.
- **HUD:** a small dark corner panel contains name and `SHOT n/6`; DIED is added after fatal reveal. Names truncate without touching faces or headwear. Table labels use `name · n/6` or muted-red `name · DIED`. ALIVE and redundant result descriptions are removed. Normal play has automatic return; a manual recovery/retry control remains only for recovered pending results or storage failure.
- **Suspense:** both outcomes use the same 2.85-second timeline, committed result, disabled controls, cock/grip cue, soft generated breathing at .4/1.35, heartbeat, subtle forearm trembling and 1.025 camera push. Second breath ends at approximately 2.37, followed by near-silence and trigger movement. Branching begins at reveal only. Volume and reduced-effects settings remain active.
- **Fatal reveal:** synchronized BANG/flash/impact precede joint release, stylized collapse and dimming. At .95 seconds a centered large portrait of the selected animal, outfit, hat, eyes and mouth appears with an offset-stroke red X stamp and restrained particles. Name/DIED are fully visible by 1.25 seconds and held until 3.5 seconds before return. Blank feedback has a small flinch/relaxation, no X and automatic return after 2.7 seconds. Reduced motion keeps opacity transitions and the full suspense delay; reduced flashing suppresses impact/flash.

## Browser and opened-image evidence

Baseline screenshots were captured and opened before editing: [table](execution-qa/before-table.png), [ready](execution-qa/before-ready.png). The initial correction review caught HUD/headwear overlap; a narrower HUD resolved it. Further opened frames caught reaction tweens also affecting the centered death portrait, clipping its hand; scoping artwork tweens to the execution rig resolved that source-level defect. A more folded resting forearm keeps the painted fingers inside the shared portrait, and the execution viewBox reserves the entire gun sweep.

The following sheets were opened for actual visual review, rather than relying solely on DOM assertions. Fractional frames show idle, 25%, 50%, 75%, 100% and ready; outcome sheets include all four customized guests, blank feedback, fatal collapse and centered X; return sheets include intermediate blank/fatal fades and the stable destination.

| CSS viewport | Raising | Guests and outcomes | Return frames |
|---|---|---|---|
| 667×375 | [frames](execution-qa/review-raise-667x375.png) | [frames](execution-qa/review-outcomes-667x375.png) | [frames](execution-qa/review-return-667x375.png) |
| 740×360 | [frames](execution-qa/review-raise-740x360.png) | [frames](execution-qa/review-outcomes-740x360.png) | [frames](execution-qa/review-return-740x360.png) |
| 844×390 | [frames](execution-qa/review-raise-844x390.png) | [frames](execution-qa/review-outcomes-844x390.png) | [frames](execution-qa/review-return-844x390.png) |
| 932×430 | [frames](execution-qa/review-raise-932x430.png) | [frames](execution-qa/review-outcomes-932x430.png) | [frames](execution-qa/review-return-932x430.png) |
| 1366×768 | [frames](execution-qa/review-raise-1366x768.png) | [frames](execution-qa/review-outcomes-1366x768.png) | [frames](execution-qa/review-return-1366x768.png) |

Observed continuous shoulder/elbow bends, two distinct attached arms, attached grip, readable compact HUD, unclipped tall headwear and centered X/name. Long names ellipsize. The table remains at the same position/size through the crossfade. Four successive executions per viewport alternate blank/fatal results across independently customized wolf, hare, bear and stag. Existing all-six-species contact and customization coverage includes fox and raven. Also opened setup/editor/table review sheets at [667x375](execution-qa/review-setup-667x375.png), [740x360](execution-qa/review-setup-740x360.png), [844x390](execution-qa/review-setup-844x390.png), [932x430](execution-qa/review-setup-932x430.png) and [1366x768](execution-qa/review-setup-1366x768.png).

New browser tests use Playwright's paused browser clock to render repeatable real GSAP/SVG frames at .12 + .8×fraction seconds. They assert two visible arm groups, one hand/gun hierarchy, zero shoulder/elbow separation, complete painted bounds and different fractional transforms. Browser RAF probes record every return frame, requiring more than 20 samples per execution with unscaled, constant camera geometry. Other suites use the real wall clock for common reveal timing, fully readable hold, save recovery, duplicate protection and offline regression. No production RNG is patched.

Read `agent-browser skills get core`, then ran native headed Chrome on the real HTTP app: table → select raven → ready → FIRE → customized DIED/X → automatic return → snapshot/errors. [Command evidence](execution-qa/agent-browser.jsonl). Measured CSS viewport was 1036×703; this exploratory session is not mobile evidence. Cold startup returned a successful open message but the spawned process pipe timed out; `doctor --offline --quick` reported 9 passes, and retry on that live session completed. No installation was retried. The exploratory screenshots precede the final portrait-selector correction; final five-size screenshots are authoritative.

One inherited real-time pose assertion initially sampled after the full raise under concurrent trace load. It now captures the idle transform synchronously on the actual click; strict fractional checks remain in the new suite. Old selectors were scoped to execution because all portraits now correctly share the same arm class names. Status/button assertions were updated to the requested DIED/automatic-return contract while probability, saves, bounds and timing assertions remain.

## Final checks and deployment

- **39 Vitest passed** ([JSON](execution-qa/vitest-results.json)).
- **29 Playwright passed**, zero failures, skips or retries, 3.4 minutes ([summary](execution-qa/test-summary.json), [full JSON](playwright-results.json)).
- All **29 trace ZIPs** passed integrity checks; retained [667x375 execution trace](execution-qa/execution-trace.zip).
- Every return probe recorded 29 stable frames per execution; shoulder/elbow gaps remained below .1 CSS pixel, including fractional raising frames.
- Production rebuild matches the tested artifact; index and standalone are byte-identical and the offline ZIP matches dist ([release integrity](execution-qa/release-integrity.json)). HTML: 155211 bytes, SHA256 `d65eb3e4792f236149ad61db154fd1067457d718447fd3f8c1cce140bd489e7f`.
- OpenSpec main shared-bar requirements are synchronized; strict validation passes ([output](execution-qa/openspec-validation.txt)).

## Verified live deployment

- Implementation commit [`b5eb06153b6a366af8cf2f32d9c035c42c49f111`](https://github.com/vltruong01/liars-deck-referee/commit/b5eb06153b6a366af8cf2f32d9c035c42c49f111), pushed to existing main.
- Existing dist subtree published as `6441665be973e513724edfc3621e2e70839d48aa` on gh-pages. API reports built, HTTPS enforced, no build error ([evidence](execution-qa/deployment-pages.json)).
- [Live game](https://vltruong01.github.io/liars-deck-referee/) verified in headed Chrome at **844x390**, HTTP 200; actual response bytes match the tested SHA256 and standalone ([live JSON](execution-qa/live-verification.json)). No JavaScript errors.
- Real setup/name entry, western outfit/top hat/sunglasses/cigar, selection and one normal random shot passed. Actual normal outcome: SURVIVED. Automatic return, exactly one consumed shot, cosmetic editing without changing progress, and reload persistence passed.
- In the same isolated live browser context, loaded a deterministic valid match fixture and fired through the actual published UI. The customized portrait retained the edited monocle, top hat and outfit; DIED/X appeared; right-arm resting transforms were unchanged; automatic return showed DIED on a disabled seat and an unscaled camera. Production RNG code was not patched.
- Opened actual live [ready](execution-qa/live-execution.png), [table](execution-qa/live-table.png), [survival](execution-qa/live-result.png) and [customized DIED/X](execution-qa/live-death.png) screenshots. The release ZIP remains byte-consistent with dist.

All ten tracked tasks in cinematic-table-polish are complete; change retained for review without archiving.

## Limits

Responsively's previously documented desktop integration blocker is unchanged; no reinstall attempted. Real Chrome/Playwright provides viewport evidence. No physical-phone/Safari or independent subjective audio listening was performed. Offline sample rendering verifies generated breathing/silence; it does not rate speaker quality. The art remains stylized 2D SVG.
