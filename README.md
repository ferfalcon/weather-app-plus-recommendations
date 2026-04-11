# Weather App + Recommendations

Monorepo foundation for a portfolio-quality weather app where weather is the primary experience and AI recommendations are a secondary enhancement.

This repository is being built in small phases. Phase 1 foundation work is now in place: the workspace, shared contracts package, placeholder API skeleton, and frontend scaffold all exist. The current product state is still intentionally limited to a search-first empty frontend and contract-first placeholder backend routes.

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

- `apps/api`: Fastify backend skeleton with placeholder app-level routes that validate input and return normalized contract-shaped JSON
- `apps/web`: React + Vite frontend scaffold with TanStack Router, TanStack Query, global tokens, and the search-first empty state
- `packages/contracts`: shared Zod schemas and inferred TypeScript types for normalized app-level contracts

## Current status

- Monorepo workspace wiring is in place with `pnpm`
- Root verification scripts are defined
- Shared TypeScript base config is defined for future package-level configs
- The contracts package exports the initial location and weather request/response schemas
- The API package can run a small Fastify server in development
- The web package can run a small frontend scaffold in development
- `GET /api/locations/search?q=...` and `GET /api/weather?...` exist as placeholder skeleton routes
- The frontend currently renders only the empty search-first state and is ready for later feature work
- Real weather provider integration, Gemini integration, and full search/weather flows are still intentionally out of scope at this phase

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

At this phase, `pnpm dev:api` starts the placeholder backend on `http://localhost:3001`, and `pnpm dev:web` starts the frontend scaffold on `http://127.0.0.1:5173`. The frontend currently shows the search-first empty state only, while the backend routes remain deterministic placeholder skeletons.

## Reference material

- [project-decisions.md](./project-decisions.md)
- [AGENTS.md](./AGENTS.md)
- [frontend-mentor/README.md](./frontend-mentor/README.md)
