# Branching And Commits

## Branching

1. Use short-lived branches scoped to one coherent change.
2. Prefer branch names such as:
   - `feature/sales-invoice-posting`
   - `fix/ledger-balance-validation`
   - `docs/architecture-cleanup`
3. Do not mix unrelated refactors with functional changes unless required for safety.

## Commit Discipline

1. Keep commits reviewable and logically atomic.
2. Pair code changes with required documentation updates in the same branch.
3. Mention affected modules or layers in commit messages.

## Recommended Commit Format

```text
<type>: <short summary>
```

Examples:

- `feat: add organization bootstrap contract`
- `fix: enforce balanced ledger entry validation`
- `docs: define repository testing policy`

## Before Opening Review

1. Rebase or otherwise align with the current integration baseline.
2. Ensure build, lint, and required tests pass or document gaps.
3. Confirm changelog and documentation updates are present.
