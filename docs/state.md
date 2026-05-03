# Estado y persistencia

## Stores

Dos stores Zustand independientes, ambos con middleware `persist` apuntando a `localStorage`.

### `useDeckStore` — `localStorage["helios-deck/deck"]`

Estado del escritorio: qué widgets hay, dónde y cómo están configurados. Persistente.

```js
{
  widgets: [
    { id, type, x, y, w, h, settings }
  ],
  editMode: false,        // NO persistido — siempre false al cargar
  pickerOpen: false       // NO persistido
}
```

Acciones:

- `addWidget(type)` — instancia un widget en la primera posición libre con su `defaultSize`. Devuelve el id creado.
- `removeWidget(id)`.
- `moveWidget(id, x, y)` — sólo aplica si `(x, y, w, h)` no colisiona con otro widget y queda dentro del canvas.
- `resizeWidget(id, w, h)` — clamped a `[minSize, maxSize]` del descriptor.
- `updateSettings(id, partialSettings)` — merge sobre `instance.settings`.
- `setEditMode(bool)`, `togglePicker()`, `setPickerOpen(bool)`.

`editMode` y `pickerOpen` se excluyen de la persistencia con la opción `partialize` del middleware.

### `useSettingsStore` — `localStorage["helios-deck/settings"]`

Preferencias globales. Persistente. Versionada (`version: 2`); migración automática para usuarios pre-`gradientStops`.

```js
{
  location: {
    lat: 40.4168,
    lon: -3.7038,
    label: 'Madrid',
    timezone: 'Europe/Madrid',  // IANA tz, devuelto por Open-Meteo Geocoding
    country_code: 'ES'          // ISO 3166-1 alpha-2 para mostrar bandera
  } | null,
  cellSize: 88,           // px por celda (tope para el responsive cell)
  gap: 18,                // px de separación entre celdas
  theme: 'dark',          // reservado para multi-tema futuro
  gradientStops: [        // 5 colores hex para el cielo (cenit → horizonte)
    '#0a1230', '#1c2456', '#3a2a6b', '#a85a8c', '#ffb377'
  ]
}
```

`timezone` permite que Clock y SunTimes muestren la hora local del lugar elegido vía `Intl.DateTimeFormat({ timeZone })`. Sin timezone (locations antiguas), se usa la del navegador.

Acciones:

- `setLocation({ lat, lon, label })`.
- `requestGeolocation()` — usa `navigator.geolocation`, hace reverse-geocode con Open-Meteo Geocoding y guarda.
- `setCellSize(n)`, `setGap(n)`.
- `setGradientStop(index, color)` — actualiza un único stop (0..4).
- `setGradientStops(stops)` — sobreescribe el array entero (presets).
- `resetGradient()` — vuelve al `DEFAULT_GRADIENT` definido en `defaults.js`.

## Versionado del esquema persistido

El middleware `persist` admite `version` y `migrate`. Política:

- Cambios aditivos (nuevo campo opcional con default sano): incrementar `version`, `migrate` rellena el default.
- Cambios destructivos (renombrar/eliminar campos): incrementar `version`, `migrate` transforma o tira el state al default.
- Cambios en el shape de `settings` por widget: responsabilidad del propio widget — leer `instance.settings` con defaults defensivos en el componente.

Defaults centralizados en `src/store/defaults.js` para que `migrate` y `addWidget` lean del mismo sitio.

## Reset

Hay un botón "Reset" en la Toolbar (modo edición) que limpia ambos `localStorage` y recarga. Útil durante el desarrollo y para el usuario.
