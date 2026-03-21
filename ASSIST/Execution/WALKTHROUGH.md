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

`Application menu and common-module workspace`

### Summary

Delivered the application-menu increment from `ASSIST/Execution/IDEAS.md`. The dashboard shell now uses a production-oriented common header and grouped sidebar menu for the shared masters, and the common-list UX is connected to the backend common-module APIs so the master workspace is functional instead of placeholder-only.

### Files Changed

- `ASSIST/Execution/TASK.md` to track and complete the application-menu task
- `ASSIST/Execution/PLANNING.md` to record the menu/common-workspace plan
- `ASSIST/Execution/WALKTHROUGH.md` to capture implementation details and residual gaps
- `apps/web/src/app/router.tsx` to add common-module workspace routes under the app shell
- `apps/web/src/app/layouts/app-layout.tsx` and `apps/web/src/features/dashboard/components/navigation/app-header.tsx` to introduce the common workspace header
- `apps/web/src/features/dashboard/components/navigation/app-sidebar.tsx` to replace placeholder demo navigation with grouped chevron menus and relevant icons
- `apps/web/src/features/common-modules/config/common-module-navigation.tsx` to define scalable menu groups and module icons
- `apps/web/src/features/common-modules/lib/common-module-definitions.tsx` to bind backend metadata and CRUD endpoints into the existing common-list UX
- `apps/web/src/features/common-modules/pages/common-modules-home-page.tsx` and `apps/web/src/features/common-modules/pages/common-module-page.tsx` to add the working common-module screens
- `apps/web/src/shared/api/client.ts` to add common-module metadata and CRUD client helpers plus `HttpError`
- `apps/web/src/components/forms/*` and `apps/web/src/types/common.ts` to align the common-master forms with the shared/backend data shape
- `apps/web/src/components/ui/dialog.tsx`, `apps/web/src/components/ui/checkbox.tsx`, `apps/web/src/components/ui/field.tsx`, and `apps/web/src/components/lookups/AutocompleteLookup.tsx` to provide the missing frontend primitives required by the common-module dialogs
- `ASSIST/Documentation/CHANGELOG.md` to document the new application-menu and common-workspace surface

### Validation Performed

- Reviewed `ASSIST/AI_RULES.md`
- Reviewed `ASSIST/Execution/IDEAS.md`
- Reviewed the current app shell, dashboard navigation, and common-master frontend hooks
- `npm run build:web`
- `npm run build:api`
- `npm run typecheck` still fails because of pre-existing legacy files under `apps/web/src/state/*` and `apps/web/src/components/forms/ProtectedRoute.tsx`

### Decisions

- Keep the existing common-list and common-upsert UX instead of replacing it with a new screen pattern
- Group common modules by functional area in the sidebar so the menu scales beyond the current set of master tables
- Use backend metadata plus a thin local presentation registry for icons, descriptions, and grouping instead of duplicating full schema rules locally
- Add a common app header with a module switcher so common-module navigation is available both in the sidebar and in the header

### Remaining Work

- Add authorization controls around the common-module backend endpoints before wider production exposure
- Decide whether common-module screens should resolve and display reference names directly in tables instead of raw foreign-key ids
- Remove or modernize the unrelated legacy `state/*` and old protected-route files so repository-wide typecheck can pass

### Risks

- Reference-backed masters currently display stored ids in table cells for related entities, which is functional but not yet ideal for operator readability
- The common-module workspace is now operational, but broader ERP menu areas beyond common masters still need the same structured navigation treatment
