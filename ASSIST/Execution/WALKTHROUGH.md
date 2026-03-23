# Walkthrough

## Purpose

This file records what was actually done for the current task, how it was validated, and what remains.

## Current Entry

### Task

`Admin helpdesk and order operations list/show refinement`

### Summary

Added an internal customer helpdesk workspace for admin and staff users using a master list plus dedicated customer show-page flow, then aligned order operations to the same pattern by replacing the split queue/workboard screen with a full-width order list and a dedicated order show page. The helpdesk surfaces customer account status, order summary, saved delivery addresses, recent verification history, and derived mismatch flags in a product-detail style layout. The new order show page exposes workflow actions, timeline, shipment detail, invoice rows, and accounting postings in cleaner tabs. OTP password-reset request and confirmation flows remain available so support can send reset help to the customer's existing email without asking for the current password, while disabled accounts can still receive recovery OTP help. The customer-facing reset flow lives on its own forgot-password page linked from login.

### Files Changed

- `packages/shared/src/schemas/auth.ts` to add password-reset OTP request and confirmation contracts
- `packages/shared/src/schemas/customer-helpdesk.ts` and `packages/shared/src/index.ts` to add admin helpdesk list/detail contracts
- `apps/api/src/features/auth/application/auth-service.ts` to support password-reset OTP creation, support-triggered reset initiation, and public password-reset confirmation
- `apps/api/src/features/customer-profile/data/customer-profile-repository.ts` to load customer profiles by user id for helpdesk lookups
- `apps/api/src/features/customer-helpdesk/data/customer-helpdesk-repository.ts` to aggregate customer account, order, address, and verification history for support
- `apps/api/src/features/customer-helpdesk/application/customer-helpdesk-service.ts` to expose support-safe customer detail, issue derivation, reset initiation, and recovery initiation logic
- `apps/api/src/app/http/router.ts` to add admin helpdesk routes and public password-reset endpoints
- `apps/web/src/shared/api/client.ts` to add helpdesk and password-reset client helpers
- `apps/web/src/features/commerce/pages/customer-helpdesk-page.tsx` to build the admin customer helpdesk master list
- `apps/web/src/features/commerce/pages/customer-helpdesk-show-page.tsx` to build the dedicated customer show page in the product-detail tone
- `apps/web/src/features/commerce/pages/order-operations-page.tsx` to build the admin order operations master list
- `apps/web/src/features/commerce/pages/order-show-page.tsx` to build the dedicated order show page in the product-detail tone
- `apps/web/src/app/router.tsx`, `apps/web/src/features/dashboard/components/navigation/app-sidebar.tsx`, and `apps/web/src/features/dashboard/components/navigation/app-header.tsx` to route and expose the helpdesk inside the admin dashboard shell
- `apps/web/src/features/auth/pages/login-page.tsx` and `apps/web/src/features/auth/pages/forgot-password-page.tsx` to link and host the self-service password-reset OTP flow
- `ASSIST/Execution/TASK.md`, `ASSIST/Execution/PLANNING.md`, and `ASSIST/Documentation/CHANGELOG.md` to keep execution tracking aligned with the new task

### Validation Performed

- `npm run typecheck` succeeded
- `npm run build` succeeded, including `build:api`, `build:web`, and `build:desktop`

### Decisions

- Keep support-triggered password reset limited to the customer's existing account email and require OTP completion from the customer side
- Reuse the existing contact-verification store for password-reset OTP challenges instead of introducing a new reset-token table in this batch
- Derive helpdesk mismatch signals from current account, address, and order data instead of creating a persistent support-case subsystem
- Place the admin helpdesk inside the existing dashboard workspace using a CommonList browse page plus a separate customer detail page rather than keeping support detail embedded under the table
- Apply the same list/show pattern to order operations so workflow controls live on a dedicated order page instead of sharing space with the queue

### Remaining Work

- Add durable support notes, case ownership, and audit events if the helpdesk evolves into a full ticketing workflow
- Introduce explicit long-term verified-contact flags if support operations need more than the current challenge-history view
- Move customer order ownership from email matching to an explicit customer-user foreign key for stronger support traceability

### Risks

- Customer order and mismatch views still depend on checkout email matching the authenticated customer account email
- Verification history is challenge-based and does not yet represent a full permanent customer-verification ledger
- Password reset support currently uses email only; mobile OTP reset is still out of scope for this batch
