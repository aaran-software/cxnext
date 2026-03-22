
## compose docker image
```
docker compose -f docker/client/tirupur-direct.yml up -d
```

```
tirupur_direct
```

```
docker exec -it tirupur_direct bash
```

# for file folder permission

```
 sudo chown -R $USER:$USER .
```

```
sudo chown -R devops:devops .
```

```
sudo su - devops
```

```
git clone https://github.com/aaran-software/codexsun.git
```

```
pnpm install
```
```
cd apps/backend
```

```
cp .env.example .env
```


```
 cd etc/nginx/sites-available/
```

```
sudo nano tirupurdirect.com
```

```
server {
    listen 80;
    server_name tirupurdirect.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```


sudo ln -s /etc/nginx/sites-available/tirupurdirect.com /etc/nginx/sites-enabled/


```
sudo certbot --nginx
```

```
sudo nginx -t
```

```
sudo systemctl reload nginx
```

bench migrate
bench build