# Billing Product Architecture

## Purpose

Define the standalone billing-and-accounts product that will live inside this repository without destabilizing the main ERP system.

## Product Position

The billing product is a separate software line inside the repo.

It is intended to behave like:

1. a desktop-first small-business accounting and inventory product
2. a plugin-style module that can run independently
3. an auditor-focused bookkeeping system in a `Tally`-like tone
4. an optionally connected system for `Tally`, `Frappe ERPNext`, and the main ERP

It is not just an extra feature page under the current ERP navigation.

## Core Goals

1. deliver a standalone billing runtime for small industries and traders
2. keep accounts and inventory as the trust center of the product
3. support fast billing entry without weakening voucher correctness
4. preserve full auditability, period traceability, and reversible correction flows
5. allow connector-based two-way data movement with external accounting systems

## Non-Goals

1. coupling billing implementation directly to current ERP internals
2. turning the billing product into a generic ecommerce admin shell
3. building manufacturing, HR, or CRM-heavy workflows in the first phase
4. hiding accounting complexity inside frontend-only document forms

## Architectural Boundary

The billing product should be able to boot, build, and evolve even if the rest of the ERP is unchanged.

Required boundary rules:

1. billing has its own app entry points
2. billing has its own backend service boundary
3. billing has its own domain packages
4. billing migrations and fixtures stay separate
5. integration with the main ERP happens only through explicit contracts

## Recommended Repository Shape

```text
apps/
  billing-api/
  billing-desktop/
packages/
  billing-core/
  billing-connectors/
  shared/
```

## Runtime Responsibilities

### `apps/billing-desktop`

1. Electron shell
2. accountant and auditor-facing workstation UI
3. keyboard-first navigation and transaction entry
4. print/export orchestration
5. desktop-safe configuration and local runtime integration

### `apps/billing-api`

1. billing document orchestration
2. accounts posting and validation
3. inventory movement orchestration
4. reporting services
5. connector endpoints and sync job execution

### `packages/billing-core`

1. chart of accounts rules
2. voucher and ledger domain models
3. item, warehouse, and stock-ledger domain models
4. billing document models
5. posting, reversal, and period-lock policies
6. report calculation primitives

### `packages/billing-connectors`

1. Tally adapter contracts
2. ERPNext/Frappe adapter contracts
3. import/export transforms
4. sync state and conflict handling models

### `packages/shared`

Keep only truly cross-product contracts here, such as generic audit or identity primitives.

Do not place billing-owned accounting rules here unless the repository proves they are genuinely shared across products.

## Functional Modules

### Foundation

1. company
2. branch
3. books and financial year
4. users and permissions
5. numbering and settings
6. audit metadata

### Masters

1. ledgers
2. customers
3. suppliers
4. items and services
5. units and categories
6. tax profiles
7. warehouses
8. bank and payment masters

### Accounts

1. opening balances
2. voucher types
3. journal
4. receipt
5. payment
6. contra
7. debit note
8. credit note
9. bill-wise adjustment
10. bank reconciliation
11. period close and lock

### Inventory

1. stock item master
2. opening stock
3. warehouse balances
4. stock journal
5. stock transfer
6. stock adjustment
7. stock ledger
8. stock summary

### Billing

1. sales invoice
2. purchase invoice
3. sales return
4. purchase return
5. quotation
6. delivery challan
7. invoice-linked receipt and payment workflows

### Reports

1. day book
2. cash book
3. bank book
4. ledger
5. trial balance
6. profit and loss
7. balance sheet
8. receivable and payable aging
9. sales and purchase register
10. tax summaries
11. audit exception reporting

## Tally-Like Design Rules

1. accounts-first navigation and language
2. inventory tightly linked to accounting truth
3. posted history must reproduce reports for any date range
4. stock and voucher changes require traceable correction flows
5. hard delete is not allowed for posted or stock-affecting records

## Integration Strategy

### Internal Integration

The standalone billing product may integrate with the main ERP through explicit APIs or shared contracts, but it must remain usable without that integration.

### External Connectors

Support connector-based, optional, reviewable sync for:

1. `Tally`
2. `Frappe ERPNext`

Connector rules:

1. two-way sync must be idempotent
2. external IDs and source systems must be tracked
3. sync conflicts must be reviewable
4. imports must pass through billing domain/application validation
5. outbound sync must read from committed internal documents only

## Recommended Delivery Order

1. standalone billing app/package skeleton
2. accounts core
3. inventory core
4. billing documents
5. reports and period controls
6. Tally and ERPNext connectors

## Current Implementation Baseline

The repository now contains only the initial scaffold for this billing product direction.

Current scaffold goals:

1. reserve clean app/package boundaries
2. define the billing product manifest
3. define the first shared billing domain contracts
4. keep the main ERP unchanged unless integration is explicitly added later
