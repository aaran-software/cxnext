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

`Global media asset manager redesign for form integration`

### Goal

Turn the existing popup media picker into a shared form component with a more deliberate upload experience: left-side upload controls, right-side image preview, and a bottom metadata area organized into tabs. The redesign must preserve current library selection and API persistence, while making the component reusable anywhere the dashboard needs image picking.

### Assumptions

- The existing upload API contract is sufficient for this redesign, so the UI should organize current fields better rather than inventing new persisted schema
- The current admin image-entry surfaces are company logos, product images, variant images, and the media asset quick-upload flow
- Keeping compatibility re-exports in the old feature paths is useful while shifting the canonical implementation into shared form components

### Constraints

- Keep persistence behavior unchanged: uploads remain temporary in the client until confirmation triggers the API write
- Stay within the current shared media schema and backend route capabilities
- Make the upload workspace responsive so it still works on narrower form-page widths
- Update execution tracking and documentation in the same change set

### Plan

1. Replace the active execution notes with the media manager redesign scope
2. Build shared `MediaAssetManagerDialog` and `MediaImageField` components under `apps/web/src/components/forms`
3. Redesign the upload tab into the requested two-column layout plus bottom metadata tabs while keeping the library tab intact
4. Rewire the current company, product, and media form consumers to the shared components and keep compatibility re-exports in the previous feature-local paths
5. Update overview/architecture/changelog docs and validate with focused ESLint plus `npm run build:web`

### Validation

- Focused ESLint on the shared media form components and current consuming pages
- `npm run build:web`

### Open Questions

- Whether future media work should support true multipart uploads for large assets instead of the current data-URL JSON flow
- Whether a follow-up increment should auto-create `media_usage` rows when specific forms pick an asset
