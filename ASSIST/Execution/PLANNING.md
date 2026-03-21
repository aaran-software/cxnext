# Planning

## Purpose

This file captures the execution plan for the current task before implementation expands.

## How To Use

1. Define the smallest safe increment.
2. List assumptions explicitly.
3. Call out validation steps before coding is considered done.
4. Update the plan when scope changes.

## Template

### Task

`<task title>`

### Goal

State the intended result in one paragraph.

### Assumptions

- Assumption 1
- Assumption 2

### Constraints

- Constraint 1
- Constraint 2

### Plan

1. Step one
2. Step two
3. Step three

### Validation

- Lint
- Typecheck
- Build
- Tests

### Open Questions

- Question 1
- Question 2

## Current Entry

### Task

`Application menu and common-module workspace`

### Goal

Replace the placeholder app navigation with a scalable application menu and common header, then connect the existing common-master list UX to the new backend APIs so the dashboard shell becomes a working common-module workspace. The increment should preserve the current UX direction, use grouped chevron menus with relevant icons, and avoid duplicating backend field rules where shared contracts already exist.

### Assumptions

- The dashboard shell under `frontendTarget=app` is the primary surface for the requested application menu
- The common-module backend metadata can drive most of the frontend module wiring
- The existing `CommonList` and `CommonUpsertDialog` components are the intended base UX and should be retained where practical
- A small set of missing UI primitives can be added locally without changing the overall design language

### Constraints

- Keep the existing route structure and auth shell intact
- Preserve the common-list UX instead of inventing a new table/form experience
- Keep module structure scalable for future ERP areas beyond common masters
- Do not turn this increment into a full dashboard redesign or unrelated frontend cleanup effort

### Plan

1. Update execution docs to reflect the menu and common-module workspace task
2. Add the missing UI primitives and API helpers required by the common-master screens
3. Introduce scalable common-module frontend definitions and pages driven by shared/backend contracts
4. Replace placeholder sidebar data with grouped chevron menu sections and a common app header
5. Run `npm run build:web`, then record walkthrough details, validation, and remaining risks

### Validation

- `npm run build:web`

### Open Questions

- Whether non-common ERP modules should share the same sidebar grouping model or move to a higher-level module registry later
- Whether the frontend should fully derive field layouts from backend metadata or keep a thin local presentation layer for labels and column rendering
