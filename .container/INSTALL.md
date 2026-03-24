# CXNext Install

Run every command from the repo root:

```bash
cd /home/cxnext
```

## Clean old install

Use this when an old container, runtime volume, or stale runtime source is causing restart loops.

```bash
docker compose -f .container/clients/cxnext/docker-compose.yml down
docker rm -f cxnext-app 2>/dev/null || true
docker volume rm cxnext_cxnext_runtime 2>/dev/null || true
docker image rm cxnext-app:v1 2>/dev/null || true
```

If MariaDB is installed separately and contains live data, do not remove its data volume.

## Create network

```bash
docker network create codexion-network
```

## Optional: run MariaDB locally

```bash
docker compose -f .container/mariadb.yml up -d
```

## Build shared app image

```bash
docker build -t cxnext-app:v1 -f .container/Dockerfile .
```

## Start CXNext

```bash
docker compose -f .container/clients/cxnext/docker-compose.yml up -d
```

## View logs

```bash
docker logs -f cxnext-app
```

## Open shell

```bash
docker exec -it cxnext-app bash
```

## URLs

```text
http://YOUR_SERVER_IP:4000
http://YOUR_SERVER_IP:5000
```

## Notes

- The container creates `/opt/cxnext/runtime/.env` on first start.
- The active compose file is `.container/clients/cxnext/docker-compose.yml`.
- The shared image tag is `cxnext-app:v1`.
- If the app restarts, check `docker logs --tail 200 cxnext-app`.


docker volume ls