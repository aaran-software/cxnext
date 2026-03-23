# Walkthrough

## Purpose

This file records what was actually done for the current task, how it was validated, and what remains.

## Current Entry

### Task

`Customer portal live commerce pages and test payment bypass`

### Summary

Completed the customer-facing commerce portal surfaces for overview, orders, wishlist, cart, and notifications using live current data. Added a customer-safe order-history API keyed to the authenticated customer identity already present at checkout, and introduced an explicit `.env` payment bypass switch so online checkout can complete end to end during testing without Razorpay.

### Files Changed

- `apps/api/src/features/storefront/data/storefront-order-repository.ts` to add customer order listing and a test-bypass payment order path
- `apps/api/src/features/storefront/application/storefront-order-service.ts` to expose customer order listing and support env-driven online payment bypass
- `apps/api/src/app/http/router.ts` to add authenticated customer order routes
- `apps/api/src/shared/config/environment.ts`, `.env.example`, and `.env` to introduce and enable `PAYMENT_TEST_BYPASS` for current testing
- `packages/shared/src/schemas/storefront.ts` and `apps/web/src/shared/api/client.ts` to add shared customer order list contracts and client helpers
- `apps/web/src/features/customer-portal/lib/customer-orders.ts` to centralize live customer order loading and notification derivation
- `apps/web/src/features/customer-portal/pages/customer-dashboard-page.tsx` to convert overview metrics and summaries to live order/cart/wishlist data
- `apps/web/src/features/customer-portal/pages/customer-orders-page.tsx` to add a live customer order history page
- `apps/web/src/features/customer-portal/pages/customer-wishlist-page.tsx` and `apps/web/src/features/customer-portal/pages/customer-cart-page.tsx` to complete live wishlist and cart portal pages
- `apps/web/src/features/customer-portal/pages/customer-notifications-page.tsx` to derive current customer notifications from live order/payment activity
- `apps/web/src/app/router.tsx` to route the new customer portal pages inside the existing customer shell
- `apps/web/src/features/store/pages/store-checkout-page.tsx` to label test-bypass payments clearly in the existing checkout success state
- `ASSIST/Documentation/CHANGELOG.md` to record the customer portal and test payment changes

### Validation Performed

- `npm run typecheck` succeeded
- `npm run build` succeeded, including `build:api`, `build:web`, and `build:desktop`

### Decisions

- Keep the customer portal inside the existing layout and navigation shell instead of introducing a separate commerce account design
- Use existing storefront cart and wishlist state as the live source for customer portal pages in this batch
- Derive customer notifications from available order/payment state rather than creating a separate notification subsystem
- Keep payment bypass strictly environment-driven so it is explicit test behavior

### Remaining Work

- Customer order ownership should later move from email-based lookup to an explicit customer-user linkage in the storefront order model
- Customer notifications are currently derived from order state and not persisted as a dedicated notification timeline
- Production-ready payment resilience, webhook reconciliation, and cart/wishlist persistence hardening remain separate launch-readiness work

### Risks

- `PAYMENT_TEST_BYPASS=true` is currently enabled in `.env` for testing and must be disabled outside test scenarios
- Customer order history currently depends on the checkout email matching the authenticated customer account email
