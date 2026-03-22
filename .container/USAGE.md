# CXNext Deploy

```bash
docker network create codexion-network
```

Local MariaDB from uploaded file:

```bash
docker compose -f .container/mariadb.yml up -d
```

App deploy:

```bash
docker compose -f .container/docker-compose.yml up -d --build
```

```bash
docker exec -it cxnext-app bash
```

Open:

```text
http://YOUR_SERVER_IP:4000
```

Admin update screen:

```text
http://YOUR_SERVER_IP:4000/admin/dashboard/settings
```

Defaults:

- GitHub: `https://github.com/aaran-software/cxnext.git`
- Branch: `main`
- Network: `codexion-network`
- DB host: `mariadb`
- DB user: `root`
- DB password: `DbPass1@@`
- DB name: `cxnext_db`
- Super admin: `sundar@sundar.com`

Config file:

- container creates `.env` from `.env.example` on first start
- only `.env` is used
- if `.env` is invalid, startup fails with error
- update settings and manual update are available from the admin Settings page
