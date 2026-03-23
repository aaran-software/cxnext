# Task

## Purpose

This file tracks the current active task so contributors and AI agents stay aligned on the exact unit of work in progress.

## Current Entry

### Title

`Customer portal live commerce pages and test payment bypass`

### Status

validated

### Objective

Complete the customer-facing portal surfaces for overview, orders, wishlist, cart, and notifications using live current data, and add an `.env`-controlled checkout payment bypass so online-order testing can finish without Razorpay during test runs.

### In Scope

- Replace customer portal placeholder pages with live customer-facing commerce pages
- Add a customer-safe storefront order list API using existing authenticated user context
- Reuse existing storefront cart and wishlist state instead of redesigning those flows
- Add an environment-controlled online payment bypass path for storefront checkout testing
- Keep execution notes and changelog aligned with the change set

### Out Of Scope

- Redesigning customer portal navigation or layout
- Adding webhook reconciliation or production-grade payment fallback logic
- Reworking cart and wishlist persistence architecture beyond the current live-state scope

### Dependencies

- `ASSIST/AI_RULES.md`
- `apps/api/src/features/storefront/*`
- `apps/web/src/features/customer-portal/*`
- `apps/web/src/features/store/context/storefront-context.tsx`
- `.env` and `.env.example` payment settings

### Risks

- Storefront orders are currently associated by captured checkout identity rather than a dedicated customer-order ownership table
- Payment bypass is for test flow only and must stay explicit in environment config
- Customer portal notifications will reflect available live order/payment state, not a separate messaging system
