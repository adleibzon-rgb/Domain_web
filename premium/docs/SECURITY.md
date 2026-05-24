# Security policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | Yes |
| Older tags | Best effort |

## Reporting a vulnerability

**Please do not** file public GitHub issues for security problems.

1. Email or DM the maintainer with a description and reproduction steps.
2. Allow up to **90 days** for a fix before public disclosure.
3. We will acknowledge receipt within **72 hours** when possible.

Include:

- Affected endpoints or components
- Impact (data leak, SSRF, RCE, etc.)
- Proof of concept if available
- Suggested fix (optional)

## Threat model (self-hosted)

GeoExport is typically deployed on a private VPS or internal network. Common risks:

| Risk | Mitigation |
|------|------------|
| Open DNS lookup abuse | Rate-limit `/api/lookup`; block private IP ranges in resolver |
| SSRF via upstream proxy | Whitelist paths; fixed `GEOEXPORT_UPSTREAM` host only |
| API scraping / DoS | Redis rate limits; nginx `limit_req` |
| Leaked `.env` | Never commit secrets; rotate DB passwords on deploy |
| Outdated geo databases | Monitor `/api/last-update`; automate refresh jobs |

## Hardening checklist (production)

- [ ] HTTPS only (TLS 1.2+)
- [ ] `NEXT_PUBLIC_APP_URL` matches real hostname
- [ ] Strong PostgreSQL password (not compose defaults)
- [ ] Redis bound to localhost or private network
- [ ] Firewall: expose only 80/443
- [ ] Disable directory listing on nginx
- [ ] Keep Node.js and base images patched (`docker compose pull`)

## Dependencies

- Run `npm audit` before releases
- Pin Docker image digests in production compose overrides
- Subscribe to GitHub security advisories for this repo

## Data privacy

GeoExport processes **domains and IPs** users submit for lookup. Operators should:

- Document retention (if logging lookups)
- Avoid shipping lookup logs to third parties without consent
- Prefer self-hosted rule databases over permanent upstream proxy when feasible

## Safe defaults

- No default API keys in repository
- Example compose passwords are for **local dev only** — change before internet exposure
- CSP headers on Next.js responses (planned)

## Recognition

We credit reporters in release notes when they agree to be named.
