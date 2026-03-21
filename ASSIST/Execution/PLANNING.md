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

Repository execution planning templates

### Goal

Introduce a durable execution workflow under `ASSIST/Execution` so active task scope, planning assumptions, and completed walkthrough details are stored in predictable files and referenced by AI rules.

### Assumptions

- `ASSIST` is the source of truth for repository process
- Templates are sufficient for now; no automation is required yet

### Constraints

- Keep the structure simple and readable
- Do not add conflicting process rules outside existing documentation

### Plan

1. Create a new execution subfolder under `ASSIST`
2. Add `TASK.md`, `PLANNING.md`, and `WALKTHROUGH.md` with usable templates
3. Update `ASSIST/AI_RULES.md` so agents must read and maintain them

### Validation

- Review file presence and content consistency
- Confirm AI rules mention the execution files explicitly

### Open Questions

- Whether future automation should prefill these files per task
