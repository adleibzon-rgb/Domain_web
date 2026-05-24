# Domain Scanner

Modern domain intelligence and infrastructure analysis platform with premium UX, real-time monitoring, and scalable self-hosted architecture.

![Domain Scanner](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square)

## Features

- **DNS** — A, AAAA, CNAME, MX, TXT, NS resolution
- **WHOIS** — Registrar and domain metadata
- **SSL** — Certificate validity, issuer, expiry
- **HTTP** — Status, redirects, response headers
- **Geo/IP** — Location via ip-api.com (or IPinfo with token)
- **Security** — Header scoring and grade
- **Tech/CDN** — Server, Cloudflare, Vercel signals
- **Export** — JSON and CSV downloads
- **Live progress** — Server-Sent Events during scans
- **Monitoring** — DB schema + API for DNS/SSL monitors (workers: roadmap)

## Quick start (Docker)

```bash
git clone https://github.com/andrey271192/Domain_web.git
cd Domain_web
cp .env.example .env
docker compose up -d
docker compose exec web npx prisma db push
open http://localhost:3000
```

## One-line VPS install

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh | sudo bash
```

On small VPS disks (&lt;4GB free), the install script uses a **lite path**: Postgres/Redis in Docker, Next.js built on the host. For full container deploy on larger machines: `docker compose up -d && docker compose exec web npx prisma db push`.

Legacy GeoExport mirror in `site/` is **not** deployed (see `site/ARCHIVED.md`).

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/uninstall.sh | sudo bash
```

## Development

```bash
npm install
cp .env.example .env
# Start Postgres + Redis (docker compose up postgres redis -d)
npm run db:push
npm run dev
```

## Environment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis for scan cache |
| `NEXTAUTH_SECRET` | Auth signing secret |
| `NEXTAUTH_URL` | Public app URL |
| `IPINFO_TOKEN` | Optional IPinfo token |
| `SCAN_RATE_LIMIT_PER_HOUR` | Per-IP scan limit (default 30) |

## API

See [docs/API.md](docs/API.md) and the in-app `/api-docs` page.

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Marketing](docs/MARKETING.md)

## License

MIT — see [LICENSE](LICENSE)

## Topics

`domain-scanner` `dns` `whois` `ssl` `networking` `cybersecurity` `nextjs` `typescript` `self-hosted` `monitoring` `analytics` `infrastructure` `devtools` `open-source` `docker` `postgresql` `redis` `webapp` `dashboard` `security`
