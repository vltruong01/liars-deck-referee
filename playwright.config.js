import { defineConfig } from '@playwright/test';
export default defineConfig({
  webServer:{command:'npm run dev',url:'http://127.0.0.1:4173',reuseExistingServer:true,timeout:15000},
  testDir:'./tests/browser',
  timeout:45000,
  expect:{timeout:6000},
  fullyParallel:true,
  workers:3,
  reporter:[['list'],['json',{outputFile:'docs/playwright-results.json'}]],
  outputDir:'test-results/playwright',
  use:{channel:'chrome',headless:true,hasTouch:true,trace:'retain-on-failure',screenshot:'only-on-failure'},
});
