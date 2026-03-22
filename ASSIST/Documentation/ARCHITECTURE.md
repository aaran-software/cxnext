# Architecture

## Target Structure

```text
apps/
  api/
  desktop/
  web/
packages/
  shared/
  ui/
ASSIST/
  Discipline/
  Documentation/
```

## Layering Rules

### Domain

- Core business vocabulary
- Invariants and guardrails
- Shared identifiers, enums, and schemas

### Application

- Use cases and orchestration
- Cross-entity workflows
- Transaction boundaries

### Transport

- HTTP routing
- Request parsing
- Response serialization

### Persistence

- Repositories
- Database adapters
- External service integrations

### UI

- Page composition
- View state
- Presentation primitives

## Current Technical Foundation

1. `apps/web` renders the operator-facing shell plus the storefront-facing `shop` target, now including a full static frontend shopping flow for home, catalog, product detail, wishlist, cart, and checkout.
2. `apps/api` exposes bootstrap, health, and auth endpoints with MariaDB-backed RBAC persistence.
3. API database bootstrap now separates schema migrations from optional tracked seeders for development/demo aggregate data.
4. `apps/desktop` wraps the web client in Electron.
5. `packages/shared` centralizes domain types, schemas, auth contracts, and accounting guardrails.
6. `packages/ui` contains reusable React primitives.
7. Media uploads now persist through the API into configured public/private storage and create tracked media asset records that frontend forms can reuse through shared popup manager components under `apps/web/src/components/forms`.
8. The storefront now uses a feature-local static data/model/context layer so the shopping experience can be reviewed end to end without backend commerce wiring while keeping the existing public shop shell intact.
9. The storefront layout owns route-entry scroll behavior so browser scroll restoration does not pull product detail views away from the hero section on navigation.
10. Storefront utility actions such as save/share stay in the UI layer and reuse shared presentation helpers such as the toast system across both card and detail surfaces, with aligned hover and motion behavior.
11. Storefront collection/category navigation cues remain presentational within the card-link UI layer, using accent tokens and motion to signal clickability without introducing nested interactive controls.
12. Theme tokens in `apps/web/src/css/styles.css` must keep the neutral accent readable by default, because storefront CTA and utility affordances depend on that baseline before hover state is applied.
13. Shared storefront navigation/search primitives can be reused inside feature pages such as the catalog toolbar, as long as route-derived state remains synchronized from the page layer.
14. Search-input copy decisions belong in the shared storefront search primitive so header and page-level search surfaces stay behaviorally and visually aligned.
15. Home-page feature notes can stay in the UI layer as presentational-interactive button surfaces, using shared feedback primitives such as toasts until real destinations exist.
16. Shared storefront utility controls should keep the container visually calm and reserve stronger motion/state expression for the icon so they remain secondary to primary commerce CTAs.
17. Header utility icons should follow the same icon-led interaction rule when acting as lightweight status shortcuts, so sticky navigation does not visually overpower core storefront actions.
18. Adjacent sticky-header utility triggers should reuse the same hover surface language where appropriate to avoid visual drift within the top navigation cluster.
19. Catalog toolbar helper copy can be removed when the shared search control alone communicates the surface purpose clearly enough.

## Current Auth Foundation

1. The API persists auth data in normalized `auth_users`, `auth_roles`, `auth_permissions`, `auth_user_roles`, and `auth_role_permissions` tables so it can coexist with pre-existing schemas in `cxnext_db`.
2. The default table shape now expects `is_active`, `created_at`, and `updated_at` lifecycle columns unless an exception is documented.
3. JWT auth responses expose avatar, roles, and permissions to the frontend through shared schemas.
4. Development bootstrap can seed a default admin user and RBAC metadata from environment-driven configuration.
5. Optional aggregate/demo data should flow through tracked seeders under `apps/api/src/shared/database/seeders` instead of being embedded in schema-only migrations.

## Architecture Constraints

1. Business logic must not live only in frontend components.
2. Shared schemas must remain the contract source of truth.
3. Accounting writes must be modeled as explicit, reversible operations.
4. Security and authorization are mandatory cross-cutting concerns.
5. Reporting must remain reproducible for historical date ranges.
