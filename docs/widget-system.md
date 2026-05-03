# Sistema de widgets

## Contrato de un widget

Cada widget vive en `src/widgets/<Nombre>/` y exporta un **descriptor** desde su `index.js`:

```js
// src/widgets/Clock/index.js
import { IconClock } from '@tabler/icons-react';
import { ClockWidget } from './ClockWidget.jsx';

export const ClockDescriptor = {
  type: 'clock',                    // identificador único, kebab-case
  name: 'Reloj',                    // nombre visible en el picker
  description: 'Hora local con segundos.',
  Icon: IconClock,                  // componente React de @tabler/icons-react
  defaultSize: { w: 4, h: 2 },      // en celdas del grid
  minSize: { w: 3, h: 2 },
  maxSize: { w: 8, h: 3 },
  defaultSettings: { showSeconds: true, format: '24h' },
  Component: ClockWidget,           // recibe { instance, settings, location }
  SettingsComponent: null           // opcional: panel de settings por instancia
};
```

`Icon` es un componente React (no un string ni un emoji). Se renderiza con `<desc.Icon size={N} stroke={1.8} />` en el chrome del widget, en el picker y en los chips del empty state.

El descriptor se importa y se añade al array exportado por `src/widgets/registry.js`:

```js
import { ClockDescriptor } from './Clock';
import { WeatherDescriptor } from './Weather';
// ...

export const widgetDescriptors = [
  ClockDescriptor,
  WeatherDescriptor,
  // ...
];

export function getDescriptor(type) {
  return widgetDescriptors.find((d) => d.type === type);
}
```

## Forma de una instancia en el store

```js
{
  id: 'w_1715703421_4xq',   // único por instancia
  type: 'clock',            // referencia al descriptor
  x: 0, y: 0,               // celda superior izquierda
  w: 3, h: 2,               // tamaño en celdas
  settings: { showSeconds: true, format: '24h' }
}
```

## Cómo se renderiza

`Deck` recorre `useDeckStore.widgets` y para cada instancia:

1. Busca su descriptor en el registry. Si no existe (widget eliminado del código), lo ignora.
2. Calcula su posición/tamaño en píxeles a partir de `cellSize` y `gap`.
3. Lo envuelve en un `DeckWidget` (shell con drag handle, resize, botón de cierre).
4. Renderiza `<descriptor.Component instance={instance} settings={instance.settings} location={location} />`.

El componente del widget **no sabe** de drag, resize, edición ni store. Solo recibe sus props y muestra contenido.

## Cómo añadir un widget nuevo

1. Crear `src/widgets/<Nombre>/<Nombre>Widget.jsx` con el componente.
2. Crear `src/widgets/<Nombre>/index.js` con el descriptor.
3. Importar y registrar el descriptor en `src/widgets/registry.js`.
4. (Opcional) Añadir un `<Nombre>Settings.jsx` si el widget tiene opciones por instancia.
5. Documentar en `docs/widgets/<nombre>.md` (datos consumidos, dependencias, fallback).

No se necesita tocar `Deck`, `Toolbar`, `WidgetPicker` ni `useDeckStore` — todo es genérico sobre el registry.

## Settings por instancia vs globales

- **Por instancia** (en `instance.settings`): preferencias que tiene sentido variar entre dos instancias del mismo widget (formato 24/12h, unidades, etc.).
- **Globales** (en `useSettingsStore`): cosas que afectan a varios widgets a la vez (ubicación geográfica, tema, tamaño de celda).
