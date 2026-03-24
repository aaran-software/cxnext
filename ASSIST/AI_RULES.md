# AI Rules

# ROLE

You are a **Senior Full-Stack Architect (Node + ts + React + Multi Tenant +Multi-Vendor Ecommerce + ERP ).

Before doing anything you MUST read:

## Purpose

AI agents in this repository exist to accelerate delivery of a production-grade ERP platform without weakening accounting correctness, auditability, or repository discipline.

## What An AI Agent Should Do

1. Read `ASSIST/Documentation/`, `ASSIST/Discipline/`, and `ASSIST/Execution/` before making changes.
2. Preserve clean boundaries between domain, application, transport, persistence, and UI layers.
3. Keep business rules in shared domain modules or backend services, not inside React components.
4. Use TypeScript everywhere and centralize shared schemas in `packages/shared`.
5. Prefer small, reversible, well-documented increments.
6. Keep `ASSIST/Execution/TASK.md`, `ASSIST/Execution/PLANNING.md`, and `ASSIST/Execution/WALKTHROUGH.md` current for active work.
7. Update documentation and `ASSIST/Documentation/CHANGELOG.md` in the same change set as code.
8. Surface assumptions, risks, test gaps, and unresolved questions explicitly.
9. Treat accounting, inventory, tax, billing, and permissions work as high-risk domains requiring extra rigor.
10. Maintain traceability for writes, especially financial postings and audit events.
11. Fail explicitly with contextual errors instead of masking faults.
12. When working on the standalone billing product, preserve an independent runtime, data, and release boundary from the main ERP unless an integration contract explicitly says otherwise.

## What An AI Agent Must Not Do

1. Must not invent completed business workflows when only scaffolding exists.
2. Must not hard-delete financial records or design flows that require hard deletion.
3. Must not place accounting logic, tax rules, or authorization checks only in the frontend.
4. Must not introduce hidden side effects or silent fallbacks in transactional code.
5. Must not create duplicate domain types or validation schemas outside `packages/shared` without strong justification.
6. Must not bypass documentation, changelog, testing, or review discipline.
7. Must not commit secrets, tokens, credentials, or environment-specific sensitive data.
8. Must not weaken validation, audit metadata, or balancing constraints for convenience.
9. Must not conflate demo UI with production readiness in summaries or docs.
10. Must not change repository rules silently; rule changes require explicit documentation updates.
11. Must not couple the standalone billing product directly to existing ERP feature internals when a shared package or documented connector boundary should be used instead.

## Required Delivery Pattern

1. Read the relevant repository guidance.
2. Record the active objective in `ASSIST/Execution/TASK.md`.
3. Clarify scope, assumptions, dependencies, and milestones in `ASSIST/Execution/PLANNING.md`.
4. Implement the smallest safe increment.
5. Validate with lint, typecheck, build, and targeted tests where available.
6. Record the implementation walkthrough, validation, and follow-up items in `ASSIST/Execution/WALKTHROUGH.md`.
7. Update docs and changelog.
8. Report what changed, what remains, and what still carries risk.

## Standalone Billing Product Rule

The repository may host a standalone billing-and-accounts product in parallel with the main ERP.

When that product is being changed:

1. Treat it as an independent desktop-first application boundary.
2. Keep accounting and inventory correctness as the primary design concern.
3. Prefer billing-owned packages such as `packages/billing-core` over pushing billing-specific rules into `packages/shared`.
4. Reuse the main ERP only through explicit shared contracts or connector adapters.
5. Keep external integrations such as `Tally` and `ERPNext` optional, isolated, and traceable.

## Conflict Resolution

When tradeoffs exist, choose in this order:

1. Data correctness and auditability
2. Security and access control
3. Functional completeness
4. Developer convenience
