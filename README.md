# Weather App + Recommendations

Monorepo foundation for a portfolio-quality weather app where weather is the primary experience and AI recommendations are a secondary enhancement.

This repository is being built in small phases. The foundation is in place, and the current product state now includes the real search-to-weather flow: backend geocoding, frontend search submit behavior, selectable ambiguous matches, live weather loading, and distinct no-results and API-error states.

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

- `apps/api`: Fastify backend with normalized app-level routes, including live location search and weather fetching through Open-Meteo
- `apps/web`: React + Vite frontend scaffold with TanStack Router, TanStack Query, global tokens, and the search-first location + weather flow
- `packages/contracts`: shared Zod schemas and inferred TypeScript types for normalized app-level contracts

## Current status

- Monorepo workspace wiring is in place with `pnpm`
- Root verification scripts are defined
- Shared TypeScript base config is defined for future package-level configs
- The contracts package exports the initial location and weather request/response schemas
- The API package can run a small Fastify server in development
- The web package can run a small frontend scaffold in development
- `GET /api/locations/search?q=...` now calls Open-Meteo geocoding and returns normalized `LocationOption[]` results
- `GET /api/weather?lat=...&lon=...&tempUnit=...&windUnit=...` now calls Open-Meteo forecast data and returns normalized current, daily, and hourly weather payloads
- The frontend supports search submit, loading, no-results, ambiguous-result selection, live weather rendering, and distinct weather API error states
- The weather payload now includes recommendation suggestions in the same response shape, using Gemini when configured and deterministic fallback when it is not

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

At this phase, `pnpm dev:api` starts the backend on `http://localhost:3001`, and `pnpm dev:web` starts the frontend on `http://127.0.0.1:5173`. The frontend supports the end-to-end location search, live weather flow, and backend-owned recommendation generation through the internal API. If `GEMINI_API_KEY` is absent or Gemini fails validation, the API returns deterministic fallback suggestions in the same payload shape.

## API runtime env vars

The API uses small runtime config parsing with sensible local defaults. These optional env vars are supported:

- `HOST` default: `0.0.0.0`
- `PORT` default: `3001`
- `LOG_LEVEL` default: `info`
- `CORS_ORIGINS` comma-separated list, default: `http://127.0.0.1:5173,http://localhost:5173`
- `GEMINI_API_KEY` optional: enables Gemini-backed recommendation generation; deterministic fallback remains the safety net when the key is absent, Gemini times out, or output validation fails

## Reference material

- [project-decisions.md](./project-decisions.md)
- [AGENTS.md](./AGENTS.md)
- [frontend-mentor/README.md](./frontend-mentor/README.md)
