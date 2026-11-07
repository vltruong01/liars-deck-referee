# GitHub Pages

Latest mobile character studio deployment: source `67576a8`, Pages `1dee5310a799406c378644e95f846ec6e40ce2fd`, verified 2026-11-07. 39 Vitest / 16 Playwright tests passed. The live HTML matches the tested artifact byte-for-byte; headed Chrome verified setup, customization, a shot, automatic return and cosmetic editing without lost progress. See [current QA evidence](MOBILE_QA_REPORT.md).

Repository: https://github.com/vltruong01/liars-deck-referee

Website: https://vltruong01.github.io/liars-deck-referee/

The `main` branch retains project source and QA evidence. The `gh-pages` branch contains only the verified `dist` output and is published from its root by GitHub Pages. Dependencies and locally installed agent skills are excluded from Git.

## Updating

After changing application source, build and complete the appropriate checks before publishing:

```powershell
npm ci
npm run build
npm test
npm run test:browser
git add .
git commit -m "Describe the verified change"
git push origin main
git subtree push --prefix=dist origin gh-pages
```

Do not run `npm ci` when existing dependencies already match the lockfile. Changes to documentation alone do not require another application regression run. Check the Pages build and live website after pushing a new `dist` commit.

The initial deployment uses the release verified in [QA_AUDIT.md](QA_AUDIT.md): 36 Vitest and 10 Playwright tests passed, with four-state visual inspection at four viewport sizes. Agent-browser trace export remains a documented tooling failure; valid Playwright traces were retained. No GitHub credentials are stored in source or the game.

Initial publication verified on 2026-11-07: Pages build `1348583204` completed successfully for `gh-pages` commit `202b0a1577e5609f6c4abfb26fc7af1c3c21cdfc`. HTTPS returned 200 and HTML matched the tested artifact byte-for-byte. A headed Chrome smoke check at 844×390 completed setup, player selection, FIRE, survival, elimination and automatic return on the public URL; browser errors were empty. Opened and visually inspected the deployed table, execution and fully revealed result screenshots. Evidence: [Pages](qa-audit/deployment-pages.json), [HTTP/hash](qa-audit/deployment-http.json), [browser commands](qa-audit/deployment-browser.jsonl), [table](qa-audit/deployed-table.png), [execution](qa-audit/deployed-execution.png), [result](qa-audit/deployed-result.png).
