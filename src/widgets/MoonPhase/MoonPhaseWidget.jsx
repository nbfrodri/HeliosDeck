import { useEffect, useMemo, useState } from 'react';
import SunCalc from 'suncalc';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import { useTranslation } from '../../i18n.jsx';

const SYNODIC_MONTH_DAYS = 29.530588853;

function phaseLabelKey(phase) {
  if (phase < 0.03 || phase > 0.97) return 'new';
  if (phase < 0.22) return 'waxingCrescent';
  if (phase < 0.28) return 'firstQuarter';
  if (phase < 0.47) return 'waxingGibbous';
  if (phase < 0.53) return 'full';
  if (phase < 0.72) return 'waningGibbous';
  if (phase < 0.78) return 'lastQuarter';
  return 'waningCrescent';
}

function buildMoonPath(phase, r) {
  const cx = r;
  const isRightLit = phase <= 0.5;
  const outerSweep = isRightLit ? 1 : 0;
  const rx = r * Math.abs(Math.cos(2 * Math.PI * phase));
  let terminatorSweep;
  if (phase < 0.25) terminatorSweep = outerSweep;
  else if (phase < 0.5) terminatorSweep = 1 - outerSweep;
  else if (phase < 0.75) terminatorSweep = 1 - outerSweep;
  else terminatorSweep = outerSweep;
  return `M ${cx} 0 A ${r} ${r} 0 1 ${outerSweep} ${cx} ${2 * r} A ${rx} ${r} 0 1 ${terminatorSweep} ${cx} 0 Z`;
}

function MoonGlyph({ phase, size = 92, className = '' }) {
  const r = size / 2;
  const path = buildMoonPath(phase, r - 1);
  const id = `moon-${size}-${Math.round(phase * 1000)}`;
  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(0 8px 20px rgba(255, 220, 180, 0.18))' }}>
      <defs>
        <radialGradient id={`${id}-body`} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="55%" stopColor="#f3eadc" />
          <stop offset="100%" stopColor="#bdb6c8" />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="0.4" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="rgba(40, 30, 80, 0.85)" />
          <stop offset="100%" stopColor="rgba(20, 18, 60, 0.95)" />
        </radialGradient>
      </defs>
      <circle cx={r} cy={r} r={r - 1} fill={`url(#${id}-shade)`} />
      <g transform="translate(1, 1)">
        <path d={path} fill={`url(#${id}-body)`} />
      </g>
      {size >= 60 && (
        <>
          <circle cx={r * 0.75} cy={r * 0.85} r={r * 0.06} fill="rgba(0,0,0,0.06)" />
          <circle cx={r * 1.25} cy={r * 1.15} r={r * 0.05} fill="rgba(0,0,0,0.05)" />
          <circle cx={r * 1.05} cy={r * 0.7} r={r * 0.04} fill="rgba(0,0,0,0.05)" />
        </>
      )}
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke="rgba(255,255,255,0.08)" />
    </svg>
  );
}

const PHASE_TARGETS = [
  { value: 0.25, key: 'firstQuarter' },
  { value: 0.5, key: 'full' },
  { value: 0.75, key: 'lastQuarter' },
  { value: 0, key: 'new' }
];

function findNextPhase(from, targetValue, maxDays = 60) {
  let prev = SunCalc.getMoonIllumination(from).phase;
  const stepMs = 60 * 60 * 1000;
  for (let i = 1; i < maxDays * 24; i++) {
    const t = new Date(from.getTime() + i * stepMs);
    const cur = SunCalc.getMoonIllumination(t).phase;
    let crossed;
    if (targetValue === 0) {
      crossed = prev > 0.9 && cur < 0.1;
    } else {
      crossed = prev < targetValue && cur >= targetValue;
    }
    if (crossed) return t;
    prev = cur;
  }
  return null;
}

function formatRelative(date, now, t, locale) {
  const days = Math.round((date - now) / (1000 * 60 * 60 * 24));
  if (days === 0) return t('widget.moonPhase.today');
  if (days === 1) return t('widget.moonPhase.tomorrow');
  if (days < 14) return t('widget.moonPhase.inDays', { n: days });
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short' });
}

function formatAbsolute(date, locale) {
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short' });
}

function Stat({ label, value, unit, hint, valueColor }) {
  return (
    <div className="moon-stat" title={hint}>
      <div className="moon-stat__head">
        <span className="label">{label}</span>
      </div>
      <div className="moon-stat__value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
        {unit && <span className="moon-stat__unit">{unit}</span>}
      </div>
      {hint && <div className="moon-stat__hint">{hint}</div>}
    </div>
  );
}

export function MoonPhaseWidget({ location }) {
  const [now, setNow] = useState(() => new Date());
  const { t, locale } = useTranslation();
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const ill = SunCalc.getMoonIllumination(now);
  const pct = Math.round(ill.fraction * 100);
  const ageDays = ill.phase * SYNODIC_MONTH_DAYS;
  const waxing = ill.phase < 0.5;

  const lat = location?.lat ?? 0;
  const lon = location?.lon ?? 0;
  const pos = SunCalc.getMoonPosition(now, lat, lon);
  const altitudeDeg = (pos.altitude * 180) / Math.PI;
  const distanceKm = Math.round(pos.distance);
  const aboveHorizon = altitudeDeg > 0;

  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const upcoming = useMemo(() => {
    return PHASE_TARGETS
      .map((p) => ({ ...p, date: findNextPhase(now, p.value) }))
      .filter((p) => p.date)
      .sort((a, b) => a.date - b.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey]);

  const localeTag = locale === 'en' ? 'en-US' : 'es-ES';
  return (
    <div className="moon">
      <div className="moon__head">
        <MoonGlyph phase={ill.phase} size={84} className="moon-glyph-svg" />
        <div className="moon__head-text">
          <div className="moon__metric">
            <span>{pct}</span>
            <span className="moon__metric-unit">%</span>
          </div>
          <div className="label">{t('widget.moonPhase.illumination')}</div>
          <div className="moon__phase-name">{t(`widget.moonPhase.phases.${phaseLabelKey(ill.phase)}`)}</div>
          <div className="moon__trend">
            {waxing
              ? <IconArrowUpRight size={11} stroke={2} color="var(--good)" />
              : <IconArrowDownRight size={11} stroke={2} color="var(--accent-warm)" />}
            <span>{waxing ? t('widget.moonPhase.waxing') : t('widget.moonPhase.waning')}</span>
          </div>
        </div>
      </div>

      <div className="moon-stats">
        <Stat
          label={t('widget.moonPhase.age')}
          value={ageDays.toFixed(1)}
          unit="d"
          hint={t('widget.moonPhase.ageHint', { days: ageDays.toFixed(1) })}
        />
        <Stat
          label={t('widget.moonPhase.distance')}
          value={(distanceKm / 1000).toFixed(0)}
          unit="·10³ km"
          hint={t('widget.moonPhase.distanceHint', { km: distanceKm.toLocaleString(localeTag) })}
        />
        <Stat
          label={t('widget.moonPhase.altitude')}
          value={`${altitudeDeg >= 0 ? '+' : ''}${altitudeDeg.toFixed(0)}`}
          unit="°"
          hint={aboveHorizon
            ? t('widget.moonPhase.altAbove', { deg: altitudeDeg.toFixed(1) })
            : t('widget.moonPhase.altBelow', { deg: Math.abs(altitudeDeg).toFixed(1) })}
          valueColor={aboveHorizon ? 'var(--text-1)' : 'var(--text-3)'}
        />
      </div>

      <div className="moon-upcoming">
        <div className="label">{t('widget.moonPhase.upcoming')}</div>
        <div className="moon-upcoming__list">
          {upcoming.map((p) => (
            <div key={p.key} className="moon-upcoming__row">
              <span className="moon-upcoming__icon">
                <MoonGlyph phase={p.value} size={20} />
              </span>
              <span className="moon-upcoming__label">{t(`widget.moonPhase.phases.${p.key}`)}</span>
              <span className="moon-upcoming__abs">{formatAbsolute(p.date, locale)}</span>
              <span className="moon-upcoming__rel">{formatRelative(p.date, now, t, locale)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
