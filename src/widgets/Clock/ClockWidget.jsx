import { useEffect, useState } from 'react';
import SunCalc from 'suncalc';
import { IconSunrise, IconSunset, IconWorld } from '@tabler/icons-react';
import { useDeckStore } from '../../store/useDeckStore.js';
import { timeParts, formatInZone, tzShortLabel } from '../../lib/time.js';

function isoWeek(date, tz) {
  // Use date components in the target tz to compute week consistently with the displayed date.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const get = (t) => parseInt(parts.find((p) => p.type === t)?.value, 10);
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function dayOfYear(date, tz) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const get = (t) => parseInt(parts.find((p) => p.type === t)?.value, 10);
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const start = new Date(Date.UTC(year, 0, 0));
  const today = new Date(Date.UTC(year, month - 1, day));
  return Math.floor((today - start) / 86400000);
}

function fmtCountdown(ms) {
  if (ms == null || ms < 0) return '—';
  const total = Math.round(ms / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m`;
}

function nextSolarEvent(now, location) {
  if (!location) return null;
  const todayTimes = SunCalc.getTimes(now, location.lat, location.lon);
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const tomorrowTimes = SunCalc.getTimes(tomorrow, location.lat, location.lon);
  const candidates = [
    { kind: 'sunrise', date: todayTimes.sunrise },
    { kind: 'sunset', date: todayTimes.sunset },
    { kind: 'sunrise', date: tomorrowTimes.sunrise },
    { kind: 'sunset', date: tomorrowTimes.sunset }
  ];
  const future = candidates.filter((c) => c.date && c.date > now).sort((a, b) => a.date - b.date);
  return future[0] ?? null;
}

export function ClockWidget({ instance, settings, location }) {
  const [now, setNow] = useState(() => new Date());
  const updateSettings = useDeckStore((s) => s.updateSettings);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const showSeconds = settings?.showSeconds ?? true;
  const format = settings?.format ?? '24h';
  const is24h = format === '24h';
  const tz = location?.timezone || null;

  const { hour, minute, second, dayPeriod: rawDayPeriod } = timeParts(now, tz, !is24h);
  // Strip non-letters from dayPeriod to get clean "am"/"pm" (es-ES gives "p. m.")
  const dayPeriod = rawDayPeriod ? rawDayPeriod.replace(/[^a-záéíóúñ]/gi, '') : null;
  const dateRaw = formatInZone(now, tz, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const date = dateRaw.charAt(0).toUpperCase() + dateRaw.slice(1);
  const week = isoWeek(now, tz);
  const doy = dayOfYear(now, tz);

  const next = nextSolarEvent(now, location);
  const countdown = next ? fmtCountdown(next.date - now) : null;

  const setFormat = (next) => updateSettings(instance.id, { format: next });

  const tzLabel = tz ? tzShortLabel(tz, now) : null;

  return (
    <div className="clock">
      <div className="clock__time metric metric--xl">
        <span>{hour}</span>
        <span className="clock__sep">:</span>
        <span>{minute}</span>
        {showSeconds && (
          <>
            <span className="clock__sep clock__sep--small">:</span>
            <span className="clock__seconds">{second}</span>
          </>
        )}
        {dayPeriod && <span className="clock__ampm">{dayPeriod}</span>}
      </div>

      <div className="clock__row">
        <div className="muted clock-date">{date}</div>
        <div className="seg-toggle" role="group" aria-label="Formato horario">
          <button
            className={`seg-toggle__btn ${is24h ? 'seg-toggle__btn--active' : ''}`}
            onClick={() => setFormat('24h')}
          >24h</button>
          <button
            className={`seg-toggle__btn ${!is24h ? 'seg-toggle__btn--active' : ''}`}
            onClick={() => setFormat('12h')}
          >12h</button>
        </div>
      </div>

      <div className="clock__meta">
        {location && (
          <span className="clock__meta-item" title={tz ?? 'Zona horaria'}>
            <IconWorld size={11} stroke={1.7} />
            <span className="clock__meta-value" style={{ fontSize: 11 }}>
              {location.label}
              {tzLabel && <span className="muted" style={{ marginLeft: 5, fontWeight: 400 }}>{tzLabel}</span>}
            </span>
          </span>
        )}
        <span className="clock__meta-item">
          <span className="label">SEM</span>
          <span className="clock__meta-value">{week}</span>
        </span>
        <span className="clock__meta-item">
          <span className="label">DÍA</span>
          <span className="clock__meta-value">{doy}</span>
        </span>
        {next && countdown && (
          <span className="clock__meta-item clock__meta-item--accent">
            {next.kind === 'sunrise'
              ? <IconSunrise size={12} stroke={1.8} color="#ffb377" />
              : <IconSunset size={12} stroke={1.8} color="#ff8e57" />}
            <span className="clock__meta-value" style={{ fontSize: 11 }}>en {countdown}</span>
          </span>
        )}
      </div>
    </div>
  );
}
