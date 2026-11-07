# Design

## Context
See proposal.md. The checkout was empty; Node 22 and npm are available on Windows. The reference repository was cloned outside the source tree and inspected; its custom reuse terms and third-party asset provenance favor original SVG and Web Audio assets.

## Goals / Non-Goals
Goals: stable saved revolvers, responsive cinematic scenes, a single HTML release that works via file://. Non-goals: physical card logic, networking, accounts, or cryptographic secrecy against someone inspecting their own local storage.

## Decisions
- Pure immutable engine separated from DOM/GSAP; injected secure RNG permits exact exhaustive fairness tests. Rejection sampling of a uint32 removes modulo bias. Never use weighted odds or reshuffle blanks.
- Persist each shot and its pending reveal synchronously before starting a common anticipation timeline. Reload recovers the committed result, without another trigger pull. A shot ID and pending state reject duplicate actions. Save failures block progress rather than silently rerolling.
- Versioned JSON in localStorage with structural and semantic validation; malformed saves are preserved until explicit replacement. Revision checks reject stale writes in other tabs. One shared-screen tab is the supported play mode.
- Inline original SVG portraits, room, revolver, system fonts and synthesized Web Audio; GSAP handles camera, recoil, reactions and scene transitions. Reduced motion and flashing disable violent visual movement/flash.
- esbuild produces an IIFE embedded with CSS in dist/Liars-Deck.html and dist/index.html. No fetch, modules, service worker or server needed to play. Alternative Vite hosting was unnecessary.

## Risks / Trade-offs
- Browser storage can be disabled or cleared → explicit errors, stable file-path launch guidance; no silent reset of malformed saves.
- Mobile file opening varies by OS → self-contained HTML is portable; optional local HTTP preview for development. No network dependency in the game.
- Synthesized audio differs by speakers → volume control, limiter, user-gesture initialization; audio failure never changes outcomes.
- Hidden tabs may pause animation → committed result is durable, restored on reload.

## Migration Plan
Build, run engine tests, verify browser flows and file launch, then distribute dist. Keep source and lockfile for rebuilds. Schema 1 rejects unknown versions without overwriting them.
