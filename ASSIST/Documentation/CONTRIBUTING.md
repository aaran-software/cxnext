# Contributing

## Required Workflow

1. Read `ASSIST/AI_RULES.md`.
2. Read `ASSIST/Documentation/ARCHITECTURE.md`.
3. Read the relevant discipline files under `ASSIST/Discipline`.
4. Update `ASSIST/Execution/TASK.md` and `ASSIST/Execution/PLANNING.md` before substantial work.
5. Implement the smallest safe increment.
6. Validate the affected areas.
7. Update docs and changelog in the same change set.

## Repository Rules

Always follow:

1. `ASSIST/Discipline/CODING_STANDARDS.md`
2. `ASSIST/Discipline/BRANCHING_AND_COMMITS.md`
3. `ASSIST/Discipline/REVIEW_CHECKLIST.md`
4. `ASSIST/Discipline/TESTING_POLICY.md`
5. `ASSIST/Discipline/RELEASE_DISCIPLINE.md`

## Platform Standard

Every meaningful change should preserve the Codexsun platform direction:

1. framework stays reusable and app-agnostic
2. core stays shared and business-common
3. apps stay standalone and shippable independently
4. connector behavior stays explicit
5. host composition happens through a clear composition root and DI-style registration model
6. docs must make the platform understandable without depending on private memory or AI context

## Pull Request Expectations

1. State scope clearly.
2. State affected ownership boundaries: framework, `Core`, or app-specific.
3. Describe validation performed.
4. Identify risks or gaps.
5. Mention documentation and changelog updates.
6. If code moved between `apps/framework`, `apps/core`, `apps/ecommerce`, or `apps/billing`, explain why that ownership is correct.
7. If a change increases host coupling, justify it explicitly or redesign it.
