## ADDED Requirements

### Requirement: Independent character customization
Each player SHALL have a base animal, headwear (none, fedora, cowboy, top hat, cap, mafia), eyewear (none, sunglasses, round glasses, monocle, eyepatch), mouth accessory (none, cigarette, cigar, toothpick), suit/tie colors and optional bow tie. Setup and Manage Players SHALL provide a one-viewport editor with large preview, category controls, randomize, cancel and Save; essential targets SHALL be at least 44 CSS pixels.

#### Scenario: Cosmetic editing preserves a match
- **WHEN** a player saves a new appearance after taking shots
- **THEN** their cosmetics persist after refresh while all revolver progress and other players remain unchanged.

#### Scenario: Legacy save
- **WHEN** a version-1 save lacks cosmetic fields
- **THEN** it loads with safe defaults and all cylinder/shot data preserved.

### Requirement: Complete customized silhouette
One layered SVG renderer SHALL anchor accessories to every animal in setup, table, selection, execution and outcomes. Padded bounds SHALL contain tall hats, ears and antlers. Reduced motion SHALL suppress optional ambient movement.

#### Scenario: Small landscape inspection
- **WHEN** four customized players appear at 667x375, 740x360, 844x390, 932x430 or 1366x768
- **THEN** every silhouette and name/status plate remains visible and tappable without clipping, overlapping controls or gameplay scrolling.

### Requirement: Compact stage and attached execution rig
The table SHALL use a compact header and in-stage management HUD without website-style headings or slogans. The selected character SHALL raise an attached illustrated arm/revolver toward the side of their head before the common anticipation. The existing fair algorithm SHALL remain unchanged.

#### Scenario: Recognizable outcome and automatic return
- **WHEN** FIRE commits survival or elimination
- **THEN** the result is committed once, receives the same anticipation and at least two seconds of fully visible result feedback, then returns automatically without requiring a return-button press.
