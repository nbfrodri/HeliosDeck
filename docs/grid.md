# Grid, drag & drop, resize

## Implementación

Migrado a **react-grid-layout v1.5** (`Responsive` + `WidthProvider`) — librería gold-standard para dashboards (la usan Grafana y Kibana). Resuelve fuera de la caja:
- Reflow automático de widgets al cambiar viewport (sin overlap)
- Drag con handle propio (`.widget__chrome` vía `draggableHandle`)
- Resize por esquinas (`resizeHandles=['se']`, estilizado para match glass)
- Compactación vertical (no deja huecos)
- Persistencia: `onDragStop`/`onResizeStop` actualizan store sólo en cambios iniciados por el usuario, no en auto-reflows

**Breakpoints y columnas**:

| BP | Ancho | Cols |
| --- | --- | --- |
| `lg` | ≥ 1200px | 12 |
| `md` | ≥ 996px | 10 |
| `sm` | ≥ 768px | 6 |
| `xs` | ≥ 480px | 4 |
| `xxs` | < 480px | 2 |

`rowHeight` también es responsive (60–96px clamp en función del ancho de viewport, vía ResizeObserver propio).

## Modelo lógico

El estado se guarda en `useDeckStore.widgets[]` con `{ id, type, x, y, w, h, settings }`. Los `x/y/w/h` son cell coordinates (no píxeles). RGL renderiza en píxeles a partir de cols × rowHeight.

```js
const { cellSize } = useResponsiveCell(deckRef, {
  targetCols: 12,
  minCell: 56,
  maxCell: settings.cellSize, // preferencia del usuario actúa como tope
  gap,
  padding: 18
});
```

`useResponsiveCell` instala un `ResizeObserver` sobre el contenedor y devuelve **dos valores** que adaptan el grid al viewport:

- `cellSize`: tamaño actual de cada celda en px, clamped a `[minCell, maxCell]`.
- `cols`: número de columnas que caben con `cellSize ≥ minCell`. Empieza por `maxCols=12` y baja si no entran.

El canvas se dimensiona a `cols × cellSize + (cols-1)·gap + gap` (último `+gap` = right gutter), nunca excede el ancho del deck. **No hay scroll horizontal** en ningún viewport.

Resultados verificados (con `maxCell=88`, `minCell=64`, `gap=18`, `rightGutter=18`):

| Viewport | cols | cellSize | Canvas | Overflow |
| --- | --- | --- | --- | --- |
| 1440px | 12 | 88 | 1272 | No |
| 1024px | 12 | 71 | 979 | No |
| 768px  | 8  | 72 | 720 | No |
| 480px  | 5  | 72 | 450 | No |
| 380px  | 4  | 70 | 352 | No |

Las **posiciones lógicas** `(x, y, w, h)` de cada widget se conservan entre viewports — un widget guardado en `x=10` con un grid de 12 columnas se **clampea visualmente** a `x = max(0, cols - w)` cuando se renderiza en un grid más estrecho. Al volver a un viewport amplio, el widget recupera su posición original.

El drag aplica el delta sobre la posición renderizada (no la lógica), evitando saltos al arrastrar widgets clampeados.

 Una celda en posición `(x, y)` ocupa el rect:

```
left   = x * (cellSize + gap)
top    = y * (cellSize + gap)
width  = w * cellSize + (w - 1) * gap
height = h * cellSize + (h - 1) * gap
```

Las funciones de geometría viven en `src/lib/grid.js`:

- `cellToPx({ x, y, w, h }, cellSize, gap)` → `{ left, top, width, height }`
- `pxDeltaToCells({ dx, dy }, cellSize, gap)` → `{ dx, dy }` en celdas (round)
- `rectsOverlap(a, b)` → bool, AABB sobre celdas.
- `findFreeSpot(widgets, size, columns)` — recorre filas buscando hueco para `size`.

## Drag con dnd-kit

```jsx
<DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
  {widgets.map((w) => (
    <DeckWidget key={w.id} instance={w} />
  ))}
</DndContext>
```

`DeckWidget` usa `useDraggable({ id: w.id, disabled: !editMode })`. El `transform` que devuelve dnd-kit se aplica como CSS `translate3d` durante el arrastre (visual). Al soltar, `onDragEnd` recibe `{ active, delta }`:

```js
function handleDragEnd({ active, delta }) {
  const w = widgets.find((w) => w.id === active.id);
  const { dx, dy } = pxDeltaToCells(delta, cellSize, gap);
  moveWidget(w.id, w.x + dx, w.y + dy);
}
```

`moveWidget` en el store valida:

1. `x >= 0 && y >= 0`.
2. No hay otro widget cuyo rect (en celdas) se solape con el nuevo.

Si la validación falla, **no se aplica** y el widget vuelve a su posición. Sin animación de rebote por ahora.

## Resize

dnd-kit no resuelve resize; se implementa con un `<ResizeHandle>` propio:

- Esquina inferior-derecha del widget, visible solo en modo edición.
- `onPointerDown` captura el puntero (`setPointerCapture`), guarda posición inicial y dimensiones iniciales.
- `pointermove` actualiza `w` y `h` en píxeles → convierte a celdas → llama a `resizeWidget(id, w, h)` con clamp a `[minSize, maxSize]`.
- `pointerup` libera la captura.

`stopPropagation` en el `pointerdown` del handle es crítico para que dnd-kit no inicie un drag.

## Modificadores aplicados

- `restrictToParentElement` (de `@dnd-kit/modifiers`): el widget no se puede arrastrar fuera del canvas.
- No usamos `snapCenterToCursor` ni `snapToGrid` durante el arrastre — el snap se hace al soltar, manteniendo el feedback visual fluido.

## Sensores

`useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))` para que un click corto no inicie un drag accidental.
