# System Control Checklist

## Purpose

Use this file as the main startup-to-E2E control sheet for the whole application.

This file is intentionally basic in language and deep in coverage.

Rule:

1. Do not mark an item complete unless it was actually checked.
2. If a check fails, add one short failure note directly below the item.
3. If a check is not relevant for the current environment, mark it as skipped in notes instead of silently ignoring it.
4. Prefer system truth over assumptions.
5. Update this file whenever a runtime, setup, branding, config, routing, or release problem is discovered.

## How To Use

1. Start from Section 1 and move in order.
2. Do not jump to feature work before startup, config, and database checks are stable.
3. Save evidence for every important pass:
   - command used
   - page opened
   - API checked
   - screenshot or note if needed
4. If one section is red, stop and fix that area before moving deeper.

## Status Meaning

- `[ ]` not checked
- `[x]` checked and passed
- `[!]` checked and failed
- `[-]` not applicable for current environment

## Current Snapshot

- Date: `2026-03-26`
- Scope: whole application control
- Owner: Codex
- Current confidence: partial
- Last verified items:
  - `npm run typecheck`
  - `npm run build:web`
  - company tagline data path
  - branding fallback logo path

## Run Order

1. environment and config
2. startup and database
3. backend runtime
4. frontend target selection
5. basic page visibility
6. branding and identity
7. core masters
8. ecommerce
9. billing
10. auth and permissions
11. build and release
12. end-to-end flow

## 1. Environment And Config

### 1.1 File Presence

- [ ] root `.env` exists
- [ ] required `.env` keys exist for current environment
- [ ] no required key is blank
- [ ] sensitive values are not hardcoded in source where env should be used

### 1.2 Runtime Respect

- [ ] API base URL respects environment configuration
- [ ] frontend target respects environment configuration
- [ ] app debug flag respects environment configuration
- [ ] setup skip flag respects environment configuration
- [ ] media public base URL respects environment configuration
- [ ] version/update checks respect environment configuration

### 1.3 Build Respect

- [ ] dev mode uses intended config
- [ ] build mode uses intended config
- [ ] production build does not silently fall back to localhost values
- [ ] web target and billing target read separate intended settings

### 1.4 Acceptance

- [ ] no unexpected fallback value is observed during runtime
- [ ] no environment-sensitive route behaves differently than configured

### 1.5 Evidence

- commands:
- notes:

## 2. Startup And Database

### 2.1 First Startup

- [ ] API process starts cleanly
- [ ] startup does not crash on missing optional services
- [ ] setup state is correctly detected on boot
- [ ] startup logs are readable and useful

### 2.2 Database Connection

- [ ] database credentials work
- [ ] initial database connection succeeds
- [ ] reconnect behavior is stable after restart
- [ ] health check shows database ready

### 2.3 Setup Flow

- [ ] setup status endpoint responds
- [ ] database setup request works
- [ ] invalid setup input is rejected correctly
- [ ] setup recovery mode is entered when DB is not ready
- [ ] setup recovery mode exits when DB becomes ready

### 2.4 Migration Flow

- [ ] migration verification reports correctly
- [ ] migration run completes successfully
- [ ] no migration order issue exists
- [ ] no duplicate-column or table drift issue blocks current environment
- [ ] existing database upgrades without data loss
- [ ] new database bootstrap reaches latest schema

### 2.5 Data Foundation

- [ ] framework tables exist
- [ ] core tables exist
- [ ] ecommerce tables exist
- [ ] billing tables exist where expected
- [ ] bootstrap company record exists
- [ ] bootstrap common modules exist
- [ ] unknown/default reference records exist

### 2.6 Acceptance

- [ ] system can move from fresh setup to ready state
- [ ] system can restart without re-entering broken setup state

### 2.7 Evidence

- commands:
- endpoints:
- notes:

## 3. Backend Runtime Control

### 3.1 Core Service Health

- [ ] `/health` responds correctly
- [ ] `/health/db` responds correctly
- [ ] `/system/version` responds correctly
- [ ] `/framework/manifest` responds correctly

### 3.2 Auth Surface

- [ ] login route responds correctly
- [ ] register route responds correctly
- [ ] `/auth/me` responds correctly with token
- [ ] protected routes reject missing token correctly

### 3.3 Core Routes

- [ ] company list route responds
- [ ] company detail route responds
- [ ] contact list route responds
- [ ] contact detail route responds
- [ ] common module routes respond
- [ ] media routes respond

### 3.4 Ecommerce Routes

- [ ] product routes respond
- [ ] storefront catalog route responds
- [ ] checkout routes respond
- [ ] customer order routes respond
- [ ] customer profile routes respond

### 3.5 Billing Routes

- [ ] billing API process starts
- [ ] billing routes expected for current build are reachable

### 3.6 Acceptance

- [ ] no primary route family returns unexpected server error during smoke test

### 3.7 Evidence

- commands:
- endpoints:
- notes:

## 4. Frontend Target Control

### 4.1 Repository Wiring

- [x] repository contains frontend and runtime targets for core, ecommerce web/shop, and billing
- [x] root scripts define `dev:web`, `dev:billing-web`, `dev:api`, `dev:billing-api`, `build:web`, and `build:billing-web`

### 4.2 Target Switching

- [ ] active target switches correctly by configuration
- [ ] `web` target opens intended admin experience
- [ ] `shop` target opens intended storefront experience
- [ ] `billing` target opens intended billing experience
- [ ] wrong target content does not leak into another target

### 4.3 Shells

- [ ] browser app shell loads
- [ ] admin layout loads
- [ ] storefront layout loads
- [ ] billing layout loads
- [ ] desktop shell loads where required

### 4.4 Acceptance

- [ ] target selection is predictable and controllable
- [ ] developer can state exactly which target is active and why

### 4.5 Evidence

- commands:
- pages:
- notes:

## 5. Basic Page Visibility

### 5.1 Entry Pages

- [ ] setup page is visible properly when system is not ready
- [ ] login page is visible properly
- [ ] registration page is visible properly
- [ ] forgot password flow page is visible properly

### 5.2 Main Pages

- [ ] admin dashboard home page is visible properly
- [ ] storefront home page is visible properly
- [ ] billing home page is visible properly
- [ ] customer portal landing page is visible properly

### 5.3 UI Stability

- [ ] navigation renders without blank blocks
- [ ] footer renders without blank blocks
- [ ] no major spacing break is visible on first load
- [ ] no broken image is visible on first load
- [ ] no obvious console crash appears on first load
- [ ] no obvious hydration or runtime React error appears

### 5.4 Responsiveness

- [ ] desktop layout is usable
- [ ] tablet layout is usable
- [ ] mobile layout is usable

### 5.5 Acceptance

- [ ] user can enter the app and identify where they are without confusion

### 5.6 Evidence

- pages:
- viewport notes:
- console notes:

## 6. Branding And Identity Control

### 6.1 Data Source

- [x] company tagline field exists in core schema, persistence, and admin form
- [x] shared brand mark can use uploaded company logo first
- [x] fallback branding assets exist at `/logo.svg` and `/logo-dark.svg`
- [ ] current company is correctly resolved for branding snapshot
- [ ] branding does not stay stale after company update

### 6.2 Logo Visibility

- [ ] uploaded company logo is visible in admin sidebar
- [ ] uploaded company logo is visible in storefront header
- [ ] uploaded company logo is visible in footer branding
- [ ] uploaded company logo is visible in auth layout
- [ ] fallback logo appears when no company logo exists

### 6.3 Dark And Light Behavior

- [ ] light logo is correct in light mode
- [ ] dark logo is correct in dark mode
- [ ] dark mode fallback still works when no dark company logo is uploaded

### 6.4 Text Identity

- [ ] brand name is correct
- [ ] tagline is correct below logo text
- [ ] browser title is correct
- [ ] meta description is correct enough for current environment
- [ ] favicon, logo, and title stay consistent

### 6.5 Acceptance

- [ ] one company change updates visible branding across the application consistently

### 6.6 Evidence

- company used:
- logo types used:
- pages checked:
- notes:

## 7. Core Master Control

### 7.1 Company

- [ ] company list loads
- [ ] company create works
- [ ] company edit works
- [ ] company detail shows correct values
- [ ] company delete/deactivate works
- [ ] company restore works
- [ ] company logo upload works
- [ ] company tagline save works

### 7.2 Contact

- [ ] contact list loads
- [ ] contact create works
- [ ] contact edit works
- [ ] contact detail loads
- [ ] contact deactivate works
- [ ] contact restore works

### 7.3 Common Masters

- [ ] countries load
- [ ] states load
- [ ] cities load
- [ ] pincodes load
- [ ] brands load
- [ ] categories load
- [ ] create common master works
- [ ] edit common master works

### 7.4 Media

- [ ] media list loads
- [ ] media upload works
- [ ] uploaded asset preview works
- [ ] returned public URL is usable
- [ ] media folder create works

### 7.5 Acceptance

- [ ] core masters are stable enough to support downstream ecommerce and billing flows

### 7.6 Evidence

- records tested:
- notes:

## 8. Ecommerce Control

### 8.1 Catalog

- [ ] storefront catalog loads real data
- [ ] product list page loads
- [ ] product detail page loads
- [ ] category navigation works
- [ ] search works at basic level

### 8.2 Product Backoffice

- [ ] product create works
- [ ] product edit works
- [ ] product detail works
- [ ] product image display works
- [ ] product appears in storefront after save

### 8.3 Cart And Checkout

- [ ] add to cart works
- [ ] cart update quantity works
- [ ] remove from cart works
- [ ] checkout start works
- [ ] payment verification flow works

### 8.4 Customer Area

- [ ] customer login works
- [ ] customer order list loads
- [ ] customer order detail/tracking loads
- [ ] customer support page shows company contact details correctly

### 8.5 Acceptance

- [ ] a product can move from backoffice creation to storefront purchase flow

### 8.6 Evidence

- products tested:
- orders tested:
- notes:

## 9. Billing Control

### 9.1 Startup

- [ ] billing API starts correctly
- [ ] billing web starts correctly

### 9.2 Basic Runtime

- [ ] billing navigation is usable
- [ ] billing home/dashboard loads
- [ ] billing masters load correctly

### 9.3 Voucher Area

- [ ] sales voucher flow loads
- [ ] purchase voucher flow loads
- [ ] receipt voucher flow loads
- [ ] payment voucher flow loads
- [ ] journal voucher flow loads
- [ ] contra voucher flow loads

### 9.4 Reporting

- [ ] billing reports load
- [ ] ledger or transaction drill-down loads

### 9.5 Acceptance

- [ ] billing can be opened and basic accounting workflow is navigable

### 9.6 Evidence

- pages tested:
- notes:

## 10. Auth And Permission Control

### 10.1 Access Rules

- [ ] unauthenticated user cannot access protected admin routes
- [ ] customer user cannot access backoffice-only routes
- [ ] staff/admin access works where expected
- [ ] super admin-only pages are properly restricted

### 10.2 User Flows

- [ ] admin login works
- [ ] customer login works
- [ ] register flow works
- [ ] password reset request flow works
- [ ] recovery flow works

### 10.3 Destructive Actions

- [ ] destructive actions ask for confirmation
- [ ] delete/deactivate actions give understandable feedback

### 10.4 Acceptance

- [ ] role boundaries are clear and enforced

### 10.5 Evidence

- users tested:
- notes:

## 11. Build And Release Control

### 11.1 Local Checks

- [x] `npm run typecheck` passes
- [x] `npm run build:web` passes
- [ ] `npm run build:api` passes
- [ ] `npm run build:billing-web` passes
- [ ] `npm run build:billing-api` passes
- [ ] `npm run build:desktop` passes when needed

### 11.2 Output

- [ ] API dist output exists
- [ ] web dist output exists
- [ ] billing dist output exists where applicable
- [ ] build artifacts are generated in expected folders

### 11.3 Acceptance

- [ ] current branch is buildable for the intended release surface

### 11.4 Evidence

- commands:
- artifact paths:
- notes:

## 12. End-To-End Control Flow

### 12.1 Fresh Setup Path

- [ ] fresh setup can reach ready state
- [ ] admin can log in after setup
- [ ] initial company data is visible

### 12.2 Brand Setup Path

- [ ] admin can create or update company
- [ ] admin can upload logo
- [ ] admin can save tagline
- [ ] logo and tagline appear in menu and footer after save

### 12.3 Product Path

- [ ] admin can create product
- [ ] storefront can show that product
- [ ] customer can add product to cart

### 12.4 Order Path

- [ ] customer can place order
- [ ] payment result is stored correctly
- [ ] admin can see order in backoffice
- [ ] customer can see order in customer area

### 12.5 Acceptance

- [ ] one complete business path works from setup to order visibility

### 12.6 Evidence

- setup checked:
- company checked:
- product checked:
- order checked:
- notes:

## 13. Current Verified Items

- [x] repository contains frontend and runtime targets for core, ecommerce web/shop, and billing
- [x] root scripts define `dev:web`, `dev:billing-web`, `dev:api`, `dev:billing-api`, `build:web`, and `build:billing-web`
- [x] company tagline field exists in core schema, persistence, and admin form
- [x] shared brand mark can use uploaded company logo first
- [x] fallback branding assets exist at `/logo.svg` and `/logo-dark.svg`
- [x] `npm run typecheck` passes
- [x] `npm run build:web` passes

## 14. Known Concerns To Investigate

- [ ] environment values may be bypassed in some runtime paths
- [ ] frontend target control may not be obvious enough
- [ ] branding may still use stale session snapshot in some cases
- [ ] uploaded logo behavior must be visually verified in all major surfaces
- [ ] current layout spacing should be reviewed for unnecessary gaps

## 15. Working Notes

- `2026-03-26`: Added company tagline support to core company data and branding rendering.
- `2026-03-26`: Added shared fallback logo files and connected brand mark to uploaded company logos.
- `2026-03-26`: Verified `npm run typecheck`.
- `2026-03-26`: Verified `npm run build:web`.

## 16. Next Immediate Checks

- [ ] verify `.env` values are actually respected at runtime
- [ ] verify active app target switching in browser
- [ ] verify uploaded company logo appears in sidebar, header, footer, and auth layout
- [ ] verify current database migration state on the active environment
- [ ] run a fresh startup smoke test from API boot to homepage load
