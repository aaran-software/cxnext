# Coding Standards

## Core Principles

1. TypeScript is mandatory across frontend, backend, desktop, and shared code.
2. Business logic belongs in domain or application layers, not UI event handlers.
3. Shared contracts, schemas, and domain primitives belong in `packages/shared`.
4. Prefer pure functions for domain decisions and explicit side-effect boundaries.
5. No silent failure paths. Errors must carry actionable context.

## Backend Rules

1. Validate all API inputs at the boundary before invoking use cases.
2. Separate request parsing, application orchestration, domain rules, and persistence concerns.
3. Financial writes must be atomic, balanced, traceable, and audit-safe.
4. Never hard-delete financial transactions. Model reversals, cancellations, or correction entries.
5. Store posting date, effective date, and created timestamp separately for accounting events.
6. Database tables should default to lifecycle columns named `is_active`, `created_at`, and `updated_at` unless a documented exception exists.

## Frontend Rules

1. React components should compose state and presentation, not own domain rules.
2. Network boundaries should map API responses into typed view models.
3. Reusable primitives belong in `packages/ui`.
4. Keep module screens composable and avoid monolithic page components.

## Shared Package Rules

1. Centralize enums, identifiers, schemas, and business guardrails.
2. Version tax and rule-based calculation structures when future changes are expected.
3. Keep module contracts stable and additive where possible.

## Error Handling

1. Return explicit results or throw typed errors with context.
2. Do not swallow exceptions.
3. Log infrastructure faults with enough metadata to trace the failing operation.

## File And Naming Conventions

1. Use clear module-oriented names.
2. Keep directories aligned to architecture boundaries.
3. Avoid `utils` dumping grounds. Name code by responsibility.

## Documentation Coupling

Any user-visible, architecture-relevant, or workflow-relevant code change must update:

- `ASSIST/Documentation/PROJECT_OVERVIEW.md`
- `ASSIST/Documentation/ARCHITECTURE.md`
- `ASSIST/Documentation/CHANGELOG.md`
