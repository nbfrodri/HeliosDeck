# Plan — Admin-only route

> Adds a route that only users with `role === "admin"` can reach.

## What we are building

A new gated section `/:locale/admin` that lists every dummyjson user (name, email, role). Reachable only for sessions whose `/auth/me` payload reports `role: "admin"`. Unauthenticated visitors are bounced to `/login`; authenticated non-admins see a 403 card with a link back to the dashboard.

## Why this shape

- The professor explicitly asked for an admin-exclusive route. dummyjson already attaches `role` (`"admin" | "moderator" | "user"`) to its login and `/auth/me` payloads, so we can gate purely on the existing token — no extra backend.
- The demo user `emilys` is `role: "admin"` in dummyjson, so the README's demo credentials cover this surface without a second account.
- A user list is the most natural admin payload: it consumes the bearer token (`/users` with `Authorization: Bearer <accessToken>`), demonstrates that the guard actually limits access, and reuses the existing React Query setup (cache key, staleTime).

## Phases

1. **AuthContext** — extend `pickProfile` to keep `role` so guards and the NavBar can read `user.role` without re-fetching.
2. **Service + hook** — `services/usersApi.js` (`GET /users?limit=30&select=...` with bearer token) + `hooks/useUsers.js` (`useQuery`, `staleTime: 5min`, key includes the token so logout invalidates the cache).
3. **AdminRoute guard** — `components/AdminRoute.jsx`. Three states:
   - `loading` → same spinner card as `ProtectedRoute`.
   - `unauthenticated` → `<Navigate to="/login" state={{ from }} replace />`.
   - `authenticated && role !== 'admin'` → 403 card (`admin.forbidden.*`) with a CTA back to the dashboard. We don't redirect because that hides the failure mode from the user.
4. **Admin page** — `pages/Admin.jsx`. Header (title + subtitle with current user count) + table (avatar, name, username, email, role badge). Loading + error states match the earthquakes page.
5. **Routing** — register `<Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />` inside the `:locale` layout in `App.jsx`.
6. **NavBar** — render the Admin link only when `user?.role === 'admin'`. Non-admins must not even see it.
7. **i18n** — `nav.admin` + an `admin.*` block in `en.json` / `es.json`.
8. **Styles** — small additions in `styles/global.css` for the admin table and role badges (reuse the existing `.card` / `.page` system).

## Success criteria

- [ ] Hitting `/:locale/admin` while logged out redirects to `/login` with `state.from` preserved (same UX as the other gated pages).
- [ ] Logging in as `emilys` (admin) reveals the Admin link in the NavBar and renders the user list.
- [ ] Logging in as a non-admin dummyjson user (e.g. `michaelw`) hides the NavBar link and, if the URL is typed by hand, surfaces the 403 card.
- [ ] The user list query carries `Authorization: Bearer <accessToken>`; on logout the cache is dropped.
- [ ] EN and ES strings render for every visible piece of text.

## Out of scope (deferred)

- Role-based mutations (creating / promoting users). dummyjson supports it, but it's not what the requirement asks for.
- A separate `requireAdmin` prop on `ProtectedRoute`. Two distinct components stay easier to read than one with a flag, given there are only two callers.
