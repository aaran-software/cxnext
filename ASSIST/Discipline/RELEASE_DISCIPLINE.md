# Release Discipline

## Quality Gates Before Merge

1. Build passes
2. Lint passes
3. Required tests pass, or the gap is documented
4. Documentation is updated
5. Changelog is updated

## Release Requirements

1. No secrets in source control
2. Database or financial schema changes must include rollout notes
3. User-visible changes must be reflected in changelog entries
4. Breaking contract changes must be explicitly documented

## Financial Domain Caution

Any release touching vouchers, ledgers, stock, tax, or report reproducibility requires:

1. Verification of audit metadata handling
2. Verification of reversible correction flow behavior
3. Verification of deterministic numbering and posting semantics
