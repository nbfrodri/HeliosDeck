# 2026-05-05 — Phase 2 + Phase 3 (auth + earthquakes page)

## Phase 2 — dummyjson auth

**Files added**
- `src/services/authApi.js` — `login`, `me`, `refresh`. Each parses the JSON error body so the user sees dummyjson's actual message ("Invalid credentials") instead of `Login failed (400)`.
- `src/contexts/AuthContext.jsx` — `loading | authenticated | unauthenticated` state machine. Boot effect: read `helios.auth` from localStorage → call `/auth/me` with the stored access token → if it fails, try `/auth/refresh` with the refresh token → on second failure clear storage and become unauthenticated. Public `login(username, password)` and `logout()` actions.
- `src/components/ProtectedRoute.jsx` — during `loading` shows a spinner card so we don't flash the user to `/login` during boot. Otherwise either renders children or redirects with `state={{ from: location }}`.
- `src/components/UserMenu.jsx` — avatar + name + logout button, used by both NavBar and Toolbar.

**Files modified**
- `src/main.jsx` — wrapped with `<AuthProvider>` (inside the QueryClient + BrowserRouter chain).
- `src/App.jsx` — `/dashboard` route now renders inside `<ProtectedRoute>`.
- `src/components/NavBar.jsx` — auth-aware: `<UserMenu>` when authenticated, `Log in` link when not.
- `src/components/Toolbar.jsx` — `<UserMenu>` after the existing reset button.
- `src/pages/Login.jsx` — real form.

**Two non-trivial UX decisions**

1. **The "Continue as demo user" button.** Chrome 124+ flashes a "compromised password" alert when a known-leaked password is submitted via a `<input type="password">`. The dummyjson public credentials (`emilys` / `emilyspass`) are in the HIBP database, so every login showed that warning. Solution: a separate button above the form that calls `login(DEMO.username, DEMO.password)` programmatically — the password value never enters a password input, so Chrome never intercepts. The form below is empty by default and stays available for users with their own dummyjson accounts.

2. **Vertical alignment of the NavBar.** When the UserMenu replaced the "Log in" link in the navbar's right group, the existing Dashboard link looked oddly higher than the avatar. The flex container was using `align-items: stretch` (default) so each child stretched to the tallest sibling, but the link's text stayed top-aligned inside its box. Fix: `align-items: center` on `.navbar__links` and `display: inline-flex; align-items: center; line-height: 1` on `.navbar__link`.

**Verified**
- `/dashboard` redirects to `/login` when logged out and back after login.
- Reload preserves the session.
- Bad password surfaces dummyjson's error text inline.
- Logout clears storage and re-protects routes.

---

## Phase 3 — Earthquakes page (USGS via React Query)

**Files added**
- `src/services/earthquakesApi.js` — single function building the FDSN query URL with `URLSearchParams`. Marked `@ai-assisted` because Claude proposed the URL pattern.
- `src/hooks/useEarthquakes.js` — `useQuery` with parameterised cache key. 5-minute `staleTime` and `refetchInterval`.
- `src/components/MagnitudeChart.jsx` — Recharts BarChart with 7 magnitude buckets and a custom amber gradient on the bars.
- `src/components/EarthquakeList.jsx` — scrollable list, `<MagBadge>` exported separately so the map popup can reuse it later.
- `src/pages/Earthquakes.jsx` — header + filters + 3-section grid.

**Files modified**
- `src/App.jsx` — `/earthquakes` route inside `<ProtectedRoute>`.
- `src/components/NavBar.jsx` + `Toolbar.jsx` — added "Earthquakes" link.
- `src/styles/global.css` — page styling (pill tabs, magnitude badges, stats grid, slider thumb gradient).

**UI iterations on the magnitude badges (logged because the user pushed back twice)**

1. **First attempt** — square 44×44 with mono digits and a vertical gradient. User said "horrible".
2. **Second attempt** — circular with hierarchy (`5` big bold + `.4` small dim). User said "needs a lot of improvement". The hierarchy broke the natural reading flow and the baselines didn't line up cleanly.
3. **Final** — circular 50×50, single piece (`5.4` all same size), Inter 17/700, solid background with a radial highlight at top-left for a 3D ball look, color-tinted outer shadow per severity, subtle inner ring. This stuck.

**Window selector pill polish**

The 4 tabs (1h / 24h / 7d / 30d) initially had a flex container with default `gap` but no `flex: 1`, so the rendered pill had visible empty space on the right (parent column had `min-width: 200px`). Switched to `flex: 1` per tab + a CSS-driven sliding indicator (`--idx` custom property + `calc()` for `left`) so changing the active tab animates the indicator instead of swapping backgrounds. Same pattern reused later for the sky-mode toggle and the language switcher.

**Verified**
- `/earthquakes` shows real USGS events.
- Slider and tabs each trigger a new request with the right params (verified in DevTools).
- Loading and error states render as glass cards.
- Polling (`refetchInterval: 5min`) shows "refreshing…" briefly when it fires.
