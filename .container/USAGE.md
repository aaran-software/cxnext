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
docker compose -f .container/docker-compose.yml --env-file .container/compose.env up -d --build
```

```bash
docker exec -it cxnext-app bash
```

Open:

```text
http://YOUR_SERVER_IP:4000
```

Defaults:

- GitHub: `https://github.com/aaran-software/cxnext.git`
- Branch: `main`
- Network: `codexion-network`
- DB host: `mariadb`
- DB user: `root`
- DB password: `DbPass1@@`
- DB name: `cxnext_db`
