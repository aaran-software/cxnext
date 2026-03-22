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
2. `apps/api` exposes bootstrap, health, auth, and setup endpoints with MariaDB-backed RBAC persistence.
3. API database bootstrap now separates schema migrations from optional tracked seeders for development/demo aggregate data and can enter a runtime setup mode instead of crashing when DB settings are missing or invalid.
4. `apps/desktop` wraps the web client in Electron.
5. `packages/shared` centralizes domain types, schemas, auth contracts, and accounting guardrails.
6. `packages/ui` contains reusable React primitives.
7. Media uploads now persist through the API into configured public/private storage and create tracked media asset records that frontend forms can reuse through shared popup manager components under `apps/web/src/components/forms`.
8. The storefront now uses a feature-local static data/model/context layer so the shopping experience can be reviewed end to end without backend commerce wiring while keeping the existing public shop shell intact.
9. Production VPS deployment can run as a single Node container that serves the built React app from `apps/web/dist` and stores runtime config/media data in an external volume.

## Current Auth Foundation

1. The API persists auth data in normalized `auth_users`, `auth_roles`, `auth_permissions`, `auth_user_roles`, and `auth_role_permissions` tables so it can coexist with pre-existing schemas in `cxnext_db`.
2. The default table shape now expects `is_active`, `created_at`, and `updated_at` lifecycle columns unless an exception is documented.
3. JWT auth responses expose avatar, roles, and permissions to the frontend through shared schemas.
4. Development bootstrap can seed a default admin user and RBAC metadata from environment-driven configuration.
5. Optional aggregate/demo data should flow through tracked seeders under `apps/api/src/shared/database/seeders` instead of being embedded in schema-only migrations.
6. Runtime database settings may come from a volume-backed JSON config file that overrides `.env`, allowing first-run setup without image rebuilds.

## Architecture Constraints

1. Business logic must not live only in frontend components.
2. Shared schemas must remain the contract source of truth.
3. Accounting writes must be modeled as explicit, reversible operations.
4. Security and authorization are mandatory cross-cutting concerns.
5. Reporting must remain reproducible for historical date ranges.
