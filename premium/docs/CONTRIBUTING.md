# Contributing to GeoExport

Thanks for helping improve GeoExport. This project aims for production-grade quality — clear PRs, tested behavior, and docs that match the code.

## Ways to contribute

- Report bugs and gaps in [GitHub Issues](https://github.com/andrey271192/geoexport/issues)
- Improve docs (README, `docs/`, API examples)
- Port UI features from [Domain_web](https://github.com/andrey271192/Domain_web) into Next.js
- Implement API routes and Prisma models
- Add tests for parsers, export formatters, and routing generator

## Development setup

```bash
git clone https://github.com/andrey271192/geoexport.git
cd geoexport
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

### With Docker data services only

```bash
docker compose up -d postgres redis
# Run app on host:
npm run dev
```

## Branching

- `main` — stable, deployable
- `feat/*` — features
- `fix/*` — bug fixes
- `docs/*` — documentation only

## Pull request checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] User-facing changes documented in README or `docs/`
- [ ] No secrets, `.env`, or large binary blobs committed
- [ ] PR description explains **why**, not only **what**

## Code style

- **TypeScript** strict mode
- **React** — functional components, hooks
- **Tailwind** — utility-first; use shadcn patterns for forms/dialogs
- **API routes** — validate input, return consistent JSON errors
- Keep diffs focused; avoid drive-by refactors

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(api): add lookup rate limiter
fix(export): handle empty category
docs: update Docker deployment steps
```

## Security

Do not open public issues for vulnerabilities. See [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](../LICENSE).
