# Project Overview

## Mission

Build one ERP platform in Node.js, TypeScript, React, and Electron with a shared framework, a shared core business foundation, and parallel standalone business apps.

## Current App Suite

1. `framework` provides runtime services and platform contracts.
2. `core` provides shared business masters and reusable admin foundations.
3. `ecommerce` provides the current live commerce and storefront product.
4. `billing` is the separate accounts-and-inventory product base.
5. `site` is the static presentation surface.
6. `ui` provides reusable UI primitives.
7. `docs` provides unified suite documentation.
8. `cli` provides server control commands for the suite.

## Current State

1. the repository already has a working ecommerce web experience
2. the suite API host currently runs from `apps/core/api`
3. framework infrastructure has now been extracted into `apps/framework`
4. ecommerce backend ownership has now been extracted into `apps/ecommerce/api`
5. billing scaffolds exist, but billing business workflows are still early

## Product Principles

1. explicit ownership between framework, core, and apps
2. shared masters in `core`
3. ecommerce behavior in `ecommerce`
4. accounting and inventory correctness in `billing`
5. incremental extraction without collapsing the working product
