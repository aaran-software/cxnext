# Project Overview

## Mission

Build a full stack ERP platform using TypeScript, Node.js, React, and Electron with shared domain code and production-oriented business workflows.

The repository can also host standalone product lines when they preserve explicit runtime and domain boundaries, including a desktop-first billing-and-accounts product.

## Product Scope

The platform is intended to cover:

1. Organization setup and financial year management
2. Customer, supplier, and item masters
3. Sales and purchase invoicing
4. Payments, receipts, and contra entries
5. Tax-ready billing with configurable GST-ready structures
6. Stock movement and inventory valuation basics
7. Ledger, trial balance, P&L, and balance sheet reports
8. Audit trail and role-based access control
9. CRM and commerce workflows built on the same shared platform
10. VPS-friendly single-container deployment with runtime-first database setup
11. A standalone billing-and-accounts product track for small businesses, with Tally-like accounts-plus-inventory workflows and optional external connectors

## Current State

Current delivery is foundation work:

1. Monorepo-style application structure
2. Shared domain package
3. Initial Node API scaffold
4. Initial React application shell
5. Initial Electron shell
6. MariaDB-backed authentication and RBAC foundation with frontend-connected login/register flows
7. Tracked MariaDB bootstrap with schema migrations plus optional seeders for demo aggregate data
8. Upload-backed media asset management with a shared popup media manager, tabbed metadata review, and reusable image field integration across admin forms
9. A storefront `shop` target with a full static frontend shopping flow covering home, category browsing, product detail, wishlist, cart, and checkout for design review
10. Storefront product cards and product detail actions now expose balanced utility share/save controls beside the primary purchase CTAs
11. Storefront route entry now resets the viewport so product detail pages open from the hero section instead of restoring prior listing scroll position
12. Storefront category cards now expose a clearer inline `Explore` CTA with a visible neutral-black baseline and accent-led hover motion so collection navigation reads as intentionally clickable
13. Storefront neutral accent tokens now resolve to black-based values so CTA and utility states remain visible on light storefront surfaces
14. Storefront catalog browsing now exposes the shared search bar directly in the catalog toolbar instead of a placeholder filter-style control
15. Storefront search inputs now render without placeholder copy so the shared search bar stays visually clean across header and catalog contexts
16. Storefront home feature cards now provide interactive hover/click feedback instead of reading as static informational blocks
17. Storefront wishlist and share utilities now use icon-led hover and active feedback so the button shell stays visually secondary to primary purchase CTAs
18. The top storefront cart, wishlist, and login/account controls now use icon-led hover and active feedback instead of filled shells in the sticky header
19. The top header login/account trigger now shares the same hover surface behavior as the adjacent `More` trigger for consistent sticky-nav affordance
20. The catalog toolbar now presents the shared search bar without extra helper copy for a cleaner browsing surface
21. Repository discipline and operating documentation
22. Runtime configuration-backed setup mode that keeps the API online when MariaDB is not configured yet
23. Single-process production serving where `apps/api` can serve the built `apps/web` bundle for VPS deployment
24. Initial billing product direction documented as a standalone desktop-first plugin-style application boundary rather than an embedded ERP feature

## Product Principles

1. Real business operations over demo-only flows
2. Auditability before convenience
3. Shared contracts across channels
4. Incremental delivery with safe boundaries
