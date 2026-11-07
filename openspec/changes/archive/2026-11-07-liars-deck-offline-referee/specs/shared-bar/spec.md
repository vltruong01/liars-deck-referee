# Shared bar delta

## Purpose
Offer a cinematic and accessible offline shared-screen experience for groups playing with physical cards.

## ADDED Requirements

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
