# Deployment

This guide covers deploying **GeoExport** (`geoexport-premium`) on a VPS or container platform. For the **static mirror** that is production-ready today, use [andrey271192/Domain_web](https://github.com/andrey271192/Domain_web).

## Prerequisites

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB+ |
| Disk | 10 GB | 20 GB+ (geo databases grow) |
| OS | Linux (Debian/Ubuntu/Alpine) | Ubuntu 22.04 LTS |

Software:

- Docker 24+ and Docker Compose v2, **or**
- Node.js 20+ with PostgreSQL 16 and Redis 7

---

## Option 1 — Docker Compose (recommended)

### 1. Clone and configure

```bash
git clone https://github.com/andrey271192/geoexport.git geoexport
cd geoexport
cp .env.example .env
# Edit DATABASE_URL / secrets if not using compose defaults
```

### 2. Start stack

```bash
docker compose up -d --build
```

Services:

| Name | Image | Host port |
|------|-------|-----------|
| `web` | Built from `Dockerfile` | `3000` |
| `postgres` | `postgres:16-alpine` | `5432` |
| `redis` | `redis:7-alpine` | `6379` |

Verify:

```bash
curl -f http://localhost:3000
docker compose logs -f web
```

### 3. Reverse proxy (nginx)

```nginx
server {
    listen 80;
    server_name geo.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Add TLS with Certbot or Caddy. Set `NEXT_PUBLIC_APP_URL=https://geo.example.com` in `.env` and restart `web`.

---

## Option 2 — Bare Node.js

```bash
git clone https://github.com/andrey271192/geoexport.git geoexport
cd geoexport
cp .env.example .env
# Point DATABASE_URL and REDIS_URL to your instances

npm install
npm run build
NODE_ENV=production npm run start
```

Use **pm2** or **systemd** for process supervision:

```ini
# /etc/systemd/system/geoexport.service
[Unit]
Description=GeoExport Next.js
After=network.target

[Service]
Type=simple
User=geoexport
WorkingDirectory=/opt/geoexport
EnvironmentFile=/opt/geoexport/.env
ExecStart=/usr/bin/npm run start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

## Option 3 — Domain_web mirror (available now)

One-line install on a fresh VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh | sudo bash
```

- Site files: `/opt/domain_web/site/`
- Node service: `geoexport-site` on `127.0.0.1:4173`
- nginx on port 80

Update cached JSON:

```bash
cd /opt/domain_web/site
curl -fsSL https://geoexport.org/api/presets -o data/presets.json
curl -fsSL https://geoexport.org/api/sources -o data/sources.json
curl -fsSL https://geoexport.org/api/last-update -o data/last-update.json
curl -fsSL https://geoexport.org/api/routing/presets -o data/routing-presets.json
sudo systemctl restart geoexport-site
```

---

## Environment variables

See [.env.example](../.env.example). Critical production values:

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | Canonical public URL |
| `DATABASE_URL` | Required when Prisma is enabled |
| `REDIS_URL` | Required for cache/rate limits |
| `GEOEXPORT_UPSTREAM` | Set only for hybrid/mirror mode |

---

## Database migrations (roadmap)

When Prisma lands in this repo:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Until then, Docker Postgres is provisioned but unused by the app.

---

## Updates

**Docker:**

```bash
git pull
docker compose up -d --build
```

**Domain_web:**

```bash
cd /opt/domain_web && sudo git pull && sudo systemctl restart geoexport-site
```

---

## Health checks

| Check | Command |
|-------|---------|
| HTTP | `curl -sf http://localhost:3000` |
| Postgres | `docker compose exec postgres pg_isready -U geoexport` |
| Redis | `docker compose exec redis redis-cli ping` |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Export/search 502 | Upstream unreachable | Check `GEOEXPORT_UPSTREAM`, outbound HTTPS |
| Empty presets | DB not seeded | Use cached JSON or run seed (roadmap) |
| Docker build fails | Missing lockfile | `npm install` locally, commit `package-lock.json` |
| Port 3000 in use | Conflict | Set `PORT=3001` in `.env` and compose |
