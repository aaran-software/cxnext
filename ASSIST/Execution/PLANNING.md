# Planning

## Purpose

This file captures the execution plan for the current task before implementation expands.

## Current Entry

### Task

`Admin order operations board with fulfillment workflow actions`

### Goal

Turn the newly added commerce workflow backend into an operational admin surface by creating a routed order board inside the dashboard shell. The page should let internal users review recent orders, inspect the full workflow timeline, update shipment progression, open the print-ready invoice, and view linked accounting postings from one place.

### Assumptions

- The backend commerce repository and routes are the source of truth for workflow, invoice, and voucher data
- Only `admin` and `staff` actors should be able to operate this board
- A single master-detail board is the safest first increment, instead of building several disconnected list/detail pages

### Constraints

- Keep workflow business rules in the backend, not in React
- Reuse shared schemas from `packages/shared`
- Preserve the existing admin dashboard tone and navigation patterns
- Update execution tracking and changelog in the same change set

### Plan

1. Add frontend API helpers for listing orders, loading workflow detail, posting workflow actions, and opening invoice print HTML
2. Add a dedicated admin order operations page with queue, control panel, timeline, shipment, invoice, and accounts tabs
3. Wire the page into the admin router, sidebar, and header
4. Patch any backend workflow gaps discovered while wiring the UI, especially fulfillment events used by the board
5. Validate with focused ESLint plus API and web production builds

### Validation

- Focused ESLint on the touched backend and frontend workflow files
- `npm run build:api`
- `npm run build:web`

### Open Questions

- Whether the next increment should add a customer-side order tracking page using the same workflow data
- Whether invoice print should later move from HTML print-preview to actual PDF generation
