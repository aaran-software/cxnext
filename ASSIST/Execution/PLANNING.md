# Planning

## Current Batch

### Goal

Add the missing suite-level support roots:

1. `apps/docs` for unified documentation across all apps
2. `apps/cli` for server-side control of the application suite

### Execution Checklist

- [x] add the docs app root
- [x] write suite startup documentation
- [x] add the CLI app root
- [x] implement first control commands
- [x] update architecture and operating docs
- [x] run typecheck
- [x] run full build suite
- [ ] run lint

### Validation Status

1. `npm run typecheck` passed.
2. `npm run build` passed.
3. `npm run build:billing-api` passed.
4. `npm run build:billing-web` passed.
5. `npm run build:billing-desktop` passed.
6. `npm run lint` not yet rerun in this batch.
