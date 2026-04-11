# Weather App + Recommendations

Monorepo foundation for a portfolio-quality weather app where weather is the primary experience and AI recommendations are a secondary enhancement.

This repository is being built in small phases. The foundation is in place, and the current product state now includes the first real location search flow: backend geocoding, frontend search submit behavior, selectable ambiguous matches, and distinct no-results and API-error states.

## Planned structure

```txt
weather-app-plus-recommendations/
├─ apps/
│  ├─ api/
│  └─ web/
├─ packages/
│  └─ contracts/
├─ docs/
├─ frontend-mentor/
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ README.md
```

## Workspace packages

- `apps/api`: Fastify backend with normalized app-level routes, including live location search through Open-Meteo geocoding
- `apps/web`: React + Vite frontend scaffold with TanStack Router, TanStack Query, global tokens, and the search-first location search flow
- `packages/contracts`: shared Zod schemas and inferred TypeScript types for normalized app-level contracts

## Current status

- Monorepo workspace wiring is in place with `pnpm`
- Root verification scripts are defined
- Shared TypeScript base config is defined for future package-level configs
- The contracts package exports the initial location and weather request/response schemas
- The API package can run a small Fastify server in development
- The web package can run a small frontend scaffold in development
- `GET /api/locations/search?q=...` now calls Open-Meteo geocoding and returns normalized `LocationOption[]` results
- The frontend supports search submit, loading, no-results, API-error, and ambiguous-result selection states
- Weather fetching remains placeholder-only, and Gemini integration is still intentionally out of scope at this phase

## Commands

```bash
pnpm install
pnpm dev
pnpm dev:web
pnpm dev:api
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

At this phase, `pnpm dev:api` starts the backend on `http://localhost:3001`, and `pnpm dev:web` starts the frontend on `http://127.0.0.1:5173`. The frontend now supports the first end-to-end location search flow through the internal API, while the weather route remains a placeholder scaffold for the next phase.

## API runtime env vars

The API uses small runtime config parsing with sensible local defaults. These optional env vars are supported:

- `HOST` default: `0.0.0.0`
- `PORT` default: `3001`
- `LOG_LEVEL` default: `info`
- `CORS_ORIGINS` comma-separated list, default: `http://127.0.0.1:5173,http://localhost:5173`

## Reference material

- [project-decisions.md](./project-decisions.md)
- [AGENTS.md](./AGENTS.md)
- [frontend-mentor/README.md](./frontend-mentor/README.md)
