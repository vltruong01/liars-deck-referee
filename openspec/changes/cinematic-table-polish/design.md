# Context
The existing percentage slots are a flat row and execution has one curved arm group. Existing optional cosmetics support safe defaults. See proposal for motivation.

# Decisions
Use one responsive seating map per player count with semantic rear/end positions. Separate stacking contexts for rear portraits, tabletop and end portraits; labels/tap areas stay clear. Consolidate stage rules rather than append offsets.
Add a normalized `outfit` enum (classic, vest, western), preserving existing saves. Species shoulder widths and expressions vary inside padded SVG bounds. Anchor mouth accessories from a local origin at the corner; only the gun graphic is mirrored.
Use shoulder -> forearm -> hand/gun nested SVG groups. Animate shoulder and elbow together; reverse barrel stays aimed toward temple in final pose. Shared anticipation lasts 2.85 seconds; shaped bandpass noise provides offline breath, ending before the reveal. Result timelines differ only after the durable result is revealed.
Remove table manage/alive controls. Protected New Match dialog offers editing current players without destroying progress. Keep existing management operations reachable there.

# Risks / Trade-offs
Seating/layering can occlude faces; verify painted bounds and point hit tests plus screenshots. Collapse can clip; use local body joints and reserved bottom space. Audio can be unavailable; visuals remain authoritative and reduced effects respected.

# Migration Plan
Optional outfit defaults to classic. Engine remains unchanged. Existing gh-pages subtree publishes the tested standalone build, with source/evidence in main.

## Follow-up root causes and decisions
The previous execution arm was outside the portrait, with a shoulder not matching its body, while broad vest shirt panels resembled remaining arms; CSS hiding did not give a coherent idle rig. Render both arms inside the shared portrait, make the right shoulder/forearm/hand one hierarchy, and reuse it in execution. Narrow torso panels so they do not impersonate limbs.
The table camera was scaled immediately behind a fading execution overlay, and remained scaled until the overlay finished fading and renderTable rebuilt it. Remove transforms from the table camera; apply suspense push only to the execution camera. Cancel owned entry/reaction/delayed timelines, rebuild the stable table under an opaque overlay, then fade the overlay. Use explicit entering/ready/firing/result/returning phases and generation guards.
A death reveal uses the selected renderer in a centered overlay after collapse, with a restrained SVG red X; fully readable reveal holds two seconds. Normal play has automatic return; manual return is reserved for recovered results or save failure.

The final idle right forearm is folded 130 degrees with a 40-degree shoulder; a padded 480x490 execution viewBox contains the gun sweep. Artwork tweens target only #execution-portrait, excluding the centered reveal portrait. Painted leaf geometry checks distinguish real clipping from empty corners of rotated aggregate boxes.

## Compact nameplate follow-up
Table nameplates size to their text instead of the full seat width, capped at 180px or the seat width. Height is 26px on small screens and 28px on desktop. Keep the seat geometry and large character hit areas unchanged.

## Relaxed idle arms and overhead execution HUD
Idle right shoulder/forearm fold inward at 76/136 degrees, with a relaxed open hand resting across the waist instead of a vertical curled gun grip. Armed hand geometry, aiming target and firing reaction timelines remain intact. Execution uses a centered overhead name/shot panel with 18-24px names and 12-14px shot counts. Keep the newly compact table plates.
