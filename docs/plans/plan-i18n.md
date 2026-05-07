# Plan — Bilingual i18n with locale in URL (Phase 5)

> Track A "Excellent" criterion: locale segment in URL, switch without reload, all UI strings translated.

## What we are building

Two-language support (English + Spanish) for HeliosDeck, with the active locale encoded in every URL as a `/:locale/*` segment. The user can switch from any page via a sliding pill in the NavBar; the URL flips from `/en/earthquakes` to `/es/earthquakes` and the UI re-renders in the target language without a full page reload. The choice persists naturally because it lives in the URL; refreshing or sharing a link keeps the locale.

## Why this shape

- The rubric gives the "Excellent" rating only when the locale is in the URL (shareable + survives reload) AND all strings are translated AND the switch happens without a full reload. A pure `useState`/`localStorage` implementation only reaches "Satisfactory".
- The `/:locale/*` pattern is idiomatic for React Router v7 declarative mode — a `LocaleLayout` route validates the segment, redirects unknown locales to `/en`, and mounts the `I18nProvider` so every nested page reads the same context.
- Putting translations in static JSON keeps the type system simple, the bundle tree-shakable per language, and avoids any runtime build step. The `t()` function does dotted-path lookup with `{var}` interpolation — no library needed for what we have.

## Phases

### Ola 1 — infrastructure + priority surfaces

1. **Locale files** — `src/locales/en.json` + `src/locales/es.json` with a comprehensive nested key tree (nav, auth, home, earthquakes, map, common).
2. **Provider** — `src/i18n.jsx` exports `I18nProvider`, `useTranslation`, `replaceLang`, `SUPPORTED_LOCALES`. Provider takes a `locale` prop (read by the parent layout from `useParams`).
3. **Route restructure** — `src/App.jsx` wraps every route under `<Route path="/:locale" element={<LocaleLayout />}>`. Unknown paths redirect to `/en`.
4. **Language switcher** — sliding pill EN/ES in `NavBar`, mirrors the same indicator pattern as the time-window tabs.
5. **Translate** — NavBar, UserMenu, ProtectedRoute, Home, Login, Earthquakes (page + list), MapPage (header + popup + legend), MagnitudeChart (tooltip).

### Ola 2 — dashboard + widgets

1. **Toolbar** — every button/tooltip + the reset confirm dialog texts.
2. **SkySettings** — modal title, mode toggle, stop labels, presets (animation + color), fine-tune sliders, hex input caption.
3. **LocationSearch** — placeholder, hint, no-results; the geocoding API also gets `language=${locale}` so the city results come back in the active language.
4. **EmptyHero / WidgetPicker / DeckWidget** — empty-state hero, picker title + descriptions, widget chrome aria.
5. **Widgets** — Clock (week/day labels, "in {countdown}"), MoonPhase (8 phase names + age/distance/altitude stats + relative date "today/tomorrow/in N days"), SunTimes (dawn, golden hour, dusk, moonrise, moonset, "day length", "vs yesterday"), Weather (loading/error/no-location, feels like / humidity / wind, 5 UV levels, 21 weather codes from Open-Meteo, the map popup uses the same code map).
6. **Time library** — `src/lib/time.js` was hardcoded to `es-ES`. Threaded a `locale` argument through `formatInZone`, `formatHM`, `formatHMS`, `formatDate`, `timeParts`, mapping `'en' → 'en-US'` and `'es' → 'es-ES'`.

## Success criteria

- [ ] Visiting `/` redirects to `/en`. Unknown paths (`/foo`) also redirect to `/en`.
- [ ] Visiting `/es/earthquakes` shows the Earthquakes page in Spanish, with relative times like "hace 3 min".
- [ ] Switching the EN/ES pill from `/en/map` lands on `/es/map` instantly, no full reload, every string flips.
- [ ] No Spanish leftovers visible while in `/en/*`; no English leftovers in `/es/*`.
- [ ] The Open-Meteo geocoding picker returns results in the active locale.
- [ ] Date/time formatting uses the active locale (`Wednesday, October 5` vs `miércoles, 5 de octubre`).

## Out of scope

- A third language.
- Server-side locale negotiation from the `Accept-Language` header — Track A is fully client-side, so we default to `/en` for unmatched paths.
- Pluralisation rules beyond simple `{n}` substitution.
