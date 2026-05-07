# Plan de implementación — HeliosDeck (Track A)

> Resumen accionable de [`geophysical-aggregator-project.md`](../geophysical-aggregator-project.md) convertido en hoja de ruta por fases. Cada fase termina en un checkpoint **STOP** para que tú hagas `git commit`, `git push` y test manual antes de pasar a la siguiente.

## Decisiones tomadas

- **Track:** A (Declarative SPA — `BrowserRouter`, JWT en `localStorage`, React Query como única capa de datos, i18n cliente).
- **Auth provider:** dummyjson (`https://dummyjson.com/auth/login`) — requisito explícito del profesor y mencionado en la propia spec (línea 80).
- **Punto de partida:** repositorio actual de HeliosDeck (no la sandbox `react-auth-sprint-10`); reutilizamos los 4 widgets ya construidos como contenido del dashboard protegido.
- **Stack añadido:** `react-router-dom` v7, `@tanstack/react-query`, `react-leaflet` (mapa) — Tailwind queda como decisión opcional para más adelante (CSS actual ya es funcional).

## Estado actual a respetar

- 4 widgets funcionando: Clock, MoonPhase, SunTimes, Weather.
- Layout grid con `dnd-kit` + `react-grid-layout`.
- Estado en `zustand`.
- Charts con `recharts`.
- **No tocar** la lógica de widgets existente sin razón — solo envolverlos en las nuevas piezas (router, auth, React Query).

---

## Fase 0 — Baseline y dependencias

**Meta:** dejar el repo en un estado verificable antes de tocar nada.

**Tareas:**
1. `npm install` (asegurar lockfile actualizado).
2. `npm run dev` → comprobar que arranca y los widgets funcionan.
3. `npm run build` → comprobar que compila sin errores.
4. Crear `.env.example` vacío (con `VITE_API_BASE_URL=https://dummyjson.com` como placeholder).
5. Crear carpetas vacías `docs/plans/` (ya existe con este archivo) y `docs/reports/`.

**Archivos nuevos/modificados:**
- `.env.example`
- `docs/reports/.gitkeep`

### STOP — Fase 0
- [ ] `npm run dev` y los 4 widgets se ven en el navegador.
- [ ] `npm run build` termina sin errores.
- Commit sugerido: `chore: baseline + docs/ folders for project rubric`
- Push y seguir.

---

## Fase 1 — React Router + estructura de páginas

**Meta:** introducir routing sin romper el dashboard existente.

**Tareas:**
1. `npm i react-router-dom@^7 @tanstack/react-query`
2. Crear `src/pages/`:
   - `Home.jsx` — landing pública con CTA a Login.
   - `Login.jsx` — placeholder por ahora (form en Fase 2).
   - `Dashboard.jsx` — mover el contenido actual de `App.jsx` (Sky, Toolbar, Deck, WidgetPicker) aquí.
3. Reescribir `src/App.jsx` con `<Routes>`: `/` → Home, `/login` → Login, `/dashboard` → Dashboard.
4. Envolver en `main.jsx` con `<BrowserRouter>` y `<QueryClientProvider>` (un `QueryClient` con defaults sensatos: `staleTime: 60_000`).
5. Añadir un `NavBar.jsx` mínimo en `components/` que muestre links según haya o no sesión (de momento, links fijos).

**Archivos nuevos:** `src/pages/{Home,Login,Dashboard}.jsx`, `src/components/NavBar.jsx`
**Modificados:** `src/main.jsx`, `src/App.jsx`, `package.json`

### STOP — Fase 1
- [ ] `/` muestra la landing.
- [ ] `/dashboard` muestra los widgets exactamente como antes.
- [ ] El back/forward del navegador funciona.
- [ ] `npm run build` sigue verde.
- Commit sugerido: `feat: add react-router + react-query providers, split pages`

---

## Fase 2 — Autenticación dummyjson (token-based)

**Meta:** login real contra dummyjson, ruta `/dashboard` protegida.

**Tareas:**
1. `src/services/authApi.js` — funciones puras:
   - `login({ username, password })` → `POST /auth/login` (dummyjson devuelve `accessToken`, `refreshToken`, datos del user).
   - `me(token)` → `GET /auth/me` con `Authorization: Bearer`.
   - `refresh(refreshToken)` → `POST /auth/refresh`.
2. `src/contexts/AuthContext.jsx` con `AuthProvider` + hook `useAuth`:
   - Estado: `{ user, accessToken, isLoading }`.
   - Persistencia en `localStorage` (`helios.auth`).
   - Al montar, si hay token, hacer `me()` para validar; si 401, intentar refresh; si falla, limpiar.
3. `src/components/ProtectedRoute.jsx` — si no hay `user`, redirige a `/login` preservando `location.state.from`.
4. `src/pages/Login.jsx` — form con `username` / `password`, llama a `login()`, muestra error en línea, redirige a `state.from || '/dashboard'`.
5. Proteger `/dashboard` con `<ProtectedRoute>`.
6. Mostrar usuario logueado + botón Logout en `NavBar`.
7. Documentar credenciales demo en `README.md` (sección **Live demo**) — usar usuario válido de dummyjson, p.ej. `emilys` / `emilyspass` (verificar primero en `https://dummyjson.com/users`).

**Archivos nuevos:** `src/services/authApi.js`, `src/contexts/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`
**Modificados:** `src/main.jsx` (envolver con `AuthProvider`), `src/App.jsx`, `src/pages/Login.jsx`, `src/components/NavBar.jsx`, `README.md`

### STOP — Fase 2
- [ ] `/dashboard` sin login → redirige a `/login`.
- [ ] Login con `emilys` / `emilyspass` → entra al dashboard, NavBar muestra el username.
- [ ] Refresh del navegador con sesión activa → sigue logueado (token en `localStorage`).
- [ ] Logout → vuelve a Home y `/dashboard` queda bloqueado otra vez.
- [ ] Login mal → mensaje de error visible, no se redirige.
- Commit sugerido: `feat: dummyjson auth with AuthContext + ProtectedRoute`

---

## Fase 3 — Primera API geofísica con React Query (USGS Earthquakes)

**Meta:** primera de las 2 APIs obligatorias, integrada con `useQuery`.

**Tareas:**
1. `src/services/earthquakesApi.js` — `getRecentEarthquakes({ minMagnitude, days })` contra `https://earthquake.usgs.gov/fdsnws/event/1/query` (formato GeoJSON). Marcar con `@ai-assisted` si pides ayuda.
2. `src/hooks/useEarthquakes.js` — `useQuery` con:
   - `queryKey: ['earthquakes', { minMagnitude, days }]` (la cache key cambia con los filtros — requisito de la rúbrica).
   - `staleTime: 5 * 60 * 1000`.
   - `refetchInterval: 5 * 60 * 1000`.
3. `src/pages/Earthquakes.jsx` — ruta `/earthquakes` (protegida), con:
   - Filtros: slider de magnitud mínima + select de días (1/7/30).
   - Lista de eventos.
   - Un `recharts` con histograma de magnitudes (ya tienes recharts instalado).
4. Link a `/earthquakes` en NavBar.

**Archivos nuevos:** `src/services/earthquakesApi.js`, `src/hooks/useEarthquakes.js`, `src/pages/Earthquakes.jsx`, `src/components/EarthquakeList.jsx`, `src/components/MagnitudeChart.jsx`

### STOP — Fase 3
- [ ] `/earthquakes` carga datos reales de USGS.
- [ ] Cambiar el filtro dispara una nueva fetch (verifica en DevTools → Network que la URL cambia).
- [ ] El histograma se actualiza con los nuevos datos.
- [ ] Estado de loading y de error visibles si simulas fallo (`Network throttling: Offline`).
- [ ] El polling de 5 min está activo (puedes cambiarlo a 10 s temporalmente para verificar).
- Commit sugerido: `feat: USGS earthquakes page with React Query + chart`

---

## Fase 4 — Segunda API + mapa (Open-Meteo + react-leaflet)

**Meta:** cubrir la segunda API obligatoria y el "ideally one map" de la rúbrica. Reutilizamos el widget de Weather existente como entrada.

**Tareas:**
1. `npm i react-leaflet leaflet`
2. Refactorizar el fetch del widget Weather actual para usar `useQuery` (cambiar `useEffect`/`fetch` interno por un hook `useWeather(lat, lon)` en `src/hooks/`).
3. `src/pages/Map.jsx` (ruta `/map`, protegida):
   - Mapa Leaflet centrado en una posición por defecto (Madrid).
   - Marcadores de epicentros USGS (reutilizando `useEarthquakes`).
   - Popup en cada marcador con magnitud, lugar, fecha y temperatura actual de Open-Meteo en esas coordenadas (otra `useQuery`, lazy al abrir popup).
4. Importar el CSS de Leaflet en `main.jsx`.

**Archivos nuevos:** `src/hooks/useWeather.js`, `src/pages/Map.jsx`
**Modificados:** widget Weather (extraer fetch al hook), `src/main.jsx` (CSS de leaflet), NavBar.

### STOP — Fase 4
- [ ] Widget Weather sigue funcionando, ahora vía React Query (verifica en DevTools → React Query Devtools, opcional).
- [ ] `/map` muestra el mapa con marcadores de terremotos recientes.
- [ ] Al hacer click en un marcador, el popup carga la temperatura de esa coordenada.
- [ ] La cache de React Query reutiliza la respuesta de USGS de Fase 3 si abres `/earthquakes` y luego `/map` (no debería refetchear si está fresca).
- Commit sugerido: `feat: open-meteo + earthquake map (react-leaflet)`

---

## Fase 5 — i18n bilingüe (en / es)

**Meta:** cumplir el requisito de 2 idiomas con locale en URL.

**Tareas:**
1. `src/locales/en.json` y `src/locales/es.json` con todas las strings UI (NavBar, Home, Login labels y errores, Dashboard, Earthquakes filters, Map popups).
2. `src/i18n.jsx` — `I18nProvider` + `useTranslation` (`t`, `locale`, `setLocale`). Lee locale inicial de `params` y persiste preferencia en `localStorage`.
3. Rutas con segmento `/:lang/*`:
   - `/en/*` y `/es/*`.
   - Redirección de `/` y rutas sin lang al locale por defecto del navegador (o `en`).
4. Selector de idioma en NavBar (botones EN/ES) — al cambiar, `navigate(replaceLang(pathname, newLang))`.
5. Reemplazar **todos** los strings hardcodeados por `t('key')`.

**Archivos nuevos:** `src/locales/{en,es}.json`, `src/i18n.jsx`, `src/lib/replaceLang.js`
**Modificados:** todas las páginas y componentes con texto visible.

### STOP — Fase 5
- [ ] `/en/dashboard` y `/es/dashboard` muestran los textos en su idioma.
- [ ] El selector cambia idioma sin recargar y la URL se actualiza.
- [ ] Refresh con `/es/earthquakes` mantiene el español.
- [ ] No queda ningún string en inglés/español hardcodeado en el código (grep rápido por strings sospechosos).
- Commit sugerido: `feat: bilingual i18n (en/es) with locale in URL`

---

## Fase 6 — Documentación, README y AI disclosure

**Meta:** cumplir el 5% de la rúbrica de docs y dejar el repo presentable.

**Tareas:**
1. `README.md` siguiendo el template de la spec (líneas 884–934 de `geophysical-aggregator-project.md`):
   - Descripción 1 frase.
   - Track A marcado.
   - Live demo URL (placeholder hasta Fase 7) + credenciales demo (`emilys` / `emilyspass`).
   - Tabla de APIs (USGS + Open-Meteo).
   - Tech stack.
   - Notas de arquitectura (2-4 frases: dónde corre React Query, cómo se gestiona auth, cómo se resuelve el locale).
   - Limitaciones conocidas (sé honesto).
   - Setup.
   - Sección **AI assistance disclosure** completa.
2. `.env.example` con todas las variables documentadas.
3. `docs/plans/` — añadir un plan corto por feature no trivial que hayas implementado con IA (puedes generarlos retrospectivamente describiendo lo planeado en cada fase).
4. `docs/reports/YYYY-MM-DD-fase-N.md` por cada sesión con IA: archivos cambiados, decisiones, qué verificaste.
5. Comentarios `@ai-assisted` en código no trivial generado con IA.
6. Pasada de limpieza: borrar `console.log`, código muerto, comentarios obsoletos.

**Archivos nuevos/modificados:** `README.md`, `.env.example`, `docs/plans/*.md`, `docs/reports/*.md`.

### STOP — Fase 6
- [ ] `README.md` se renderiza correctamente en GitHub (preview local con un visor markdown).
- [ ] Las credenciales demo del README funcionan.
- [ ] `npm run build` sigue verde.
- [ ] No hay secretos commiteados (`git log -p | grep -iE 'token|secret|password'` solo debería mostrar la palabra en strings literales del código, no valores).
- Commit sugerido: `docs: README + AI disclosure + plans/reports`

---

## Fase 7 — Deploy público

**Meta:** URL pública funcionando — 10% de la rúbrica.

**Recomendación:** **Netlify** o **Vercel** (cero config para SPA, HTTPS automático). GitHub Pages requiere `HashRouter` o el truco del `404.html` (ver líneas 668–793 de la spec); evítalo si puedes.

**Tareas (Netlify recomendado):**
1. Push del repo a GitHub si aún no está.
2. Netlify → New site from Git → seleccionar repo → build command `npm run build` → publish dir `dist`.
3. Esperar primer deploy, copiar la URL.
4. Probar en navegador limpio (modo incógnito): login con credenciales demo, navegar todas las rutas, cambiar idioma, refrescar en `/es/earthquakes` (debe seguir funcionando — esto es el test crítico de SPA + static host).
5. Actualizar `README.md` con la URL real.

**Archivos modificados:** `README.md` (URL real). Posible `netlify.toml` si quieres fijar config:
```toml
[build]
  command = "npm run build"
  publish = "dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### STOP — Fase 7 (final)
- [ ] La URL pública responde.
- [ ] Login con credenciales demo funciona en producción.
- [ ] Refresh en una ruta interna (`/es/earthquakes`) NO da 404 (si da 404, falta el redirect a `index.html`).
- [ ] Las dos APIs cargan datos reales en producción.
- [ ] Cambio de idioma persiste.
- [ ] Sin errores en consola del navegador.
- Commit sugerido: `chore: production deploy + live URL in README`
- Push y **entrega**.

---

## Mapa rápido de la rúbrica → fase

| Criterio | Peso | Fase principal |
|---|---|---|
| React Router | 20% | Fase 1 (+ refuerzo en Fase 2 con `ProtectedRoute`) |
| React Query | 15% | Fase 3 (+ Fase 4) |
| 2 APIs públicas | 15% | Fases 3 y 4 |
| Autenticación | 15% | Fase 2 |
| i18n | 10% | Fase 5 |
| Deploy | 10% | Fase 7 |
| Calidad de código | 10% | Transversal — limpiar en Fase 6 |
| README + AI disclosure | 5% | Fase 6 |

## Reglas de juego durante la implementación

- **No mezclar tracks.** Estamos en Track A: `BrowserRouter` + `localStorage` + React Query como capa única. Nada de `createCookieSessionStorage` ni loaders SSR (la spec lo penaliza explícitamente).
- **No mockear el login.** Va contra dummyjson real desde el primer día.
- **No commitear secretos.** Ningún token va al repo. dummyjson no requiere API key, así que no hay riesgo, pero mantén el hábito.
- **Entender cada línea.** Si tras una sesión con IA hay código que no sabes explicar, párate y revísalo antes del commit (criterio de la política de IA en la spec).
- **Commits con mensaje legible.** No `wip` ni `final2` (la rúbrica lo penaliza).
