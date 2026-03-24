# Task

## Purpose

This file tracks the current active task so contributors and AI agents stay aligned on the exact unit of work in progress.

## Current Entry

### Title

`Standalone billing product documentation and initial scaffold`

### Status

in_progress

### Objective

Promote the standalone billing-and-accounts product concept into formal ASSIST documentation, update repository rules to preserve its independent product boundary, and implement the first compile-safe scaffold for a desktop-first billing app with billing-owned core and connector packages.

### In Scope

- Create formal ASSIST documentation for the standalone billing product architecture
- Update repository rules and high-level architecture docs to recognize the billing product as an independent boundary
- Add initial `apps/billing-api` and `apps/billing-desktop` scaffolding
- Add initial `packages/billing-core` and `packages/billing-connectors` scaffolding
- Add the first shared billing manifest/contracts needed to describe the product shape
- Keep changelog and execution notes aligned with the change set

### Out Of Scope

- Building real invoice, voucher, stock, or report workflows in this batch
- Wiring billing into the existing ERP navigation or database runtime
- Implementing Tally or ERPNext connector behavior beyond initial manifest and adapter scaffolding
- Redesigning the current ERP web or desktop experience

### Dependencies

- `ASSIST/AI_RULES.md`
- `ASSIST/Documentation/PROJECT_OVERVIEW.md`
- `ASSIST/Documentation/ARCHITECTURE.md`
- `packages/shared/src/domain/*`
- `package.json`

### Risks

- New product scaffolding can become misleading if documentation overstates readiness
- Shared-package boundaries may drift if billing-specific rules are pushed into generic shared modules too early
- Future connector work could pressure the team into coupling billing internals to external system formats unless adapter boundaries stay strict
