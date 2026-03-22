# Setup And Run

## Prerequisites

1. Node.js 22 or later
2. npm 10 or later

## Install

```bash
npm install
```

## Environment

CXNext now reads runtime configuration from `.env` only.

Key entries:

- `DB_ENABLED=true`
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=...`
- `DB_NAME=cxnext_db`
- `WEB_DIST_ROOT=apps/web/dist`
- `JWT_SECRET=change-this-for-real-use`
- `SUPER_ADMIN_EMAILS=sundar@sundar.com`
- `SEED_DEFAULT_USER=true`
- `SEED_DEFAULT_USER_NAME=Sundar`
- `SEED_DEFAULT_USER_EMAIL=sundar@sundar.com`
- `SEED_DEFAULT_USER_PASSWORD=kalarani`
- `SEED_DEFAULT_USER_AVATAR_URL=https://...`
- `SEED_DUMMY_PRODUCTS=true`

The seeded Sundar account and dummy product catalog data are intended only for development bootstrap.

Media uploads created through the shared dashboard popup media manager are written into the configured `storage/public` or `storage/private` directories and registered in the media asset tables through the API. The upload dialog keeps file metadata editable in the client until the user confirms persistence.

Local development has been verified with:

- `DB_HOST=localhost`
- `DB_USER=root`
- `DB_NAME=cxnext_db`

If `cxnext_db` already contains unrelated tables named `users`, `roles`, or `permissions`, the current auth bootstrap uses its own `auth_*` table names to avoid overwriting them.

## First-Run Setup Mode

If `DB_ENABLED` is `false` or the configured database cannot be reached, the API now starts in setup mode instead of exiting. In that state:

- `GET /setup/status` reports whether setup is `ready`, `required`, or `error`
- `POST /setup/database` writes MariaDB settings into `.env`
- The React app shows an initial setup screen until database bootstrap succeeds
- If the named database does not exist but the credentials can create it, CXNext creates it automatically before running migrations

`.env` is the single runtime config file. If it is invalid, startup fails with an explicit error instead of falling back to other config sources.

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

Set `CXNEXT_WEB_URL` in `.env` before starting the desktop shell.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## VPS Container Deployment

Build and run the bundled stack:

```bash
docker network create codexion-network
docker compose -f .container/docker-compose.yml up -d --build
```

The default container stack includes:

- `app`: one Node container serving both the API and the built web app on port `4000`

This deployment path assumes your VPS already has access to an existing MariaDB server. The app stack joins the external Docker network `codexion-network`, so the MariaDB container/service should also be attached to that network and resolve as `mariadb`.

If you want to run the uploaded local MariaDB stack from this repository:

```bash
docker compose -f .container/mariadb.yml up -d
```

Default database values in `.env.example`:

- Host: `mariadb`
- Port: `3306`
- User: `root`
- Password: `DbPass1@@`
- Database: `cxnext_db`

Persistent runtime data is stored in the `cxnext_runtime` Docker volume, including:

- Runtime `.env`
- Uploaded media storage

### Optional Git Sync On Start

The container entrypoint under `.container/entrypoint.sh` supports pulling from Git and rebuilding inside the container. Enable it in `.env` with values such as:

- `GIT_SYNC_ENABLED=true`
- `GIT_AUTO_UPDATE_ON_START=true`
- `GIT_REPOSITORY_URL=https://github.com/aaran-software/cxnext.git`
- `GIT_BRANCH=main`

Optional related flags:

- `BUILD_ON_START=true`
- `INSTALL_DEPS_ON_START=true`

Detailed app-only deployment instructions for an existing MariaDB data server are in `.container/USAGE.md`.
