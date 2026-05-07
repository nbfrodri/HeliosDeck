---
layout: lesson
title: 'Individual Project: Geophysical Aggregator'
slug: geophysical-aggregator-project
category: react
tags:
 [
  react,
  react-router,
  declarative-mode,
  framework-mode,
  ssr,
  react-query,
  i18n,
  authentication,
  geophysics,
  public-api,
  deployment,
  individual-project,
 ]
week: 12
phase: 3
sprint: 13
date: 2026-05-05
author: 'Rubén Vega Balbás, PhD'
lang: en
permalink: /lessons/en/react/geophysical-aggregator-project/
status: draft
---

<!-- prettier-ignore-start -->

## 📋 Table of Contents

{: .no_toc }

- TOC
  {:toc}

<!-- prettier-ignore-end -->

> _"Data without a frame is noise. A good interface is the lens through which the Earth speaks to the user."_
> — Tao of the Webapp Master

---

## Overview

This is an **individual project assignment** that synthesises the React curriculum into a single deployable application. You will build a **Geophysical Aggregator** — a web app that fetches, displays, and contextualises real-time or near-real-time data from public geophysical APIs.

The project is framed as a realistic professional brief: a small dashboard product a field scientist or emergency manager might use to monitor geophysical activity. You are both the engineer and the designer of its architecture.

**You choose one of two implementation tracks.** Both tracks share the same data requirements, AI usage policy, and evaluation rubric. They differ in architecture — one is a client-side SPA, the other is a server-rendered app. Pick the track that matches your current confidence and the lessons you have completed.

---

## Choosing your track

| | **Track A — Declarative SPA** | **Track B — Framework Mode SSR** |
|---|---|---|
| **React Router mode** | Declarative (`BrowserRouter` / `createBrowserRouter`) | Framework Mode (`ssr: true`, `routes.js`, route modules) |
| **Auth pattern** | JWT + `localStorage` / `sessionStorage`; `AuthContext` + `useAuth`; client-side `ProtectedRoute` | httpOnly cookie session; `createCookieSessionStorage`; `requireUser` in loader |
| **Data loading** | React Query for all fetching; no server-side loaders | SSR loader for first paint; React Query for polling and user-triggered refresh |
| **i18n** | Client-side locale state (URL param or context) | Server-resolved locale from `:locale` URL segment |
| **Departure point** | The `react-auth-sprint-10` sandbox from [Authentication](../react-authentication/) | The `helios-deck-fw` app from [Framework Mode in practice](../react-framework-mode-auth-i18n/) |
| **Prerequisite lessons** | Routing (L8) + Authentication (L9) | Routing (L8) + Auth (L9) + Framework Mode Auth & i18n (L10b) |
| **Deployment** | Any static host (Netlify, Vercel, GitHub Pages) or Node host | Node.js process required (Railway, Render, Fly.io, Vercel with adapter) |

> **Still deciding?** If you have not completed the Framework Mode lesson, choose **Track A**. Track A still requires React Query, real APIs, auth, and deployment — it is not the easier path, just the different architecture.

---

## Track A — Declarative SPA

### Departure point

Your starting point is the **`react-auth-sprint-10`** sandbox built in the [Authentication: From Mock to Real](../react-authentication/) lesson. It already provides:

- `BrowserRouter` + `App.jsx` with pre-wired routes
- `AuthContext` + `useAuth` with JWT login/logout against dummyjson
- `ProtectedRoute` that redirects anonymous users and preserves `location.state.from`
- Token refresh on 401 in the fetch interceptor
- Tailwind v4 styling

You will **extend** that sandbox — wiring in React Query, adding geophysical data pages, replacing dummyjson data calls with real public APIs, and adding a visualisation layer.

> You do **not** need to rebuild the auth plumbing. Fork your repo from the lesson sandbox, then build on top of it.

---

### Track A — Mandatory requirements

| Requirement | Notes |
|---|---|
| React Router v7 **Declarative mode** | `BrowserRouter` or `createBrowserRouter`; routes declared in JSX or config |
| At least **two public geophysical APIs** | One must return time-series or event-list data; one must return geographic coordinates suitable for a map or chart |
| **React Query** for all data fetching | At least one `useQuery` with meaningful `staleTime`; at least one cache key that changes with user input |
| **Client-side i18n** in at least two languages | Locale in URL param or context; all UI strings translated; language switch without page reload |
| **JWT authentication** on at least one route | `AuthContext`; httpOnly-equivalent protection via token; `ProtectedRoute` guards at least one page |
| **Public deployment** with working URL | Works without local setup; demo credentials in README |
| **GitHub repository** with clean history | No secrets committed; `.env.example` present; meaningful commit messages |

---

### Track A — Architecture guide

```
src/
  main.jsx                          ← BrowserRouter + QueryClientProvider + AuthProvider
  App.jsx                           ← Routes + ProtectedRoute wiring
  contexts/
    AuthContext.jsx                 ← login, logout, user, isLoading
  services/
    authApi.js                      ← login/logout/me against dummyjson
    earthquakesApi.js               ← USGS or other geophysical API
    weatherApi.js                   ← Open-Meteo or similar
  hooks/
    useEarthquakes.js               ← useQuery wrapper; exported for reuse
    useWeather.js
  pages/
    Home.jsx                        ← dashboard landing
    Login.jsx
    Dashboard.jsx                   ← protected; React Query data
    Earthquakes.jsx
    [YourSecondApi].jsx
  components/
    ProtectedRoute.jsx              ← from auth lesson; unchanged
    EarthquakeList.jsx
    MagnitudeChart.jsx
    NavBar.jsx
  locales/
    en.json
    es.json
  i18n.js                           ← locale context + useTranslation hook
```

#### Where React Query fits in Track A

In declarative mode, React Query is the **only** data layer — there are no server-side loaders. Every page that shows geophysical data must use `useQuery`. The auth state comes from `AuthContext`, not from a loader.

```js
// Excerpt — Track A: React Query in a protected page
// src/pages/Earthquakes.jsx

import { useQuery } from '@tanstack/react-query';
import { getRecentEarthquakes } from '../services/earthquakesApi';
import { useAuth } from '../contexts/AuthContext';

export default function Earthquakes() {
	const { user } = useAuth();

	const { data, isLoading, isError } = useQuery({
		queryKey: ['earthquakes', { minMagnitude: 5, days: 7 }],
		queryFn: () => getRecentEarthquakes({ minMagnitude: 5, days: 7 }),
		staleTime: 5 * 60 * 1000,
		refetchInterval: 5 * 60 * 1000,
	});

	if (isLoading) return <p>Loading earthquakes…</p>;
	if (isError) return <p>Failed to load data. Try again later.</p>;

	return (/* render data.features */);
}
```

Services in Track A are plain async functions — no `.server.js` convention, no Node.js-only APIs.

---

### Track A — Client-side i18n pattern

```js
// Excerpt — minimal i18n context
// src/i18n.js
import { createContext, useContext, useState } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';

const translations = { en, es };
const I18nContext = createContext();

export function I18nProvider({ children }) {
	const [locale, setLocale] = useState('en');
	const t = key => translations[locale]?.[key] ?? key;
	return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export const useTranslation = () => useContext(I18nContext);
```

Reflect the locale in the URL so links are shareable: `/en/earthquakes`, `/es/earthquakes`. Use a `/:lang/*` route segment and sync it to the context on navigation.

---

## Track B — Framework Mode SSR

### Departure point

Your starting point is the **`helios-deck-fw`** app built in the [Framework Mode in practice: SSR auth & i18n](../react-framework-mode-auth-i18n/) lesson. It already provides:

- React Router v7 Framework Mode with SSR enabled
- `createCookieSessionStorage` with httpOnly cookie session
- `requireUser` / `requireRole` server-side guards
- `:locale` bilingual route tree (`/en/...`, `/es/...`)
- `i18n.server.js` locale resolution + JSON translation files
- Tailwind v4 styling

You will **extend** that scaffold — renaming the app, wiring in React Query, replacing the dummyjson data layer with real public APIs, and adding a visualisation layer.

> You do **not** need to rebuild the auth plumbing. Fork your own repo from the lesson template, then build on top of it.

---

### Track B — Mandatory requirements

| Requirement | Notes |
|---|---|
| React Router v7 **Framework Mode** | `react-router.config.js` with `ssr: true`; routes defined in `routes.js` |
| At least **two public geophysical APIs** | One must return time-series or event-list data; one must return geographic coordinates suitable for a map or chart |
| **React Query** for client-side data management | At least one `useQuery` with meaningful `staleTime`; at least one cache key that changes with user input |
| **Server-side i18n** in at least two languages | Server-resolved locale from URL param; all UI strings translated |
| **httpOnly cookie authentication** on at least one route | `createCookieSessionStorage`; `requireUser` or equivalent in the loader |
| **Public deployment** with working URL | App must run without local setup; demo credentials in README |
| **GitHub repository** with clean history | No secrets committed; `.env.example` present; meaningful commit messages |

---

### Track B — Architecture guide

```
app/
  routes.js                     ← central registry; /:locale/* tree + resource routes
  root.jsx                      ← HTML shell; root loader returns { locale, user }
  utils/
    session.server.js           ← cookie read/write + requireUser/requireRole
    i18n.server.js              ← locale resolution + tFor(locale)
    authApi.server.js           ← login, refresh, verifyOrRefresh
    earthquakesApi.server.js    ← (or whichever APIs you choose)
    weatherApi.server.js
  locales/
    en.json
    es.json
  routes/
    $locale/
      _index.jsx                ← dashboard home; links to all features
      login.jsx                 ← loader + action
      dashboard.jsx             ← protected; calls ≥1 API service in loader
      earthquakes.jsx           ← public or protected; data page
      [your-second-api].jsx
    logout.js
    api/
      healthz.js
      [optional proxy routes]
  components/
    EarthquakeList.jsx
    MagnitudeChart.jsx
    [your components]
```

#### Where React Query fits in Track B

React Router loaders handle **initial SSR data** (critical for first paint, SEO, auth guards). React Query handles **client-side polling, user-triggered refreshes, and derived queries** — data that changes while the user is on the page.

```js
// Excerpt — Track B: mixing loader data and React Query
// app/routes/$locale/earthquakes.jsx

export async function loader({ request, params }) {
	const user = await getOptionalUser(request);
	const initial = await getRecentEarthquakes({ minMagnitude: 5, days: 7 });
	return { initial, user, locale: params.locale };
}

export default function Earthquakes({ loaderData }) {
	const { initial, locale } = loaderData;

	const { data, isRefetching } = useQuery({
		queryKey: ['earthquakes', 5, 7],
		queryFn: () => fetch('/api/earthquakes?min=5&days=7').then(r => r.json()),
		initialData: initial,
		staleTime: 5 * 60 * 1000,
		refetchInterval: 5 * 60 * 1000,
	});

	return (/* ... */);
}
```

The `/api/earthquakes` route is a **resource route** in `routes.js` that returns JSON — the client calls it; the loader hydrates the first render.

---

## Shared requirements (both tracks)

The following requirements are identical regardless of which track you choose.

### Geophysical APIs

You must integrate **at least two public APIs from different domains** (seismology, meteorology, oceanography, volcanology, air quality). Both tracks can use the same APIs.

### React Query

Both tracks must use `@tanstack/react-query`. Track A uses it for all data; Track B uses it for live polling on top of SSR initial data.

### Visualisation

Both tracks should include **at least one chart** (time series of magnitudes, tide heights, or temperature) and ideally **one map** (earthquake epicentres or station locations). See the libraries table in the [Extension features](#extension-features-optional-but-encouraged) section.

### GitHub repository

- Public (or private with instructor as collaborator)
- Branch: `main` (deployable)
- No secrets in commit history; `.env.example` with all required variable names
- Meaningful commit messages (not `wip`, `final`, `final2`)
- `README.md` at the root — see template below

### Deployed application

- URL publicly accessible without local setup
- Demo credentials provided in the README (or a clearly labelled demo/guest mode)
- `npm run build && npm run start` (Track B) or `npm run build && serve -s dist` (Track A) succeeds locally before submission

---

## Recommended API catalogue

All APIs listed here are public and free — most require no API key for moderate request rates. Pick at least two from different categories.

> **Code block note:** The fetch examples below are **Excerpt** blocks — they are illustrative service function bodies. In Track B, place them inside a `.server.js` module and call from a route loader. In Track A, they are plain async functions in `src/services/`.

### Seismology

**USGS Earthquake Hazards Program**

Base URL: `https://earthquake.usgs.gov/fdsnws/event/1/`

```js
// Excerpt — earthquakesApi (Track A: src/services/earthquakesApi.js | Track B: app/utils/earthquakesApi.server.js)
export async function getRecentEarthquakes({ minMagnitude = 4.5, days = 7 } = {}) {
	const endtime = new Date().toISOString().slice(0, 10);
	const starttime = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
	const url = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
	url.searchParams.set('format', 'geojson');
	url.searchParams.set('starttime', starttime);
	url.searchParams.set('endtime', endtime);
	url.searchParams.set('minmagnitude', String(minMagnitude));
	url.searchParams.set('orderby', 'time');
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`USGS API ${res.status}`);
	return res.json(); // GeoJSON FeatureCollection
}
```

Returned data includes `geometry.coordinates` (lon, lat, depth), `properties.mag`, `properties.place`, and `properties.time` (Unix ms). Ideal for a map overlay and a magnitude histogram.

---

**IRIS DMC / FDSN Earthquake API** (alternative or complement to USGS)

Base URL: `https://service.iris.edu/fdsnws/event/1/`

Same FDSN protocol as USGS — you can swap the base URL. Useful for older catalog depth or regional filters not available in USGS.

---

### Meteorology & Atmosphere

**Open-Meteo** (no API key required)

Base URL: `https://api.open-meteo.com/v1/forecast`

```js
// Excerpt — weatherApi (Track A: src/services/weatherApi.js | Track B: app/utils/weatherApi.server.js)
export async function getForecast({ lat, lon, days = 7 }) {
	const url = new URL('https://api.open-meteo.com/v1/forecast');
	url.searchParams.set('latitude', String(lat));
	url.searchParams.set('longitude', String(lon));
	url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max');
	url.searchParams.set('forecast_days', String(days));
	url.searchParams.set('timezone', 'auto');
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
	return res.json();
}
```

Returned `daily` arrays are perfect for a line/area chart. Pair with USGS events to show weather conditions at the time and place of a seismic event.

---

**OpenWeatherMap Current & Forecast** (free tier, API key required)

Register at openweathermap.org. Free tier includes current conditions, 5-day forecast, and air quality index. Useful if you want a richer weather widget alongside geophysical data.

---

### Oceanography & Sea Level

**NOAA Tides and Currents**

Base URL: `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter`

```js
// Excerpt — tidesApi
export async function getTidePredictions({ stationId, days = 2 }) {
	const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const url = new URL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter');
	url.searchParams.set('begin_date', today);
	url.searchParams.set('range', String(days * 24));
	url.searchParams.set('station', stationId);
	url.searchParams.set('product', 'predictions');
	url.searchParams.set('datum', 'MLLW');
	url.searchParams.set('time_zone', 'GMT');
	url.searchParams.set('interval', 'h');
	url.searchParams.set('units', 'metric');
	url.searchParams.set('application', 'geo-aggregator');
	url.searchParams.set('format', 'json');
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`NOAA Tides ${res.status}`);
	return res.json();
}
```

Station IDs: San Francisco = `9414290`, New York = `8518750`.

---

### Volcanology

**GeoNet (New Zealand) Earthquake & Volcano API**

Base URL: `https://api.geonet.org.nz`

```js
// Excerpt — geonetApi
export async function getVolcanicAlerts() {
	const res = await fetch('https://api.geonet.org.nz/volcano/val');
	if (!res.ok) throw new Error(`GeoNet ${res.status}`);
	return res.json();
}

export async function getNZEarthquakes({ pastHours = 48 } = {}) {
	const res = await fetch(`https://api.geonet.org.nz/quake?MMI=3`);
	if (!res.ok) throw new Error(`GeoNet quakes ${res.status}`);
	return res.json();
}
```

New Zealand Volcanic Alert Levels (0–5) per volcano — compact, easy to display as a status board.

---

### Air Quality

**OpenAQ** (no API key for basic queries)

Base URL: `https://api.openaq.org/v3/`

```js
// Excerpt — airQualityApi
export async function getLatestMeasurements({ locationId }) {
	const res = await fetch(`https://api.openaq.org/v3/locations/${locationId}/latest`);
	if (!res.ok) throw new Error(`OpenAQ ${res.status}`);
	return res.json();
}
```

---

### Combining APIs — suggested pairings

| Pairing | Teaching value |
|---|---|
| USGS Earthquakes + Open-Meteo | Time series + event map; two different temporal resolutions |
| USGS Earthquakes + GeoNet Volcanic Alerts | Event list + status board; contrasting data shapes |
| NOAA Tides + Open-Meteo | Continuous time series from two independent sources |
| GeoNet Earthquakes + OpenAQ | Geographic filtering; real-time vs. periodic polling |

---

## Extension features (optional but encouraged)

These are **not graded as required**, but a project that includes one or more demonstrates genuine mastery.

### Framer Motion interactions

```js
// Excerpt — animated earthquake row
import { motion, AnimatePresence } from 'framer-motion';

function EarthquakeRow({ quake }) {
	return (
		<motion.li
			layout
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.25 }}
		>
			{/* row content */}
		</motion.li>
	);
}
```

---

### Data visualisation libraries

| Library | Strength | Install |
|---|---|---|
| **Recharts** | Simple React-native charts; composable; good for line/area/bar | `npm i recharts` |
| **Visx** (Airbnb) | D3-powered but React-friendly; precise control | `npm i @visx/xychart @visx/scale` |
| **Chart.js + react-chartjs-2** | Mature; large plugin ecosystem | `npm i chart.js react-chartjs-2` |
| **Leaflet + react-leaflet** | Interactive maps; tile layers; custom markers | `npm i leaflet react-leaflet` |
| **Mapbox GL JS** | High-performance WebGL map; 3D terrain | `npm i mapbox-gl` |
| **deck.gl** | Large-scale geospatial data layers | `npm i deck.gl` |

---

### Track B only: Role-gated admin panel

Extend the `admin` route from the lesson scaffold to show aggregated statistics only visible to `admin`-role users: event counts by region, API health status, or a raw data inspector.

---

### Dark mode + theme tokens

Add a `theme.css` with CSS custom properties and a theme preference toggle. Track B can resolve theme from a cookie to avoid flash of incorrect content.

---

### Service Worker + offline fallback

Cache the last successful API response with a Workbox-based service worker. When the network is unavailable, show a "Last known data" banner and render stale data.

---

## AI usage policy

This project is built under the Web Atelier **docs-first, AI-as-amplifier** methodology described in full at [/methodology/en/ai-practical-guide/](/methodology/en/ai-practical-guide/). The rules below are grading criteria, not suggestions.

### The non-negotiables

| Rule | Why it matters |
|---|---|
| **Understand every line you submit** | You are responsible for the code, not the model. If you cannot explain a function in your own words, it does not belong in your repo. |
| **Document AI usage transparently** | Undisclosed AI-generated code submitted as original work is an academic integrity violation. |
| **No secrets in prompts** | Never paste `SESSION_SECRET`, API tokens, or credentials into a chat interface. |
| **Verify security** | AI does not know your threat model. Every auth-related piece of code must be understood and verified by you before submission. |

### The docs-first workflow

For every non-trivial feature (anything touching more than one file, or taking more than 15 minutes):

**Phase 1 — Plan before you code.** Create `docs/plans/plan-[feature].md` before asking AI to implement anything. Include: what you are building, why, the phases, and success criteria. Ask AI to review the plan for gaps — but approve it yourself before proceeding.

**Phase 2 — Implement with a report.** After each AI-assisted implementation phase, ask AI to generate an implementation report and save it to `docs/reports/YYYY-MM-DD-[phase].md`. The report must document: files changed, decisions made, potential issues, and what you verified.

**Minimum documentation expected at submission:**

```
docs/
  plans/
    plan-[feature1].md        ← written before coding started
    plan-[feature2].md
  reports/
    YYYY-MM-DD-[phase1].md    ← generated after each AI session
    YYYY-MM-DD-[phase2].md
```

You do not need a plan for: fixing a typo, adjusting a colour, or changing a single config value. You do need one for: adding a new page, wiring a new API, implementing a query hook, or changing the auth flow.

### Inline disclosure

Mark AI-assisted code at the function level when the AI's contribution was non-trivial:

```js
// Excerpt — inline AI disclosure convention
/**
 * Builds the USGS query URL with dynamic time range and magnitude filter.
 * @ai-assisted Claude proposed the URLSearchParams pattern; reviewed against
 *              the USGS FDSN spec at earthquake.usgs.gov/fdsnws/event/1/.
 */
export function buildUSGSUrl({ minMagnitude, days }) {
	// ...
}
```

### The verification checklist

Before submitting, confirm each item for every AI-generated piece of code:

- [ ] I can explain what this code does
- [ ] I understand why it is written this way
- [ ] I have tested it manually in the browser
- [ ] I have checked for security issues (especially in auth and cookie handling)
- [ ] I have verified edge cases (empty data, API errors, expired session)
- [ ] I have documented the AI assistance (inline comment or report)

### README AI disclosure (mandatory)

**Template** — add to your `README.md` under its own heading.

```markdown
## AI assistance disclosure

This project was developed with AI assistance (Claude / ChatGPT / Copilot — specify which).

**AI was used for:**
- [List specific uses: scaffolding service functions, suggesting React Query patterns,
  debugging loader data flow, generating translation strings, etc.]

**Human verification:**
- All code has been read, understood, and tested by the author
- Auth and cookie handling was verified against the lesson spec and OWASP guidelines
- The author takes full responsibility for the final implementation

**Docs-first plans:** see `docs/plans/`
**Implementation reports:** see `docs/reports/`
```

### Prompts that align with the methodology

**Before you build — the Architect prompt:**

> "I need to implement [feature] for a React Router v7 [Declarative / Framework Mode] app. Before writing code, propose 2–3 architectural approaches, compare their trade-offs, and recommend one. Do not write code yet."

**When you are stuck — the Rubber Duck prompt:**

> "I have a bug. Expected: [description]. Actual: [description]. Code: [paste]. Do not give me the answer immediately. Ask me questions that help me discover the bug."

**After each session — the Report Generator prompt:**

> "Based on the changes we just made, generate an implementation report: files changed and why, key decisions, potential issues or tech debt, and what I should verify manually."

### Ethical framework

Web Atelier AI usage is grounded in the [ACM Code of Ethics](https://www.acm.org/code-of-ethics) and the [UNESCO Recommendation on the Ethics of AI (2021)](https://www.unesco.org/en/artificial-intelligence/recommendation-ethics).

- **Proportionality** — use AI where it amplifies your learning, not where it replaces it.
- **Transparency and explainability** — your README disclosure and `docs/` folder are your transparency artefacts.
- **Human oversight** — you approve every diff. "The AI wrote it" is not an explanation of a bug.
- **Environmental awareness** — ask intentionally. Favour documentation lookup over AI regeneration for things you already know.

> _"AI is not the destination. AI is the compass that helps us navigate toward human flourishing."_
> — Web Atelier Methodology

---

## Deployment decision guide

### Track A — static or Node host

Track A produces a static bundle (`dist/`) that can be served from any static host. If your app has no server-side routes (all API calls go directly to third-party APIs from the browser), you can use:

| Platform | Effort | Free tier | Notes |
|---|---|---|---|
| **Netlify** | Very low | Yes | Drag-and-drop or GitHub deploy; custom domains; no sleep. Handles SPA routing natively. |
| **Vercel** | Very low | Yes | `vercel deploy`; excellent DX; automatic HTTPS. Handles SPA routing natively. |
| **GitHub Pages** | Low | Yes | `gh-pages` branch; no custom server logic. **Requires extra config — see below.** |
| **Railway / Render** | Low | Yes | Can serve static files if you add a small Express/Node server. |

> **Track A caveat:** If your auth provider requires a secret (e.g., a token exchange that must not happen in the browser), you will need a small server proxy. In that case, use Railway or Render just like Track B.

---

### Deploying Track A to GitHub Pages — the refresh problem

GitHub Pages serves static files from `dist/`. When a user navigates directly to `https://yourname.github.io/your-repo/earthquakes` or refreshes that page, GitHub Pages looks for a file at `dist/earthquakes/index.html`, finds nothing, and returns a **404**.

This is not a bug in your code — it is a fundamental mismatch between client-side routing and a static file server that has no concept of "send `index.html` for every path."

**You have two options. Choose one before you build.**

#### Option 1 — HashRouter (simplest, no config)

Swap `BrowserRouter` for `HashRouter`. All routes move behind a `#`:

- `/earthquakes` → `/#/earthquakes`
- `/en/dashboard` → `/#/en/dashboard`

```js
// CodeSandbox-ready — src/main.jsx (HashRouter variant)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
);
```

No other changes needed — `<Routes>`, `<Route>`, `<Link>`, `useNavigate` all work identically.

**Trade-off:** URLs contain `#`. Shareable links work; the fragment is never sent to the server so refreshes always land on `index.html`. Locale URL segments (`/#/en/earthquakes`) still work.

---

#### Option 2 — 404.html redirect (clean URLs, more config)

GitHub Pages serves `404.html` for any unknown path. A script in that file encodes the full URL into a query string, redirects to `index.html`, and a matching script in `index.html` reconstructs the original URL before React Router boots. Clean `/en/earthquakes` URLs survive refresh.

**Step 1** — Create `public/404.html`:

```html
<!-- Template — public/404.html
     Replace REPO_SEGMENT_COUNT with 1 if deploying to a repo page
     (yourname.github.io/your-repo/) or 0 if deploying to a user/org page
     (yourname.github.io/). -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <script>
      var segmentCount = 1; // ← set to 0 for user/org pages
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + segmentCount).join('/') +
        '/?/' +
        l.pathname.slice(1).split('/').slice(segmentCount).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
</html>
```

**Step 2** — Add this snippet to `index.html` **before** your Vite `<script>` tag:

```html
<!-- Template — add inside <head> in index.html -->
<script>
  (function (l) {
    if (l.search[1] === '/') {
      var decoded = l.search.slice(1).split('&').map(function (s) {
        return s.replace(/~and~/g, '&');
      });
      window.history.replaceState(
        null, null,
        l.pathname.slice(0, -1) + decoded[0] +
        (decoded[1] ? '?' + decoded[1] : '') +
        l.hash
      );
    }
  }(window.location));
</script>
```

**Step 3** — Set the Vite `base` to your repo name (required for all GitHub Pages repo deploys):

```js
// Template — vite.config.js
// Replace 'your-repo-name' with your actual GitHub repository name.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react()],
});
```

> Without `base`, all asset paths (`/assets/index-abc.js`) are absolute from the root. GitHub Pages repo sites live at `/your-repo-name/`, so every asset 404s.

**Step 4** — Deploy with `gh-pages`:

```bash
npm install --save-dev gh-pages
# Add to package.json scripts:
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d dist"
npm run deploy
```

The `gh-pages` package pushes the `dist/` folder to the `gh-pages` branch. GitHub Pages serves from that branch automatically once configured in the repository settings (Settings → Pages → Source: `gh-pages` branch).

**Trade-off:** Clean URLs preserved on refresh. More setup. The `404.html` trick is a widely-used workaround, not an official GitHub Pages feature — it works because GitHub Pages is predictable, not because it was designed for this.

---

**Recommendation:** Use **Netlify or Vercel** if you want clean URLs with zero extra config. Use **HashRouter** if you specifically want GitHub Pages and minimal setup. Use the `404.html` trick only if you have a strong reason to avoid the hash and are comfortable with the extra files.

---

### Track B — Node.js process required

React Router v7 Framework Mode requires a Node.js process — not a static CDN.

| Platform | Effort | Free tier | SSR / Node.js | Notes |
|---|---|---|---|---|
| **Railway** | Low | Yes — $5 credit/month | Native | Always-on; GitHub deploy in ~2 min. **Recommended default.** |
| **Render** | Low | Yes — sleeps after 15 min | Native | Easy setup; add a `/api/healthz` ping to prevent sleep during demo. |
| **Fly.io** | Medium | Yes — 3 shared VMs | Native | More setup (`flyctl launch`); best for persistent apps. |
| **VPS + PM2** | High | Depends | Native | Full control; nginx + PM2 as shown in the Framework Mode lesson. |
| **Vercel** | Low–Medium | Yes | **Requires config** | Works, but needs `@react-router/vercel` adapter and `vercel.json`. See below. |

**Recommended platform for Track B: Railway or Render.** Both deploy a Node.js app from a GitHub repo in under five minutes.

---

### Deploying Track B to Railway

```bash
# 1. Push your repo to GitHub
# 2. railway.app → New Project → Deploy from GitHub repo
# 3. Set environment variables: SESSION_SECRET, NODE_ENV=production
# 4. Railway reads: "start": "react-router-serve ./build/server/index.js"
# 5. Done — Railway gives you a public URL.
```

---

### Deploying Track B to Vercel (extra steps)

Vercel's default Edge runtime does not support the Node.js `crypto` module that `createCookieSessionStorage` needs.

**Step 1** — Install the Vercel adapter:

```bash
npm install @react-router/vercel
```

**Step 2** — Update `react-router.config.js`:

```js
// react-router.config.js
import { vercelPreset } from '@react-router/vercel';

export default {
	ssr: true,
	presets: [vercelPreset()],
};
```

**Step 3** — Add `vercel.json`:

```json
{
	"functions": {
		"build/server/index.js": {
			"runtime": "nodejs22.x"
		}
	}
}
```

**Step 4** — Set env vars: `SESSION_SECRET`, `NODE_ENV=production`, any API keys.

---

### Environment variables — all platforms

| Variable | Required by | Description |
|---|---|---|
| `SESSION_SECRET` | Track B | Random string ≥ 32 chars — `openssl rand -base64 32` |
| `NODE_ENV` | Track B | Set to `production` |
| `MAPBOX_TOKEN` | Either (if using Mapbox) | Public token from mapbox.com — keep in env, not in code |
| `VITE_API_BASE_URL` | Track A | Base URL for any proxy or backend you add |
| Other API keys | Either | OpenWeatherMap, NOAA CDO, etc. |

Document all required variables in `.env.example`. A grader who cannot run `cp .env.example .env && npm run dev` without guessing variable names will mark the setup criterion down.

---

## Submission requirements

### README template

**Template** — `README.md` (replace `[BRACKETED]` values).

```markdown
# [YOUR APP NAME]

> [One sentence describing the application and the geophysical domain it covers.]

## Track

[ ] Track A — Declarative SPA  
[ ] Track B — Framework Mode SSR

## Live demo

URL: [DEPLOYMENT_URL]
Demo credentials: username `[USERNAME]` / password `[PASSWORD]`
(or) Public mode: all routes are accessible without login — no credentials needed.

## APIs used

| API | Endpoint | Data type | Refresh strategy |
| --- | -------- | --------- | ---------------- |
| [API NAME] | [BASE URL] | [e.g. GeoJSON events] | [e.g. React Query, 5 min] |
| [API NAME] | [BASE URL] | [e.g. daily time series] | [e.g. React Query, loader] |

## Tech stack

- React Router v7 [Declarative / Framework Mode]
- React Query v5 (`@tanstack/react-query`)
- Tailwind v4
- [Visualisation / map libraries]
- Deployed on [Netlify / Vercel / Railway / Render / Fly.io / VPS]

## Architecture notes

[2–4 sentences. Where does React Query run? What handles auth? How is locale resolved?]

## Known limitations

[Be honest. Examples: "Polling interval is fixed at 5 min." "Map does not render without JavaScript."]

## Setup

\`\`\`bash
npm install
cp .env.example .env          # fill in secrets and API keys
npm run dev
\`\`\`

Required env vars: see `.env.example`
```

---

## Evaluation rubric

The same rubric applies to both tracks. Track-specific notes appear in parentheses.

| Criterion | Weight | Unsatisfactory | Satisfactory | Excellent |
|---|---|---|---|---|
| **React Router usage** — correct mode, routing, data flow | 20% | Wrong mode; no separation between routing and data | Routes correctly configured for chosen mode; data loaded via loaders (B) or query hooks (A) | Full route tree; nested layouts; auth guard at route level; (B) resource routes for API |
| **React Query integration** | 15% | No React Query; raw `useEffect` for fetching | `useQuery` in at least one page; `staleTime` configured | Multiple queries; cache keys change with filters; (B) `initialData` from SSR loader |
| **Public geophysical APIs** — two distinct sources | 15% | Fewer than two APIs; mock data | Two APIs integrated, data visible in UI | Two APIs with meaningful cross-domain presentation; data shapes documented |
| **Authentication** — track-appropriate pattern | 15% | No auth; or client-side guard with no server backup | (A) JWT in storage + `ProtectedRoute`; (B) httpOnly cookie + `requireUser` | (A) Token refresh on 401; role guard; (B) `Set-Cookie` on login/logout; `?from=` redirect; session verified per request |
| **i18n** — bilingual UI, locale routing | 10% | Hardcoded strings; no locale routing | (A) Locale in URL param; `en.json` / `es.json`; switch works; (B) Server-resolved `:locale`; `tFor` in loaders | All strings translated; locale persists; switch without reload |
| **Deployment** — public URL, working build | 10% | No deployment or local-only | App at public URL; build passes locally | HTTPS; no exposed secrets; (B) one-command redeploy or CI/CD |
| **Code quality & architecture** — service layer, file structure | 10% | Services mixed into components; secrets in components | Dedicated service layer; components receive data via props / query hooks | Clean separation; no dead code; meaningful commits; `.env.example` present |
| **README, docs-first artefacts & AI disclosure** | 5% | No README; no AI disclosure; no plans or reports | README complete; AI disclosure present; at least one `docs/plans/` file | `docs/plans/` + `docs/reports/` present; inline `@ai-assisted` comments; verification checklist demonstrably followed |

**Total: 100%**

> A project that meets every *Satisfactory* criterion across all rows will receive a passing grade. The *Excellent* column is for distinction.

---

## Frequently asked questions

**Which track should I choose?**
Choose Track A if you have not yet completed the Framework Mode Auth & i18n lesson. Choose Track B if you have. Track A is not simpler — it requires the same APIs, React Query, auth, i18n, and deployment — it just uses a different architectural layer.

**Can I mix patterns from both tracks?**
No. Choose one track and follow its conventions consistently. A submission that mixes `BrowserRouter` with `createCookieSessionStorage` or SSR loaders with localStorage tokens will not receive credit in the architecture criterion.

**Can I use a different auth provider?**
Track A: yes — any provider that returns a JWT or session token (GitHub OAuth, Auth0 free tier, Firebase Auth) is acceptable. Track B: yes — any server-side-callable provider that can store a session token in an httpOnly cookie. Document your choice in the README.

**Can I add TypeScript?**
Yes. Both lesson scaffolds use plain JavaScript, but you may migrate. TypeScript does not add or subtract from grading criteria.

**Can I use a different CSS framework?**
Yes, as long as the result looks deliberate. Tailwind is the default; shadcn/ui, Radix UI, or custom CSS are acceptable. Document your choice.

**What deployment platforms are accepted?**
Track A: Netlify, Vercel, GitHub Pages, Railway, Render, or any host that can serve a static bundle (or a small Node server if you need a proxy). Track B: any platform that can run a Node.js process — Railway, Render, Fly.io, Heroku, a VPS (nginx + PM2), or Vercel with the adapter.

**Can I work in a team?**
No — this is an individual assignment. Commit history must reflect individual authorship.

---

## Resources

- **React Router v7 Declarative mode** — [reactrouter.com/start/declarative](https://reactrouter.com/start/declarative)
- **React Router v7 Framework Mode** — [reactrouter.com/start/framework](https://reactrouter.com/start/framework)
- **React Query v5 docs** — [tanstack.com/query/latest](https://tanstack.com/query/latest)
- **TanStack Query + React Router SSR** — [tanstack.com/query/latest/docs/framework/react/guides/ssr](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- **USGS Earthquake API** — [earthquake.usgs.gov/fdsnws/event/1/](https://earthquake.usgs.gov/fdsnws/event/1/)
- **Open-Meteo** — [open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **NOAA Tides and Currents API** — [api.tidesandcurrents.noaa.gov/api/prod/](https://api.tidesandcurrents.noaa.gov/api/prod/)
- **GeoNet API** — [api.geonet.org.nz](https://api.geonet.org.nz)
- **OpenAQ v3** — [docs.openaq.org](https://docs.openaq.org)
- **Framer Motion** — [motion.dev/docs](https://motion.dev/docs)
- **Recharts** — [recharts.org](https://recharts.org)
- **react-leaflet** — [react-leaflet.js.org](https://react-leaflet.js.org)
- **Lesson: Routing & Navigation** — [../react-routing/](../react-routing/)
- **Lesson: Authentication** — [../react-authentication/](../react-authentication/)
- **Lesson: Framework Mode in practice** — [../react-framework-mode-auth-i18n/](../react-framework-mode-auth-i18n/)

---

## Closing

> _"A dashboard that shows the Earth's pulse is not decoration. It is an argument: that data, well framed, makes the invisible visible."_

You are not building a toy. You are building the kind of product a scientist opens at 6 a.m. when the seismograph wakes them. Choose your track deliberately. Make it honest. Make it fast. Make it work. Then make it live.

---

## Resumen de la práctica (en español)

### Agregador Geofísico — Proyecto Individual

Construirás una aplicación web que consuma **APIs públicas de datos geofísicos** (sismología, meteorología, oceanografía, vulcanología...) y los presente en un dashboard funcional, desplegado y accesible desde cualquier navegador.

**Tienes dos itinerarios posibles. Elige uno y sígue sus convenciones de forma consistente.**

---

### Itinerario A — SPA declarativa (React Router modo declarativo)

**Punto de partida:** la sandbox `react-auth-sprint-10` de la lección [Autenticación](../react-authentication/). Ya tienes `BrowserRouter`, `AuthContext` con JWT, `ProtectedRoute` y Tailwind v4.

**Requisitos obligatorios (Itinerario A):**

| Requisito | Qué debes entregar |
|---|---|
| React Router v7 **modo declarativo** | `BrowserRouter` o `createBrowserRouter`; rutas en JSX o config |
| Dos APIs geofísicas públicas | De dominios distintos; al menos una con coordenadas geográficas |
| **React Query** para todos los datos | Mínimo un `useQuery` con `staleTime` configurado |
| **i18n en cliente** en dos idiomas | Locale en parámetro URL o contexto; todos los textos traducidos |
| **JWT** en al menos una ruta protegida | `AuthContext`; `ProtectedRoute` |
| Despliegue público | Netlify, Vercel, GitHub Pages, Railway o Render |
| Repositorio GitHub | Sin secretos; `.env.example`; commits legibles |

---

### Itinerario B — SSR con Framework Mode

**Punto de partida:** la app `helios-deck-fw` de la lección [Framework Mode en práctica](../react-framework-mode-auth-i18n/). Ya tienes SSR activado, sesiones con cookie httpOnly, rutas bilingües y Tailwind v4.

**Requisitos obligatorios (Itinerario B):**

| Requisito | Qué debes entregar |
|---|---|
| React Router v7 **Framework Mode** | `ssr: true`; `routes.js`; datos en `loader`, mutaciones en `action` |
| Dos APIs geofísicas públicas | De dominios distintos; al menos una con coordenadas geográficas |
| **React Query** (polling sobre SSR) | `initialData` desde el `loader`; `refetchInterval` configurado |
| **i18n en servidor** en dos idiomas | Locale resuelto desde el parámetro URL (`/en/...`, `/es/...`) |
| **Cookie httpOnly** en al menos una ruta | `requireUser` o equivalente en el loader |
| Despliegue público | Railway, Render, Fly.io, VPS o Vercel (con adaptador) |
| Repositorio GitHub | Sin secretos; `.env.example`; commits legibles |

---

### Qué se entrega (ambos itinerarios)

1. **URL de la aplicación desplegada**
2. **Repositorio GitHub** con rama `main` desplegable
3. **README.md** con: descripción, track elegido, APIs usadas, stack técnico, notas de arquitectura, limitaciones conocidas, instrucciones de setup y **declaración de uso de IA**

---

### Criterios de evaluación (resumen)

| Criterio | Peso |
|---|---|
| React Router — modo correcto, rutas, flujo de datos | 20% |
| React Query (useQuery, staleTime, initialData en Itinerario B) | 15% |
| Dos APIs geofísicas integradas y visibles en la UI | 15% |
| Autenticación — patrón adecuado al itinerario | 15% |
| i18n bilingüe con locale en URL | 10% |
| Despliegue público funcionando | 10% |
| Calidad del código y arquitectura de servicios | 10% |
| README, documentación y uso de IA | 5% |

Un proyecto que alcance el nivel *Satisfactorio* en todos los criterios obtiene nota de aprobado.

---

### Uso de IA (política obligatoria)

Este proyecto sigue la metodología **docs-first** de Web Atelier descrita en [/methodology/en/ai-practical-guide/](/methodology/en/ai-practical-guide/).

- **Entiende cada línea que entregas.** Si no puedes explicarla con tus propias palabras, no pertenece a tu repositorio.
- **Documenta el uso de IA de forma transparente.** Código generado por IA sin declaración es una falta de integridad académica.
- **Nunca pegues secretos en prompts.** `SESSION_SECRET`, tokens de API y credenciales nunca deben aparecer en un chat.
- **Flujo docs-first:** crea `docs/plans/plan-[feature].md` antes de implementar; guarda un informe en `docs/reports/YYYY-MM-DD-[fase].md` después de cada sesión.
- **La sección de declaración en el README es obligatoria.** Sin ella, el criterio de documentación se califica como Insatisfactorio.

> _"Un dashboard que muestra el pulso de la Tierra no es decoración. Es un argumento: que los datos, bien enmarcados, hacen visible lo invisible."_
