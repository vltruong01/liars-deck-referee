# Context
The existing percentage slots are a flat row and execution has one curved arm group. Existing optional cosmetics support safe defaults. See proposal for motivation.

# Decisions
Use one responsive seating map per player count with semantic rear/end positions. Separate stacking contexts for rear portraits, tabletop and end portraits; labels/tap areas stay clear. Consolidate stage rules rather than append offsets.
Add a normalized `outfit` enum (classic, vest, western), preserving existing saves. Species shoulder widths and expressions vary inside padded SVG bounds. Anchor mouth accessories from a local origin at the corner; only the gun graphic is mirrored.
Use shoulder -> forearm -> hand/gun nested SVG groups. Animate shoulder and elbow together; reverse barrel stays aimed toward temple in final pose. Shared anticipation lasts 2.05 seconds; shaped bandpass noise provides offline breath, ending before the reveal. Result timelines differ only after the durable result is revealed.
Remove table manage/alive controls. Protected New Match dialog offers editing current players without destroying progress. Keep existing management operations reachable there.

# Risks / Trade-offs
Seating/layering can occlude faces; verify painted bounds and point hit tests plus screenshots. Collapse can clip; use local body joints and reserved bottom space. Audio can be unavailable; visuals remain authoritative and reduced effects respected.

# Migration Plan
Optional outfit defaults to classic. Engine remains unchanged. Existing gh-pages subtree publishes the tested standalone build, with source/evidence in main.
