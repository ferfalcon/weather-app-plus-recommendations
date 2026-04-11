# Weather App + Recommendations

Portfolio-oriented fullstack weather app built from the Frontend Mentor weather challenge. Weather is the primary experience. AI recommendations are a secondary enhancement delivered by the backend and protected by deterministic fallback logic.

## Current feature set

- Search-first empty state with no default city and no geolocation
- Backend location search with selectable ambiguous matches instead of guessing
- Normalized weather payloads for current conditions, 7-day forecast, and hourly detail
- Unit switching that refetches the backend instead of converting values in the client
- Hourly day switching handled as local UI state
- Recommendation cards above the daily forecast, sourced from Gemini when configured or deterministic fallback when not
- Distinct empty, loading, no-results, and API-error states
- Responsive, accessible UI with keyboard-friendly controls and visible status messaging

## Repo structure

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
└─ project-decisions.md
```

- `apps/api`: Fastify API that owns provider integration, normalization, validation, and recommendation fallback behavior
- `apps/web`: React + Vite frontend that renders only normalized app-level data from the API
- `packages/contracts`: shared Zod schemas and inferred types for request and response contracts

## Stack

- Frontend: React, TypeScript, Vite, TanStack Router, TanStack Query, CSS Modules, Vitest, React Testing Library
- Backend: Node.js, Fastify, TypeScript
- Shared contracts: Zod in `packages/contracts`
- Package manager: `pnpm` workspaces
- Weather provider: Open-Meteo behind the backend
- AI provider: Gemini behind the backend, with deterministic fallback suggestions

## Local development

1. Install dependencies:

```bash
pnpm install
```

2. Create local env files from the examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3. Start the apps:

```bash
pnpm dev:api
pnpm dev:web
```

Convenience commands:

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Default local URLs:

- Web: `http://127.0.0.1:5173`
- API: `http://localhost:3001`

## Environment variables

### `apps/api`

```bash
HOST=0.0.0.0
PORT=3001
LOG_LEVEL=info
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173,https://your-frontend-domain.example.com
GEMINI_API_KEY=your_gemini_api_key_here
```

- `HOST`: bind address for the Fastify server
- `PORT`: server port for local runs; hosting platforms can override this
- `LOG_LEVEL`: Fastify logger level
- `CORS_ORIGINS`: comma-separated allowlist for the frontend origin(s)
- `GEMINI_API_KEY`: optional; if omitted or Gemini fails, the API returns deterministic fallback recommendations in the same shape

### `apps/web`

```bash
VITE_API_BASE_URL=http://localhost:3001
```

- `VITE_API_BASE_URL`: base URL for the app API. The frontend never talks directly to Open-Meteo or Gemini.

## Normalized API routes

- `GET /healthz`
  Returns `{ "status": "ok" }`
- `GET /api/locations/search?q=montevideo`
  Returns normalized `LocationOption[]`
- `GET /api/weather?lat=-34.90&lon=-56.16&tempUnit=celsius&windUnit=kmh`
  Returns normalized `WeatherPageResponse`, including recommendations with a consistent shape for `ai` and `fallback`

The frontend is intentionally coupled only to these normalized contracts from `packages/contracts`.

## Verification

Run the full repo checks from the root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deployment overview

This repo is a `pnpm` workspace and both apps depend on the shared `packages/contracts` package. For that reason, the safest deployment setup is repo-root-aware on both platforms instead of treating `apps/web` or `apps/api` as isolated subdirectory projects.

- Frontend target: Vercel
- Backend target: Render
- Keep the repository root as the project root during setup
- Use explicit commands that build only the app you are deploying while still keeping the workspace available

## Manual deployment: Vercel

Create a Vercel project from this repository with these settings:

- Framework Preset: `Vite`
- Root Directory: repository root
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm --filter @weather-app-plus-recommendations/web build`
- Output Directory: `apps/web/dist`

Environment variables:

- `VITE_API_BASE_URL=https://your-render-service.onrender.com`

Notes:

- Do not point Vercel at `apps/web` as an isolated root unless you have separately verified workspace package access for `packages/contracts`.
- The explicit build command above keeps the shared workspace package available while only building the frontend app.

## Manual deployment: Render

Create a Render Web Service from this repository with these settings:

- Runtime: `Node`
- Root Directory: repository root
- Build Command: `pnpm install --frozen-lockfile && pnpm --filter @weather-app-plus-recommendations/contracts build && pnpm --filter @weather-app-plus-recommendations/api build`
- Start Command: `pnpm --filter @weather-app-plus-recommendations/api start`
- Health Check Path: `/healthz`

Recommended environment variables:

- `CORS_ORIGINS=https://your-vercel-project.vercel.app`
- `GEMINI_API_KEY=your_gemini_api_key_here`
- `LOG_LEVEL=info`

Notes:

- `PORT` is supported by the app, but Render provides it automatically for web services. Do not hard-code a conflicting production port there.
- The API production `start` path is `node dist/index.js`, exposed through `pnpm --filter @weather-app-plus-recommendations/api start`.
- The explicit build command includes `packages/contracts` so the API runtime has the workspace package output it needs.

## Post-deploy checklist

- Set `VITE_API_BASE_URL` in Vercel to the deployed Render API URL
- Configure `CORS_ORIGINS` in Render to allow the deployed Vercel frontend origin
- Set `GEMINI_API_KEY` in Render if you want AI-backed recommendations
- Verify location search returns results and ambiguous matches remain selectable
- Verify weather data loads for a chosen location
- Verify temperature and wind unit changes trigger a backend refetch
- Verify recommendations still render when Gemini is missing or disabled
- Verify `/healthz` returns HTTP 200 from the deployed API

## Architecture and tradeoffs

- Weather is the primary product. Recommendations should enrich the page, not gate core weather use.
- The frontend talks only to our API, never directly to third-party providers.
- Provider-specific shapes stay in the backend. The frontend renders normalized contracts only.
- Fallback recommendations protect the UX when AI is absent, times out, or returns unusable output.

## References

- [project-decisions.md](./project-decisions.md)
- [AGENTS.md](./AGENTS.md)
- [frontend-mentor/README.md](./frontend-mentor/README.md)
