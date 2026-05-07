# Plan — Authentication (Phase 2)

> Track A authentication against dummyjson, JWT in localStorage, route-level guard.

## What we are building

Add a session layer to HeliosDeck so that `/dashboard`, `/earthquakes` and `/map` are gated. Login goes against dummyjson's public auth API. After a successful login the access token + refresh token are stored in `localStorage` so the session survives a tab reload.

## Why this shape

- The professor explicitly required dummyjson as the auth backend for this project. The course spec also pins it as the departure point ("JWT login/logout against dummyjson").
- Track A puts the entire auth state on the client. There is no server-side session store, so we lean on `localStorage` + an `AuthContext` that hydrates on mount.
- Tokens are validated via `/auth/me` on every cold boot so we don't accept whatever stale string was sitting in storage at face value.

## Phases

1. **Service layer** — `src/services/authApi.js` with `login`, `me`, `refresh` as plain async fetch wrappers.
2. **Context** — `src/contexts/AuthContext.jsx`. State machine `loading | authenticated | unauthenticated`. Bootstrap effect: read tokens → call `me` → on 401 try `refresh` → on second failure clear storage and become `unauthenticated`. Public actions: `login(username, password)` and `logout()`.
3. **Route guard** — `src/components/ProtectedRoute.jsx`. While `loading` show a spinner card so we don't flicker the user to `/login` during boot validation. Once resolved, redirect or render children.
4. **Login page** — `src/pages/Login.jsx`. Form + a "Continue as demo user" button that bypasses the password input entirely so Chrome's compromised-password warning never fires (the public dummyjson password is in HIBP databases).
5. **NavBar / Toolbar** — show a `UserMenu` (avatar + name + logout) when authenticated.

## Success criteria

- [ ] Hitting `/dashboard` while logged out redirects to `/login` with `state.from` preserved.
- [ ] After login the user lands on the page they originally tried to reach.
- [ ] Reloading the tab keeps the session (no flash of "Log in" link).
- [ ] Logout clears storage and re-protects the routes.
- [ ] Bad credentials surface an inline error and stay on the login screen.

## Out of scope (deferred)

- A fetch interceptor that retries on 401 mid-session. We refresh only on boot for now — acceptable for a 30-min access token in a single-tab demo.
- Persisting the user object itself. We re-fetch `/auth/me` on every boot rather than trusting a cached profile.
