# Relaxed idle arms and overhead shooting HUD

Continues the compact table nameplate update. Idle right arm now folds inward across the waist (shoulder 76 degrees, forearm 136 degrees), with a flat relaxed palm instead of a dangling closed gun grip. Left arm remains attached. The same two-arm hierarchy raises the weapon; ready aiming coordinates, grip artwork, suspense timing, firing reactions and camera return are unchanged. No roulette/save changes. The firing/reaction/return controller block was compared directly against the preceding commit and is identical ([preservation evidence](idle-hud-qa/preservation.json)).

Shooting name/shot panel is centered over the actual head bounding box, positioned 8px above the highest head/hat geometry. Names use 18-24px type and shot count uses 12-14px. Resize, entry and HUD height changes (including the added DIED line) update its position. Opened fatal-reaction frames exposed the height-change edge case; a HUD ResizeObserver prevents the panel from touching ears when the status appears ([opened fatal frame](idle-hud-qa/fatal-hud-667x375.png)). Reserved space prevents toolbar/headwear overlap on small screens. Table labels retain their compact content width and 26/28px height.

Before: [idle hooked hand](nameplate-qa/table-1366x768.png), [corner shooting HUD](execution-qa/live-execution.png).

Opened after screenshots at the five targets. Normal hands now rest across the torso; overhead names stay readable and clear of tall hats/antlers. New regression assertions require the HUD centered within 1px and 4-12px above the head/hat; retain strict two-arm, joint continuity, painted bounds, death appearance and repeated-return checks. The old name-vs-entire-SVG check now compares actual head geometry because padded blank SVG space is intentionally used for the HUD.

| Size | Idle/table | Overhead HUD |
|---|---|---|
| 667x375 | [image](idle-hud-qa/table-667x375.png) | [image](idle-hud-qa/ready-667x375.png) |
| 740x360 | [image](idle-hud-qa/table-740x360.png) | [image](idle-hud-qa/ready-740x360.png) |
| 844x390 | [image](idle-hud-qa/table-844x390.png) | [image](idle-hud-qa/ready-844x390.png) |
| 932x430 | [image](idle-hud-qa/table-932x430.png) | [image](idle-hud-qa/ready-932x430.png) |
| 1366x768 | [image](idle-hud-qa/table-1366x768.png) | [image](idle-hud-qa/ready-1366x768.png) |

Build/standalone/offline ZIP integrity: [JSON](idle-hud-qa/release-integrity.json). Final regression: **39 Vitest and 29 Playwright passed**, zero failures/skips ([summary](idle-hud-qa/test-summary.json)). Verified [live Pages](https://vltruong01.github.io/liars-deck-referee/) in headed Chrome at 844x390, HTTP 200; actual response matches tested dist (SHA256 `fd6f396a76f9b7ad44bba3440453c149b73d25dcd960db7d99e8d6c00e3d4dc9`). Name is 18px, HUD/head center difference .006px and gap 8.31px. Random live shot produced DIED; automatic return, one shot, appearance editing with progress intact, persistence and a separate customized fatal fixture passed, with no JavaScript errors ([live JSON](idle-hud-qa/live-verification.json)). Opened actual live [idle table](idle-hud-qa/live-table.png), [overhead HUD](idle-hud-qa/live-execution.png), [result](idle-hud-qa/live-result.png) and [DIED/X](idle-hud-qa/live-death.png).

Source commits: `bf0dcae` (idle pose/overhead HUD), `a73d1ff` (status-height positioning). Pages subtree `b334e2ab921ca870c4bc296d25b72e12a9516c9e` reports built/HTTPS/no build error ([API](idle-hud-qa/deployment-pages.json)). Both the compact table labels and idle/HUD follow-ups are complete. Responsively blocker unchanged; no reinstall. Chrome viewport evidence only; no physical-phone/Safari or independent listening check.
