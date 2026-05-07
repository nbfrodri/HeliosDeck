# 2026-05-06 — Phase 4 (map + 2nd API in React Query) and Fluid sky extension

## Phase 4 — Map page

**Files added**
- `src/hooks/useWeather.js` — `useQuery({ queryKey: ['weather', { lat, lon }], staleTime: 10 min, refetchInterval: 10 min, enabled: lat != null && lon != null })`.
- `src/pages/MapPage.jsx` — Leaflet map with CartoDB Dark Matter tiles + `<CircleMarker>` per earthquake (radius and color scaled by magnitude) + `<Popup>` with a `PopupBody` component that fetches weather lazily via `useWeather`.

**Files modified**
- `src/widgets/Weather/WeatherWidget.jsx` — migrated from custom `usePolling` hook to `useWeather`. Same UX, but now shares its query cache with the map popup.
- `src/main.jsx` — `import 'leaflet/dist/leaflet.css'`.
- `src/App.jsx` — `/map` route inside `<ProtectedRoute>`.
- `src/components/NavBar.jsx` + `Toolbar.jsx` — added Map link.
- `src/styles/global.css` — map page styling, leaflet popup re-skin, magnitude legend overlay.

**Three deployment / library / layout fixes worth recording**

1. **Peer-dep mismatch on react-leaflet.** v5 declares `peer react@^19`. We're on 18.3.1. `npm i react-leaflet` failed with ERESOLVE. Solution: pin to `react-leaflet@^4` which supports React 18.

2. **Map renders empty until window resize.** Classic Leaflet symptom when the container has no explicit height at mount time. With our flex chain (`.app` → `.page--map` → `.map-container`), `flex: 1` on `.map-container` is supposed to fill but Leaflet measures dimensions during init. Belt-and-suspenders fix: `style={{ width: '100%', height: '100%' }}` directly on `<MapContainer>` plus `min-height: 400px` on `.map-container` plus `height: calc(100vh - 70px)` on `.page--map`.

3. **Vertical-only pan limit.** User wanted to keep horizontal infinity (`worldCopyJump`) but stop the map from being dragged into empty space above/below the world. Set `maxBounds={[[-85, -Infinity], [85, Infinity]]}` with `maxBoundsViscosity: 1.0`. Mercator stretches infinitely past ±85° anyway.

**Popup polish iteration**

User asked for "polish UI of the popup" plus the X button being too close to the corner. Final shape:
- Circular magnitude badge (same 3D-ball look as the list).
- Header in a column: title + meta with Tabler icons (clock, depth arrow, compass for coords).
- Weather section: large condition icon (color-tinted), 32px serif temperature, condition label, then a separator and humidity + wind extras with icons.
- Close button: re-styled to a 26×26 glass circle with hover state, positioned at `top: 10px; right: 10px` instead of leaflet's default flush-corner.

---

## Fluid sky extension (not in the original plan, added on user request)

**Goal:** an animated background as an alternative to the static gradient.

**Story arc**
1. Started with CSS-only blobs floating around. User said "feels like floating around, I want flowing colors like an RGB keyboard wave".
2. Tried a rotating conic gradient. User: "I want vertical, top to bottom, not circular".
3. Two stacked vertical bands with translateY animation + palindromic palette + `in oklch` interpolation. User: "still not 100% smooth, the gradient transitions show banding". This is 8-bit color quantization — CSS gradients can't avoid it.
4. Switched to `shadergradient` — WebGL mesh gradient with FP32 precision and built-in dithering. Lazy-loaded so static-mode users don't pay the 265 KB bundle cost.

**Files added**
- `src/components/SkyFluidShader.jsx` — default export, lazy-loaded.
- `src/components/skyFluidConfig.js` — preset definitions + `getPresetConfig` + `TUNABLE_KEYS`. Pure data, no three/shadergradient imports — this is critical so `SkySettings.jsx` (which imports the preset list for the picker UI) doesn't accidentally pull the WebGL bundle into the main chunk.
- `src/components/SkyFluidErrorBoundary.jsx` — falls back to the static gradient if the shader explodes.

**Files modified**
- `src/store/{defaults,useSettingsStore}.js` — added `skyMode`, `skyFluidPreset`, `skyFluidCustom`, plus the `setSkyMode`, `setSkyFluidPreset`, `setSkyFluidCustom` actions.
- `src/components/Sky.jsx` — `if (skyMode === 'fluid')` returns the lazy shader inside an ErrorBoundary + Suspense. Otherwise the static rendering path.
- `src/components/SkySettings.jsx` — added Static/Fluid toggle, animation preset grid, fine-tune sliders.

**Fixed bug along the way:** "Cannot set properties of undefined (setting 'mapping')" on first mount. Root cause: `npm i three` had grabbed `three@0.184` (the latest) but shadergradient is built against `three@0.169` and the texture mapping API drifted between those versions. Pinned `three@~0.169.0`. Also cleared `node_modules/.vite` to force a fresh prebundle.

**Removed presets:** `halo`, `chrome`, `vortex`, `pulse` — the user found them visually weak compared to `liquid-wave` / `aurora-flow` / `slow-drift` / `plasma` / `mist` / `storm`. Kept only the 6 that earned their place.

**Verified**
- Main bundle stays at ~960 KB; shader chunk is ~1 MB and only loads when Fluid is selected.
- All 6 presets render without the mapping error.
- Sliders update in real time.
- Picking a new preset resets the sliders to that preset's defaults; Reset button restores them later.
- Settings persist across reload.
