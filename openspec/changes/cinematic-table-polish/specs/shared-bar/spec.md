## ADDED Requirements

### Requirement: Spatial seating and compact HUD
Four-player scenes SHALL place players 1 and 2 behind the upper-left/upper-right edges of the table, player 3 at the left end and player 4 at the right end facing inward. Rear torsos SHALL sit behind the tabletop while faces/accessories and small name/status labels remain visible. Two/three-player maps SHALL adapt around the same table. The table HUD SHALL contain New Match without an alive counter or Manage Players button.

#### Scenario: Content-sized nameplates
- **WHEN** the table displays a player name and shot count or DIED
- **THEN** its label sizes to the text, capped at 180px or the seat width, with 26px mobile/28px desktop height and centered alignment; character hit areas remain unchanged.

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

## MODIFIED Requirements

### Requirement: Compact stage and attached execution rig
The table SHALL use a compact header and in-stage New Match control; current-player editing is accessed through its protected dialog without website-style headings or slogans. The selected character SHALL raise an attached illustrated arm/revolver toward the side of their head before the common anticipation. The existing fair algorithm SHALL remain unchanged.

#### Scenario: Recognizable outcome and automatic return
- **WHEN** FIRE commits survival or elimination
- **THEN** the result is committed once, receives the same anticipation and at least two seconds of fully visible result feedback, then returns automatically without requiring a return-button press.

### Requirement: Continuous two-arm rig and stable cinematic return
Characters SHALL contain exactly two anatomical arm groups in their shared renderer. The existing right shoulder, elbow, wrist, hand and grip SHALL transition continuously from idle to aiming without a separate added arm or CSS concealment. Execution SHALL show name/SHOT n/6 centered immediately above the head, using 18-24px name text and 12-14px shot text, plus DIED after elimination, without ALIVE labels. Table plates SHALL use name and n/6 or DIED.

#### Scenario: Fatal reveal and automatic return
- **WHEN** the durable fatal result is revealed after the shared anticipation
- **THEN** impact and collapse precede a centered large customized portrait with a red X and name/DIED, held fully readable for two seconds before automatic return; blank feedback returns without an X.

#### Scenario: Interrupted entry and repeated execution
- **WHEN** entry is cancelled or consecutive players are selected and fired
- **THEN** stale callbacks are cancelled, the execution alone owns camera motion, and a stable unscaled table is prepared before revealing it with no offset or zoom frame.
