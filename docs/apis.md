# APIs y fuentes de datos

## Globalidad

**Todas las fuentes son globales.** Open-Meteo (forecast + geocoding) cubre el mundo entero; SunCalc es matemática local que funciona para cualquier coordenada. La app no está restringida a España: los widgets refrescan correctamente al cambiar la ubicación a cualquier ciudad del planeta.

Cuando el usuario selecciona una ubicación:
- `Weather` refetch a Open-Meteo con las nuevas lat/lon (verificable en el `network log`).
- `SunTimes` recalcula con SunCalc para las nuevas coords y formatea con `location.timezone`.
- `MoonPhase` recalcula posición/distancia/altitud con SunCalc para las nuevas coords (la fase global se mantiene).
- `Clock` formatea la hora con `Intl.DateTimeFormat({ timeZone: location.timezone })` — muestra la hora local del lugar elegido, no la del navegador.

## Resumen

| Fuente | Datos | Auth | Coste | Usado por |
| --- | --- | --- | --- | --- |
| Open-Meteo Forecast | Tiempo actual + horario 12h + diario (max/min, sunrise, sunset, UV) | No | Gratis, global | `Weather` |
| Open-Meteo Geocoding | Nombre de ciudad ↔ lat/lon + `timezone` (IANA) + `country_code` | No | Gratis, global | `LocationSearch`, GPS reverse |
| SunCalc (npm) | Fase lunar, salida/puesta sol y luna, posición azimut/altitud, distancia, golden hour | — | Local, sin red, global | `MoonPhase`, `SunTimes`, `Clock` (countdown) |
| Open Notify ISS | Posición actual de la ISS | No | Gratis | `ISS` (futuro) |
| NASA APOD | Imagen del día | API key gratuita (`DEMO_KEY` de prueba) | 1.000 req/h con key registrada | `APOD` (futuro) |
| Astronomy API | Cuerpos celestes, constelaciones | Basic auth, free tier limitado | Free tier ~500 req/día | `Constellations` (futuro) |

## Open-Meteo Forecast

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,
           precipitation,weather_code,wind_speed_10m,wind_direction_10m
  &hourly=temperature_2m,precipitation_probability,weather_code
  &timezone=auto
```

- `weather_code` sigue WMO. Mapping a icono/etiqueta vive en `src/lib/api/openMeteo.js` (`weatherCodeToLabel`, `weatherCodeToIcon`).
- Sin clave necesaria. Atribución recomendada en el footer.

## Open-Meteo Geocoding

```
GET https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=es
```

Devuelve resultados con `latitude`, `longitude`, `name`, `country`. Usado para que el usuario teclee una ciudad sin pedir permisos de geolocalización.

## SunCalc

```js
import SunCalc from 'suncalc';

SunCalc.getMoonIllumination(new Date());
// → { fraction: 0..1, phase: 0..1, angle }

SunCalc.getMoonTimes(date, lat, lon);
// → { rise, set, alwaysUp, alwaysDown }

SunCalc.getTimes(date, lat, lon);
// → { sunrise, sunset, solarNoon, dawn, dusk, ... }

SunCalc.getPosition(date, lat, lon);
// → { altitude (rad), azimuth (rad) }
```

Sin API, todo se calcula con efemérides locales. Suficiente para fase lunar, horarios y posición instantánea sin red.

## Open Notify ISS (futuro)

```
GET http://api.open-notify.org/iss-now.json
→ { iss_position: { latitude, longitude }, timestamp }
```

HTTP plano (no HTTPS) — habrá que proxy o cambiar de proveedor (wheretheiss.at lo expone por HTTPS). Documentar antes de añadir el widget.

## Política de claves

- Las claves van en `.env.local` con prefijo `VITE_` (Vite las inyecta en build).
- Nunca commitear `.env.local`. `.env.example` sirve de referencia.
- Si una API requiere clave de pago, el widget detecta su ausencia y muestra estado vacío con instrucciones, no crashea.

## Política de fetch

- Cada widget que consume red tiene su propio polling interval razonable (clima cada 10 min, ISS cada 5 s, APOD una vez al día).
- Hook común `usePolling(fn, intervalMs, deps)` evita reescribir la mecánica.
- Errores de red muestran último valor cacheado + indicador discreto, no rompen el widget.
