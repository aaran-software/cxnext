# Task

## Active Batch

### Title

`Implement Enterprise Task Management Module in apps/core`

### Checklist

- [ ] Create Task and TaskActivity domain models, schemas, and repositories in `apps/core`
- [ ] Implement API endpoints for Task Lifecycle (Create, Assign, Comment, Finalize)
- [ ] Build Staff Workload UI (My Tasks, Open Tasks, Created By Me)
- [ ] Run validation typecheck commands

### Validation Note

- Verify tab visibility and universal task assignment rules.

## Completed Batch

### Title

`Add company tagline support to branding surfaces`

### Checklist

- [x] Add `tagline` to the shared company schema and payload
- [x] Persist `tagline` in the core company repository
- [x] Add a database migration for the company tagline column
- [x] Expose `tagline` in the company create and edit form
- [x] Show `tagline` in the company detail page
- [x] Use the saved company tagline in branding snapshots for menu and footer surfaces
- [x] Use uploaded company logos in branding surfaces with public SVG fallbacks
- [x] Run validation commands

### Validation Note

- Validation will use the workspace typecheck/build commands after the schema and branding changes.

## Next Batch

### Title

`Close ecommerce go-live blockers and release gaps`

### Checklist

- [ ] Validate production auth behavior with real email OTP and recovery delivery
- [ ] Review Razorpay production readiness and confirm payment gateway configuration
- [ ] Integrate stock reduction and restock flow between ecommerce orders and billing inventory
- [x] Implement automated customer notifications (Email/SMS) for order and shipment lifecycle events
- [/] Build a dedicated customer-side order tracking and shipment detail page
- [ ] Add support for order cancellation with automated refund and inventory reversal
- [ ] Refine backoffice order operations with bulk fulfillment actions and print-ready dispatch labels
- [ ] Run go-live validation for auth, checkout, payments, email, and public storefront routes

## Upcoming Batch

### Title

`Build billing vouchers and ledger workflows like Tally`

### Checklist

- [x] Define billing domain scope for sales, purchase, cash, bank, and journal voucher flows
- [x] Design voucher numbering rules for invoice, purchase, receipt, payment, journal, and contra entries
- [x] Create chart of accounts structure needed for Tally-style posting behavior
- [x] Add ledger master management for customer, supplier, cash, bank, tax, and expense accounts
- [x] Build sales invoice entry flow with item lines, taxes, totals, and posting rules
- [x] Build purchase voucher entry flow with supplier ledger, item lines, taxes, and posting rules
- [x] Build receipt voucher entry flow for customer collections and bank or cash posting
- [x] Build payment voucher entry flow for supplier payments and bank or cash posting
- [x] Build journal voucher entry flow for manual debit and credit adjustments
- [x] Build contra voucher entry flow for cash-to-bank and bank-to-bank transfers
- [x] Implement voucher list, detail, edit, cancel, and print-ready surfaces for each entry type
- [x] Post every voucher into ledger transactions with balanced debit and credit validation
- [x] Add period filters, voucher search, and ledger drill-down from billing reports
- [x] Add accounting validations for locked periods, duplicate voucher numbers, and invalid ledger combinations
- [x] Create seed/demo accounting data only if needed for billing development and keep it disabled for production
- [x] Run typecheck for billing voucher workflows
- [ ] Run functional validation for billing voucher workflows
