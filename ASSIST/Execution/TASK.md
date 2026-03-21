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

`Product master across backend and frontend`

### Status

completed

### Objective

Implement the product master described in `ASSIST/Execution/IDEAS.md` across backend and frontend, reusing existing common reference tables where they already exist and adding the remaining product-specific tables, contracts, CRUD endpoints, and full-page list plus upsert screens that return to the product list after save.

### In Scope

- Check the existing common reference modules and reuse product categories, brands, taxes, warehouses, and related masters instead of duplicating them
- Add the remaining requested product-related tables through a separate migration and seed a default placeholder product
- Introduce shared product schemas and backend CRUD routes for the product aggregate
- Add a frontend product list page using the same list tone as the common modules
- Add a full-page create/edit product form instead of a popup dialog
- Update execution docs and changelog for this increment

### Out Of Scope

- Full inventory posting workflows, valuation logic, or accounting integration beyond storing the requested product aggregate data
- Reworking unrelated legacy state/auth files that still fail global typecheck
- Building every downstream commerce workflow that may later consume products

### Dependencies

- `ASSIST/AI_RULES.md`
- `ASSIST/Execution/IDEAS.md`
- `apps/api`
- `apps/web`
- `packages/shared`
- Existing common-module reference tables and CRUD APIs
- MariaDB environment configuration in `.env`

### Risks

- The product aggregate spans many related tables, so transactional writes and fetch composition need to be kept consistent
- Variant, stock, pricing, and tag child collections can become difficult to evolve if the initial persistence model is too rigid
