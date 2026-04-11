# Weather App + Recommendations — Project Decisions

This document is the concise source of truth for planning the project.

---

## 1. Product goal

Turn the Frontend Mentor **Weather app** challenge into a portfolio-quality fullstack product that:

- delivers a polished, responsive weather experience
- uses maintainable, interview-friendly architecture
- includes **AI activity suggestions as a core differentiator**
- keeps weather as the primary experience and recommendations as a secondary enhancement

*Product rule: this is a ****weather app plus recommendations****. Weather remains primary, but recommendations are part of the MVP.*

---

## 2. MVP scope

### Included

- Search weather by location
- Current weather card with temperature, icon, and location details
- Extra metrics: feels like, humidity, wind speed, precipitation
- 7-day forecast
- Hourly forecast for the selected day
- Day selector for the hourly forecast
- Units dropdown with:
  - Celsius / Fahrenheit
  - km/h / mph
  - precipitation in millimeters
- Responsive layout for mobile, tablet, and desktop
- Hover and focus states for interactive elements
- Loading, search-in-progress, no-results, empty, and API-error states
- **AI activity suggestions in MVP**
- No geolocation in MVP

### Out of scope

- Geolocation
- Saved locations / recent searches
- Authentication / user accounts
- Sharing / persistence
- Severe weather alerts
- Maps / radar
- Internationalization
- Offline support

---

## 3. Post-MVP ideas

- Recent searches
- Better motion / polish
- Shareable URLs
- Saved locations
- Geolocation
- Smarter recommendation controls or personalization

---

## 4. Core user flows

- **First load:** empty search-first state, visible search bar, no default city, no geolocation.
- **Valid search:** search location → resolve location → fetch full weather page payload → render weather + recommendations.
- **Ambiguous search:** show selectable location options instead of guessing.
- **No results:** show a distinct no-results state, not a server error state.
- **Weather/API failure:** show a distinct API-error state; preserve prior result when possible.
- **Recommendations failure:** backend returns deterministic fallback suggestions in the same response shape.
- **Units change:** refetch the backend payload with the selected units.
- **Hourly day change:** local UI state only; no new request.
- **New search after success:** replace the current location result; no multi-location comparison in MVP.

---

## 5. Weather provider strategy

For MVP, use **Open-Meteo** as the initial provider, but keep the architecture **provider-agnostic** from day one so the weather source can be replaced later without large frontend changes. The frontend must never depend on raw third-party response shapes; provider logic should live behind backend adapters with a simple interface such as `searchLocations(query)` and `getWeatherSnapshot(location, units)`.

### Alternatives worth keeping in mind

- WeatherAPI.com
- OpenWeather
- Visual Crossing

---

## 6. AI recommendations feature

### Purpose

Help users answer: **“Given today’s weather in this place, what should I do?”**

### MVP shape

- Tourist-friendly, generic activity suggestions
- Based on current weather and the selected day’s forecast
- No real venues, maps, booking links, or local business data
- Return **3 suggestions**

### Suggestion fields

- `title`
- `description`
- `type`: `indoor | outdoor | flexible`
- `reasonTag`: `rainy | sunny | hot | cold | windy | mixed`

### UI placement

- Place the recommendation block **above the Daily forecast**
- Keep it visible but secondary to the core weather content
- Use a simple title such as **Suggestions for today**

### Guardrails

- Practical, short, tourist-friendly suggestions
- No invented venues or unsupported local claims
- No risky advice

### Fallback rule

If Gemini fails or returns weak output, return deterministic rule-based suggestions instead. Examples:

- rain → museum, café, indoor shopping
- sunny + mild → park walk, sightseeing, beach if context supports it
- very hot → shaded walk, museum, café
- cold / windy → museum, indoor market, coffee shop

---

## 7. Frontend vs backend responsibilities

### Decision

- **Start with backend from day one**
- Frontend talks only to our API, never directly to weather providers or Gemini

### Frontend

- UI rendering
- search interactions
- units selection
- feature-level state
- rendering normalized weather and recommendation models

### Backend

- weather provider integration
- Gemini integration
- response normalization
- validation and error mapping
- recommendation fallback logic
- optional caching later

### Boundary rule

The frontend must know only our **app-level contract**, not provider-specific fields.

---

## 8. Architecture and repo structure

### Decision

Use a lean monorepo with **2 apps + 1 shared package**.

### Root structure

```txt
weather-app-plus-recommendations/
├─ apps/
│  ├─ web/
│  └─ api/
├─ packages/
│  └─ contracts/
├─ docs/
├─ frontend-mentor/
├─ package.json
├─ tsconfig.base.json
└─ README.md
```

### API structure

```txt
apps/api/src/
├─ app/
├─ modules/
│  ├─ locations/
│  ├─ weather/
│  └─ recommendations/
├─ lib/
└─ index.ts
```

### Frontend structure

```txt
apps/web/src/
├─ app/
├─ assets/
├─ components/ui/
├─ features/
│  ├─ location-search/
│  ├─ weather/
│  └─ recommendations/
├─ lib/
├─ routes/
├─ services/api/
├─ styles/
├─ router.tsx
└─ routeTree.gen.ts
```

### Shared package

Use `packages/contracts` for shared schemas and inferred types. Avoid extra shared packages until they are clearly needed.

---

## 9. Data models and API contract

### Core models

- `LocationOption`
- `WeatherUnits`
- `CurrentWeather`
- `HourlyForecastItem`
- `ForecastDay`
- `ActivitySuggestion`
- `WeatherPageResponse`

### Key fields

- `LocationOption`: `id`, `name`, `region?`, `country`, `latitude`, `longitude`, `timezone`
- `WeatherUnits`: `temperature`, `windSpeed`, `precipitation`
- `CurrentWeather`: `temperature`, `feelsLike`, `humidity`, `windSpeed`, `precipitation`, `conditionCode`, `conditionLabel`, `iconKey`, `observedAt`
- `ForecastDay`: `date`, `dayLabel`, `minTemperature`, `maxTemperature`, `iconKey`, `conditionCode`, `hourly[]`
- `ActivitySuggestion`: `title`, `description`, `type`, `reasonTag`

`WeatherPageResponse` example shape:

```ts
{
  location,
  units,
  current,
  daily,
  recommendations: {
    items,
    source,
  },
}
```

### Route shape

- `GET /api/locations/search?q=...`
- `GET /api/weather?lat=...&lon=...&tempUnit=...&windUnit=...`

### Contract rule

Keep provider-specific fields out of the frontend. Provider swaps should mostly affect backend adapters and mappers.

---

## 10. Styling strategy

### Decision

Use **CSS Modules + global design tokens with CSS custom properties**.

### Global styles

```txt
apps/web/src/styles/
├─ reset.css
├─ tokens.css
├─ globals.css
└─ utilities.css
```

### Rules

- Colocate component styles with `.module.css`
- Use simple class names such as `.root`, `.header`, `.item`, `.selected`
- Mobile-first by default
- Prefer semantic selectors such as `:focus-visible`, `[aria-selected='true']`, `[data-state='loading']`
- Avoid Tailwind, CSS-in-JS, and large utility systems for this project

### Token categories

- colors
- spacing
- typography
- radius
- shadows
- transitions
- content width

### Breakpoint guidance

- tablet: `48rem`
- desktop: `75rem`

Align final token values to the Figma palette during implementation.

---

## 11. Error handling and resilience

- `no results` must look different from `API/server error`
- If a new search fails after a prior success, prefer preserving the old result while surfacing the new error clearly
- Recommendation issues should be absorbed by backend fallback logic whenever possible
- Unit changes should refetch normalized backend data instead of converting values in the frontend
- Hourly day switching should remain local UI state

---

## 12. Quality standards and testing scope

### Quality baseline

- TypeScript strict mode
- ESLint
- No unchecked `any`
- Accessible form controls and visible focus states

### Testing stack

- Vitest
- React Testing Library
- MSW when frontend API mocking is useful

### Focus the tests on

- weather mappers / normalization
- recommendation fallback rules
- AI vs fallback orchestration
- route contract tests for `/api/locations/search` and `/api/weather`
- key frontend flows:
  - empty first-load state
  - ambiguous search flow
  - no-results state
  - API error state
  - unit change refetch
  - hourly day switching
  - recommendation rendering with fallback data

### Skip for MVP

- heavy snapshot testing
- broad presentational component testing
- browser E2E unless added later as a stretch goal

---

## 13. Deployment plan

### Decision

- **Frontend (**``**) on Vercel**
- **Backend (**``**) on Render**

### Deployment sequence

1. Deploy `apps/web` to Vercel
2. Deploy `apps/api` to Render
3. Point `VITE_API_BASE_URL` to the API URL
4. Configure CORS
5. Verify production flows
6. Add custom domains
7. Add `render.yaml` after the first successful manual deploy

### Environment strategy

- local
- preview
- production

### Key variables

- Frontend: `VITE_API_BASE_URL`
- Backend: `PORT`, `GEMINI_API_KEY`, CORS config, provider config if needed later

### URL direction

- Frontend: `www.your-domain.com`
- API: `api.your-domain.com`

---

## 14. Delivery roadmap

### Phase 1 — Foundation (1–3)

1. **Monorepo setup** — workspace, root config, scripts, README
2. **Contracts + API skeleton** — shared schemas, backend bootstrap, placeholder routes
3. **Frontend scaffold** — Vite app, styling foundation, empty initial state, base UI primitives

### Phase 2 — Core Product (4–8)

4. **Location search flow** — geocoding integration, search form, ambiguous results, no-results state
5. **Weather integration** — current weather, metrics, daily + hourly forecast, API error state
6. **Units + day switching** — units dropdown, refetch flow, local hourly day selection
7. **Recommendation fallback** — deterministic suggestions and UI block above daily forecast
8. **Gemini integration** — AI provider, output normalization, automatic fallback

### Phase 3 — Quality & Shipping (9–11)

9. **Testing pass** — protect normalized contracts, fallback logic, and key frontend flows
10. **Responsive/accessibility polish** — refine layout, states, and keyboard behavior
11. **Deployment + README** — ship both apps and document architecture, setup, and tradeoffs

### Working rule

Build in this order:

1. make it work
2. make it clean
3. make it polished

