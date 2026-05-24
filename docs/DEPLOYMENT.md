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

Install path: `/opt/domain-scanner` (lite VPS install via `install.sh`)  
Service: `domain-scanner.service` — `npm start` from repo root (not standalone `server.js` alone)  
Nginx site: `domain-scanner` on port 80 → app `:3000`, with `/_next/static/` served from disk

**CSS / static assets:** After `next build`, run `scripts/sync-standalone-assets.sh` (also via `postbuild`) so `.next/static` and `public` exist under `.next/standalone` for Docker. Host deploy must keep `${INSTALL_DIR}/.next/static` — never run `node .next/standalone/server.js` without that copy.

## Environment on server

Edit `/opt/domain-scanner/.env`:

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
cd /opt/domain-scanner && git pull && npm ci && npm run build && systemctl restart domain-scanner nginx
```
