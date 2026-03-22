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

### Dependencies

- `ASSIST/AI_RULES.md`
- `ASSIST/Documentation/PROJECT_OVERVIEW.md`
- `ASSIST/Documentation/ARCHITECTURE.md`
- `ASSIST/Documentation/CHANGELOG.md`
- `apps/web/src/features/store/pages/store-catalog-page.tsx`

### Risks

- Removing the helper copy may make the toolbar feel sparse if the search bar alone does not anchor the section well
- Browser QA is still needed to confirm the simplified toolbar spacing feels intentional
