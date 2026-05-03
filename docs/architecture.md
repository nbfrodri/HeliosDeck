# Arquitectura

## Principios

1. **Widgets son ciudadanos de primera clase**: cada widget es un módulo autocontenido que se registra en `src/widgets/registry.js`. Añadir un widget nuevo no debe requerir tocar el `Deck`, el store ni el picker.
2. **Una sola fuente de verdad**: el layout y la configuración viven en `useDeckStore`. La UI es derivada y reactiva.
3. **Sin backend**: todas las APIs son públicas y se consumen desde el navegador. La persistencia es `localStorage`.
4. **Cálculos locales antes que red**: lo que se puede calcular sin red (fase lunar, salida del sol, posición de astros básicos) usa `suncalc` en el cliente.

## Estructura de carpetas

```
src/
├── main.jsx                  # entry React
├── App.jsx                   # composición top-level (Toolbar + Deck + Picker)
├── styles/
│   └── global.css            # variables CSS + estilos base
├── store/
│   ├── useDeckStore.js       # widgets[], layout, edit mode, picker
│   └── useSettingsStore.js   # location, theme, cellSize, gap
├── widgets/
│   ├── registry.js           # registro central de tipos de widget
│   ├── Clock/
│   │   ├── ClockWidget.jsx
│   │   └── index.js          # export del descriptor
│   ├── Weather/
│   ├── MoonPhase/
│   └── SunTimes/
├── components/
│   ├── Sky.jsx               # fondo crepuscular animado (gradiente personalizable + nubes + estrellas + grain)
│   ├── Brand.jsx             # wordmark + glifo orbital (sol con luna en órbita)
│   ├── Deck.jsx              # canvas + DndContext
│   ├── DeckWidget.jsx        # shell draggable + resize
│   ├── EmptyHero.jsx         # estado vacío con ilustración, dual CTA y chips de widgets
│   ├── Toolbar.jsx
│   ├── WidgetPicker.jsx
│   ├── LocationSearch.jsx    # popover de búsqueda con autocomplete (Open-Meteo Geocoding)
│   ├── SkySettings.jsx       # modal para personalizar gradiente del cielo (color pickers + presets)
│   ├── Modal.jsx             # primitivo: backdrop, header, body, footer, ESC, click-outside
│   └── ConfirmDialog.jsx     # confirm in-app sobre Modal (sustituye window.confirm)
├── hooks/
│   ├── useGeolocation.js
│   └── usePolling.js
└── lib/
    ├── grid.js               # snap, colisiones, geometría
    └── api/
        └── openMeteo.js
```

## Flujo de datos

```
                ┌────────────────────────┐
                │      useSettingsStore  │  (lat/lon, theme, cellSize)
                └──────────┬─────────────┘
                           │
   ┌───────────────────────┼───────────────────────┐
   │                       │                       │
   ▼                       ▼                       ▼
┌────────┐         ┌──────────────┐        ┌──────────────┐
│Toolbar │         │ Widget       │  hooks │ lib/api/*    │
│        │         │ components   ├───────►│ + suncalc    │
└────────┘         └──────┬───────┘        └──────────────┘
                          │
                          ▼
                  ┌────────────────┐
                  │ useDeckStore   │  (widgets[], moveWidget, resizeWidget)
                  └───────┬────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Deck (DndContext)│  → DeckWidget * N
                └──────────────────┘
```

## Modos de la UI

- **Vista**: el grid se renderiza sin guías; los widgets son interactivos pero no se mueven ni redimensionan.
- **Edición**: aparece la rejilla de fondo, se muestran los handles de arrastre/cierre/resize. Toggle desde la Toolbar.

El modo se guarda en `useDeckStore.editMode` (no se persiste — vuelve a `false` al recargar).

## Decisiones explícitas

- **Posicionamiento libre con snap**, no flujo automático tipo masonry. Es un escritorio, no un feed: la posición elegida por el usuario manda.
- **Colisiones rechazan el drop**, no empujan. Más simple y predecible para una v1; se puede revisitar si molesta.
- **Resize manual con pointer events**, no dnd-kit, porque dnd-kit modela arrastre, no redimensionado. Mantener ambas mecánicas separadas evita acoplar el handle de resize al sistema de drag.
- **JSX puro (sin TS)** por petición explícita. Las firmas se documentan en JSDoc cuando aporta claridad.
