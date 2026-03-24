# Tirupur Direct Deploy

Run every command from the repo root: `E:\\Workspace\\websites\\cxnext`

## 1. Create the Docker network once

```bash
docker network create codexion-network
```

## 2. Create the runtime env file

```bash
cp .container/clients/tirupur_direct/tirupur-direct.env.example .container/clients/tirupur_direct/tirupur-direct.env
```

Update `.container/clients/tirupur_direct/tirupur-direct.env` with the real values before go-live.

## 3. Build the shared app image

```bash
docker build -t cxnext-app:v1 -f .container/Dockerfile .
```

## 4. Start Tirupur Direct app container

```bash
docker compose -f .container/clients/tirupur_direct/docker-compose.yml up -d
```

MariaDB is not started by this compose file. Point `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.container/clients/tirupur_direct/tirupur-direct.env` to your existing or separately installed database.

## 5. Open a shell in the app container

```bash
docker exec -it tirupur-direct-app bash
```

## Notes

- App URLs: `http://YOUR_SERVER_IP:4001` and `http://YOUR_SERVER_IP:5001`
- Runtime env file used by the container: `.container/clients/tirupur_direct/tirupur-direct.env`
- Database name: `tirupur_direct_db`
- Database server: external or separately installed MariaDB
- Compose file path from root: `.container/clients/tirupur_direct/docker-compose.yml`
- Shared app image: `cxnext-app:v1`
