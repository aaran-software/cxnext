# Review Checklist

## Reviewer Priorities

1. Data correctness and auditability
2. Security and authorization
3. Architectural boundary integrity
4. Functional behavior
5. Maintainability and documentation

## Checklist

1. Are shared types and validation schemas centralized?
2. Is business logic outside UI components?
3. Are API boundaries validating inputs explicitly?
4. Are financial or inventory writes modeled as traceable operations?
5. Are there any silent catches, hidden defaults, or non-obvious side effects?
6. Are authorization and audit implications addressed?
7. Are docs and changelog updated?
8. Are tests present for the changed behavior or is the gap explicitly documented?
9. Does the change preserve clean separation between domain, application, transport, and persistence?
10. Does the code introduce future scaling constraints or duplicated logic?
