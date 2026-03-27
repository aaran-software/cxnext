# Architecture

## Purpose

This file is the single source of truth for framework and app architecture.

If another ASSIST file conflicts with this file, this file wins.

## Platform Goal

Codexsun is not intended to become one oversized app with many screens. It is intended to become a reusable business software platform that can deliver:

1. billing-only products
2. ERP-style combined suites
3. ecommerce and shopping cart products
4. CRM products
5. connector-led integration solutions for systems such as Frappe, Zoho, and Tally

## Source Roots

All source code lives under one `apps/` container:

1. `apps/framework`
2. `apps/core`
3. `apps/ecommerce`
4. `apps/billing`
5. `apps/site`
6. `apps/ui`
7. `apps/docs`
8. `apps/cli`

## Platform Structure

The whole system is one platform with explicit boundaries between reusable framework code, shared business-common foundations, standalone apps, and integration connectors.

### Framework

`apps/framework` owns reusable platform-level services and contracts. It should be reusable for any standalone app and should not depend on app business rules.

Framework responsibilities:

1. authentication
2. database
3. config
4. migrations
5. files and media storage
6. notifications
7. payments
8. HTTP runtime helpers
9. platform manifests
10. hosted services and background jobs
11. app composition contracts
12. connector runtime contracts
13. future cache and realtime blocks

Database migration rule:

1. migrations are owned by framework modules under `apps/framework/src/runtime/database/migrations/modules/<module>`
2. each module keeps its own migration files and registry instead of adding everything to one flat dump list
3. the top-level migration index only builds the ordered execution plan from module registries
4. new migrations must use sortable ids so execution order stays deterministic across modules

Current framework code lives mainly in:

1. `apps/framework/src/auth`
2. `apps/framework/src/mailbox`
3. `apps/framework/src/runtime`
4. `apps/framework/src/app-suite.ts`
5. `apps/framework/src/manifest.ts`

### Core

`apps/core` owns shared business masters and reusable business-common behavior.

Core is not the dumping ground for app logic. It exists only for capabilities that are valid across multiple standalone apps.

Current core ownership:

1. company
2. contact
3. common modules
4. media
5. shared settings
6. setup/bootstrap
7. shared schemas and domain contracts

Current core code lives in:

1. `apps/core/api`
2. `apps/core/desktop`
3. `apps/core/domain`
4. `apps/core/shared`

### Ecommerce

`apps/ecommerce` owns ecommerce and customer-commerce behavior.

Current ecommerce ownership:

1. product
2. storefront
3. checkout
4. commerce order operations
5. customer profile
6. customer helpdesk
7. ecommerce web UX

Current ecommerce code lives in:

1. `apps/ecommerce/api`
2. `apps/ecommerce/web`
3. `apps/ecommerce/domain`

### Billing

`apps/billing` is the separate accounting, inventory, and reporting application.

Current billing structure:

1. `apps/billing/api`
2. `apps/billing/web`
3. `apps/billing/desktop`
4. `apps/billing/core`
5. `apps/billing/connectors`

### Site

`apps/site` is the static presentation surface. It is not a business app.

### UI

`apps/ui` owns reusable UI primitives and shared presentation building blocks.

### Docs

`apps/docs` owns the consolidated documentation surface for the whole suite.

It should contain:

1. startup documentation
2. app ownership documentation
3. server operations notes
4. cross-app reference documentation

### CLI

`apps/cli` owns server-side operational control commands for the suite.

It should provide:

1. app listing
2. build orchestration
3. server start helpers
4. runtime health and environment checks

## Application Model

Every standalone app should follow this model:

1. the app owns its business rules, routes, UI flows, and delivery surface
2. the app consumes framework services through a composition root and DI-style registration model
3. the app may reuse shared core capabilities, but must not hide app behavior inside core
4. the app may expose optional connectors, but connector code must stay isolated behind explicit boundaries

The framework should make it possible to run apps:

1. alone
2. together in a suite host
3. with client-specific enablement
4. with or without optional connectors

Frontend bootstrap rule:

1. the browser entry point belongs to `apps/framework/src/main.tsx`
2. standalone app shells register under framework bootstrap instead of owning the top-level startup forever
3. app-specific pages may still live in their own app folders while bootstrap ownership is being extracted

App shell rule:

1. each app web surface should expose a dedicated shell module under its own app folder such as `apps/<app>/web/src/shell`
2. the shell owns app-specific providers, routing, toasters, and browser-router setup
3. framework bootstrap should only select and render shells, not absorb app-specific provider trees
4. feature pages and app business flows must stay behind the app shell instead of leaking into framework bootstrap

Shared web runtime rule:

1. global web styles belong to framework under `apps/framework/src/web/platform`
2. shared theme contracts and providers belong to framework under `apps/framework/src/web/theme`
3. apps may consume framework web runtime primitives, but framework must not import app-local theme or shell code back again

## Delivery Modes

The repository should support these delivery modes over time:

1. billing-only
2. commerce-only
3. CRM-only
4. ERP-style multi-app suite
5. integration-only bridge deployments

## Runtime Model

Current runtime reality:

1. `apps/core/api` is the suite host API and mounts framework, core, and ecommerce behavior.
2. `apps/ecommerce/web` is the active backoffice and storefront web application.
3. `apps/core/desktop` is the current desktop shell.
4. `apps/billing/*` already exists as the base of a separate billing product.

Rule:

1. `apps/core/api` may host routes from other apps during extraction, but it must not own their business code.
2. long term, hosts should become clearer composition roots instead of permanent ownership centers.

## Boundary Rules

1. Framework code must not depend on ecommerce, billing, CRM, or other app business rules.
2. Framework code should be reusable for new apps and future client-specific products.
3. Core code must stay reusable across apps.
4. App-specific business rules must not be added back into `apps/core`.
5. Billing code must stay independent from ecommerce behavior.
6. Connectors must depend on clear app or framework contracts, not hidden cross-imports.
7. UI primitives belong in `apps/ui`, not inside business apps unless they are app-specific.
8. Composition roots may wire dependencies, but feature modules should not self-bootstrap hidden runtime singletons.

## Authentication And Authorization

1. Authentication is framework-level.
2. Authorization is app-level on top of framework auth primitives.

## Current Extraction Status

Completed:

1. framework runtime services moved out of `apps/core/api` into `apps/framework/src/runtime`
2. framework auth and mailbox moved into `apps/framework/src`
3. ecommerce backend features moved into `apps/ecommerce/api`
4. `apps/core/api` now consumes framework and ecommerce code instead of owning it

Remaining:

1. split the suite host API into clearer mounted route modules
2. formalize a DI/composition-root pattern for hosts and standalone apps
3. continue moving app-specific frontend code into cleaner app-owned sections where needed
4. move billing business rules out of UI-local state into reusable app services
5. harden connector boundaries for Frappe, Zoho, Tally, and future integrations
6. keep future database schema changes module-owned so billing, commerce, CRM, and connectors can evolve without one global migration dump
7. keep every new web app behind an explicit app shell so framework bootstrap remains thin while the product suite grows
8. continue building billing business workflows on top of the current billing base
9. improve docs so the platform vision is clear to future contributors and client delivery teams

## Target Shape

```text
apps/
  framework/
    src/
      app/
      auth/
      connectors/
      contracts/
      jobs/
      mailbox/
      runtime/
  core/
    api/
    desktop/
    domain/
    shared/
  ecommerce/
    api/
    web/
    domain/
  billing/
    api/
    web/
    desktop/
    core/
    connectors/
  crm/
    api/
    web/
    domain/
  site/
  docs/
  cli/
    src/
  ui/
    src/
```
