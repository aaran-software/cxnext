# Planning

## Purpose

This file captures the execution plan for the current task before implementation expands.

## Current Entry

### Task

`Customer portal live commerce pages and test payment bypass`

### Goal

Finish the customer portal’s core commerce pages with live current data and make checkout testable without Razorpay by introducing an explicit environment switch that bypasses online payment capture during testing.

### Assumptions

- Existing storefront catalog, cart, wishlist, and checkout UI should stay structurally the same
- The quickest safe customer order ownership path is to scope order history to the authenticated customer identity already captured at checkout
- Notifications can be derived from current order/payment/shipment state instead of requiring a new notification backend in this batch

### Constraints

- Keep business rules and payment bypass logic in backend services, not only in React
- Preserve current customer portal navigation, layout shell, and storefront UX tone
- Keep the payment bypass explicit and environment-driven so it cannot be mistaken for a normal production flow
- Update execution tracking, walkthrough, and changelog in the same change set

### Plan

1. Add shared contracts plus backend customer order list support for authenticated customer users
2. Add frontend customer portal pages for overview, orders, wishlist, cart, and notifications using live backend/storefront state
3. Route the customer portal pages into the existing customer portal shell without changing overall navigation structure
4. Add an `.env` payment bypass mode that auto-completes online checkout during testing while preserving the current checkout UX
5. Validate with `typecheck` and `build`, then record the completed implementation and remaining risks

### Validation

- `npm run typecheck`
- `npm run build`
- Completed in this batch: `npm run typecheck` and `npm run build`

### Open Questions

- Whether customer order ownership should later move from email-based scoping to an explicit customer user foreign key
- Whether a future increment should add dedicated notification persistence instead of deriving notifications from order state
