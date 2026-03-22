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

`Storefront catalog toolbar copy removal`
=======
`Single-container VPS deploy plus first-run database setup mode`

### Status

validated

### Objective

Remove the catalog-toolbar helper text so the toolbar only presents the search control without the extra “Live catalog view...” copy.

### In Scope

- Remove the visible helper text from the catalog toolbar
- Keep the shared search bar intact and tighten the toolbar layout around it
- Update execution plus documentation notes for the storefront catalog-toolbar cleanup

### Out Of Scope

- Reworking catalog search behavior, filtering, or sort behavior
- Changing the catalog hero/heading copy above the toolbar
- Revisiting other storefront helper copy outside this toolbar
=======
Package the web and API into a single deployable container, add Docker Compose for VPS hosting, and introduce a WordPress-style first-run setup flow that keeps the app online when the database is missing until runtime DB settings are entered and migrations complete.

### In Scope

- Add production container assets and startup scripts for single-container deployment
- Support optional Git sync plus build-on-start behavior inside the container
- Let the API boot in setup mode when database settings are missing or invalid
- Persist runtime database settings outside `.env`
- Add a frontend first-run setup form for database configuration
- Serve the built React app from the API in production
- Update execution notes, architecture/setup docs, and changelog

### Out Of Scope

- Reverse proxy or TLS automation on the VPS host
- A full in-browser updater UI for Git sync controls
- Reworking existing business modules to operate meaningfully without a database

### Dependencies

- `ASSIST/AI_RULES.md`
- `ASSIST/Documentation/PROJECT_OVERVIEW.md`
- `ASSIST/Documentation/ARCHITECTURE.md`
- `ASSIST/Documentation/CHANGELOG.md`
- `apps/web/src/features/store/pages/store-catalog-page.tsx`

### Risks

- Removing the helper copy may make the toolbar feel sparse if the search bar alone does not anchor the section well
- Browser QA is still needed to confirm the simplified toolbar spacing feels intentional
=======
- `ASSIST/Documentation/ARCHITECTURE.md`
- `ASSIST/Documentation/PROJECT_OVERVIEW.md`
- `ASSIST/Documentation/SETUP_AND_RUN.md`
- `apps/api/src/server.ts`
- `apps/api/src/app/http/router.ts`
- `apps/web/src/App.tsx`
- `packages/shared/src/schemas/setup.ts`

### Risks

- Container self-update/build-on-start is intentionally convenient but heavier and less deterministic than immutable-image deploys
- The first-run setup screen does not validate every MariaDB privilege nuance before attempting schema bootstrap
- Browser-level QA for the setup screen still needs manual verification
