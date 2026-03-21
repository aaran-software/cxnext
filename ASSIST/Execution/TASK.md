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

`Media manager module across backend and frontend`

### Status

completed

### Objective

Implement the media manager described in `ASSIST/Execution/IDEAS.md` across backend and frontend, including shared contracts, storage-aware tables for files, folders, tags, usage, and versions, CRUD routes, dashboard list and upsert screens, and filesystem setup for public and private media storage that returns to the list after save.

### In Scope

- Add shared media schemas in `packages/shared`
- Add media-specific tables through a separate migration and seed a default folder and placeholder media record
- Introduce backend CRUD routes for the media aggregate including folders, tags, usage, and versions
- Add a frontend media list page and full-page create/edit form in the dashboard workspace
- Add storage configuration plus `storage/public` and `storage/private` directory support with a public-serving path
- Update execution docs and changelog for this increment

### Out Of Scope

- Full multipart upload processing, image optimization jobs, or binary transformation pipelines
- Authorization redesign beyond following the current dashboard access pattern
- Reworking unrelated legacy typecheck issues outside the media module increment

### Dependencies

- `ASSIST/AI_RULES.md`
- `ASSIST/Execution/IDEAS.md`
- `apps/api`
- `apps/web`
- `packages/shared`
- Existing dashboard routing and navigation
- MariaDB environment configuration in `.env`

### Risks

- The media aggregate spans several child collections and filesystem-aware paths, so storage consistency and fetch composition need to be kept aligned
- Public/private storage handling can become brittle if URL generation and serving paths are not normalized clearly in the first increment
