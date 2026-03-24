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

## 3. Build the shared app image

```bash
docker build -t cxnext-app:v1 -f .container/Dockerfile .
```

## 4. Start CXNext

```bash
docker compose -f .container/clients/cxnext/docker-compose.yml up -d
```

## 5. Open a shell in the app container

```bash
docker exec -it cxnext-app bash
```

## Notes

- App URLs: `http://YOUR_SERVER_IP:4000` and `http://YOUR_SERVER_IP:5000`
- Compose file path from root: `.container/clients/cxnext/docker-compose.yml`
- Shared app image: `cxnext-app:v1`
