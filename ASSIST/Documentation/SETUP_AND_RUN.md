# Setup And Run

## Prerequisites

1. Node.js 22 or later
2. npm 10 or later
3. MariaDB for the suite API runtime

## Install

```bash
npm install
```

## Main Runtime Entry Points

1. Suite API host: `apps/core/api`
2. Ecommerce web app: `apps/ecommerce/web`
3. Core desktop shell: `apps/core/desktop`
4. Billing app bases: `apps/billing/api`, `apps/billing/web`, and `apps/billing/desktop`
5. Server CLI: `apps/cli`
6. Unified docs: `apps/docs`

## Environment

Runtime config is currently driven from `.env`.

Important keys include:

1. `DB_ENABLED`
2. `DB_HOST`
3. `DB_PORT`
4. `DB_USER`
5. `DB_PASSWORD`
6. `DB_NAME`
7. `WEB_DIST_ROOT`
8. `JWT_SECRET`
9. `CXNEXT_WEB_URL`

## Development Commands

```bash
npm run dev:api
npm run dev:web
npm run dev:stack
npm run dev:billing-api
npm run dev:billing-web
npm run cli -- help
```

## Build Commands

```bash
npm run typecheck
npm run build
npm run build:cli
npm run build:web
npm run build:billing-api
npm run build:billing-web
npm run build:billing-desktop
```

## Notes

1. `apps/core/api` currently hosts framework, core, and ecommerce routes together.
2. Code ownership is still app-correct because framework code now lives in `apps/framework` and ecommerce backend code now lives in `apps/ecommerce/api`.
3. Suite startup and server operation docs now live under `apps/docs`.
