# Branching And Commits

## Branching

1. Use short-lived branches scoped to one coherent change.
2. Prefer names such as `feature/billing-voucher-core`, `refactor/core-ownership-map`, or `docs/assist-consolidation`.
3. Do not mix unrelated refactors with functional changes unless required for safety.

## Commit Discipline

1. Keep commits reviewable and logically atomic.
2. Pair code changes with required docs updates in the same branch.
3. Mention affected ownership boundaries where useful: framework, `Core`, `Ecommerce`, `Billing`, `CRM`, or `Site`.

## Before Review

1. Ensure the active task and plan files are current.
2. Ensure validation is run or the gap is documented.
3. Ensure `ARCHITECTURE.md` and `CHANGELOG.md` are updated when required.
