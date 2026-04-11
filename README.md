# Weather App + Recommendations

Monorepo foundation for a portfolio-quality weather app where weather is the primary experience and AI recommendations are a secondary enhancement.

This repository is being built in small phases. Phase 1.1 sets up the workspace, root configuration, and package boundaries only. It does not scaffold application code, shared contracts, or feature implementation yet.

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
- `apps/web`: future React + Vite frontend that talks only to the internal API
- `packages/contracts`: shared Zod schemas and inferred TypeScript types for normalized app-level contracts

## Current status

- Monorepo workspace wiring is in place with `pnpm`
- Root verification scripts are defined
- Shared TypeScript base config is defined for future package-level configs
- The contracts package exports the initial location and weather request/response schemas
- The API package can run a small Fastify server in development
- `GET /api/locations/search?q=...` and `GET /api/weather?...` exist as placeholder skeleton routes
- Real weather provider integration, Gemini integration, and frontend scaffolding are still intentionally out of scope at this phase

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

At this phase, `pnpm dev:api` starts the placeholder backend on `http://localhost:3001`. The two current routes are contract-first skeletons with deterministic placeholder responses, not real provider integrations yet.

## Reference material

- [project-decisions.md](./project-decisions.md)
- [AGENTS.md](./AGENTS.md)
- [frontend-mentor/README.md](./frontend-mentor/README.md)
