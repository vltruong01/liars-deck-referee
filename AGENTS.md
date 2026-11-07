# Liar's Deck development rules

- Continue this vanilla JS offline project and its OpenSpec history. Do not replace the game or add a framework for UI work.
- Preserve the six-chamber rejection-sampled algorithm, independent revolvers, durable shot token and duplicate-FIRE guards. Cosmetic edits must never consume/reset a shot or reroll a bullet.
- Keep legacy version-1 saves readable. Normalize optional cosmetics to safe defaults. Use allowlisted SVG choices, never interpolate arbitrary saved markup or colors.
- A UI change is not complete from DOM assertions alone. Run the real built app in a browser, interact with the changed flow, capture screenshots and **open those images** for visual inspection.
- Inspect setup, customization, table, each seat/transition, execution and both outcomes at 667x375, 740x360, 844x390, 932x430 and 1366x768. Include four independently customized players and tall headwear/ears. Check complete painted accessory bounds, not only SVG element boxes.
- Use Responsively MCP when installed/accessible; distinguish MCP registration from successful desktop/tool integration. Record exact blockers and restart steps, then continue with Playwright. Never invent tool or screenshot results.
- Keep essential targets at least 44 CSS pixels, gameplay and customization within one viewport, and name/status plates unobscured. Resolve geometry/specificity/transform causes rather than clipping away characters. Frame intentional camera motion inside the stage.
- Respect reduced motion/flashing. Common anticipation must not reveal the outcome early. Results must remain fully readable at least two seconds before automatic return.
- Use focused correction checks first, then one full Vitest and Playwright regression after final UI fixes. Preserve valid traces when needed. Do not weaken checks to hide bugs.
- Update OpenSpec tasks/specs and a concise QA report with actual screenshot paths, opened-image observations, test counts and limits. Do not archive incomplete changes.
- Publish only a verified build to the existing GitHub Pages workflow; verify the live URL and artifact after deployment. Keep credentials, dependencies and local skill installations out of Git.
