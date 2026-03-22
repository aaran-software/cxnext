# Project Overview

## Mission

Build a full stack ERP platform using TypeScript, Node.js, React, and Electron with shared domain code and production-oriented business workflows.

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
10. Repository discipline and operating documentation

## Product Principles

1. Real business operations over demo-only flows
2. Auditability before convenience
3. Shared contracts across channels
4. Incremental delivery with safe boundaries
