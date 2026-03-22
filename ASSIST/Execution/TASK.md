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

`Media manager viewport fit and fixed preview sizing`

### Status

validated

### Objective

Keep the shared media upload dialog within the viewport by fixing preview/upload panel heights, enabling internal vertical scrolling, and making the "new media" upload surface fit cleanly on page.

### In Scope

- Constrain the shared media asset manager dialog to viewport height
- Set fixed upload and preview panel sizes for the upload tab
- Add y-axis scrolling to the dialog body so long content stays usable
- Update execution notes and changelog for the layout adjustment

### Out Of Scope

- Changing the backend media upload contract or stored metadata
- Redesigning unrelated storefront or dashboard surfaces
- Adding new media schema fields beyond the current form

### Dependencies

- `ASSIST/AI_RULES.md`
- `ASSIST/Documentation/CHANGELOG.md`
- `apps/web/src/components/forms/media-asset-manager-dialog.tsx`
- Existing shared media form components and upload API flow

### Risks

- Responsive behavior still benefits from live browser QA at very small viewport heights
- The media dialog remains image-focused and does not solve large-file handling constraints in the current JSON upload flow
