# Changelog

## Unreleased

### Added

- Introduced `apps/web`, `apps/api`, `apps/desktop`, `packages/shared`, and `packages/ui`
- Added repository governance under `ASSIST/Discipline`
- Added architecture and setup documentation under `ASSIST/Documentation`
- Added `ASSIST/AI_RULES.md` for AI agent operating constraints
- Replaced starter Vite screen with ERP platform foundation shell
- Added initial Node API bootstrap endpoint and Electron desktop shell
- Added Tailwind CSS, shadcn-style component primitives, and theme switching to `apps/web`
- Added `WebLayout`, `AppLayout`, and `AuthLayout` with routed Home, About, Contact, Dashboard, Login, and 404 pages
- Added a dashboard sidebar shell inspired by `sidebar-08` and committed `components.json` for future shadcn generator compatibility
- Refined the dashboard app shell to use the full available width and simplified the login screen to a cleaner baseline form
- Repointed the root frontend entry at `apps/web` and removed the stale root starter component files
- Added shared auth schemas, actor types, token contracts, and database health contracts in `packages/shared`
- Added MariaDB configuration, connection health reporting, auth-user persistence, bcrypt password hashing, and JWT auth routes in `apps/api`
- Added protected frontend auth flows with separate login and register pages for customer, staff, admin, and vendor roles
- Added normalized `users`, `roles`, `permissions`, `user_roles`, and `role_permissions` tables with development bootstrap seeding
- Added avatar, role, and permission data to frontend auth sessions and dashboard presentation
- Added a discipline rule that tables should default to `is_active`, `created_at`, and `updated_at` lifecycle columns
- Added `.env.example`, local `.env` wiring, `cxnext_db` bootstrap, and verified local login for `sundar@sundar.com`
- Added automatic `.env` loading for the API runtime so local `/auth/login` works through the normal dev server path
- Added a lightweight backend ORM wrapper, recorded migration runner, and committed migrations for auth plus shared ecommerce/billing reference tables including geography, contact grouping, product grouping, units, HSN, tax, brands, colours, sizes, currencies, order types, transports, warehouses, destinations, payment terms, and product categories
- Added shared common-module API contracts plus backend metadata, list, fetch, create, update, deactivate, and restore endpoints for the common geography, contact, product, tax, logistics, warehouse, currency, and payment master tables
- Added a grouped application menu, common workspace header, and working common-module management screens in `apps/web` using the existing common list/dialog UX connected to the backend common-module APIs
