# HeliosDeck — documentación

Escritorio web personalizable con widgets en estilo bento. Cada widget consume datos meteorológicos, astronómicos o de calendario celeste, y el usuario los coloca, redimensiona, oculta y configura libremente. La configuración persiste en `localStorage`.

## Stack

- **Vite + React 18** (sin TypeScript, JSX puro).
- **dnd-kit** para drag & drop libre con snap a grid.
- **zustand + persist** para estado global y guardado de layout/configuración.
- **suncalc** para cálculos astronómicos locales (sin red).
- APIs públicas sin servidor propio: Open-Meteo, Open Notify, NASA APOD.

## Índice de documentos

| Documento | Contenido |
| --- | --- |
| [architecture.md](architecture.md) | Estructura de carpetas, principios y flujo general. |
| [widget-system.md](widget-system.md) | Contrato de un widget, registry, cómo añadir uno nuevo. |
| [state.md](state.md) | Stores Zustand, esquema persistido, migraciones. |
| [grid.md](grid.md) | Sistema de grid, dnd-kit, snap, colisiones, resize. |
| [apis.md](apis.md) | Catálogo de APIs, endpoints, claves, límites. |
| [design.md](design.md) | Lenguaje visual: mood, tokens, tipografía, capas, animaciones. |

## Convención de la documentación

- Cada feature significativa actualiza al menos un `.md`. Si un `.md` queda obsoleto, se actualiza en el mismo commit.
- Diagramas se mantienen en ASCII dentro del propio markdown para sobrevivir a renombrados.
- Los nombres de identificadores en docs deben coincidir exactamente con el código (`widgets/registry.js`, `useDeckStore`, etc.).
