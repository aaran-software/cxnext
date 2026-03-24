# CXNext Deploy

Run every command from the repo root: `E:\\Workspace\\websites\\cxnext`

## 1. Create the Docker network once

```bash
docker network create codexion-network
```

## 2. Install MariaDB separately if needed

```bash
docker compose -f .container/mariadb.yml up -d
```

## 3. Optional: prepare a runtime env template

```bash
cp .container/clients/cxnext/.env.example .container/clients/cxnext/.env
```

This file is now only a local reference template. The container keeps its active runtime `.env` inside the Docker volume at `/opt/cxnext/runtime/.env`.

If you leave `DB_ENABLED=false`, CXNext starts in setup mode and you can finish database configuration from the UI.

## 4. Build the shared app image

```bash
docker build -t cxnext-app:v1 -f .container/Dockerfile .
```

## 5. Start CXNext

```bash
docker compose -f .container/clients/cxnext/docker-compose.yml up -d
```

On first start, the container automatically creates `/opt/cxnext/runtime/.env` from the app template if it does not already exist.

## 6. Open a shell in the app container

```bash
docker exec -it cxnext-app bash
```

## 7. Inspect or edit the runtime env inside the container

```bash
docker exec -it cxnext-app bash
cat /opt/cxnext/runtime/.env
```

## Notes

- App URLs: `http://YOUR_SERVER_IP:4000` and `http://YOUR_SERVER_IP:5000`
- Runtime env file used by the container: `/opt/cxnext/runtime/.env`
- Compose file path from root: `.container/clients/cxnext/docker-compose.yml`
- Shared app image: `cxnext-app:v1`
