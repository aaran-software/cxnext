# codexsun

`codexsun` is the brand, platform direction, and product family for delivering standalone business applications and integrated suites from one shared TypeScript codebase.

## Goal

Build a reusable framework and application model that lets the same repository deliver:

1. billing-only deployments
2. ERP-style suites
3. ecommerce and shopping cart products
4. CRM products
5. integration bridges for Frappe, Zoho, Tally, and future third-party systems

## Platform Model

1. `framework` is the reusable runtime, infrastructure, platform contracts, and delivery foundation.
2. `core` is the shared business-common foundation used by multiple apps.
3. `apps` are standalone business products that compose framework services through a composition root and DI-style registration model.
4. `connectors` are explicit integration boundaries, not hidden cross-app coupling.
5. `ui` provides reusable presentation primitives without owning business behavior.

## Current Repository Shape

```text
apps/
  framework/  Reusable platform runtime and contracts
  core/       Shared business foundation
  ecommerce/  Commerce and storefront application
  billing/    Billing, accounts, inventory, and reporting application
  site/       Presentation surface
  ui/         Reusable UI primitives
  docs/       Unified platform and app docs
  cli/        Operational control commands
ASSIST/
  Discipline/ Internal engineering rules
  Documentation/ Internal platform guidance
  Execution/ Current planning and task tracking
```

## Engineering Direction

The target is not a single monolith that happens to contain many features. The target is a disciplined platform where:

1. framework services stay reusable for any app or client delivery
2. applications stay standalone and can be shipped independently
3. shared contracts stay explicit and versionable
4. connectors stay isolated behind reviewable boundaries
5. the same repo can scale without collapsing app ownership

## Commands

```bash
npm install
npm run dev:api
npm run dev:web
npm run dev:stack
npm run dev:billing-api
npm run dev:billing-web
npm run build
npm run lint
npm run typecheck
```

Desktop shell:

```bash
npm run start:desktop
```

Repository guidance currently lives in `ASSIST/`. Start with:

1. `ASSIST/Documentation/PROJECT_OVERVIEW.md`
2. `ASSIST/Documentation/ARCHITECTURE.md`
3. `ASSIST/Execution/TASK.md`
