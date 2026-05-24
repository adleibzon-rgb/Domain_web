# Deployment

## Docker (recommended)

```bash
docker compose up -d --build
docker compose exec web npx prisma db push
```

## VPS one-liner

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh | sudo bash
```

Install path: `/opt/domain_web`  
Service: Docker Compose (`web`, `postgres`, `redis`)  
Nginx site: `domain-scanner` on port 80 → app `:3000`

## Environment on server

Edit `/opt/domain_web/.env`:

- `NEXTAUTH_SECRET` — auto-generated on first install
- `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` — public IP or domain

## Manual Node deploy

```bash
npm ci && npm run build
DATABASE_URL=... npx prisma db push
PORT=3000 npm start
```

## SSL / HTTPS

Place certbot in front of nginx or terminate TLS at a reverse proxy.

## Upgrades

```bash
cd /opt/domain_web && git pull && docker compose up -d --build
```
