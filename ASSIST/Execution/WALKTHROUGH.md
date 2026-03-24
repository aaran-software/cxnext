# Walkthrough

## Purpose

This file records what was actually done for the current task, how it was validated, and what remains.

## Current Entry

### Task

`Standalone billing product documentation and initial scaffold`

### Summary

Promoted the standalone billing-and-accounts product idea into formal ASSIST documentation, updated repository rules so the billing product is treated as an independent desktop-first boundary, and added the first compile-safe scaffold for billing-specific apps and packages. The scaffold does not implement live accounting or inventory behavior yet; it establishes product manifests, connector metadata, and placeholder entry points so the billing product can evolve without directly affecting the current ERP runtime.

### Files Changed

- `ASSIST/AI_RULES.md` to add explicit standalone billing product boundary rules
- `ASSIST/Documentation/BILLING_PRODUCT_ARCHITECTURE.md` to document the billing product vision, boundaries, modules, and delivery order
- `ASSIST/Documentation/PROJECT_OVERVIEW.md` and `ASSIST/Documentation/ARCHITECTURE.md` to reflect the new standalone billing track
- `ASSIST/Execution/IDEAS.md` to convert the prior billing note into a pointer after promotion to formal documentation
- `ASSIST/Execution/TASK.md`, `ASSIST/Execution/PLANNING.md`, and `ASSIST/Execution/WALKTHROUGH.md` to align execution tracking with the new active task
- Billing app/package scaffold files under `apps/billing-api`, `apps/billing-desktop`, `packages/billing-core`, `packages/billing-connectors`, and `packages/shared`
- `package.json` to add initial billing-focused build/start scripts
- `ASSIST/Documentation/CHANGELOG.md` to record the documentation and scaffold work

### Validation Performed

- Pending until scaffold edits complete: `npm run typecheck`

### Decisions

- Keep the billing product as a separate product line rather than extending the current ERP module registry directly
- Use billing-owned packages for billing-specific domain rules instead of forcing those rules into `packages/shared`
- Start with compile-safe manifests and entry points instead of partially implemented invoice or voucher flows

### Remaining Work

- Define the first billing persistence and migration strategy
- Build accounting core domain models and application services
- Build inventory and billing document aggregates on top of the accounting foundation
- Add real connector adapters and sync workflows only after core models stabilize

### Risks

- The scaffold can be mistaken for functional readiness if future summaries are not precise
- Shared-package overreach remains a risk until the billing core matures
- Connector scope can expand too early unless internal billing models stabilize first
