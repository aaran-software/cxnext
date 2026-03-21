# Planning

## Purpose

This file captures the execution plan for the current task before implementation expands.

## How To Use

1. Define the smallest safe increment.
2. List assumptions explicitly.
3. Call out validation steps before coding is considered done.
4. Update the plan when scope changes.

## Template

### Task

`<task title>`

### Goal

State the intended result in one paragraph.

### Assumptions

- Assumption 1
- Assumption 2

### Constraints

- Constraint 1
- Constraint 2

### Plan

1. Step one
2. Step two
3. Step three

### Validation

- Lint
- Typecheck
- Build
- Tests

### Open Questions

- Question 1
- Question 2

## Current Entry

### Task

`API runtime env loading and local login smoke fix`

### Goal

Make the local auth stack actually runnable without manual env injection. The API should read `.env` automatically when started through the normal dev workflow, then successfully respond on port `4000` so the frontend login fetch no longer fails with connection refusal.

### Assumptions

- The browser error is caused by the API not running or not booting cleanly with env values
- A `dotenv`-based runtime load is acceptable in this repository
- The current local MariaDB settings in `.env` are correct

### Constraints

- Preserve build and typecheck behavior
- Keep the fix minimal and focused on the runtime failure
- Re-verify with a live local API smoke test

### Plan

1. Add runtime `.env` loading for the API
2. Start the API locally and verify `/health`
3. Verify `/auth/login` works for the seeded Sundar account
4. Update walkthrough and changelog with the runtime fix

### Validation

- Local API smoke test
- `npm run lint`
- `npm run typecheck`
- `npm run build`

### Open Questions

- Whether the team wants a dedicated smoke-test script committed after this fix
