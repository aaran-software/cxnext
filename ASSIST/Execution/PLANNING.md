# Planning

## Current Batch

### Goal

Improve database restore behavior and automated backup handling:

1. chunk restore work into smaller pieces with fresh and incremental modes
2. surface database errors instead of a generic unhandled message
3. add nightly automated backups with retention and external delivery hooks
4. update the restore page UI to expose the new mode controls

### Execution Checklist

- [x] patch the backup/restore service
- [x] wire scheduler startup into the API
- [x] update the restore page controls
- [x] update environment example and task tracking
- [ ] run typecheck
- [ ] run a focused build or validation pass

### Validation Status

1. `npm run typecheck` passed.
2. `npm run build` passed.
3. `npm run build:billing-api` passed.
4. `npm run build:billing-web` passed.
5. `npm run build:billing-desktop` passed.
6. `npm run lint` not yet rerun in this batch.
