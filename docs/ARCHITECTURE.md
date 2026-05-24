# Architecture

## Overview

Domain Scanner is a Next.js 15 application with PostgreSQL (Prisma) and optional Redis caching. Scans run in-process on the web server using Node.js built-ins and public APIs.

## Components

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js App │────▶│ PostgreSQL  │
│  (SSE/REST) │     │  scan worker │     │   scans     │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │    Redis     │
                    │ scan cache   │
                    └──────────────┘
```

## Scan pipeline

1. `POST /api/scan` validates domain, checks rate limit, creates `Scan` row
2. Async `runDomainScan()` updates progress in DB
3. Client subscribes to `GET /api/scan/:id/stream` (SSE)
4. Completed results cached in Redis (1h) and stored as JSON in Postgres

## Data model

- **User** — credentials auth (NextAuth)
- **Scan** — domain, status, progress, result JSON
- **Monitor** — per-user DNS/SSL/uptime watch (cron stub)
- **ApiRateLimit** — hourly per-IP counters

## Competitive positioning

Tools like DNSChecker and SecurityTrails focus on single-record lookups or enterprise datasets. Domain Scanner targets unified infrastructure snapshots with export and self-hosting — not a clone of their UI patterns.

## Roadmap

- BullMQ worker container for monitors
- GraphQL server (schema placeholder in `src/lib/graphql/schema.ts`)
- Blacklist checks (Spamhaus, etc.)
- DNS diff history
