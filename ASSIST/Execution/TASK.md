# Task

## Purpose

This file tracks the current active task so contributors and AI agents are aligned on the exact unit of work in progress.

## How To Use

1. Replace the placeholder content when starting a new task.
2. Keep the scope narrow and specific.
3. Update the status as work moves from analysis to implementation to validation.
4. Link to relevant modules, documents, and constraints.

## Template

### Title

`<short task title>`

### Status

`planned | in_progress | blocked | validated | completed`

### Objective

Describe the concrete outcome to deliver in this task.

### In Scope

- Item 1
- Item 2

### Out Of Scope

- Item 1
- Item 2

### Dependencies

- Relevant docs
- Relevant modules
- External constraints

### Risks

- Risk 1
- Risk 2

## Current Entry

### Title

`Application menu and common-module workspace`

### Status

completed

### Objective

Implement the application menu described in `ASSIST/Execution/IDEAS.md` by replacing the placeholder dashboard navigation with a production-oriented common header and grouped common-module sidebar menu, then connect the existing common list UX to the new backend common-module APIs so the master screens are actually usable.

### In Scope

- Prepare the application menu structure for the dashboard shell
- Add a common header that works across the application workspace
- Group common modules in the sidebar with chevron toggles and relevant icons
- Connect the common-module list and upsert UX to the backend metadata and CRUD endpoints
- Update execution docs and changelog for this increment

### Out Of Scope

- Reworking the public marketing/store shells
- Full ERP transaction flows beyond common masters
- Solving every unrelated pre-existing frontend typecheck issue outside the common-module workspace

### Dependencies

- `ASSIST/AI_RULES.md`
- `ASSIST/Execution/IDEAS.md`
- `apps/web`
- `apps/api`
- `packages/shared`

### Risks

- The old generic form code still depends on missing primitives and stale data shapes, so the UI layer needs careful cleanup before it can compile cleanly
- The app menu structure needs to stay scalable for future ERP modules instead of being hardcoded only for the current common-module set
