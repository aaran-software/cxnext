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

### Goal

Simplify the catalog toolbar by removing the helper copy and leaving the search bar as the sole control in that surface. The result should feel cleaner without affecting the existing search/filter behavior.

### Assumptions

- The requested text is the helper copy in the catalog toolbar, not the main catalog page description above it
- The search bar should remain full-width once the helper copy is removed
- No replacement label or icon is needed in this toolbar surface

### Constraints

- Keep the work inside the storefront UI layer only
- Limit the scope to the catalog toolbar surface
- Update execution tracking and user-visible documentation in the same change set

### Plan

1. Remove the helper text block from the catalog toolbar
2. Let the shared search bar occupy the toolbar cleanly on its own
3. Update execution notes plus overview, architecture, and changelog entries
4. Validate with focused ESLint

### Validation

- Focused ESLint on the touched catalog-page file

### Open Questions

- Whether the toolbar needs a tighter vertical padding pass after browser QA
=======
`Single-container VPS deploy plus first-run database setup mode`

### Goal

Enable CXNext to run as a single container on a VPS by serving the built React app from the Node API, persisting runtime database settings in a volume-backed config file, and exposing a first-run setup screen that can recover from missing or invalid MariaDB configuration without crashing the server process.

### Assumptions

- The current Node API remains the single runtime process in production, with the built React app served as static files by that process
- Runtime database settings should override `.env` when present so container deployments can be configured through the UI after first boot
- A Git-sync-and-build-on-start option is required for this task even though immutable image deployment is usually the cleaner production pattern

### Constraints

- Keep shared contracts in `packages/shared` for the new setup API
- Fail explicitly when DB-backed routes are used before setup completes
- Persist runtime configuration outside the source tree so updates do not erase it
- Update the required execution/docs/changelog files in the same change set

### Plan

1. Add shared setup schemas and API runtime settings persistence
2. Rework database bootstrap so startup enters setup mode instead of crashing on missing/invalid DB configuration
3. Add setup endpoints and production static-web serving in the API
4. Gate the React app with a first-run database setup screen wired to the new API
5. Add `.container` runtime scripts, a single production `Dockerfile`, Docker Compose, and environment/documentation updates
6. Validate with lint, typecheck, and build

### Validation

- `npm run lint`
- `npm run typecheck`
- `npm run build:server`

### Open Questions

- Whether a future follow-up should add an authenticated admin UI for editing runtime DB settings after setup is complete
- Whether Git-sync behavior should later be moved to a separate maintenance container or CI/CD path
