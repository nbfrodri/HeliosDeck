# Lenguaje visual

## Mood

Crepúsculo. Un cielo que va del azul profundo (cenit nocturno) a violeta (atardecer/amanecer) y se cierra con tonos cálidos (rosa, ámbar) hacia el horizonte. Los widgets son **cristales translúcidos flotando** sobre ese cielo: glassmorphism con `backdrop-filter` real, no un color falso semitransparente.

La interfaz no compite con el contenido. La barra y los widgets son chrome calmado; la atmósfera (gradiente animado + nubes) hace el trabajo emocional.

## Tokens

Definidos como variables CSS en `src/styles/global.css`:

### Cielo
- `--sky-deep` `#0a1230` — base (cenit)
- `--sky-mid` `#1c2456`
- `--sky-violet` `#3a2a6b`
- `--sky-rose` `#a85a8c`
- `--sky-amber` `#ffb377`
- `--sky-pale` `#ffe1d2`

### Texto
- `--text-1` `#f4f1ff` — máximo contraste (números grandes, títulos)
- `--text-2` 78% — texto secundario
- `--text-3` 50% — labels, muted
- `--text-faint` 32% — pistas, atribuciones

### Acento
- `--accent` `#fde7c8` — cálido suave
- `--accent-warm` `#ffb377` — CTA, sol
- `--accent-cold` `#9bb8ff` — luna, frío
- `--danger` `#ff7a8a`

### Glass
- `--glass-bg` `rgba(255,255,255,0.06)` — superficie por defecto
- `--glass-bg-strong` `rgba(255,255,255,0.10)` — hover/activo
- `--glass-border` `rgba(255,255,255,0.14)`
- `--glass-border-strong` `rgba(255,255,255,0.24)` — hover
- `--glass-shadow` — proyección difusa hacia abajo
- `--glass-inset` — highlight interno superior + sombra inferior

Toda superficie de cristal usa `backdrop-filter: blur(28px) saturate(180%)`. La saturación amplifica el cielo detrás y evita que el cristal se vea grisáceo.

## Tipografía

- **Inter** para UI: pesos 300/400/500/600/700, font-features `cv11 ss01 ss03` para alternativas estilísticas.
- **Instrument Serif** para acentos editoriales: marca, títulos del picker, hero del estado vacío.
- Números siempre con `font-variant-numeric: tabular-nums` para que no bailen al cambiar.
- Letter-spacing negativo en métricas grandes (`-0.03em`/`-0.05em`); positivo (`0.12em` con uppercase) en labels.

## Capas

```
┌─ ui (toolbar, widgets, picker) ── glass
├─ grain ───────────────────────── overlay
├─ stars ───────────────────────── radial dots
├─ clouds (a, b, c) ────────────── floating blobs
├─ aurora (sky::before/::after) ── giant blurred radial gradients
└─ gradient base (.sky) ────────── linear top→bottom twilight
```

Todo lo del fondo está en `Sky.jsx` y vive en `position: fixed; z-index: -1`. Los widgets nunca tapan el fondo más allá del blur.

## Animaciones

- Aurora y nubes: drifts de 30–110s, `cubic-bezier(0.65, 0, 0.35, 1)`, `alternate` o lineal `infinite`.
- `prefers-reduced-motion: reduce` desactiva todas las animaciones de fondo.
- Transiciones de UI: 180–220ms con `cubic-bezier(0.2, 0.8, 0.2, 1)`. Snappy pero no bruscas.
- Picker entra con `scaleIn` (0.96 → 1) + `fadeIn`. El backdrop es blur+oscurecido.

## Iconografía

- Iconos de la toolbar y de UI (modal close, search, location, palette, edit, etc.): **`@tabler/icons-react`**, stroke 1.8 (2.0 para énfasis), `currentColor`. Tabler tree-shakes con Vite, así que cada icono importado pesa lo justo.
- Iconos de widgets (en `descriptor.icon` y picker tile): emoji por simplicidad y por aportar color sin más assets. Mantenerlos como string en el descriptor permite mostrarlos donde haga falta sin que cada widget importe Tabler.
- Iconos en `EmptyHero` chips: Tabler con `IconClock`, `IconCloudFilled`, `IconMoonFilled`, `IconSunset2`.
- Glifo de marca (`BrandGlyph`): SVG hecho a mano (sol con órbita y luna).

## Responsividad: container queries

Cada `.widget__body` declara `container-type: inline-size; container-name: widget`. Esto convierte al body en el contenedor de queries; los descendientes pueden usar:

- **`cqi`** (1% del inline-size del contenedor) para tipografía fluida con `clamp()`. Ejemplo: `font-size: clamp(34px, 17cqi, 80px)` en `.widget--clock .metric--xl` escala el reloj de 34px (mínimo) a 80px (máximo) según ancho real del widget.
- **`@container widget (max-width: 220px)`** para reordenar/ocultar elementos por debajo de cierto umbral. Ejemplos en uso:
  - Reloj < 220px: oculta el toggle 12h/24h.
  - Reloj < 180px: oculta los segundos.
  - Weather < 240px: stats pasan de 3 a 2 columnas y oculta el label de ubicación.
  - Weather < 180px: oculta los stats por completo.
  - SunTimes ≤ 220px: filas más compactas, iconos más pequeños.
  - MoonPhase < 200px: oculta la fecha absoluta y deja solo "en X días".

Cada widget se identifica con la clase `widget--<type>` añadida en `DeckWidget.jsx`, lo que permite reglas específicas por widget sin saturar el componente con lógica JS.

**Por qué container queries y no media queries:** un widget de 300px en un canvas de 1920px no tiene nada que ver con la viewport. Lo que importa es el ancho propio del widget. Las CQ son la herramienta correcta y todos los navegadores modernos las soportan.

## Patrones de UI reutilizables

- **Modal** (`components/Modal.jsx`): backdrop con blur+oscurecido, contenedor de cristal con header (título serif + close), body y footer opcional. Maneja Esc y click-outside. Animación `scaleIn` + `fadeIn`. Usado por `SkySettings`, `ConfirmDialog`.
- **Popover** (clases `.popover`/`.popover__overlay`): contenedor anclado a coordenadas pasadas como prop (`anchorRect`). Usado por `LocationSearch` para colgar el buscador del botón de ubicación.
- **Segmented toggle** (`.seg-toggle`): grupo de botones pill mutuamente excluyentes. Usado por el toggle 12h/24h del reloj. Para futuros switches binarios mantener este patrón.
- **Color row + Presets** (en `SkySettings`): cada parada del gradiente como fila editable; rejilla de presets debajo, cada uno con swatch en miniatura y nombre.
- **Confirm in-app** (`ConfirmDialog`): siempre preferible a `window.confirm`. Soporta `destructive` para acciones irreversibles (botón rojo).

## Don'ts

- **No usar opacidades sólidas planas (rgba con alfa) sin backdrop-filter** para fingir cristal — se ve gris en el cielo.
- **No saturar de gradientes en cada widget** — el cielo ya da color; los widgets son neutros.
- **No usar text-transform: capitalize en frases con preposiciones** (rompía la fecha del reloj).
- **No sustituir el blur por un fondo opaco** sin ajustar también la `border` y la sombra; pierde profundidad.
