# Codexsun Rename Notes

## Current Status

The product-facing brand is already `codexsun`, but several technical identifiers still use `cxnext`.

This means:

1. renaming the local folder and git remote is safe
2. renaming every internal `cxnext` identifier in the same batch is not yet safe without a compatibility plan

## Safe To Change Now

1. local workspace folder name from `cxnext` to `codexsun`
2. git remote URL
3. GitHub repository name
4. public docs that still mention the old repository URL
5. container docs that refer to the old repository name

## Rename-Sensitive Areas

These still contain `cxnext` and should be handled deliberately:

1. Docker runtime paths under `.container/` such as `/opt/cxnext/app` and `/opt/cxnext/runtime`
2. docker image, compose, container, and volume names such as `cxnext-app` and `cxnext_runtime`
3. default repository URL values in:
   - `.env.example`
   - `.container/clients/*/*.env.example`
   - `apps/framework/src/runtime/config/environment.ts`
   - `apps/ecommerce/web/src/features/settings/pages/system-settings-page.tsx`
4. desktop preload globals:
   - `cxnextDesktop`
   - `cxnextBillingDesktop`
5. browser storage keys and custom events such as:
   - `cxnext-auth-session-v2`
   - `cxnext.branding`
   - `cxnext-color-mode`
   - `cxnext-storefront-cart`
   - `cxnext.billing.workspace.v1`
   - `cxnext-customer-profile-updated`
6. backup filename prefixes in database maintenance code
7. seed/demo ids and slugs such as `cxnext-polo`
8. e2e test data and assertions using `cxnext`
9. absolute filesystem links in legacy docs that point to `E:/Workspace/websites/cxnext`

## Recommendation

Use two separate batches:

1. repository rename batch
   - rename folder
   - rename git remote/repository URL
   - update docs and env defaults
   - leave storage keys, preload globals, backup prefixes, and demo ids unchanged
2. compatibility migration batch
   - version storage key migration
   - desktop bridge rename with fallback alias
   - backup prefix transition
   - seed/demo cleanup
   - container/runtime naming cleanup

## Current Remote

`origin https://github.com/aaran-software/cxnext.git`

## Follow-Up After Folder Rename

1. update any docs with absolute local paths
2. update container docs and env defaults to the new git URL
3. run `npm run typecheck`
4. run `npm run build:web`
5. run `npm run build:billing-web`

