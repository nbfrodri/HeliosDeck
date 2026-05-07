import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useEarthquakes } from '../hooks/useEarthquakes.js';
import { useWeather } from '../hooks/useWeather.js';
import { weatherCodeToLabel } from '../lib/api/openMeteo.js';

const CENTER = [20, 0];
const ZOOM = 2;

const WINDOW_OPTIONS = [
  { hours: 24, label: '24h' },
  { hours: 24 * 7, label: '7d' },
  { hours: 24 * 30, label: '30d' },
];

function magColor(m) {
  if (m == null) return '#888';
  if (m >= 6) return '#ed5564';
  if (m >= 5) return '#ff8e57';
  if (m >= 4) return '#b9cd56';
  return '#5677ad';
}

function magRadius(m) {
  if (m == null) return 4;
  return Math.max(4, (m - 2) * 2.4);
}

function relTime(ms) {
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'just now';
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function PopupBody({ feature }) {
  const [lon, lat, depth] = feature.geometry.coordinates;
  const m = feature.properties?.mag;
  const place = feature.properties?.place ?? 'Unknown location';
  const time = feature.properties?.time;
  const url = feature.properties?.url;

  const { data: weather, isLoading, isError } = useWeather({ lat, lon });
  const cur = weather?.current;

  return (
    <div className="map-popup">
      <div className="map-popup__head">
        <span
          className="map-popup__mag"
          style={{
            background: magColor(m),
            color: m != null && m >= 5 ? '#2a1408' : '#fff',
          }}
        >
          {m != null ? m.toFixed(1) : '?'}
        </span>
        <div className="map-popup__title">
          {url ? (
            <a href={url} target="_blank" rel="noreferrer">{place}</a>
          ) : (
            place
          )}
        </div>
      </div>
      <div className="map-popup__meta">
        {time && <span>{relTime(time)}</span>}
        {depth != null && <span>{Math.round(depth)} km depth</span>}
      </div>
      <div className="map-popup__weather">
        <div className="map-popup__weather-label">Local conditions</div>
        {isLoading && (
          <div className="map-popup__weather-state">Loading…</div>
        )}
        {isError && (
          <div className="map-popup__weather-state">No data</div>
        )}
        {cur && (
          <div className="map-popup__weather-row">
            <span className="map-popup__temp">{Math.round(cur.temperature_2m)}°</span>
            <span className="map-popup__condition">{weatherCodeToLabel(cur.weather_code)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  const [hoursWindow, setHoursWindow] = useState(24 * 7);
  const minMagnitude = 4.5;
  const { data, isLoading, isError } = useEarthquakes({ minMagnitude, hoursWindow });
  const features = data?.features ?? [];

  const activeIdx = WINDOW_OPTIONS.findIndex((o) => o.hours === hoursWindow);

  return (
    <main className="page page--map">
      <div className="map-overlay" role="region" aria-label="Map controls">
        <div className="map-overlay__title">Seismic + weather map</div>
        <div className="map-overlay__sub">
          USGS · M ≥ {minMagnitude.toFixed(1)} · last{' '}
          {WINDOW_OPTIONS[activeIdx]?.label}
        </div>
        <div
          className="quakes-tabs map-overlay__tabs"
          style={{ '--idx': activeIdx, '--tab-count': WINDOW_OPTIONS.length }}
          role="tablist"
        >
          <span className="quakes-tabs__indicator" aria-hidden />
          {WINDOW_OPTIONS.map((o) => (
            <button
              key={o.hours}
              type="button"
              role="tab"
              aria-selected={hoursWindow === o.hours}
              className={`quakes-tab${hoursWindow === o.hours ? ' quakes-tab--active' : ''}`}
              onClick={() => setHoursWindow(o.hours)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="map-overlay__count">
          {isLoading && 'Loading…'}
          {isError && 'Failed to load events'}
          {!isLoading && !isError && `${features.length} events`}
        </div>
      </div>

      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        minZoom={2}
        scrollWheelZoom
        className="map-container"
        worldCopyJump
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />
        {features.map((f) => {
          const [lon, lat] = f.geometry.coordinates;
          const m = f.properties?.mag;
          return (
            <CircleMarker
              key={f.id}
              center={[lat, lon]}
              radius={magRadius(m)}
              pathOptions={{
                color: 'rgba(255, 255, 255, 0.55)',
                weight: 1,
                fillColor: magColor(m),
                fillOpacity: 0.6,
              }}
            >
              <Popup>
                <PopupBody feature={f} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </main>
  );
}
