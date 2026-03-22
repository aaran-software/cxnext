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

`Storefront catalog toolbar copy removal`

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
