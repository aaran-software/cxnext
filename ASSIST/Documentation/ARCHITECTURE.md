# Architecture

## Target Structure

```text
apps/
  api/
  desktop/
  web/
packages/
  shared/
  ui/
ASSIST/
  Discipline/
  Documentation/
```

## Layering Rules

### Domain

- Core business vocabulary
- Invariants and guardrails
- Shared identifiers, enums, and schemas

### Application

- Use cases and orchestration
- Cross-entity workflows
- Transaction boundaries

### Transport

- HTTP routing
- Request parsing
- Response serialization

### Persistence

- Repositories
- Database adapters
- External service integrations

### UI

- Page composition
- View state
- Presentation primitives

## Current Technical Foundation

1. `apps/web` renders the operator-facing shell and roadmap summary.
2. `apps/api` exposes a bootstrap API for system metadata and module readiness.
3. `apps/desktop` wraps the web client in Electron.
4. `packages/shared` centralizes domain types, schemas, and accounting guardrails.
5. `packages/ui` contains reusable React primitives.

## Architecture Constraints

1. Business logic must not live only in frontend components.
2. Shared schemas must remain the contract source of truth.
3. Accounting writes must be modeled as explicit, reversible operations.
4. Security and authorization are mandatory cross-cutting concerns.
5. Reporting must remain reproducible for historical date ranges.
