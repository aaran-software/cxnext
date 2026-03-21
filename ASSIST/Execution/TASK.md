# Task

## Purpose

This file tracks the current active task so contributors and AI agents are aligned on the exact unit of work in progress.

## How To Use

1. Replace the placeholder content when starting a new task.
2. Keep the scope narrow and specific.
3. Update the status as work moves from analysis to implementation to validation.
4. Link to relevant modules, documents, and constraints.

## Template

### Title

`<short task title>`

### Status

`planned | in_progress | blocked | validated | completed`

### Objective

Describe the concrete outcome to deliver in this task.

### In Scope

- Item 1
- Item 2

### Out Of Scope

- Item 1
- Item 2

### Dependencies

- Relevant docs
- Relevant modules
- External constraints

### Risks

- Risk 1
- Risk 2

## Current Entry

### Title

API runtime env loading and local login smoke fix

### Status

completed

### Objective

Fix the local runtime issue causing `http://localhost:4000/auth/login` to refuse connections by ensuring the API loads `.env` automatically in development and by verifying that the API can start and answer health/auth requests with the configured local MariaDB setup.

### In Scope

- Load `.env` automatically for the API runtime
- Verify the API starts successfully on port `4000`
- Smoke-test health and login locally
- Update execution docs and changelog for the runtime fix

### Out Of Scope

- Auth model redesign
- Frontend UI changes unrelated to the runtime failure
- Deployment or production process changes

### Dependencies

- `ASSIST/AI_RULES.md`
- Local `.env`
- `apps/api`

### Risks

- Fixing env loading must not break existing build or tsup behavior
