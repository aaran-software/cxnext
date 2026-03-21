# Setup And Run

## Prerequisites

1. Node.js 22 or later
2. npm 10 or later

## Install

```bash
npm install
```

## Environment

API auth and database bootstrap can be configured through environment variables:

- `DB_ENABLED=true`
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=...`
- `DB_NAME=cxnext_db`
- `JWT_SECRET=change-this-for-real-use`
- `SEED_DEFAULT_USER=true`
- `SEED_DEFAULT_USER_NAME=Sundar`
- `SEED_DEFAULT_USER_EMAIL=sundar@sundar.com`
- `SEED_DEFAULT_USER_PASSWORD=kalarani`
- `SEED_DEFAULT_USER_AVATAR_URL=https://...`

The seeded Sundar account is intended only for development bootstrap.

Local development has been verified with:

- `DB_HOST=localhost`
- `DB_USER=root`
- `DB_NAME=cxnext_db`

If `cxnext_db` already contains unrelated tables named `users`, `roles`, or `permissions`, the current auth bootstrap uses its own `auth_*` table names to avoid overwriting them.

## Development

Web:

```bash
npm run dev:web
```

API:

```bash
npm run dev:api
```

Web and API together:

```bash
npm run dev:stack
```

Desktop:

1. Start the web application
2. Run:

```bash
npm run start:desktop
```

Set `CXNEXT_WEB_URL` if the desktop shell should target a non-default web URL.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
