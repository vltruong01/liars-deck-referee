# Mobile landscape UI refinement — 2026-11-07

The existing game now uses a fixed safe-area-aware viewport shell. Setup, the table and the two-region execution screen fit one landscape screen. The roulette engine and save schema are unchanged.

## Defects fixed

| Observed defect | Source change and verification |
| --- | --- |
| At 844×390 the old document was 861px tall, clipping most of the table | Dynamic viewport shell; flexible rows reserve controls. Final document is 844×390. |
| Independent portrait sizes and escaping nameplates caused crowding | One 960×400 stage scales uniformly to available width **and** height; seats have disjoint art/name regions. Geometry, touch selection and screenshots checked for 2/3/4 players. |
| Execution was a tall stack, with the gun covering critical information | Character/name/revolver on the left; pull count/FIRE/result on the right. Full name is available through the seat's accessible label/title; long names truncate within their own bands. |
| Rotating the gun extended its box below the viewport | Moved its anchor upward with reserved recoil space; bounding-box checks pass. |
| Background player text ghosted through the execution overlay | Opaque scene background with a local spotlight; inspected the new 667×375 render. |
| At 1920×1080 the character floated far above the revolver | Capped the shared art stage at 520px and centered it; reviewed a fresh desktop render. |
| Camera zoom cropped the scene | Bound zoom to 1.16; focus derives from the selected seat. Tests check transform origin against each seat center. |
| Tapping quickly could reach FIRE during entry | FIRE unlocks after entry; cancelled transition callbacks cannot enable a newer selection. Added a regression test. |
| Tiny secondary controls / excessive headings | Compact heading bands, 44px main controls, 64px mobile FIRE, larger management buttons and inline SVG utility icons. |

## Screenshots

- [Before / after at 844×390](screenshots/before-after-844x390.png)
- [All five phone sizes, long names](screenshots/mobile-review.png)
- [Tablet and desktop sizes](screenshots/large-review.png)
- [agent-browser inspection](screenshots/agent-review.png)
- [Execution at 667×375](screenshots/agent-execution-667x375.png)
- [Elimination](screenshots/eliminated-667x375.png) / [survival](screenshots/survived-667x375.png)

The image files were opened and visually inspected; saving them alone was not treated as review. Contact sheets resize images only for comparison; original PNGs remain alongside them.

## Tests

- **36/36 Vitest tests pass**, including all original 35 tests and a new cancelled-entry callback regression. [JSON](test-results.json)
- **10/10 Playwright tests pass** using actual Chrome, real GSAP and touch input. [JSON](playwright-results.json)
- Eight exact viewports: 667×375, 740×360, 844×390, 852×393, 932×430, 1024×768, 1366×768, 1920×1080.
- At each size: setup, four long names, four seats, each execution, camera focus, FIRE/return, two- and three-player layouts, settings and management. Assertions check document/panel overflow, element bounds, disjoint seats/nameplates, plates clear of faces and touch control sizes.
- Integration checks include blank/fatal outcomes, pending-shot recovery, refresh persistence, reset, winner, portrait-to-landscape transition, fullscreen fallback, reduced-effects preferences and local **file://** launch with networking disabled.
- `src/engine.js` SHA-256 before and after: `7794D868D385FAA44E142C977A979859028FE4D1CDDB23D0F3C28F202BB032F3`. No RNG, player-state or storage-schema changes.

Reproduce:

```sh
npm run build
npm test
npm run test:browser
node scripts/inspect-ui.mjs
```

## Tools and limits

Installed agent-browser **0.27.0** and its Chrome for Testing; its doctor reports no failures. Configured an isolated local-file session and captured table/execution at 667×375, 844×390, 932×430 and 1366×768. No personal browser profile or saved game was touched.

Installed UI UX Pro Max CLI **2.15.0** with `uipro init --ai codex`; read `.agents/skills/ui-ux-pro-max/SKILL.md` and used its touch, safe-area, hierarchy, contrast and motion guidance. The skill can be read directly in this session; no restart was needed. Existing Vitest, GSAP and OpenSpec installations were retained. Playwright was added as a development dependency because no setup existed in this checkout.

The folder has no `.git` repository, so there was no Git working-tree diff. Existing source and in-progress OpenSpec artifacts were retained and continued.

No physical phone, Safari or Firefox run was performed. Real mobile browser toolbars, virtual keyboards and notches can vary; viewport emulation and safe-area-aware CSS are the available evidence. Fullscreen is optional and depends on browser support. Portrait phone play intentionally shows a rotate prompt. Existing file-viewer JavaScript limitations still apply. These tools are development-only; playing requires just the self-contained HTML.

## Launch

Open `dist/PLAY.cmd` or `dist/Liars-Deck.html`. Rotate a phone to landscape. Optional fullscreen is the square-corners button. Keep the same browser/profile/file location to restore progress. `Liars-Deck-Offline.zip` contains the refreshed standalone release.
