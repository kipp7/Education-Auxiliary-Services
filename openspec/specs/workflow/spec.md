# Spec: workflow

## ADDED Requirements

### Requirement: Module Directory Isolation
Each development window MUST only modify files inside its assigned module directory under `modules/`.

#### Scenario: Parallel development
- **GIVEN** multiple Codex CLI windows are working in parallel
- **WHEN** a change is required in another module’s directory
- **THEN** the request MUST be recorded in `modules/99-hub/REQUESTS.md` and handled by the hub window

### Requirement: Environment Single Source of Truth
All environment setup changes MUST be documented in `ENVIRONMENT.md`.

#### Scenario: Adding a new dependency
- **GIVEN** a module requires a new tool or version change
- **WHEN** the tool/version is adopted by the team
- **THEN** `ENVIRONMENT.md` MUST be updated with the change and scope

