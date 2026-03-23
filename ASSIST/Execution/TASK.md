# Task

## Purpose

This file tracks the current active task so contributors and AI agents stay aligned on the exact unit of work in progress.

## Current Entry

### Title

`Admin helpdesk and order operations list/show refinement`

### Status

in_progress

### Objective

Refine admin support and operations surfaces into cleaner list/show flows by keeping customer helpdesk in a master-list plus customer show pattern, and converting order operations into a separate order list and product-tone order show page with organized workflow actions.

### In Scope

- Add backend admin customer helpdesk list/detail APIs using existing customer, order, address, and verification data
- Add an admin dashboard customer helpdesk list page in the existing master-list tone and a dedicated customer show page in the product-detail tone
- Convert order operations into a full-width master-list page plus a dedicated order show page in the product-detail tone
- Show customer support pain-point context including order summary, saved delivery addresses, verification history, and mismatch indicators
- Show order workflow context including actions, shipment history, invoice detail, and accounting postings in an organized tabbed show page
- Add OTP-based customer password-reset request and confirmation flows that do not require the current password
- Let staff trigger password-reset help to the customer's existing email and recovery mail for disabled accounts
- Add customer-facing login-page support for self-service password reset with OTP
- Keep execution notes and changelog aligned with the change set

### Out Of Scope

- Building a full CRM or ticketing subsystem with persistent support cases
- Adding SMS password reset delivery in this batch
- Redesigning the overall admin shell or customer portal shell beyond the required route additions

### Dependencies

- `ASSIST/AI_RULES.md`
- `apps/api/src/features/auth/*`
- `apps/api/src/features/customer-profile/*`
- `apps/api/src/features/storefront/*`
- `apps/web/src/features/auth/*`
- `apps/web/src/features/commerce/*`
- `apps/web/src/components/forms/CommonList.tsx`

### Risks

- Customer order linkage still depends on checkout email matching the customer account email
- Contact verification history is challenge-based and does not yet represent a full long-term verified-contact ledger
- Support-triggered password reset must remain limited to the customer's existing email destination and must not bypass OTP confirmation
