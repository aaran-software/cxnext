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

`Media manager module across backend and frontend`

### Goal

Deliver the media manager requested in `ASSIST/Execution/IDEAS.md` as a production-oriented vertical slice. The increment should add storage-aware tables for folders, files, tags, usage, and versions, expose transactional CRUD APIs for the media aggregate, add frontend list plus full-page create/edit flows that align with the existing dashboard workspace and return to the media list after save, and establish filesystem directories plus a public-serving path for stored media references.

### Assumptions

- The first increment should model media metadata and storage paths without yet implementing multipart upload ingestion
- The media aggregate should be implemented as a dedicated backend feature rather than folded into the generic common-module registry
- Files can support both `public` and `private` storage scopes, with public assets exposed through the API server and private assets stored without anonymous serving
- Child collections can follow the existing aggregate-write pattern by deactivating previous rows and inserting fresh active rows on edit
- The frontend media form can use a dedicated page layout and reuse the shared animated tabs pattern where it improves usability

### Constraints

- Keep shared request and response contracts in `packages/shared`
- Preserve transactional integrity for multi-table media writes
- Reuse the dashboard/application workspace rather than creating a separate shell
- Keep the implementation production-oriented without overstating upload or optimization capabilities that do not yet exist
- Add the requested filesystem folders and public path handling without using destructive setup steps

### Plan

1. Update execution docs for the media manager task and inspect the current shared, backend, frontend, and storage extension points
2. Add shared media schemas plus a dedicated backend migration, seed data, and storage configuration for media-specific tables and directories
3. Implement backend repository, service, static public-media serving, and HTTP routes for media CRUD
4. Add frontend media list and full-page upsert screens, then connect them into the dashboard routes and navigation
5. Run `npm run build:api` and `npm run build:web`, then record walkthrough details, residual risks, and storage assumptions

### Validation

- `npm run build:api`
- `npm run build:web`

### Open Questions

- Whether private media should later be exposed through signed URLs or authenticated streaming endpoints
- Whether upload ingestion and optimization should be implemented in a later increment as background jobs instead of synchronous request handling
