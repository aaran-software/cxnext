# Changelog

## Unreleased

### Changed

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
