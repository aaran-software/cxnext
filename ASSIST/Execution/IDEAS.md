# Planning

## Purpose

This file captures implementation ideas before work expands.

Read `ASSIST/AI_RULES.md`.
Read this file fully.
Update `TASK.md`, `PLANNING.md`, and `WALKTHROUGH.md` before starting implementation.

## Go-Live Ecommerce Review

Date: 2026-03-23

Conclusion: the project is not yet fulfilled for go-live ecommerce.

The storefront experience is now visually strong and partially backend-connected, but the full ecommerce launch baseline is still incomplete across checkout resilience, post-purchase customer flows, inventory/payment operations, and repo-wide validation.

## Launch Blockers

1. Repo-wide validation is not green.
   `npm run typecheck` currently fails across API, web, shared, and legacy state modules.
   Launch should not proceed until `lint`, `typecheck`, and `build` are green together.

2. Storefront cart and wishlist are still browser-local.
   Current storefront state persists through local storage in `apps/web/src/features/store/context/storefront-context.tsx`.
   This blocks multi-device continuity, authenticated cart recovery, and reliable customer support handling.

3. Product review submission is demo-only.
   `addReview()` in `apps/web/src/features/store/context/storefront-context.tsx` prepends a local record and does not persist it.
   This makes the visible review UX misleading for production shoppers.

4. Online payment completion depends on the browser callback path.
   The current checkout flow verifies Razorpay after client success callback in `apps/web/src/features/store/pages/store-checkout-page.tsx`.
   API routing exposes `/storefront/checkout/verify-payment`, but no webhook-driven reconciliation path was found in the inspected backend routes/services.
   Go-live needs server-side reconciliation, retry safety, and payment-status recovery when the client disconnects.

5. Customer post-purchase self-service is incomplete.
   Customer portal order/support surfaces still use generic section placeholders in `apps/web/src/app/router.tsx`.
   Public shop utility routes such as returns, shipping, privacy, help, and support still render `PlaceholderPage`.

6. Pricing logic is still too static for production commerce.
   Shipping threshold, shipping charge, and handling charge are hard-coded in `apps/api/src/features/storefront/data/storefront-order-repository.ts` and mirrored in storefront cart/checkout pages.
   This must move to configurable commerce rules before launch.

7. Inventory lifecycle is not proven end to end.
   Checkout validates available stock before order creation, but launch readiness still needs explicit proof for reservation, allocation, cancellation reversal, failed-payment release, and shipment-stage deduction.

8. Automated commerce coverage is missing.
   No storefront-focused tests were found for catalog, checkout, payment verification, order initialization, or customer storefront flows.

## Gaps Found In Code

1. `apps/web/src/features/store/context/storefront-context.tsx`
   Catalog loads from backend, but cart and wishlist remain local-storage state only.
   Reviews can be created locally without any backend persistence.

2. `apps/web/src/features/store/pages/store-checkout-page.tsx`
   Checkout still depends on frontend-managed address/profile fallbacks and client-triggered payment verification.
   Charges are repeated as hard-coded UI values.

3. `apps/api/src/features/storefront/application/storefront-order-service.ts`
   Payment verification exists, but only the client verification path was confirmed during review.
   This is not enough for resilient production reconciliation.

4. `apps/api/src/features/storefront/data/storefront-order-repository.ts`
   Shipping and handling are static constants.
   Stock is checked during checkout preparation, but operational stock-state transitions still need a dedicated review and likely implementation hardening.

5. `apps/web/src/app/router.tsx`
   Customer order, support, and many public storefront policy/help routes still point to generic placeholder experiences.

6. `ASSIST/Documentation/PROJECT_OVERVIEW.md`
   The repo still describes the storefront as a frontend shopping flow for design review, which matches the current maturity more than a true go-live state.

7. `ASSIST/Documentation/ARCHITECTURE.md`
   Architecture notes still describe storefront behavior as review-oriented foundation work rather than a fully operational commerce channel.

## Current Bugs And Technical Debt

1. Repo typecheck fails in critical modules.
   Examples:
   `apps/api/src/features/auth/application/auth-service.ts`
   `apps/api/src/features/commerce/data/commerce-order-workflow-repository.ts`
   `apps/api/src/shared/notifications/email-otp.ts`
   `apps/web/src/app/router.tsx`
   `apps/web/src/features/store/components/product/FilterSidebar.tsx`
   `apps/web/src/features/store/components/product/SortDropdown.tsx`
   `apps/web/src/features/store/pages/store-checkout-page.tsx`
   `apps/web/src/features/store/types/storefront.ts`
   `apps/web/src/state/authStore.ts`
   `apps/web/src/state/cartStore.ts`
   `apps/web/src/state/wishlistStore.ts`

2. Legacy frontend state files still reference missing modules and packages.
   This includes broken imports from `@/api/*`, `@/types/*`, and missing `zustand` usage in `apps/web/src/state/*`.

3. Storefront frontend has unresolved typing defects in the new catalog/filter layer.
   `FilterSidebar.tsx`, `SortDropdown.tsx`, `storefront-utils.ts`, `store-checkout-page.tsx`, and `types/storefront.ts` all surfaced compile issues.

4. Missing type declarations for email infrastructure.
   `nodemailer` typings are currently missing in API notification modules.

5. Placeholder or partial customer/public route experiences remain in the live storefront target.

## Recommended Implementation Order

### Phase 1: Stabilize The Baseline

1. Fix repo-wide TypeScript errors until `npm run typecheck` passes.
2. Remove or repair legacy dead state modules that are still included in the compile graph.
3. Re-run `lint`, `typecheck`, and `build` together and keep them green before further storefront expansion.

### Phase 2: Make Storefront Data Real

1. Introduce backend-backed customer cart persistence.
2. Introduce backend-backed wishlist persistence.
3. Replace local review submission with real review create/list flows, moderation rules, and verified-purchase linking.
4. Keep the current storefront UI, but move state ownership behind shared API contracts.

### Phase 3: Harden Checkout And Payment

1. Add payment webhook ingestion and signature verification on the server.
2. Add idempotent order creation and payment reconciliation.
3. Add failed-payment recovery and status polling/reload support.
4. Separate pricing rules from hard-coded UI and repository constants.

### Phase 4: Complete Inventory And Fulfillment

1. Define inventory reservation at checkout/order creation.
2. Release reserved stock on cancellation/expiry/payment failure.
3. Deduct or allocate stock at the correct fulfillment milestone.
4. Expose shipment, invoice, and fulfillment status to the customer portal.

### Phase 5: Complete Customer Commerce Flows

1. Build real customer order history with order detail pages.
2. Build support/contact/order-help flows connected to the customer portal.
3. Replace placeholder policy/help/store service pages with production content.
4. Add address-book management as a stable customer feature, not a checkout-side fallback only.

### Phase 6: Operational Readiness

1. Add automated tests for checkout, payment verification, order initialization, and order-state transitions.
2. Add monitoring/logging for payment and order failures.
3. Review rate limiting, auth boundaries, and public endpoint abuse protection.
4. Verify deployment configuration, storage, secrets, and recovery procedures.

## Immediate Next Task Suggestion

Recommended next implementation batch:

1. Restore repo-wide typecheck.
2. Remove broken legacy `apps/web/src/state/*` compile-path debt.
3. Fix current storefront typing defects.
4. After the baseline is green, start backend-backed cart and wishlist persistence without redesigning the existing storefront UI.

## Future Idea Backlog

1. Make shipping, handling, and offer rules admin-configurable.
2. Add customer order tracking timeline and downloadable invoices.
3. Add returns and exchange request workflow.
4. Add saved payment and address-book quality-of-life improvements after the core commerce flow is stable.
5. Add merchandising/admin analytics only after launch-critical transaction flows are reliable.
