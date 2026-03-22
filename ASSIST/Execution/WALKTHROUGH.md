# Walkthrough

## Purpose

This file records what was actually done for the current task, how it was validated, and what remains.

## How To Use

1. Update this after implementation and validation.
2. Capture decisions, not just outcomes.
3. Note residual risk and next steps.

## Template

### Task

`<task title>`

### Summary

Short description of the delivered increment.

### Files Changed

- Path and reason
- Path and reason

### Validation Performed

- Command or check
- Result

### Decisions

- Decision 1
- Decision 2

### Remaining Work

- Item 1
- Item 2

### Risks

- Risk 1
- Risk 2

## Current Entry

### Task

`Single-container VPS deploy plus first-run database setup mode`

### Summary

Added a production-oriented deployment path that can run CXNext as a single container serving both the Node API and the built React app. The API now starts in setup mode when MariaDB settings are missing or invalid, reads and updates a single volume-backed `.env` file, exposes setup endpoints, and lets the frontend block on a WordPress-style first-run database form until bootstrap succeeds.

### Files Changed

- `packages/shared/src/schemas/setup.ts` and `packages/shared/src/index.ts` to add shared contracts for setup status and database configuration payloads
- `apps/api/src/shared/config/environment.ts`, `apps/api/src/shared/database/database.ts`, and `apps/api/src/shared/database/orm.ts` to support `.env`-only runtime config, setup-state tracking, DB auto-create-if-missing, and non-fatal startup when DB setup is incomplete
- `apps/api/src/app/http/router.ts`, `apps/api/src/server.ts`, and `apps/api/src/shared/http/static-web.ts` to expose setup endpoints, include setup state in health responses, and serve the built React app from the API in production
- `apps/web/src/features/setup/components/setup-provider.tsx`, `apps/web/src/features/setup/pages/initial-setup-page.tsx`, `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, and `apps/web/src/shared/api/client.ts` to gate the application on setup status and provide the first-run database configuration screen
- `.container/Dockerfile`, `.container/docker-compose.yml`, `.container/USAGE.md`, `.dockerignore`, and `.container/*` to keep the Docker assets together and document app-only deployment against an existing MariaDB server
- `.container/mariadb.yml` and `.container/50-server.cnf` were reviewed and the app compose was aligned to the same `codexion-network` and `mariadb` hostname
- `.env`, `.env.example`, `.container/docker-compose.yml`, and `.container/mariadb.yml` were finalized so `.env` is the only runtime config source, with concrete defaults `mariadb` / `root` / `DbPass1@@` / `cxnext_db` and the Git source `https://github.com/aaran-software/cxnext.git` on `main`
- `.env.example`, `ASSIST/Documentation/PROJECT_OVERVIEW.md`, `ASSIST/Documentation/ARCHITECTURE.md`, `ASSIST/Documentation/SETUP_AND_RUN.md`, and `ASSIST/Documentation/CHANGELOG.md` to document the new setup/deployment architecture
- `ASSIST/Execution/TASK.md`, `ASSIST/Execution/PLANNING.md`, and `ASSIST/Execution/WALKTHROUGH.md` to keep the active-work records aligned with this change set

### Validation Performed

- `npx eslint apps/api/src/shared/config/environment.ts apps/api/src/shared/database/database.ts apps/desktop/src/main.ts` succeeded
- `npm run build:server` succeeded
- `docker compose -f .container/mariadb.yml config` succeeded
- `docker compose -f .container/docker-compose.yml config` succeeded
- `docker network create codexion-network` reported the network already exists
- `docker compose -f .container/mariadb.yml up -d --force-recreate` succeeded after removing the unnecessary host `3306` mapping from the MariaDB stack
- `docker compose -f .container/docker-compose.yml up -d --build` built successfully with the container reading its runtime settings from `.env` only
- `docker ps -a` confirmed `cxnext-app` and `mariadb` are running
- `docker logs cxnext-app` showed `CXNext API listening on http://localhost:4000`
- `Invoke-WebRequest http://localhost:4000/health` returned `status: ok` with MariaDB `status: ok`
- `Invoke-WebRequest http://localhost:4000/setup/status` returned `status: ready`
- `npm run typecheck` failed because the repository already has a large baseline of unrelated TypeScript errors in existing API, storefront, state, and notification modules
- `npm run lint` failed because the repository already has a large baseline of unrelated ESLint violations outside the files changed for this task

### Decisions

- Store runtime DB settings in a single volume-backed `.env` file so container deployments have one authoritative startup config
- Keep the API process alive in setup mode and fail DB-backed operations explicitly rather than crashing startup
- Serve the built web bundle directly from the Node API so a single VPS container can host both the backend and SPA
- Support Git sync/build-on-start in the container entrypoint because it was explicitly requested, while documenting that it is heavier than immutable-image deployment

### Remaining Work

- Run browser QA against the first-run setup screen and the production static-serving path in a real container session
- Decide whether runtime DB settings should remain editable from an authenticated admin screen after first-run setup
- Clean up the repository-wide pre-existing lint/typecheck failures so full validation can go green again

### Risks

- Runtime Git sync/build-on-start increases startup time and makes production state less deterministic than CI-built images
- The setup flow assumes the provided MariaDB user can either connect to the named database or create it; more granular privilege diagnostics would improve operator feedback
- The production web bundle is still large and emits Vite chunk-size warnings during `build:web`
