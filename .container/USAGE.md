# CXNext Deploy

### 1. Check network is installed

```bash
docker network create codexion-network
```

## 2. install MariaDB:

```bash
docker compose -f .container/mariadb.yml up -d
```
### 3. Check mariadb is installed

```
docker exec -it mariadb mariadb -u root -p
```

### 4. remote access for root user

```
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```


# 5. Build shared app image:

```bash
docker build -t cxnext-app:v1 -f .container/Dockerfile .
```

# 6. App deploy:

```bash
docker compose -f .container/clients/cxnext/docker-compose.yml up -d
```

# 7. console app:

```bash
docker exec -it cxnext-app bash
```

Open:

```text
http://YOUR_SERVER_IP:4000
http://YOUR_SERVER_IP:5000
```

Admin update screen:

```text
http://YOUR_SERVER_IP:4000/admin/dashboard/settings
```

Defaults:

- GitHub: `https://github.com/aaran-software/cxnext.git`
- Branch: `main`
- Network: `codexion-network`
- Shared app image: `cxnext-app:v1`
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
- compose file path: `.container/clients/cxnext/docker-compose.yml`
