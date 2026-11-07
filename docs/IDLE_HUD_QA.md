# Relaxed idle arms and overhead shooting HUD

Continues the compact table nameplate update. Idle right arm now folds inward across the waist (shoulder 76 degrees, forearm 136 degrees), with a flat relaxed palm instead of a dangling closed gun grip. Left arm remains attached. The same two-arm hierarchy raises the weapon; ready aiming coordinates, grip artwork, suspense timing, firing reactions and camera return are unchanged. No roulette/save changes. The firing/reaction/return controller block was compared directly against the preceding commit and is identical ([preservation evidence](idle-hud-qa/preservation.json)).

Shooting name/shot panel is centered over the actual head bounding box, positioned 8px above the highest head/hat geometry. Names use 18-24px type and shot count uses 12-14px. Resize and entry update its position. Reserved space prevents toolbar/headwear overlap on small screens. Table labels retain their compact content width and 26/28px height.

Before: [idle hooked hand](nameplate-qa/table-1366x768.png), [corner shooting HUD](execution-qa/live-execution.png).

Opened after screenshots at the five targets. Normal hands now rest across the torso; overhead names stay readable and clear of tall hats/antlers. New regression assertions require the HUD centered within 1px and 4-12px above the head/hat; retain strict two-arm, joint continuity, painted bounds, death appearance and repeated-return checks. The old name-vs-entire-SVG check now compares actual head geometry because padded blank SVG space is intentionally used for the HUD.

| Size | Idle/table | Overhead HUD |
|---|---|---|
| 667x375 | [image](idle-hud-qa/table-667x375.png) | [image](idle-hud-qa/ready-667x375.png) |
| 740x360 | [image](idle-hud-qa/table-740x360.png) | [image](idle-hud-qa/ready-740x360.png) |
| 844x390 | [image](idle-hud-qa/table-844x390.png) | [image](idle-hud-qa/ready-844x390.png) |
| 932x430 | [image](idle-hud-qa/table-932x430.png) | [image](idle-hud-qa/ready-932x430.png) |
| 1366x768 | [image](idle-hud-qa/table-1366x768.png) | [image](idle-hud-qa/ready-1366x768.png) |

Build/standalone/offline ZIP integrity: [JSON](idle-hud-qa/release-integrity.json). Final regression: **39 Vitest and 29 Playwright passed**, zero failures/skips ([summary](idle-hud-qa/test-summary.json)). Live verification follows deployment. Responsively blocker unchanged; no reinstall. Chrome viewport evidence only; no physical-phone/Safari or independent listening check.
