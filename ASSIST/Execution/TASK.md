# Task

## Purpose

This file tracks the current active task so contributors and AI agents stay aligned on the exact unit of work in progress.

## Current Entry

### Title

`Admin order operations board with fulfillment workflow actions`

### Status

validated

### Objective

Expose the new backend commerce workflow inside the admin portal so operations users can review order state, shipment progression, invoice details, and accounting postings from one board and push fulfillment events without leaving the dashboard.

### In Scope

- Add an admin `/orders` operations board in the dashboard shell
- Connect the board to the new commerce workflow APIs
- Support fulfillment actions such as prepare, pack, courier assignment, pickup, transit, delivery, and delivery confirmation
- Surface invoice details, linked invoice lines, and accounting voucher lines
- Keep execution notes and changelog aligned with the change set

### Out Of Scope

- Courier API or webhook integrations
- Customer-facing tracking or delivery-confirmation UI
- Full finance-ledger management beyond the linked order voucher display

### Dependencies

- `ASSIST/AI_RULES.md`
- `apps/api/src/features/commerce/data/commerce-order-workflow-repository.ts`
- `apps/api/src/app/http/router.ts`
- `apps/web/src/shared/api/client.ts`
- `apps/web/src/app/router.tsx`

### Risks

- The board currently depends on manual operator updates for courier and delivery progression
- Invoice printing is browser-print HTML, not server-generated PDF
- Vendor actors can still reach the admin shell broadly, while the order board itself blocks non-backoffice access
