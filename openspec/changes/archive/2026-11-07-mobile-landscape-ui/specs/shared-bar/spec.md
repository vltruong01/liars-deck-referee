# Shared bar layout delta

## ADDED Requirements

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
