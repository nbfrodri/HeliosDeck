# Plan — Earthquake + Weather map (Phase 4)

> Second public API integrated, cross-domain presentation, the rubric's "Excellent" for both React Query and 2-APIs criteria.

## What we are building

A protected `/map` page that:

- Renders a dark world map (CartoDB Dark Matter tiles via Leaflet).
- Plots one circular marker per recent earthquake, sized and coloured by magnitude.
- On marker click, opens a glass-styled popup with magnitude/place/time/depth/coordinates AND the **current weather at that exact epicentre** (Open-Meteo, lazy-fetched on popup open).
- Floats a header card on top of the map with the same time-window tabs as the Earthquakes page, plus a live event counter.
- Floats a magnitude legend at the bottom-left.
- The weather widget on the dashboard is migrated from `usePolling` to React Query so it shares the same query cache as the map popup — clicking a marker for a location the user has already loaded weather for is instant.

## Why this shape

- The course rubric gives "Excellent" on the 2-APIs criterion only when the two domains are presented **together**. A map with earthquake markers *and* weather-at-epicentre is the cleanest way to show that. Each marker popup is literally a join of USGS + Open-Meteo data on `(lat, lon)`.
- Using React Query for both APIs means the cache is shared. The popup component doesn't need any "did we already fetch this?" logic — `useWeather({ lat, lon })` returns the cached entry if it exists.
- Lazy-fetching weather only when a popup opens (rather than fetching for every visible marker on mount) keeps Open-Meteo polite and the page light. With 100+ markers visible, eager-fetching would be 100 simultaneous requests.

## Phases

1. **Install** `react-leaflet@^4` (v5 requires React 19) + `leaflet`. Import `leaflet/dist/leaflet.css` in `main.jsx`.
2. **Migrate** `WeatherWidget` from `usePolling` to a new `useWeather` hook (`src/hooks/useWeather.js`) that wraps the existing `fetchWeather` service in `useQuery({ queryKey: ['weather', { lat, lon }] })`.
3. **Page** — `src/pages/MapPage.jsx`:
   - `<MapContainer>` with CartoDB Dark Matter tiles, `worldCopyJump` for horizontal infinity, `maxBounds=[[-85, -Infinity], [85, Infinity]]` so the user can't escape the projection vertically.
   - `<ZoomControl position="topright" />` so it doesn't collide with our top-left header card.
   - One `<CircleMarker>` per feature, `magColor`/`magRadius` helpers shared visually with the Earthquakes list badges.
   - `<Popup>` containing a `PopupBody` component that calls `useWeather({ lat, lon })`. React Query handles dedupe + cache; nothing custom needed.
4. **Header overlay** — glass card above the map (not floating inside it). Title + sub + window tabs (sliding pill, same component pattern as Earthquakes) + live event counter with refreshing indicator.
5. **Legend** — bottom-left glass card with 4 magnitude tier dots.
6. **Routing + nav** — `/map` inside `<ProtectedRoute>`. Add NavBar + Toolbar links.

## Success criteria

- [ ] Map loads with CartoDB tiles and earthquake markers visible.
- [ ] Marker color and radius scale with magnitude (mild blue / moderate yellow-green / strong orange / severe red).
- [ ] Clicking a marker opens a styled popup; the weather row shows "Loading…" and is then replaced by the temperature + condition icon + humidity + wind.
- [ ] Re-opening the same popup is instant (React Query cache hit).
- [ ] Time-window tabs animate the same way as on `/earthquakes` and trigger a new USGS request.
- [ ] User cannot pan above ±85° latitude; horizontal panning wraps around the world.
- [ ] Zoom +/- buttons sit at the top-right and don't overlap the header card.

## Out of scope

- Marker clustering at low zoom levels.
- Heatmap visualisation.
- A separate "weather only" map view.
