# Changelog

## Unreleased

### Changed

1. reframed the platform docs around the `codexsun` brand and standalone multi-app delivery goal
2. documented the target model of reusable framework services plus standalone applications composed through a clearer DI/composition-root direction
3. promoted platform refinement as the active execution batch instead of treating the repo only as the current working suite
4. reorganized framework database migrations into module-owned registries so schema changes no longer accumulate in one flat migration list
5. moved frontend bootstrap ownership into `apps/framework/src/main.tsx` and added framework-side application selection for the current web shells
6. introduced explicit app shell modules for ecommerce and billing so providers, routers, and shell composition stay app-owned instead of living in framework bootstrap
7. moved global web styles and the shared theme provider into framework so app shells no longer depend on ecommerce-owned style runtime pieces
1. rewrote ASSIST guidance around the current `apps/` architecture
2. moved framework runtime infrastructure from `apps/core/api/src/shared` to `apps/framework/src/runtime`
3. moved framework auth and mailbox modules into `apps/framework/src`
4. moved ecommerce backend features into `apps/ecommerce/api/src/features`
5. rewired `apps/core/api` to host framework, core, and ecommerce code through explicit cross-app imports instead of owning all of it directly
6. added `apps/framework/src/manifest.ts` as the framework-owned suite manifest source
7. added the `@ecommerce-api/*` TypeScript path alias for clean backend app boundaries
8. added `apps/docs` as the unified documentation root for the whole suite
9. added `apps/cli` as the suite control CLI for server-side operations
10. improved database restore with incremental and fresh modes plus chunked row processing
11. added nightly automated backup scheduling with retention and external delivery hooks
12. surfaced database error details in the restore and maintenance flow instead of a generic unhandled message
13. refined the storefront mobile header to remove duplicated top actions, move the drawer to the right side, and keep search in the sticky header
14. documented a human-readable implementation style rule in `ASSIST/AI_RULES.md`
15. removed the storefront floating contact action and bottom nav, moving contact access into the drawer menu instead
16. adjusted the storefront hero slider image frame to use padded, top-aligned image fitting instead of aggressive center cropping
17. restored the storefront mobile bottom navigation, then moved the hamburger drawer trigger into the bottom bar and removed the mobile top search strip
18. restored the storefront mobile top search bar with branding above the fold
19. expanded the storefront hero slider to full-bleed mobile width and tightened its mobile padding so the slide fills the screen gap
20. brightened the storefront hero slider image treatment on mobile by reducing overlay density and pulling the image closer to the frame edge
21. placed the storefront mobile logo and search bar in a single row above the fold
22. tightened mobile storefront spacing so the category rail sits closer to the hero content
23. trimmed the remaining mobile-only spacer above the hero slider without affecting tablet or desktop spacing
24. hid the category title and description on mobile while keeping the badge and nudged the Explore CTA upward
25. clamped the hero slider product title and description to tighter mobile line counts
26. expanded the hero slider line clamps on tablet and desktop to three lines for title and five for description
27. switched the hero slider image to cover the frame on mobile while preserving the desktop contain fit
28. hid the hero slider secondary action on mobile, renamed the primary CTA to Buy now, and centered the arrow controls vertically
29. pinned the hero slider mobile nav row to a fixed top line and tightened the mobile image size so the controls stay level with the badge
30. matched the mobile hero image shell to the reference crop with a wider frame and lower image placement
31. nudged the mobile hero image further downward to refine the slider crop
32. aligned the mobile category Explore CTA with the badge and moved it to the right edge
33. hid the storefront designer presentation tab on mobile while keeping it visible on larger screens
34. increased the hero slider bottom padding on tablet and desktop to add more space below the content
35. moved the hero slider nav slightly lower again on tablet and desktop
36. clamped the deal banner title to one line and the description to two lines
37. synced ERPNext item codes into product SKUs and regenerated product slugs from item names during item-to-product sync
38. sorted the Frappe item sync list by ERPNext item id and added compact category, brand, product group, and type metadata to the product list
39. added a persistent Frappe item-to-product sync log table, API, and review panel with success, skipped, and failure counts, then moved the log manager into a dedicated tab beside the product table
40. added a sync progress bar to the Frappe item sync action area and moved the reference and total/selected summaries above the product table
41. slimmed the Frappe item sync progress bar and made it appear only while selected items are syncing to ecommerce
40. captured exact persistence error details in Frappe sync failure logs instead of only the generic wrapper message
# Changelog

## 2026-03-26

- Architected and implemented a comprehensive Task Management module within \`apps/core\`.
- Created Task and TaskActivity Zod schemas with complete type safety.
- Built explicit TaskRepository and TaskService layers mapping database operations to the core API.
- Registered Task endpoints in the core API router with proper authentication and actor-based authorization (admin vs staff).
- Built a multi-tabbed TaskWorkspacePage in the Staff Desktop UI (My Tasks, Open Tasks, Created By Me).
- Added the Task workspace to the core domain manifest and connected it to the global left sidebar navigation.
- Added company tagline support to the core company schema, persistence layer, and migration path.
- Exposed the company tagline in the admin create/edit/detail screens.
- Updated branding resolution so menu and footer logo text uses the saved company tagline when present.
- Updated brand rendering to use uploaded company logos first, with `/logo.svg` and `/logo-dark.svg` as fallback assets.
