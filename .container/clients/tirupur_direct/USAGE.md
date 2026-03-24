# Tirupur Direct Deploy

Run every command from the repo root: `E:\\Workspace\\websites\\cxnext`

## 1. Create the Docker network once

```bash
docker network create codexion-network
```

## 2. Optional: prepare a runtime env template

```bash
cp .container/clients/tirupur_direct/tirupur-direct.env.example .container/clients/tirupur_direct/tirupur-direct.env
```

This file is a local reference template only. The active runtime `.env` is created inside the Docker volume at `/opt/cxnext/runtime/.env`.

## 3. Build the shared app image

```bash
docker build -t cxnext-app:v1 -f .container/Dockerfile .
```

## 4. Start Tirupur Direct app container

```bash
docker compose -f .container/clients/tirupur_direct/docker-compose.yml up -d
```

On first start, the container creates `/opt/cxnext/runtime/.env` automatically from the app template if it does not already exist.

MariaDB is not started by this compose file. Point `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `/opt/cxnext/runtime/.env` to your existing or separately installed database.

## 5. Open a shell in the app container

```bash
docker exec -it tirupur-direct-app bash
```

## 6. Inspect or edit the runtime env inside the container

```bash
docker exec -it tirupur-direct-app bash
cat /opt/cxnext/runtime/.env
```

## Notes

- App URLs: `http://YOUR_SERVER_IP:4001` and `http://YOUR_SERVER_IP:5001`
- Runtime env file used by the container: `/opt/cxnext/runtime/.env`
- Database name: `tirupur_direct_db`
- Database server: external or separately installed MariaDB
- Compose file path from root: `.container/clients/tirupur_direct/docker-compose.yml`
- Shared app image: `cxnext-app:v1`
