# Architecture

## Purpose

This file is the single source of truth for framework and app architecture.

If another ASSIST file conflicts with this file, this file wins.

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

The whole system is one ERP platform with explicit app boundaries.

### Framework

`apps/framework` owns platform-level runtime services:

1. authentication
2. database
3. config
4. migrations
5. files and media storage
6. notifications
7. payments
8. HTTP runtime helpers
9. platform manifests
10. future cache, jobs, realtime, and CLI blocks

Current framework code lives mainly in:

1. `apps/framework/src/auth`
2. `apps/framework/src/mailbox`
3. `apps/framework/src/runtime`
4. `apps/framework/src/app-suite.ts`
5. `apps/framework/src/manifest.ts`

### Core

`apps/core` owns shared business masters and reusable business-common behavior.

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

`apps/billing` is the separate accounting and inventory application.

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

## Runtime Model

Current runtime reality:

1. `apps/core/api` is the suite host API and mounts framework, core, and ecommerce behavior.
2. `apps/ecommerce/web` is the active backoffice and storefront web application.
3. `apps/core/desktop` is the current desktop shell.
4. `apps/billing/*` already exists as the base of a separate billing product.

Rule:

1. `apps/core/api` may host routes from other apps during extraction, but it must not own their business code.

## Boundary Rules

1. Framework code must not depend on ecommerce or billing business rules.
2. Core code must stay reusable across apps.
3. Ecommerce code must not be added back into `apps/core`.
4. Billing code must stay independent from ecommerce behavior.
5. UI primitives belong in `apps/ui`, not inside business apps unless they are app-specific.

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
2. continue moving app-specific frontend code into cleaner app-owned sections where needed
3. build billing business workflows on top of the current billing base

## Target Shape

```text
apps/
  framework/
    src/
      auth/
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
  site/
  docs/
  cli/
    src/
  ui/
    src/
```
