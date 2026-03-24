# Release Discipline

## Quality Gates

1. Relevant validation passes or is explicitly documented as blocked.
2. Documentation is current.
3. Changelog is updated.
4. No secrets or unsafe environment data are committed.

## Release Caution

Changes touching these areas require extra rigor:

1. framework auth
2. shared `Core` masters
3. billing/accounting/inventory logic
4. ecommerce checkout/order state
5. migrations or storage behavior

## Required Notes

If a release changes contracts, data shape, or high-risk logic, document:

1. rollout impact
2. validation performed
3. remaining risks
