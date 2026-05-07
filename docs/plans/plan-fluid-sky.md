# Plan — Fluid sky background mode (extension)

> Optional WebGL-rendered animated sky as an alternative to the static gradient. Lazy-loaded so users who never enable it pay zero bundle cost.

## What we are building

A second mode for the sky background, switchable from the existing sky modal:

- **Static gradient** (the original) — linear gradient using the user's 5 picked color stops, with two animated aurora blobs.
- **Fluid · animated** (new) — a WebGL mesh gradient rendered by [`shadergradient`](https://www.shadergradient.co/) that takes 3 of the user's color stops as inputs. 6 named animation presets (Liquid wave, Aurora flow, Slow drift, Plasma, Mist, Storm) and 5 fine-tune sliders (Speed, Intensity, Frequency, Density, Brightness) backed by Zustand persist.

## Why this shape

- A previous CSS-only attempt produced visible color banding (8-bit gradients in a tall scrolling element). WebGL renders in floating-point precision and dithers automatically, which fixes the banding.
- `shadergradient` ships a polished React component on top of `@react-three/fiber` + `three`. Bundle is heavy (~265 KB gzipped) so we lazy-load it: `Sky.jsx` does `lazy(() => import('./SkyFluidShader.jsx'))` and only triggers the chunk when `skyMode === 'fluid'`.
- Splitting the preset data (`skyFluidConfig.js`, no three/shadergradient imports) from the renderer (`SkyFluidShader.jsx`) prevents `SkySettings.jsx` (which needs preset metadata for the picker) from accidentally pulling shadergradient into the main bundle.
- All presets pin `lightType: '3d'` and `envPreset: 'city'`. Earlier experimentation with `'env'` lighting + alternative envPresets caused intermittent "Cannot set properties of undefined (setting 'mapping')" errors when the remote HDR texture failed to load. The narrowed config is the stable subset.

## Phases

1. **Install** `@shadergradient/react three @react-three/fiber@^8` (fiber 9 requires React 19; we're on 18). Pin `three@~0.169` because shadergradient was built against that and the texture API drifted in 0.184+.
2. **Settings store** — add `skyMode: 'static' | 'fluid'`, `skyFluidPreset`, `skyFluidCustom: { uSpeed, uStrength, uFrequency, uDensity, brightness }` to `defaults.js` + `useSettingsStore.js` with persist middleware.
3. **Renderer** — `src/components/SkyFluidShader.jsx` (default export, lazy-loaded). Reads stops + preset + custom overrides, spreads them into `<ShaderGradient>`.
4. **Config module** — `src/components/skyFluidConfig.js` (no three imports). Defines `FLUID_PRESETS`, `getPresetConfig`, `TUNABLE_KEYS`. Imported statically by both the renderer and `SkySettings`.
5. **Sky toggle in modal** — sliding pill (Static / Fluid). When Fluid is active, reveal the preset grid (2-column) and the fine-tune slider section.
6. **Error boundary** — `SkyFluidErrorBoundary.jsx` wraps the lazy renderer. If shadergradient throws (CDN flake, GPU issue), we fall back to the static gradient and log a warning. The user is never stuck on a black screen.

## Success criteria

- [ ] Static mode bundle is unaffected by the feature (verify with `npm run build`: main `index.js` stays around 950 KB; the shader chunk is separate).
- [ ] Switching to Fluid lazy-loads the chunk on first activation, then renders the animation.
- [ ] All 6 presets render without the "mapping" error.
- [ ] Fine-tune sliders update the live render in real time.
- [ ] Reset button restores the active preset's defaults.
- [ ] Mode + preset + custom values persist across reloads.
- [ ] If the shader fails (manually break the import), the ErrorBoundary kicks in and shows the static gradient instead of crashing the app.

## Out of scope

- A custom WebGL shader of our own.
- Animating between presets (instant swap is fine).
- Per-locale preset names (added later as part of i18n).
