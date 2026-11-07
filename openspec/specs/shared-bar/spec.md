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
