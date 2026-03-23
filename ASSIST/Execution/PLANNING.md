# Planning

## Purpose

This file captures the execution plan for the current task before implementation expands.

## Current Entry

### Task

`Admin helpdesk and order operations list/show refinement`

### Goal

Create cleaner admin browse/detail flows by keeping customer helpdesk in a master list plus dedicated customer show page, converting order operations into a dedicated order list plus order show page, and preserving the safe OTP password-reset support flow.

### Assumptions

- The existing customer account email remains the only safe destination for support-triggered password reset in this batch
- Existing contact verification storage can be reused for password-reset OTP sessions instead of adding a separate reset token table
- Support and operations users need dedicated product-style detail pages instead of embedded split panes under list tables

### Constraints

- Keep reset and verification business rules in backend auth services, not only in React
- Do not let admin users set a new customer password directly without customer OTP completion
- Keep the helpdesk and order operations UI inside the existing admin dashboard navigation, using CommonList for browse flow and the existing entity detail tone for the show pages
- Update execution tracking, walkthrough, and changelog in the same change set

### Plan

1. Add shared auth/helpdesk contracts plus backend password-reset OTP support and admin customer helpdesk data queries
2. Add admin helpdesk routes and service actions for customer list/detail, support-triggered password reset, and disabled-account recovery email initiation
3. Add an admin dashboard customer helpdesk list page plus a dedicated customer show page for overview, orders, addresses, and verification history
4. Convert order operations into a full-width order list plus a dedicated order show page with organized workflow actions, shipment, invoice, and accounts tabs
5. Validate with `typecheck` and `build`, then record the implementation and remaining support/workflow risks

### Validation

- `npm run typecheck`
- `npm run build`
- Pending for this batch: `npm run typecheck` and `npm run build`

### Open Questions

- Whether support workflows later need persistent notes, ticket ownership, and audit entries beyond current derived customer/account context
- Whether customer identity should later store durable verified-contact flags instead of inferring support verification context from challenge history
