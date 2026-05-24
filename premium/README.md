# GeoExport

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

Self-hosted platform to browse, export, and generate routing rules from **geoip** and **geosite** databases — built for VPN stacks: **Xray**, **3x-ui**, **V2Ray**, **Mihomo**, **Sing-box**.

GeoExport is an open-source, API-first alternative to hosted geo list tools: fast UI, privacy-friendly defaults, and a deployment model you control.

> **Status:** This repository is the **premium Next.js rewrite** (`geoexport-premium`). The UI scaffold is active; PostgreSQL, Prisma, Redis, and full API routes are on the roadmap. For a working static mirror today, see [andrey271192/Domain_web](https://github.com/andrey271192/Domain_web).

---

## Table of contents

- [Why GeoExport](#why-geoexport)
- [Features](#features)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Docker](#docker)
- [API](#api)
- [Deployment](#deployment)
- [Security](#security)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Why GeoExport

| | Hosted geo tools | GeoExport |
|---|------------------|-----------|
| **Data location** | Third-party SaaS | Your VPS / private cloud |
| **API access** | Opaque or limited | REST-first, documented |
| **UI** | Functional | Linear-grade layout, dark/light |
| **Stack** | Unknown | Next.js, TypeScript, Prisma, Redis |
| **Scale** | Shared tenancy | Horizontal app + cache layer |

GeoExport does not replace community rule repos (Loyalsoldier, RuNet Freedom, v2fly, etc.) — it **indexes** them, maps services to categories, and gives you export and routing helpers in one place.

---

## Features

### Presets & sources

- **9 preset groups**, **59 curated services** (messengers, video, social, AI, games, work, CDN, RU-blocked lists, …)
- **4 rule sources**: RuNet Freedom, Loyalsoldier, DanielLavrushin (b4geoip), v2fly — with per-source `geoip.dat` / `geosite.dat` links

### Discovery & export

- Full-text **search** across geoip/geosite categories
- **DNS lookup**: resolve domains to IPs/subdomains and cross-check against loaded databases
- One-click **export** to `.txt` for client import
- **Routing generator** with saved routing presets (Xray / Mihomo / Sing-box oriented)

### Platform

- **Dark / light** theme
- **REST API** for automation (GraphQL optional on roadmap)
- **Self-hosted** via Docker or bare Node
- **Edge-ready** Next.js deployment (Vercel, Cloudflare, or nginx reverse proxy)

---

## Architecture

High-level layout:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Browser    │────▶│  Next.js     │────▶│  PostgreSQL     │
│  (React)    │     │  App Router  │     │  (Prisma)       │
└─────────────┘     │  + API routes│     └─────────────────┘
                    │              │────▶┌─────────────────┐
                    │              │     │  Redis (cache)  │
                    └──────┬───────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Geo workers  │──▶ upstream .dat / GitHub releases
                    └──────────────┘
```

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, shadcn/ui |
| API | Next.js Route Handlers (REST); GraphQL optional later |
| Data | PostgreSQL + Prisma |
| Cache | Redis |
| Ops | Docker, docker-compose, nginx (production) |

---

## Screenshots

| Presets browser | DNS lookup | Routing generator |
|-----------------|------------|-------------------|
| _Coming soon — add `docs/images/presets.png`_ | _Coming soon_ | _Coming soon_ |

Place assets under `docs/images/` and reference them here before release.

---

## Quick start

### Requirements

- **Node.js** 20+ (22 LTS recommended)
- **npm**, **pnpm**, or **bun**

### Local development

```bash
git clone https://github.com/andrey271192/geoexport.git
cd geoexport   # or geoexport-premium while the repo is being renamed

cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `REDIS_URL` | Redis for API/cache layers |
| `NEXT_PUBLIC_APP_URL` | Public URL (CORS, auth callbacks) |
| `GEOEXPORT_UPSTREAM` | Upstream host for mirror/proxy mode during migration |

Full reference: [.env.example](.env.example)

---

## Docker

Run the full stack (app + PostgreSQL + Redis):

```bash
cp .env.example .env
docker compose up -d --build
```

| Service | Port (host) | Notes |
|---------|-------------|--------|
| `web` | 3000 | Next.js (`npm run start` in container) |
| `postgres` | 5432 | Persistent volume `postgres_data` |
| `redis` | 6379 | Cache / rate limit |

Health check: `curl -f http://localhost:3000`

> Prisma migrations and geo data seeding are not wired in Docker yet — track progress in [Roadmap](#roadmap).

---

## API

Base path: `/api`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/presets` | Service preset groups |
| `GET` | `/api/sources` | Rule source metadata |
| `GET` | `/api/last-update` | Last database refresh timestamp |
| `GET` | `/api/routing/presets` | Saved routing templates |
| `POST` | `/api/routing/generate` | Generate routing config |
| `GET` | `/api/search?q=` | Search categories |
| `GET` | `/api/export?...` | Export list as plain text |
| `GET` | `/api/lookup?domain=` | DNS + geodb cross-check |
| `GET` | `/api/update/status` | Background update job status |

Contract details: [docs/API.md](docs/API.md)

---

## Deployment

- **Docker Compose** — single VPS, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Vercel / edge** — frontend + serverless API routes (Redis/Postgres via managed providers)
- **nginx** — terminate TLS, proxy to `127.0.0.1:3000` (pattern used in [Domain_web](https://github.com/andrey271192/Domain_web))

---

## Security

- Run behind HTTPS in production
- Do not commit `.env` or API keys
- Rate-limit public `/api/*` when exposed to the internet
- Report issues: [docs/SECURITY.md](docs/SECURITY.md)

---

## Performance

- Static preset JSON can be CDN-cached (`Cache-Control` on read-only catalog endpoints)
- Redis backs hot search/export paths
- Next.js App Router + edge caching for public pages
- Geo `.dat` parsing runs in workers — not on the request thread

---

## Roadmap

- [ ] Port Domain_web UI into Next.js App Router
- [ ] Prisma schema + PostgreSQL seed from geoexport.org catalogs
- [ ] Self-contained geo workers (no upstream proxy)
- [ ] API keys + rate limiting
- [ ] GraphQL read API (optional)
- [ ] Helm chart / Terraform module

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md). Marketing copy and launch templates: [docs/MARKETING.md](docs/MARKETING.md).

---

## Related projects

| Repo | Role |
|------|------|
| [andrey271192/Domain_web](https://github.com/andrey271192/Domain_web) | Production VPS mirror (nginx + Node static server) |
| [geoexport-clone](https://github.com/andrey271192/geoexport-clone) | Local dev mirror of geoexport.org UI |

---

## License

[MIT](LICENSE) — Copyright (c) 2026 GeoExport Contributors
