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

## 3. Start Tirupur Direct

```bash
docker compose -f .container/clients/tirupur_direct/docker-compose.yml up -d --build
```

## 4. Open a shell in the app container

```bash
docker exec -it tirupur-direct-app bash
```

## 5. Open MariaDB if needed

```bash
docker exec -it tirupur-direct-mariadb mariadb -u root -p
```

## Notes

- App URL: `http://YOUR_SERVER_IP:4000`
- Runtime env file used by the container: `.container/clients/tirupur_direct/tirupur-direct.env`
- Database name: `tirupur_direct_db`
- Compose file path from root: `.container/clients/tirupur_direct/docker-compose.yml`
