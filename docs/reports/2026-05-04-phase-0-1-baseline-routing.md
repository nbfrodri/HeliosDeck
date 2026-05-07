# 2026-05-04 — Phase 0 + Phase 1 (baseline + routing)

## Phase 0 — baseline

**Files changed**
- `.gitignore` — added `.claude/settings.local.json` so editor settings never leak into commits.
- `.env.example` — created.
- `docs/geophysical-aggregator-project.md` — pulled the exact source markdown of the course spec from the professor's GitHub.
- `docs/plans/plan-implementation-roadmap.md` — wrote the 7-phase roadmap with explicit STOP checkpoints.
- `docs/reports/.gitkeep` — created the folder.
- `.test/` — deleted ~34 MB of leftover Playwright screenshots and Python smoke scripts (was gitignored anyway).

**Decisions**
- Track A confirmed (existing repo is a Vite + React 18 project with widgets already built; matches the declarative SPA pattern).
- Auth provider locked to dummyjson (verbal instruction from the professor; also literally in the spec line 80).

**What I verified**
- `npm install` completes (46 packages).
- `npm run build` is green (670 KB JS / 200 KB gzipped pre-routing).

## Phase 1 — React Router + page split

**Files changed**
- `package.json` + `package-lock.json` — installed `react-router-dom@^7` and `@tanstack/react-query`.
- `src/main.jsx` — wrapped the tree with `<BrowserRouter>` and `<QueryClientProvider>` (defaults: `staleTime: 60_000`, `refetchOnWindowFocus: false`).
- `src/App.jsx` — replaced the flat 4-component layout with `<Sky>` + `<NavBar>` + `<Routes>`. Three routes initially: `/`, `/login`, `/dashboard`.
- `src/components/NavBar.jsx` — new. NavLink-based primary nav with active state styling. Hidden on `/dashboard` to avoid stacking with the existing Toolbar.
- `src/pages/{Home,Login,Dashboard}.jsx` — new. Dashboard wraps the existing `<Toolbar>` + `<Deck>` + `<WidgetPicker>` so we don't disturb the widget surface. Home is a hero with two CTAs. Login is a placeholder until Phase 2.
- `src/styles/global.css` — added `.navbar`, `.page`, `.home-hero`, `.card` blocks using the existing token system.

**Decisions / surprises**
- Kept `<Sky>` global (in `App.jsx`, outside `<Routes>`) so the gradient persists across routes. Originally the plan was to move it into Dashboard, but `Sky` uses `position: fixed` and acts as the visual identity of the entire app.
- Discovered an `.hero` class collision (existing `EmptyHero` vs my new home hero CSS). Renamed mine to `.home-hero*` to avoid contaminating the existing dashboard empty state.
- Discovered a similar `.btn` collision between my pasted-in CSS and the existing toolbar button system. Removed my redefinitions and re-used the existing `.btn--accent`, `.btn--ghost-lg` modifiers.

**What I verified**
- `/` renders Home with the gradient hero.
- `/dashboard` renders the existing widget surface unchanged.
- Browser back/forward works.
- `npm run build` stays green (737 KB / 222 KB gzipped — +60 KB for the routing libs as expected).

## Decisions deferred

- Token refresh on 401 mid-session is left for Phase 2 base + a possible interceptor pass later.
- Production deploy strategy not picked yet (will pick in Phase 7 between Netlify and Vercel).
