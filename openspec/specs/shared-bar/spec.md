# shared-bar Specification

## Purpose
Offer a cinematic and accessible offline shared-screen experience for groups playing with physical cards.

## Requirements

### Requirement: Setup and table
The application SHALL offer 2, 3 or 4 players, defaulting to four, editable names, several distinct previewed skins, and a responsive central-table scene with clearly named living and eliminated characters.

#### Scenario: New group
- **WHEN** a group starts with 2–4 configured players
- **THEN** all chosen names and skins appear around the table and living characters can be selected.

### Requirement: Cinematic execution
Selection SHALL pan and zoom to the character, dim the room and show their name, revolver and FIRE control. Anticipation SHALL be indistinguishable for both outcomes. Survival SHALL click, react and return; death SHALL bang, flash, shake, collapse and return marked eliminated.

#### Scenario: Consequence
- **WHEN** FIRE is pressed
- **THEN** a common anticipation precedes the timed reveal, outcome text and automatic return to the table.

### Requirement: Accessible controls
The application SHALL provide volume, reduced flashing, reduced motion support, keyboard-operable controls and readable status. Cancel SHALL be available before firing.

#### Scenario: Reduced effects
- **WHEN** reduced flashing is enabled
- **THEN** muzzle and red flashes are suppressed while outcome text remains readable.

### Requirement: Offline release
The release SHALL contain all runtime code, styles, visuals, fonts and sound generation locally, run without an internet connection or developer tools, and include Windows launch instructions.

#### Scenario: File launch
- **WHEN** the self-contained release HTML is opened on Windows without network access
- **THEN** setup, gameplay, sound and saved-state restoration remain functional in a supported browser.

### Requirement: Single viewport landscape play
Setup, table and execution SHALL fit the safe viewport without page or gameplay-panel scrolling at 667×375, 740×360, 844×390, 852×393, 932×430, 1024×768, 1366×768 and 1920×1080. All 2–4 characters, nameplates and primary controls SHALL remain visible without severe overlaps.

#### Scenario: Four guests on a phone
- **WHEN** a four-player match is displayed at any target landscape size
- **THEN** all seats are inside the scene, names occupy separate regions, and each living seat accepts a touch selection.

#### Scenario: Execution composition
- **WHEN** any player is selected, including a player with a 24-character name
- **THEN** their character, name, revolver, pull count, FIRE, back and settings are visible together, with no page scrolling.

### Requirement: Bounded camera and touch controls
Player selection SHALL focus the correct seat with a controlled transition. Reduced motion SHALL simplify it. FIRE SHALL become actionable only after entry and remain guarded during shooting. Essential controls SHALL provide touch targets of at least 44 CSS pixels at the target sizes.

#### Scenario: Tap-through protection
- **WHEN** selection begins
- **THEN** FIRE is disabled until entry completes and a second tap cannot immediately consume a chamber.

### Requirement: Orientation and fullscreen
The application SHALL respect safe-area insets, show portrait phones a rotate-device prompt, and provide optional fullscreen where supported without requiring fullscreen or forcing orientation.

#### Scenario: Portrait phone
- **WHEN** a phone is held in portrait orientation
- **THEN** it displays a legible rotation prompt and returning to landscape preserves the current match and pending result.

#### Scenario: Fullscreen unavailable
- **WHEN** fullscreen is unsupported or rejected
- **THEN** normal viewport play remains usable and feedback explains unavailability.

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
The table SHALL use a compact header and in-stage New Match control; current-player editing is accessed through its protected dialog without website-style headings or slogans. The selected character SHALL raise an attached illustrated arm/revolver toward the side of their head before the common anticipation. The existing fair algorithm SHALL remain unchanged.

#### Scenario: Recognizable outcome and automatic return
- **WHEN** FIRE commits survival or elimination
- **THEN** the result is committed once, receives the same anticipation and at least two seconds of fully visible result feedback, then returns automatically without requiring a return-button press.

### Requirement: Spatial seating and compact HUD
Four-player scenes SHALL place players 1 and 2 behind the upper-left/upper-right edges of the table, player 3 at the left end and player 4 at the right end facing inward. Rear torsos SHALL sit behind the tabletop while faces/accessories and small name/status labels remain visible. Two/three-player maps SHALL adapt around the same table. The table HUD SHALL contain New Match without an alive counter or Manage Players button.

#### Scenario: Protected match actions
- **WHEN** New Match is opened during play
- **THEN** replacement requires confirmation and editing the current group remains available without resetting shooting progress.

### Requirement: Distinct clothing and outward accessories
The shared character renderer SHALL support classic, vest/rolled sleeves and western silhouettes, species proportions and expressions, retaining existing cosmetics. Optional outfit data SHALL default safely for old saves. Each mouth accessory SHALL emerge outward from a species mouth corner with its ember at the distal tip, including inward-facing table views.

#### Scenario: Species accessory inspection
- **WHEN** each of six animals uses each mouth accessory in table/editor/execution
- **THEN** its attachment, direction and layering remain aligned and inside the silhouette bounds.

### Requirement: Articulated suspense and outcome reactions
Execution SHALL use a connected shoulder, upper arm, elbow, forearm, wrist/hand and revolver hierarchy. Both results SHALL share a locked 2.85-second anticipation with synchronized generated breathing, mechanical cues, heartbeat and near-silence before reveal. Reduced motion SHALL simplify movements.

#### Scenario: Contrasting outcomes
- **WHEN** the predetermined shot is revealed
- **THEN** a blank clicks and visibly relaxes, while fatal impact synchronizes flash, camera impulse, red/black dimming, recoil and stylized collapse with muffled/ringing aftermath; readable named result feedback precedes automatic return.

### Requirement: Continuous two-arm rig and stable cinematic return
Characters SHALL contain exactly two anatomical arm groups in their shared renderer. The existing right shoulder, elbow, wrist, hand and grip SHALL transition continuously from idle to aiming without a separate added arm or CSS concealment. Execution SHALL use a compact name/SHOT n/6 HUD and DIED status, with no ALIVE labels. Table plates SHALL use name and n/6 or DIED.

#### Scenario: Fatal reveal and automatic return
- **WHEN** the durable fatal result is revealed after the shared anticipation
- **THEN** impact and collapse precede a centered large customized portrait with a red X and name/DIED, held fully readable for two seconds before automatic return; blank feedback returns without an X.

#### Scenario: Interrupted entry and repeated execution
- **WHEN** entry is cancelled or consecutive players are selected and fired
- **THEN** stale callbacks are cancelled, the execution alone owns camera motion, and a stable unscaled table is prepared before revealing it with no offset or zoom frame.
