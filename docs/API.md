# API Reference

Base URL: your deployment origin (e.g. `http://SERVER_IP`)

## POST /api/scan

Start a domain scan.

**Body**

```json
{ "domain": "example.com" }
```

**Response**

```json
{ "id": "clx...", "domain": "example.com" }
```

## GET /api/scan/:id

Poll scan status and full result.

## GET /api/scan/:id/stream

Server-Sent Events. Each event:

```json
{ "id": "...", "status": "RUNNING", "progress": 45, "domain": "example.com" }
```

## GET /api/export?id=:scanId&format=json|csv

Download completed scan.

## GET /api/scan

List recent scans (public metadata).

## POST /api/monitors

Requires session. Body: `{ "domain": "example.com", "type": "DNS" }`

## GET /api/health

Database connectivity check.

## Rate limits

Default 30 scans/hour per IP (`SCAN_RATE_LIMIT_PER_HOUR`).
