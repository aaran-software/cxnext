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
- [x] Restore the storefront mobile bottom menu mount in the shell
- [x] Remove the mobile search and top hamburger from the storefront header
- [x] Move the hamburger trigger into the bottom navigation
- [x] Add safe-area spacing so the bottom navigation works with mobile gestures
- [x] Restore the mobile search bar with storefront branding at the top
- [x] Place the mobile logo and search bar in a single row
- [x] Add contact access to the storefront drawer menu
- [x] Adjust the hero slider image frame to avoid harsh mobile cropping
- [x] Expand the hero slider to full-bleed mobile width and tighten its padding
- [x] Make the hero slider image larger, brighter, and closer to the edge on mobile
- [x] Reduce the mobile gap between the category rail and hero content
- [x] Trim the remaining mobile-only spacer above the hero slider
- [x] Hide the category title and description on mobile while keeping the badge
- [x] Clamp hero slider product title to two mobile lines and description to three
- [x] Expand hero slider clamps to three lines for title and five for description on tablet and desktop
- [x] Make the hero slider image cover the frame on mobile only
- [x] Hide the hero slider secondary action on mobile, rename the primary CTA to Buy now, and center the arrows vertically
- [x] Pin the hero slider mobile nav row so it stays aligned with the badge and does not drift per slide
- [x] Match the mobile hero image shell to the reference crop with a wider frame and lower image placement
- [x] Nudge the mobile hero image down another two steps for the slider crop
- [x] Move the category Explore CTA to the right and align it with the badge on mobile
- [x] Hide the presentation tab on mobile in the storefront designer
- [x] Increase tablet and desktop bottom padding under the hero slider
- [x] Move the tablet and desktop hero slider nav a little lower again
- [x] Clamp the deal banner title to one line and the description to two lines
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
