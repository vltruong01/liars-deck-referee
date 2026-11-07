# GitHub Pages

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
