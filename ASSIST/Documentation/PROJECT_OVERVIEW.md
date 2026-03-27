# Project Overview

## Mission

Build Codexsun as a reusable business software platform with:

1. a reusable framework
2. a shared business-common foundation
3. standalone application delivery
4. connector-ready integration boundaries
5. one repository that can scale across multiple products without losing control

## Platform Promise

The same platform should be able to deliver:

1. billing-only products
2. ERP-style combined suites
3. shopping cart and commerce products
4. CRM products
5. connector-led integrations for Frappe, Zoho, Tally, and future systems

## Current State

1. the repository already has a working ecommerce web experience
2. the shared host currently runs from `apps/core/api`
3. framework infrastructure has been extracted into `apps/framework`
4. ecommerce backend ownership has been extracted into `apps/ecommerce/api`
5. billing scaffolds exist, but billing business workflows and delivery boundaries still need hardening
6. documentation exists, but it still needs a cleaner product-level story and stronger execution discipline

## Platform Principles

1. framework must stay reusable outside any single application
2. core must provide only shared business-common capabilities
3. applications must stay standalone and shippable independently
4. connectors must be explicit and reviewable
5. hosts must compose apps through a DI/composition-root model instead of hidden cross-dependencies
6. documentation must explain the platform clearly enough for future contributors and client delivery teams
7. growth must not collapse into one uncontrolled monolith

## Current App Suite

1. `framework` provides runtime services and platform contracts
2. `core` provides shared business masters and reusable admin foundations
3. `ecommerce` provides commerce and storefront behavior
4. `billing` provides the separate accounts-and-inventory application base
5. `site` provides the static presentation surface
6. `ui` provides reusable UI primitives
7. `docs` provides unified platform and app documentation
8. `cli` provides server control commands
