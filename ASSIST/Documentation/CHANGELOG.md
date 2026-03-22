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
- Added a dedicated company aggregate feature with new company-related tables and `CODEXSUN` seed data, backend company CRUD routes, and frontend company list plus full-page create/edit screens
- Added a dedicated contact aggregate feature with new contact-related tables and placeholder seed data, backend contact CRUD routes, and frontend contact list plus full-page create/edit screens
- Added a dedicated product aggregate feature that reuses the existing common product masters, adds product-specific tables and placeholder seed data, exposes backend product CRUD routes, and provides frontend product list plus full-page create/edit screens
- Added a shared animated tab component and reorganized the company, contact, and product master forms into grouped tabs for easier data entry
- Added a dedicated media manager feature with storage-aware media tables, filesystem bootstrap for public and private storage, backend media and folder CRUD routes plus public asset streaming, and frontend dashboard pages for media asset and folder management
- Added a tracked database seeder flow under `apps/api/src/shared/database/seeders` and a dummy product aggregate bootstrap that runs after schema migrations when enabled
- Refactored the product foundation migration to stop inserting placeholder product data directly, keeping optional demo aggregate data in seeders instead of schema migrations
- Added upload-backed media asset creation through the API plus a reusable popup media picker/uploader used by company logo and product image form fields
- Added temporary upload metadata review in the popup flow so asset name, original name, storage scope, and folder selection are confirmed before the media asset is persisted
- Redesigned the popup uploader into shared form components with a two-column upload workspace, right-side live preview, and tabbed metadata sections for basic details, SEO content, and file details
- Adjusted the shared media manager dialog to fit the viewport with internal vertical scrolling and fixed upload/preview panel heights
- Replaced the storefront `shop` home placeholder with a polished catalog-first merchandising page that keeps the existing store shell intact while adding category storytelling, product-driven collection grids, spotlight content, and explicit empty/error states for live catalog loading
- Expanded the storefront `shop` target into a full static frontend shopping flow with garment-focused home, catalog filters, product detail, wishlist, cart, and checkout pages while preserving the existing menu and footer shell
- Added storefront scroll-reset handling so route changes into product detail force the viewport back to the hero section instead of restoring prior listing scroll position
- Added a placeholder share CTA to storefront product cards and grouped it with wishlist beside the primary add-to-cart action
- Aligned the storefront share button hover and press treatment with the wishlist control so the product-card utility actions feel visually consistent
- Added the Share CTA to the storefront product-detail action row after Save using the same utility-action styling and placeholder toast behavior
- Refined the storefront category-card `Explore` affordance into a clearer inline CTA with a visible neutral-black baseline, arrow motion, and accent hover feedback
- Corrected the storefront neutral accent tokens so the neutral theme now resolves to black-based values instead of near-white
- Replaced the storefront catalog toolbar placeholder control with the shared search bar and synchronized it with current query and department params
- Removed the placeholder copy from the shared storefront search input so header and catalog search bars render with a cleaner empty state
- Converted the storefront home-page feature cards into interactive button surfaces with hover motion, accent feedback, and placeholder click toasts
- Reworked the storefront wishlist and share buttons so icon fill, accent color, and motion carry the interaction while the button shell stays lightweight
- Reduced the top storefront cart icon shell so the sticky-header cart now expresses hover and active state through the icon instead of a filled button background
- Reduced the top storefront wishlist and login/account shells so those sticky-header controls now express hover and active state through their icons instead of filled button backgrounds
- Aligned the top header login/account trigger hover surface with the adjacent `More` trigger for more consistent sticky-nav feedback
- Removed the helper copy from the storefront catalog toolbar so the shared search bar stands alone in a cleaner browsing surface
