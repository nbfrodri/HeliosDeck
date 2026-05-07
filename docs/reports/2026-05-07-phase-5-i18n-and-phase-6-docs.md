# 2026-05-07 — Phase 5 (i18n) and Phase 6 (docs)

## Phase 5 — Bilingual i18n with locale in URL

Done in two waves. Ola 1 = infrastructure + priority pages. Ola 2 = dashboard, widgets, and the sky modal.

**Files added**
- `src/i18n.jsx` — `I18nProvider`, `useTranslation`, `replaceLang`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`. `t(key, vars)` does dotted-path lookup with `{var}` interpolation; falls back to the EN value, then the key itself.
- `src/locales/en.json` + `src/locales/es.json` — comprehensive nested key tree (12 top-level groups: `nav`, `auth`, `home`, `earthquakes`, `map`, `common`, `toolbar`, `locationSearch`, `emptyHero`, `sky`, `widget`, `widgetPicker`).

**Files modified (route restructure)**
- `src/App.jsx` — every existing route now lives under `<Route path="/:locale" element={<LocaleLayout />}>`. Unmatched paths redirect to `/en`. The `LocaleLayout` validates the segment, mounts the provider, and renders `<Sky>` + `<NavBar>` + `<Outlet>`.
- `src/components/NavBar.jsx` — added a sliding-pill EN/ES switcher (same CSS pattern as the Earthquakes window tabs and the sky-mode toggle).
- `src/components/{ProtectedRoute,UserMenu}.jsx` — locale-aware redirects and translated tooltips.
- `src/pages/{Home,Login,Earthquakes,MapPage}.jsx` — every visible string replaced with `t(...)`.
- `src/components/{EarthquakeList,MagnitudeChart}.jsx` — relative time, empty state, chart tooltip.

**Files modified (ola 2)**
- `src/components/{Toolbar,SkySettings,LocationSearch,EmptyHero,WidgetPicker,DeckWidget,ConfirmDialog}.jsx`
- `src/widgets/{Clock,MoonPhase,SunTimes,Weather}/{*Widget.jsx,index.js}`
- `src/lib/time.js` — was hardcoded `es-ES` for every Intl call. Threaded a `locale` argument through `formatInZone`, `formatHM`, `formatHMS`, `formatDate`, `timeParts`, mapping `'en' → 'en-US'` and `'es' → 'es-ES'`. Existing call sites updated to forward the locale they get from `useTranslation()`.
- Widget descriptors changed from `name: 'Reloj'` / `description: 'Hora local con segundos.'` to `nameKey: 'widget.clock.name'` / `descriptionKey: 'widget.clock.description'`. Components that display them call `t(desc.nameKey)`.

**Locale-aware integrations**
- The Open-Meteo geocoding call in `LocationSearch` now passes `language=${locale}` so when you search for "Munich" in Spanish you get "Múnich, Alemania" back.
- Weather code labels (21 conditions) live as `widget.weather.codes.{code}` keys; `WeatherWidget` and the map popup both call `t(\`widget.weather.codes.${cur.weather_code}\`)`.

**Bundle structure preserved**
- Initially `SkySettings` was importing `FLUID_PRESETS` from `SkyFluidShader.jsx`, which silently pulled `three.js` + `shadergradient` into the main bundle (jumped to ~2 MB). Extracted the preset data to `skyFluidConfig.js` (no three imports). Bundle returned to its expected 960 KB main + 1 MB lazy shader chunk.

**Verified**
- `/`, `/foo`, `/dashboard` all redirect to `/en`.
- Cold-load `/es/earthquakes` shows everything in Spanish, including relative times.
- EN↔ES switcher swaps the segment without a page reload; React Query cache survives.
- Both languages walked through every page, widget, modal, popup, tooltip — no leftovers.

---

## Phase 6 — Documentation pass (this session)

**Files added**
- `README.md` — full per-spec template: track marking, live demo + demo creds, APIs table, tech stack, architecture notes, known limitations, setup, deployment, AI assistance disclosure, Spanish summary.
- `docs/plans/plan-auth.md` — Phase 2 plan retrospectively.
- `docs/plans/plan-earthquakes-page.md` — Phase 3 plan.
- `docs/plans/plan-map.md` — Phase 4 plan.
- `docs/plans/plan-i18n.md` — Phase 5 plan with both ola breakdowns.
- `docs/plans/plan-fluid-sky.md` — extension feature plan.
- `docs/reports/2026-05-04-phase-0-1-baseline-routing.md`
- `docs/reports/2026-05-05-phase-2-3-auth-earthquakes.md`
- `docs/reports/2026-05-06-phase-4-map-and-fluid-sky.md`
- `docs/reports/2026-05-07-phase-5-i18n-and-phase-6-docs.md` (this file)

**Inline `@ai-assisted` markers added**
- `src/services/authApi.js` (already existed)
- `src/services/earthquakesApi.js` (already existed)
- `src/contexts/AuthContext.jsx` — bootstrap + refresh fallback flow.
- `src/i18n.jsx` — provider + `replaceLang` URL helper.
- `src/components/SkyFluidShader.jsx` + `skyFluidConfig.js` — preset metadata.
- `src/pages/MapPage.jsx` — popup body with cross-domain weather lookup.
- `src/hooks/useWeather.js` — React Query wrapper.

**One thing left for the user**
- Drop the live deployment URL into `README.md` (the placeholder says `<FILL IN with your deployed URL>`). Otherwise the Live demo section grades as Unsatisfactory.
