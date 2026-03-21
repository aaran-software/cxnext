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

Repository execution planning templates

### Status

completed

### Objective

Add a dedicated execution folder with task, planning, and walkthrough templates and wire them into the AI operating rules.

### In Scope

- Create `ASSIST/Execution`
- Add `TASK.md`
- Add `PLANNING.md`
- Add `WALKTHROUGH.md`
- Update `ASSIST/AI_RULES.md`

### Out Of Scope

- Feature implementation
- Runtime architecture changes

### Dependencies

- `ASSIST/AI_RULES.md`
- Existing repository discipline files

### Risks

- Future contributors may leave templates stale unless process discipline is followed
