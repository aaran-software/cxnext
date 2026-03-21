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

`Product master across backend and frontend`

### Goal

Deliver the product aggregate requested in `ASSIST/Execution/IDEAS.md` as a production-oriented vertical slice. The increment should first verify which requested masters already exist in the common-module foundation, then add only the missing product-specific tables, expose transactional CRUD APIs for the product aggregate including variants, images, pricing, discounts, offers, stock, SEO, and tags, and add frontend list plus full-page create/edit flows that align with the existing dashboard workspace and return to the product list after save.

### Assumptions

- Product categories, brands, taxes, warehouses, styles, sizes, colours, units, product types, and HSN codes should be reused from the existing common masters instead of recreated
- The product aggregate should be implemented as a dedicated backend feature rather than forced into the generic common-module registry
- The first increment can support soft lifecycle management at the product root while replacing active child rows transactionally on edit
- Stock movements can be stored as part of the aggregate record model in this increment without yet implementing operational inventory posting workflows
- The frontend product form can use a dedicated page layout instead of the popup-based common-module dialog

### Constraints

- Keep shared request and response contracts in `packages/shared`
- Preserve transactional integrity for multi-table product writes
- Reuse the dashboard/application workspace rather than creating a separate shell
- Reuse existing common-module records wherever the requested IDEA tables already exist
- Keep the implementation focused on master data capture instead of full ecommerce or ERP execution workflows

### Plan

1. Update execution docs for the product master task and confirm which requested common tables already exist
2. Add shared product schemas plus a dedicated backend migration and seed data for the missing product-specific tables
3. Implement backend repository, service, and HTTP routes for product CRUD
4. Add frontend product list and full-page upsert screens, and connect them into the dashboard navigation
5. Run `npm run build:api` and `npm run build:web`, then record walkthrough details and residual risks

### Validation

- `npm run build:api`
- `npm run build:web`

### Open Questions

- Whether stock movements should later become append-only operational records created by transactions instead of editable aggregate children
- Whether product attributes should later be normalized further into admin-managed masters instead of being maintained only through product forms
