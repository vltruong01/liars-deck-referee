# Compact table nameplates

User-requested reduction of the table name/status frame. Changed only `src/stage.css`: content-sized labels centered within the existing seat, capped at 180px/seat width; 26px height on mobile and 28px on desktop, with 12-15px name type. The original 34/42px grid row and character hit areas remain. A constrained grid column prevents long names expanding the implicit track.

Opened actual Chrome screenshots at all five sizes: [667x375](nameplate-qa/table-667x375.png), [740x360](nameplate-qa/table-740x360.png), [844x390](nameplate-qa/table-844x390.png), [932x430](nameplate-qa/table-932x430.png), [1366x768](nameplate-qa/table-1366x768.png). Short names now use narrow plates; long names ellipsize and keep the shot count visible. [Previous full-width example](execution-qa/live-table.png). [Measured geometry](nameplate-qa/geometry.json).

The smoke check asserted exact 26/28px height, centered alignment, 180px cap and a short-name plate below 80% of seat width. Production build and offline ZIP integrity match ([hash](nameplate-qa/release-integrity.json)). OpenSpec change/main specs updated. Responsively blocker unchanged; no reinstall. No physical-phone/Safari check performed.

39 Vitest and 29 Playwright tests passed; zero failures or skips ([summary](nameplate-qa/test-summary.json)). Live verification follows deployment.
