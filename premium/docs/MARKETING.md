# Marketing & launch copy

Repository: **GeoExport** (`geoexport`) — open-source geoip/geosite export platform.  
English README: [../README.md](../README.md). Russian snippets below where noted.

---

## GitHub short description (≤350 chars)

```
Self-hosted geoip/geosite export & routing platform for Xray, 3x-ui, V2Ray, Mihomo, Sing-box. 59 service presets, DNS lookup, routing generator, REST API. Next.js, PostgreSQL, Redis, Docker. Privacy-friendly alternative to hosted geo list tools.
```

---

## GitHub About section

**Website:** `https://github.com/andrey271192/geoexport` (or your docs URL when live)

**Description:** (same as short description above)

**Topics:** see [Topics list](#github-topics-15-20)

---

## GitHub Topics (15–20)

```
geoip
geosite
v2ray
xray
sing-box
mihomo
3x-ui
vpn
routing
proxy
self-hosted
nextjs
typescript
docker
postgresql
open-source
privacy
networking
devtools
russia-vpn
```

---

## Repository structure tree

```
geoexport/
├── src/
│   ├── app/                    # Next.js App Router (pages + API)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/                # REST handlers (planned)
│   ├── components/             # UI (shadcn/ui) — planned
│   └── lib/                    # db, redis, geo utils — planned
├── prisma/                     # schema & migrations — planned
├── public/                     # static assets
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   └── MARKETING.md            # this file
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── LICENSE
├── package.json
└── README.md
```

---

## SEO meta description (~155 chars)

```
GeoExport — self-hosted geoip & geosite lists for Xray, V2Ray, Mihomo. Export .txt, DNS lookup, routing rules. Open source, Docker, REST API.
```

---

## Product Hunt tagline & blurb

**Tagline:** Self-hosted geo lists for your VPN stack

**Description:**

GeoExport helps you browse, search, and export geoip/geosite categories from Loyalsoldier, RuNet Freedom, v2fly, and b4geoip — without relying on a closed SaaS.

- 59 service presets across 9 groups
- DNS lookup with geodb cross-check
- Routing snippet generator for Xray / Mihomo / Sing-box
- REST API + Docker deploy

Open source. Run it on your VPS in minutes.

---

## Telegram post (RU)

```
🌍 GeoExport — open-source замена geoexport.org на своём сервере

Экспорт geoip/geosite для Xray, 3x-ui, V2Ray, Mihomo, Sing-box:
• 9 групп пресетов, 59 сервисов
• поиск по категориям
• DNS lookup + проверка в базах
• генератор routing-правил
• экспорт .txt
• REST API + Docker

Стек: Next.js, PostgreSQL, Redis.
Код: github.com/andrey271192/geoexport

Звезда на GitHub = поддержка проекта ⭐
```

---

## Twitter / X launch

```
We shipped GeoExport — self-hosted geoip/geosite export for Xray, V2Ray, Mihomo, Sing-box.

59 presets · DNS lookup · routing generator · REST API · Docker

Open source. Your VPS. Your data.

⭐ github.com/andrey271192/geoexport
```

---

## Hacker News — Show HN

**Title:** Show HN: GeoExport – self-hosted geoip/geosite export for Xray/V2Ray/Mihomo

**Body:**

I built GeoExport, an open-source platform to browse and export geoip/geosite rule lists used by VPN clients (Xray, 3x-ui, V2Ray, Mihomo, Sing-box).

It indexes categories from Loyalsoldier, RuNet Freedom, v2fly, and DanielLavrushin b4geoip, with 59 curated service presets (Telegram, YouTube, Steam, RU-blocked lists, etc.).

Features:
- Search and export plain-text lists
- DNS lookup with geodb cross-check
- Routing config generator
- REST API
- Docker Compose deploy (Next.js + Postgres + Redis)

Motivation: operators often depend on hosted geo tools with no self-host path. GeoExport is API-first and designed to run on a cheap VPS.

Repo: https://github.com/andrey271192/geoexport

A static mirror installer already exists (Domain_web); this repo is the full Next.js rewrite.

Feedback on API shape and self-hosted geo DB ingestion is especially welcome.

---

## Dev.to post outline

**Title:** Self-hosting geoip/geosite lists with GeoExport

1. **Problem** — VPN panels need fresh geoip/geosite data; hosted tools are convenient but opaque.
2. **What GeoExport does** — catalog UI, export, lookup, routing generator.
3. **Architecture sketch** — Next.js, Postgres, Redis, workers (diagram from ARCHITECTURE.md).
4. **Quick start** — `docker compose up`, open localhost:3000.
5. **API examples** — `curl` for presets, search, export.
6. **Comparison** — mirror mode (Domain_web) vs full stack.
7. **Roadmap** — Prisma, native workers, API keys.
8. **CTA** — star the repo, contribute via CONTRIBUTING.md.

Tags: `#opensource` `#vpn` `#nextjs` `#docker` `#devtools`

---

## Suggested repo naming

| Use case | Name |
|----------|------|
| Product | **GeoExport** |
| Premium fork folder | `geoexport-premium` |
| GitHub repo (recommended) | `geoexport` |
| Legacy mirror | `Domain_web` (keep for install scripts) |

Rename path when publishing:

```bash
# Example: push premium tree to new repo
git remote add origin git@github.com:andrey271192/geoexport.git
git push -u origin main
```

Or continue on `andrey271192/Domain_web` by merging `geoexport-premium` into `site/` when the Next port is ready.

---

## One-line pitch (EN)

**GeoExport:** run your own geoip/geosite export API and UI for Xray-class clients — open source, Docker-ready.

## One-line pitch (RU)

**GeoExport:** свой сервер для экспорта geoip/geosite и routing-правил под Xray и Mihomo — open source, Docker.
