# Testing Policy

## Baseline

1. All changes must pass lint and typecheck.
2. Build must pass before merge.
3. New business logic should be introduced in testable units with focused tests.

## Test Priorities

1. Domain invariants
2. Accounting balancing rules
3. Tax computation versioning behavior
4. Role and permission checks
5. Report reproducibility for date-bound queries
6. API contract validation

## Minimum Expectations By Change Type

1. UI-only layout change:
   - Lint, typecheck, build
2. API contract change:
   - Lint, typecheck, build
   - Contract and handler tests when available
3. Domain or accounting logic change:
   - Lint, typecheck, build
   - Focused domain tests are required unless blocked and documented

## Test Gap Discipline

If tests are missing, document:

1. What was validated manually
2. What automated coverage is missing
3. Why the gap exists
4. What follow-up work is required
