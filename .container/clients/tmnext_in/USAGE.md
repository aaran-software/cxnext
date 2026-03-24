# TMNext Deploy

Run every command from the repo root: `E:\\Workspace\\websites\\cxnext`

## 1. Create the Docker network once

```bash
docker network create codexion-network
```

## 2. Create the runtime env file

```bash
cp .container/clients/tmnext_in/tmnext-in.env.example .container/clients/tmnext_in/tmnext-in.env
```

Update `.container/clients/tmnext_in/tmnext-in.env` with the real values before go-live.

## 3. Build the shared app image

```bash
docker build -t cxnext-app:v1 -f .container/Dockerfile .
```

## 4. Start TMNext app container

```bash
docker compose -f .container/clients/tmnext_in/docker-compose.yml up -d
```

MariaDB is not started by this compose file. Point `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.container/clients/tmnext_in/tmnext-in.env` to your existing or separately installed database.

## 5. Open a shell in the app container

```bash
docker exec -it tmnext-in-app bash
```

## Notes

- App URLs: `http://YOUR_SERVER_IP:4002` and `http://YOUR_SERVER_IP:5002`
- Runtime env file used by the container: `.container/clients/tmnext_in/tmnext-in.env`
- Database name: `tmnext_in_db`
- Database server: external or separately installed MariaDB
- Compose file path from root: `.container/clients/tmnext_in/docker-compose.yml`
- Shared app image: `cxnext-app:v1`
