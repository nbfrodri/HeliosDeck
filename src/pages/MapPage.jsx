import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import {
  IconClock,
  IconArrowDown,
  IconCompass,
  IconDroplet,
  IconWind,
} from '@tabler/icons-react';
import { useEarthquakes } from '../hooks/useEarthquakes.js';
import { useWeather } from '../hooks/useWeather.js';
import {
  weatherCodeToLabel,
  weatherCodeToIcon,
  weatherCodeToColor,
} from '../lib/api/openMeteo.js';

const CENTER = [20, 0];
const ZOOM = 2;
// Lock vertical pan only — Mercator stretches to infinity past ±85° anyway.
// Longitude is left unbounded so worldCopyJump can wrap freely.
const VERTICAL_BOUNDS = [
  [-85, -Infinity],
  [85, Infinity],
];

const WINDOW_OPTIONS = [
  { hours: 24, label: '24h' },
  { hours: 24 * 7, label: '7d' },
  { hours: 24 * 30, label: '30d' },
];

const MAG_TIERS = [
  { label: '< 4',   color: '#5677ad' },
  { label: '4 – 5', color: '#b9cd56' },
  { label: '5 – 6', color: '#ff8e57' },
  { label: '≥ 6',   color: '#ed5564' },
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
  const Icon = cur?.weather_code != null
    ? weatherCodeToIcon(cur.weather_code, !!cur.is_day)
    : null;
  const tint = cur?.weather_code != null
    ? weatherCodeToColor(cur.weather_code, !!cur.is_day)
    : null;

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
        <div className="map-popup__head-text">
          <div className="map-popup__title">
            {url ? (
              <a href={url} target="_blank" rel="noreferrer">{place}</a>
            ) : (
              place
            )}
          </div>
          <div className="map-popup__meta">
            {time && (
              <span className="map-popup__meta-item">
                <IconClock size={11} stroke={1.8} />
                {relTime(time)}
              </span>
            )}
            {depth != null && (
              <span className="map-popup__meta-item">
                <IconArrowDown size={11} stroke={1.8} />
                {Math.round(depth)} km
              </span>
            )}
            <span className="map-popup__meta-item">
              <IconCompass size={11} stroke={1.8} />
              {lat.toFixed(2)}°, {lon.toFixed(2)}°
            </span>
          </div>
        </div>
      </div>

      <div className="map-popup__weather">
        <div className="map-popup__weather-label">Local conditions</div>
        {isLoading && <div className="map-popup__weather-state">Loading…</div>}
        {isError && <div className="map-popup__weather-state">No data</div>}
        {cur && (
          <>
            <div className="map-popup__weather-row">
              {Icon && (
                <span
                  className="map-popup__weather-icon"
                  style={{ color: tint }}
                >
                  <Icon size={36} stroke={1.5} />
                </span>
              )}
              <div className="map-popup__weather-text">
                <div className="map-popup__temp">
                  {Math.round(cur.temperature_2m)}°
                </div>
                <div className="map-popup__condition">
                  {weatherCodeToLabel(cur.weather_code)}
                </div>
              </div>
            </div>
            <div className="map-popup__weather-extras">
              {cur.relative_humidity_2m != null && (
                <span className="map-popup__extra">
                  <IconDroplet size={11} stroke={1.8} />
                  {cur.relative_humidity_2m}%
                </span>
              )}
              {cur.wind_speed_10m != null && (
                <span className="map-popup__extra">
                  <IconWind size={11} stroke={1.8} />
                  {Math.round(cur.wind_speed_10m)} km/h
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  const [hoursWindow, setHoursWindow] = useState(24 * 7);
  const minMagnitude = 4.5;
  const { data, isLoading, isError, isFetching } = useEarthquakes({
    minMagnitude,
    hoursWindow,
  });
  const features = data?.features ?? [];

  const activeIdx = WINDOW_OPTIONS.findIndex((o) => o.hours === hoursWindow);
  const windowLabel = WINDOW_OPTIONS[activeIdx]?.label;

  return (
    <main className="page page--map">
      <header className="map-header">
        <div className="map-header__intro">
          <h1 className="map-header__title">Seismic + weather map</h1>
          <p className="map-header__sub">
            USGS · magnitude ≥ {minMagnitude.toFixed(1)} · last {windowLabel}
          </p>
        </div>
        <div className="map-header__controls">
          <div className="map-header__count">
            {isLoading && 'Loading…'}
            {isError && 'Failed to load'}
            {!isLoading && !isError && (
              <>
                <span className="map-header__count-num">{features.length}</span>
                <span className="map-header__count-label">events</span>
                {isFetching && <span className="map-header__refresh">refreshing…</span>}
              </>
            )}
          </div>
          <div
            className="quakes-tabs map-header__tabs"
            style={{ '--idx': activeIdx, '--tab-count': WINDOW_OPTIONS.length }}
            role="tablist"
            aria-label="Time window"
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
        </div>
      </header>

      <div className="map-pane">
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          minZoom={2}
          maxBounds={VERTICAL_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          worldCopyJump
          zoomControl={false}
          className="map-container"
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomControl position="topright" />
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

        <div className="map-legend" aria-label="Magnitude legend">
          <div className="map-legend__title">Magnitude</div>
          <div className="map-legend__scale">
            {MAG_TIERS.map((t) => (
              <div key={t.label} className="map-legend__row">
                <span
                  className="map-legend__dot"
                  style={{ background: t.color }}
                />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
