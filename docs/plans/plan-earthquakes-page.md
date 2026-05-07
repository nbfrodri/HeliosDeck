# Plan — Earthquakes page (Phase 3)

> First geophysical API integrated end-to-end with React Query.

## What we are building

A protected `/earthquakes` page that pulls real-time seismic events from the USGS FDSN API and displays them as:

1. A header with title + filters (magnitude slider, time window tabs).
2. A magnitude-distribution histogram (Recharts).
3. A 4-stat overview card (total events, max magnitude, latest event, deepest event).
4. A scrollable event list with colored magnitude badges and clickable place names that link to the official USGS event page.

## Why this shape

- React Query is the rubric's "Excellent" pattern for Track A. Using `useQuery` with a parameterised key makes the filter UI reactive: change a filter → cache key changes → a new request fires and the old one stays cached if the user switches back. It also gives free `isLoading`/`isError`/`isFetching` states.
- USGS' GeoJSON output is rich: each Feature carries `properties.mag`, `properties.place`, `properties.time` (Unix ms), `properties.url`, `geometry.coordinates` (lon, lat, depth). Plenty of dimensions for stats + histogram + a clickable link without a second API call.
- The 5-min `staleTime` + `refetchInterval` matches USGS' update cadence and keeps the page feeling alive without being chatty.

## Phases

1. **Service** — `src/services/earthquakesApi.js` builds a `URL` with `URLSearchParams`, accepts `{ minMagnitude, hoursWindow }`, returns the raw GeoJSON FeatureCollection.
2. **Hook** — `src/hooks/useEarthquakes.js` wraps the service in `useQuery` with `queryKey: ['earthquakes', { minMagnitude, hoursWindow }]`. Exports nothing else.
3. **Components**:
   - `src/components/MagnitudeChart.jsx` — buckets features into 7 magnitude ranges and renders a Recharts `BarChart` with a custom amber gradient.
   - `src/components/EarthquakeList.jsx` — virtualisation-free scrollable list, exports a `MagBadge` subcomponent reused on the map popup.
4. **Page** — `src/pages/Earthquakes.jsx` composes the above with a header (title + filters) and a 3-section grid (chart, stats, list).
5. **Routing** — register `/earthquakes` inside `<ProtectedRoute>` in `App.jsx`. Add a NavBar link.

## Success criteria

- [ ] Loads real USGS events on mount.
- [ ] Changing the magnitude slider triggers a new fetch (visible in DevTools); old data stays cached.
- [ ] Changing the window tab (1h / 24h / 7d / 30d) does the same.
- [ ] Loading and error states render as proper cards, not raw text.
- [ ] The histogram updates when filters change.
- [ ] Place links open the USGS event page in a new tab.

## Out of scope

- Map view of events — that's Phase 4 (separate page).
- Filtering by region or depth.
