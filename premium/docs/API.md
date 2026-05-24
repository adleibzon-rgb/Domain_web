# API reference

GeoExport exposes a **REST** API under `/api`. The contract matches [geoexport.org](https://geoexport.org) so existing clients and mirrors stay compatible.

**Base URL:** `https://your-instance.example.com`  
**Content-Type:** `application/json` unless noted  
**Errors:** JSON body `{ "error": "message" }` with appropriate HTTP status

---

## Catalog (cacheable)

### `GET /api/presets`

Returns preset groups with nested services and geoip/geosite category mappings.

**Response:** `200` — JSON array

```json
[
  {
    "group": "Мессенджеры",
    "icon": "💬",
    "slug": "messengers",
    "services": [
      {
        "name": "Telegram",
        "domain": "telegram.org",
        "keywords": ["telegram"],
        "categories": [
          {
            "full_name": "geosite:telegram",
            "name": "telegram",
            "type": "geosite",
            "source_slug": "loyalsoldier",
            "source_name": "Loyalsoldier"
          }
        ]
      }
    ]
  }
]
```

---

### `GET /api/sources`

Rule database sources (download URLs, compatibility).

**Response:** `200` — JSON array

```json
[
  {
    "slug": "loyalsoldier",
    "name": "Loyalsoldier",
    "description": "…",
    "compatible": "Xray, 3x-ui, V2Ray, Mihomo",
    "geoip_url": "https://github.com/.../geoip.dat",
    "geosite_url": "https://github.com/.../geosite.dat"
  }
]
```

---

### `GET /api/last-update`

Timestamp of the last successful geo database refresh.

**Response:** `200`

```json
{
  "updated_at": "2026-05-24T12:00:00Z"
}
```

---

### `GET /api/routing/presets`

Saved routing templates for the generator UI.

**Response:** `200` — JSON array of preset objects (structure varies by client target).

---

## Search & export

### `GET /api/search`

Search geoip/geosite categories.

**Query parameters**

| Param | Required | Description |
|-------|----------|-------------|
| `q` | yes | Search string |
| `source` | no | Filter by `source_slug` |
| `type` | no | `geoip` or `geosite` |

**Example**

```http
GET /api/search?q=telegram&source=loyalsoldier
```

**Response:** `200` — JSON array of matching categories

---

### `GET /api/export`

Export resolved entries as **plain text** (one category or domain per line depending on mode).

**Query parameters**

| Param | Required | Description |
|-------|----------|-------------|
| `category` | conditional | Full name, e.g. `geosite:telegram` |
| `source` | no | Source slug |
| `format` | no | Output variant (client-specific) |

**Response:** `200` — `text/plain`

**Example**

```bash
curl -s 'https://your-instance/api/export?category=geosite:telegram&source=loyalsoldier' -o telegram.txt
```

---

## DNS lookup

### `GET /api/lookup`

Resolve a domain and cross-check against loaded geo databases.

**Query parameters**

| Param | Required | Description |
|-------|----------|-------------|
| `domain` | yes | FQDN, e.g. `example.com` |

**Example**

```http
GET /api/lookup?domain=anydesk.com
```

**Response:** `200` — JSON with IPs, subdomains, and geodb hits (exact schema mirrors upstream).

---

## Routing generator

### `POST /api/routing/generate`

Generate a routing configuration snippet from selected rules and a template.

**Request body:** `application/json`

```json
{
  "preset_id": "xray-default",
  "rules": ["geosite:telegram", "geoip:netflix"],
  "outbound": "proxy",
  "client": "xray"
}
```

**Response:** `200` — JSON or plain text snippet (depends on `client`)

**Errors:** `400` validation, `422` unsupported combination

---

## Operations

### `GET /api/update/status`

Background geo database refresh status (worker jobs).

**Response:** `200`

```json
{
  "status": "idle",
  "last_run": "2026-05-24T06:00:00Z",
  "progress": null
}
```

---

## Rate limiting (planned)

Public instances should enforce per-IP limits on:

- `/api/lookup`
- `/api/search`
- `/api/export`

Recommended defaults: **120 req/min** per IP (configurable via `GEOEXPORT_RATE_LIMIT_PER_MINUTE`).

---

## Authentication (planned)

Optional header:

```http
Authorization: Bearer <GEOEXPORT_API_KEY>
```

Required only when `GEOEXPORT_API_KEY` is set server-side.

---

## Compatibility notes

| Endpoint | Local JSON (mirror) | Full backend |
|----------|---------------------|--------------|
| `/api/presets` | Served from `data/presets.json` | PostgreSQL or static cache |
| `/api/sources` | `data/sources.json` | Same |
| `/api/last-update` | `data/last-update.json` | Same |
| `/api/routing/presets` | `data/routing-presets.json` | Same |
| `/api/search`, `/api/export`, `/api/lookup`, `/api/routing/generate` | Proxied upstream | Native handlers |

Mirror behavior is implemented in [Domain_web `server.mjs`](https://github.com/andrey271192/Domain_web/blob/main/site/server.mjs).

---

## GraphQL (roadmap)

A read-only GraphQL layer may expose `presets`, `sources`, and `search` for panel integrations. REST remains the stable contract.
