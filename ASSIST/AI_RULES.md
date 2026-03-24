# AI Rules

## Role

Act as a senior full-stack architect and implementation agent for a Node.js, TypeScript, React, and Electron ERP platform.

## Required Reading Order

Before making changes, read:

1. `ASSIST/Documentation/ARCHITECTURE.md`
2. `ASSIST/Documentation/PROJECT_OVERVIEW.md`
3. `ASSIST/Documentation/SETUP_AND_RUN.md`
4. `ASSIST/Discipline/*`
5. `ASSIST/Execution/TASK.md`
6. `ASSIST/Execution/PLANNING.md`

## Current Repository Model

This repository is organized under one `apps/` root:

1. `apps/framework`
2. `apps/core`
3. `apps/ecommerce`
4. `apps/billing`
5. `apps/site`
6. `apps/ui`
7. `apps/docs`
8. `apps/cli`

## Ownership Rules

1. `framework` owns runtime infrastructure such as auth, database, config, migrations, storage, notifications, payments, HTTP primitives, and platform manifests.
2. `core` owns shared business masters and reusable business-common flows such as company, contact, common modules, media, shared settings, and setup flows.
3. `ecommerce` owns product, storefront, checkout, commerce operations, customer profile, and customer-helpdesk behavior.
4. `billing` owns accounting, vouchers, inventory, billing documents, reporting, and external accounting connectors.
5. `site` owns static presentation surfaces only.
6. `ui` owns reusable UI primitives only.
7. `docs` owns consolidated human-readable platform documentation for all apps.
8. `cli` owns server-side operational control commands for the whole application suite.

## Mandatory Rules

1. Keep `ASSIST/Documentation/ARCHITECTURE.md` as the single source of truth.
2. Move code to the correct app boundary instead of adding new cross-boundary shortcuts.
3. Keep framework code business-agnostic unless a documented platform-level concern requires otherwise.
4. Keep business rules in backend/domain/application layers, not in React components.
5. Keep shared masters in `apps/core`.
6. Keep authentication framework-level and authorization app-level.
7. Treat accounting, inventory, tax, payments, permissions, and reporting as high-risk areas.
8. Keep stock-affecting and financial writes explicit, traceable, reversible, and audit-safe.
9. Update docs, task tracking, and changelog in the same batch as architecture changes.
10. Make boundary changes in small, validation-backed increments.

## Prohibited Actions

1. Do not let `apps/core` become a dumping ground for unclear ownership.
2. Do not keep ecommerce behavior under `apps/core`.
3. Do not keep runtime infrastructure under app-specific folders when it belongs in `apps/framework`.
4. Do not duplicate shared business masters across apps without explicit justification.
5. Do not place accounting, tax, or authorization logic only in the frontend.
6. Do not represent scaffolding as completed production behavior.

## Delivery Pattern

1. Read the required docs.
2. Record the active batch in `ASSIST/Execution/TASK.md`.
3. Record scope, assumptions, and validation plan in `ASSIST/Execution/PLANNING.md`.
4. Implement the smallest safe boundary-correct increment.
5. Run the relevant validation commands.
6. Update docs and changelog.
7. Report what changed, what remains, and any unresolved risk.
