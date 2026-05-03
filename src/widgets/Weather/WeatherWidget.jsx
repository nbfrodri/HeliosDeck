import {
  IconMapPinOff,
  IconWind,
  IconDroplet,
  IconTemperature,
  IconArrowUp,
  IconArrowDown,
  IconSunHigh,
  IconSunrise,
  IconSunset
} from '@tabler/icons-react';
import { usePolling } from '../../hooks/usePolling.js';
import {
  fetchWeather,
  weatherCodeToIcon,
  weatherCodeToLabel,
  weatherCodeToColor
} from '../../lib/api/openMeteo.js';
import { HourlyChart } from './HourlyChart.jsx';

function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function uvLevel(uv) {
  if (uv == null) return { label: '—', color: 'var(--text-3)' };
  if (uv < 3) return { label: 'Bajo', color: '#8be0c8' };
  if (uv < 6) return { label: 'Moderado', color: '#ffd166' };
  if (uv < 8) return { label: 'Alto', color: '#ffb377' };
  if (uv < 11) return { label: 'Muy alto', color: '#ff7a8a' };
  return { label: 'Extremo', color: '#d34cff' };
}

function Stat({ Icon, label, value }) {
  return (
    <div className="weather__stat">
      <div className="weather__stat-head">
        <Icon size={11} stroke={1.8} />
        <span className="label">{label}</span>
      </div>
      <div className="weather__stat-value">{value}</div>
    </div>
  );
}

export function WeatherWidget({ location }) {
  const { data, loading, error } = usePolling(
    () => (location ? fetchWeather(location) : Promise.resolve(null)),
    10 * 60 * 1000,
    [location?.lat, location?.lon]
  );

  if (!location) {
    return (
      <div className="empty">
        <IconMapPinOff size={28} stroke={1.5} />
        <div>Configura tu ubicación en la barra superior.</div>
      </div>
    );
  }
  if (loading && !data) return <div className="empty">Cargando…</div>;
  if (error && !data) return <div className="empty">No se pudo cargar el tiempo.</div>;
  if (!data) return null;

  const cur = data.current;
  const today = data.daily;
  const Icon = weatherCodeToIcon(cur.weather_code, !!cur.is_day);
  const tint = weatherCodeToColor(cur.weather_code, !!cur.is_day);
  const label = weatherCodeToLabel(cur.weather_code);
  const tMax = today?.temperature_2m_max?.[0];
  const tMin = today?.temperature_2m_min?.[0];
  const uv = today?.uv_index_max?.[0];
  const uvInfo = uvLevel(uv);
  const sunrise = today?.sunrise?.[0];
  const sunset = today?.sunset?.[0];

  return (
    <div className="weather">
      <div className="weather__head">
        <div className="weather__icon" style={{ color: tint, filter: `drop-shadow(0 6px 14px ${tint}55)` }}>
          <Icon size="100%" stroke={1.4} />
        </div>
        <div className="weather__main">
          <div className="weather__temp metric metric--lg">
            {Math.round(cur.temperature_2m)}°
          </div>
          <div className="weather__label">{label}</div>
        </div>
        <div className="weather__minmax">
          <div className="weather__minmax-row">
            <IconArrowUp size={11} stroke={2.2} color="#ff8e57" />
            <span>{tMax != null ? `${Math.round(tMax)}°` : '—'}</span>
          </div>
          <div className="weather__minmax-row">
            <IconArrowDown size={11} stroke={2.2} color="#9bb8ff" />
            <span>{tMin != null ? `${Math.round(tMin)}°` : '—'}</span>
          </div>
          <div className="weather__minmax-row" title={`UV ${uv?.toFixed(1) ?? '—'}`} style={{ color: uvInfo.color }}>
            <IconSunHigh size={11} stroke={2} />
            <span style={{ fontWeight: 600 }}>{uv != null ? Math.round(uv) : '—'}</span>
          </div>
        </div>
      </div>

      <div className="weather__chart">
        <HourlyChart hourly={data.hourly} current={cur} />
      </div>

      <div className="weather__stats">
        <Stat Icon={IconTemperature} label="Sensación" value={`${Math.round(cur.apparent_temperature)}°`} />
        <Stat Icon={IconDroplet} label="Humedad" value={`${cur.relative_humidity_2m}%`} />
        <Stat Icon={IconWind} label="Viento" value={`${Math.round(cur.wind_speed_10m)} km/h`} />
      </div>

      <div className="weather__sun">
        <span className="weather__sun-item">
          <IconSunrise size={12} stroke={1.7} color="#ffb377" />
          <span>{fmtTime(sunrise)}</span>
        </span>
        <span className="weather__sun-item">
          <IconSunset size={12} stroke={1.7} color="#ff8e57" />
          <span>{fmtTime(sunset)}</span>
        </span>
        <span className="weather__loc faint">{location.label}</span>
      </div>
    </div>
  );
}
