# Task

## Active Batch

### Title

`Refine storefront mobile navigation`

### Checklist

- [x] Add storefront coding-style guidance to `ASSIST/AI_RULES.md`
- [x] Create a dedicated mobile storefront header component
- [x] Remove duplicated top mobile wishlist, cart, and account actions
- [x] Move the mobile hamburger trigger to the right-side drawer
- [x] Keep mobile search inside the sticky top header
- [x] Update the mobile bottom account icon to stay outlined
- [x] Remove the storefront floating contact button and bottom nav
- [x] Add contact access to the storefront drawer menu
- [x] Adjust the hero slider image frame to avoid harsh mobile cropping
- [x] Run storefront validation commands

### Validation Note

- Validation will use the ecommerce web build and TypeScript checks for this UI-only batch.

## Next Batch

### Title

`Close ecommerce go-live blockers and release gaps`

### Checklist

- [ ] Validate production auth behavior with real email OTP and recovery delivery
- [ ] Review Razorpay production readiness and confirm payment gateway configuration
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
