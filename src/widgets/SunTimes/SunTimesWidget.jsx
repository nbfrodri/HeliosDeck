import { useEffect, useState } from "react";
import SunCalc from "suncalc";
import {
  IconMapPinOff,
  IconSunrise,
  IconSunset,
  IconMoon,
  IconMoonStars,
  IconSunFilled,
  IconMapPin,
} from "@tabler/icons-react";
import { formatHM, tzShortLabel } from "../../lib/time.js";
import { useTranslation } from "../../i18n.jsx";

function fmtDuration(ms) {
  if (!ms || isNaN(ms) || ms < 0) return "—";
  const total = Math.round(ms / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function fmtDelta(diffMin) {
  if (diffMin == null || isNaN(diffMin)) return null;
  const sign = diffMin >= 0 ? "+" : "−";
  const abs = Math.abs(diffMin);
  return `${sign}${abs} min`;
}

// Tiny phase-aware shadow overlay for the moon disk in the SunArc.
// `phase` is SunCalc's 0..1 cycle position.
function SunArcMoonShadow({ cx, cy, r, phase }) {
  // 0..0.5 waxing (right side bright, dark shrinks on left)
  // 0.5..1 waning (left side bright, dark grows on right)
  const isRightLit = phase <= 0.5;
  const outerSweep = isRightLit ? 1 : 0;
  const rx = r * Math.abs(Math.cos(2 * Math.PI * phase));
  let terminatorSweep;
  if (phase < 0.25) terminatorSweep = outerSweep;
  else if (phase < 0.5) terminatorSweep = 1 - outerSweep;
  else if (phase < 0.75) terminatorSweep = 1 - outerSweep;
  else terminatorSweep = outerSweep;

  // Build dark cap covering the unlit portion. We trace the outer half opposite
  // to the lit side, plus the terminator ellipse back.
  const darkOuterSweep = isRightLit ? 0 : 1;
  const top = `${cx} ${cy - r}`;
  const bot = `${cx} ${cy + r}`;
  const path = `M ${top} A ${r} ${r} 0 0 ${darkOuterSweep} ${bot} A ${rx} ${r} 0 0 ${1 - terminatorSweep} ${top} Z`;
  return <path d={path} fill="rgba(20, 22, 50, 0.78)" />;
}

function SunArc({ now, sunrise, sunset, solarNoon, moonRise, moonSet, moonPhase, tz, locale }) {
  const W = 240;
  const H = 132; // viewBox tall enough for labels under horizon
  const cx = W / 2;
  const cy = H - 22; // horizon line; labels at cy + 16 = H - 6
  const r = W / 2 - 16;

  const total = sunset - sunrise;
  const elapsed = now - sunrise;
  const tRaw = total > 0 ? elapsed / total : 0;
  const t = Math.max(0, Math.min(1, tRaw));
  const aboveHorizon = tRaw > 0 && tRaw < 1;

  const angle = Math.PI - Math.PI * t;
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);

  // Moon position along the arc: parametrise by moonRise→moonSet if both
  // are valid and the moon is currently up; otherwise place near the apex
  // as a generic "the moon owns the sky" indicator.
  let moonX = cx;
  let moonY = cy - r;
  let moonAboveHorizon = false;
  if (moonRise && moonSet && !isNaN(moonRise) && !isNaN(moonSet) && moonSet > moonRise) {
    const mElapsed = now - moonRise;
    const mTotal = moonSet - moonRise;
    const mT = mTotal > 0 ? mElapsed / mTotal : -1;
    if (mT > 0 && mT < 1) {
      const mAngle = Math.PI - Math.PI * mT;
      moonX = cx + r * Math.cos(mAngle);
      moonY = cy - r * Math.sin(mAngle);
      moonAboveHorizon = true;
    }
  }
  // If we couldn't position via moonRise/moonSet but the sun is down, still
  // show a generic moon at the apex so the widget feels alive at night.
  const showMoon = !aboveHorizon && (moonAboveHorizon || true);

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="sunarc-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255, 200, 130, 0.45)" />
          <stop offset="100%" stopColor="rgba(255, 200, 130, 0)" />
        </linearGradient>
        <radialGradient id="sunarc-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff8d8" />
          <stop offset="60%" stopColor="#ffc77a" />
          <stop offset="100%" stopColor="#ff8e3c" />
        </radialGradient>
        <radialGradient id="sunarc-moon" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="60%" stopColor="#dcdfeb" />
          <stop offset="100%" stopColor="#9aa4be" />
        </radialGradient>
      </defs>

      {aboveHorizon && (
        <path
          d={`${arcPath} L ${cx + r} ${cy} L ${cx - r} ${cy} Z`}
          fill="url(#sunarc-glow)"
          opacity="0.6"
        />
      )}

      <line
        x1={6}
        y1={cy}
        x2={W - 6}
        y2={cy}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />

      <path
        d={arcPath}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.2"
        strokeDasharray="2 4"
        strokeLinecap="round"
      />

      <circle cx={cx - r} cy={cy} r="3" fill="rgba(255, 179, 119, 0.95)" />
      <circle cx={cx + r} cy={cy} r="3" fill="rgba(180, 130, 220, 0.95)" />
      <circle cx={cx} cy={cy - r} r="1.6" fill="rgba(255,255,255,0.55)" />

      {aboveHorizon && (
        <>
          <circle
            cx={sunX}
            cy={sunY}
            r="11"
            fill="url(#sunarc-sun)"
            opacity="0.4"
          />
          <circle cx={sunX} cy={sunY} r="6" fill="url(#sunarc-sun)" />
        </>
      )}
      {showMoon && (
        <>
          {/* halo */}
          <circle cx={moonX} cy={moonY} r="11" fill="rgba(220, 226, 255, 0.18)" />
          {/* moon disk */}
          <circle cx={moonX} cy={moonY} r="6" fill="url(#sunarc-moon)" />
          {/* phase shadow: half-circle on the dark side, scaled by phase */}
          <SunArcMoonShadow cx={moonX} cy={moonY} r={6} phase={moonPhase ?? 0} />
        </>
      )}

      <text
        x={cx - r}
        y={cy + 16}
        textAnchor="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize="9"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        letterSpacing="0.1em"
      >
        {formatHM(sunrise, tz, locale).toUpperCase()}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize="9"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        letterSpacing="0.1em"
      >
        {formatHM(solarNoon, tz, locale).toUpperCase()}
      </text>
      <text
        x={cx + r}
        y={cy + 16}
        textAnchor="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize="9"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        letterSpacing="0.1em"
      >
        {formatHM(sunset, tz, locale).toUpperCase()}
      </text>
    </svg>
  );
}

function MiniRow({ Icon, color, label, value }) {
  return (
    <div className="suntimes__row">
      <span className="suntimes__row-icon" style={{ color }}>
        <Icon size={14} stroke={1.7} />
      </span>
      <span className="suntimes__row-label">{label}</span>
      <span className="suntimes__row-value">{value}</span>
    </div>
  );
}

export function SunTimesWidget({ location }) {
  const [now, setNow] = useState(() => new Date());
  const { t, locale } = useTranslation();
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!location) {
    return (
      <div className="empty">
        <IconMapPinOff size={28} stroke={1.5} />
        <div>{t('widget.sunTimes.noLocation')}</div>
      </div>
    );
  }

  const tz = location.timezone || null;
  const times = SunCalc.getTimes(now, location.lat, location.lon);
  const moonTimes = SunCalc.getMoonTimes(now, location.lat, location.lon);
  const moonIll = SunCalc.getMoonIllumination(now);

  // Day length and delta vs yesterday
  const dayLengthMs = times.sunset - times.sunrise;
  const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
  const yTimes = SunCalc.getTimes(yesterday, location.lat, location.lon);
  const yLengthMs = yTimes.sunset - yTimes.sunrise;
  const deltaMin = isNaN(dayLengthMs - yLengthMs)
    ? null
    : Math.round((dayLengthMs - yLengthMs) / 60000);
  const deltaText = fmtDelta(deltaMin);
  const deltaUp = deltaMin != null && deltaMin > 0;

  const tzLabel = tz ? tzShortLabel(tz, now) : null;

  return (
    <div className="suntimes">
      <div className="suntimes__loc">
        <IconMapPin size={11} stroke={1.7} />
        <span className="suntimes__loc-label">{location.label}</span>
        {tzLabel && <span className="suntimes__loc-tz">{tzLabel}</span>}
      </div>
      <div className="suntimes__arc">
        <SunArc
          now={now}
          sunrise={times.sunrise}
          sunset={times.sunset}
          solarNoon={times.solarNoon}
          moonRise={moonTimes.rise}
          moonSet={moonTimes.set}
          moonPhase={moonIll.phase}
          tz={tz}
          locale={locale}
        />
      </div>

      <div className="suntimes__banner">
        <div className="suntimes__banner-block">
          <span className="label">{t('widget.sunTimes.dayLength')}</span>
          <span className="suntimes__banner-value">{fmtDuration(dayLengthMs)}</span>
        </div>
        {deltaText && (
          <span
            className={`suntimes__banner-delta ${deltaUp ? "suntimes__banner-delta--up" : "suntimes__banner-delta--down"}`}
          >
            {deltaText} {t('widget.sunTimes.vsYesterday')}
          </span>
        )}
      </div>

      <div className="suntimes__list">
        <MiniRow
          Icon={IconSunrise}
          color="#ffb377"
          label={t('widget.sunTimes.dawn')}
          value={formatHM(times.dawn, tz, locale)}
        />
        <MiniRow
          Icon={IconSunFilled}
          color="#ffd166"
          label={t('widget.sunTimes.goldenHour')}
          value={`${formatHM(times.goldenHourEnd, tz, locale)} · ${formatHM(times.goldenHour, tz, locale)}`}
        />
        <MiniRow
          Icon={IconSunset}
          color="#ff8e57"
          label={t('widget.sunTimes.dusk')}
          value={formatHM(times.dusk, tz, locale)}
        />
        <MiniRow
          Icon={IconMoonStars}
          color="#9bb8ff"
          label={t('widget.sunTimes.moonRise')}
          value={formatHM(moonTimes.rise, tz, locale)}
        />
        <MiniRow
          Icon={IconMoon}
          color="#7c89c8"
          label={t('widget.sunTimes.moonSet')}
          value={formatHM(moonTimes.set, tz, locale)}
        />
      </div>
    </div>
  );
}
