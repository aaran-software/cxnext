# Planning

## Purpose

This file captures the execution plan for the current task before implementation expands.

## Current Entry

### Task

`Standalone billing product documentation and initial scaffold`

### Goal

Create a documented and compile-safe starting point for a standalone billing-and-accounts product that is desktop-first, auditor-focused, and architecturally isolated from the existing ERP unless explicit integration contracts are added later.

### Assumptions

- The billing product should remain a separate product line inside the repo, not a feature nested under current ERP flows
- The first implementation increment should establish boundaries and manifests, not real accounting transactions
- Electron remains the preferred shell for the first billing operator runtime
- `packages/shared` should expose only product-level metadata needed across boundaries, while billing-owned domain rules should stay in billing packages

### Constraints

- Do not weaken existing ERP architecture or compile behavior while adding the scaffold
- Do not represent the billing product as production-ready beyond the current scaffold
- Keep accounting and inventory correctness central in the documented design
- Keep external integrations optional and adapter-driven
- Update changelog and execution tracking in the same change set

### Plan

1. Promote the billing vision into a formal documentation file under `ASSIST/Documentation`
2. Update `AI_RULES.md`, `PROJECT_OVERVIEW.md`, and `ARCHITECTURE.md` so the standalone billing product boundary is explicit
3. Reduce `ASSIST/Execution/IDEAS.md` to a pointer now that the concept has been formalized
4. Add a shared billing product manifest in `packages/shared` to describe the new product line without coupling it to the current ERP module registry
5. Scaffold `packages/billing-core` with initial domain manifests for accounts, inventory, and billing capabilities
6. Scaffold `packages/billing-connectors` with initial adapter metadata for Tally and ERPNext/Frappe integrations
7. Scaffold `apps/billing-api` and `apps/billing-desktop` with compile-safe placeholder entry points
8. Add package scripts where useful, then validate with `npm run typecheck`

### Validation

- `npm run typecheck`
- Pending for this batch: `npm run typecheck`

### Open Questions

- Whether the billing desktop app should later embed a local database for offline-first operation
- Whether billing will need a separate frontend renderer target or can begin with desktop-shell-plus-backend scaffolding only
- Which shared auth or organization contracts are truly cross-product versus billing-owned
