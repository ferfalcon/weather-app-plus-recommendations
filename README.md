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

- `apps/api`: future Fastify backend for weather provider integration, recommendation orchestration, normalization, and validation
- `apps/web`: future React + Vite frontend that talks only to the internal API
- `packages/contracts`: future shared package for stable contracts and inferred types used across apps

## Current status

- Monorepo workspace wiring is in place with `pnpm`
- Root verification scripts are defined
- Shared TypeScript base config is defined for future package-level configs
- Package directories exist with minimal manifests only
- No app scaffolding, API routes, frontend scaffold, or contract models have been added yet

## Commands

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

At this phase, those commands validate the workspace setup and will only execute package-level scripts when later phases add them.

## Reference material

- [project-decisions.md](./project-decisions.md)
- [AGENTS.md](./AGENTS.md)
- [frontend-mentor/README.md](./frontend-mentor/README.md)
