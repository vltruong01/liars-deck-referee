# roulette-engine Specification

## Purpose
Provide fair, independent and refresh-safe six-chamber revolvers for a shared physical-card game referee.

## Requirements

### Requirement: Fair independent revolvers
Each player SHALL receive exactly one uniformly selected bullet position among six chambers using cryptographically secure randomness. Blanks SHALL advance the chamber without reshuffling, independently of other players.

#### Scenario: Last chamber
- **GIVEN** a bullet in chamber six and five blank shots
- **WHEN** that player fires again
- **THEN** the player is eliminated on shot six, and other revolvers are unchanged.

#### Scenario: Uniform mapping
- **WHEN** secure samples are mapped to a chamber
- **THEN** each chamber has equal probability and values outside the largest multiple of six in the sample domain are rejected.

### Requirement: Durable single shots
The referee SHALL commit a shot before its reveal, reject duplicate or concurrent shots, and restore names, skins, chambers, eliminated players and pending results on reload. Storage errors SHALL block state changes visibly.

#### Scenario: Reload during anticipation
- **WHEN** the page reloads after a trigger pull but before reveal
- **THEN** it restores the committed outcome without consuming or randomizing another chamber.

#### Scenario: Repeat trigger
- **WHEN** FIRE is pressed repeatedly during a pending shot
- **THEN** exactly one chamber is consumed.

### Requirement: Match management
The referee SHALL prevent dead-player execution, announce the last survivor, allow name edits without progress loss, and support confirmed individual and full resets with fresh revolvers.

#### Scenario: Individual reset
- **WHEN** an individual reset is confirmed
- **THEN** only that player receives a fresh revolver and becomes alive.

#### Scenario: Name edit and new match
- **WHEN** a name is saved
- **THEN** all revolver progress remains unchanged.
- **WHEN** a full reset is confirmed
- **THEN** all retained players receive fresh revolvers with zero shots.
