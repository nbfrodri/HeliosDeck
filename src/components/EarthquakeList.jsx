import { useTranslation } from '../i18n.jsx';

function useRelativeTime() {
  const { t } = useTranslation();
  return (ms) => {
    const diff = Date.now() - ms;
    if (diff < 60_000) return t('earthquakes.time.justNow');
    const min = Math.floor(diff / 60_000);
    if (min < 60) return t('earthquakes.time.minAgo', { n: min });
    const h = Math.floor(min / 60);
    if (h < 24) return t('earthquakes.time.hourAgo', { n: h });
    const d = Math.floor(h / 24);
    return t('earthquakes.time.dayAgo', { n: d });
  };
}

function magClass(m) {
  if (m == null) return 'mag mag--unknown';
  if (m >= 6) return 'mag mag--severe';
  if (m >= 5) return 'mag mag--strong';
  if (m >= 4) return 'mag mag--moderate';
  return 'mag mag--mild';
}

export function MagBadge({ value }) {
  const cls = magClass(value);
  if (value == null) {
    return (
      <span className={cls} aria-label="unknown magnitude">
        ?
      </span>
    );
  }
  return (
    <span className={cls} aria-label={`magnitude ${value.toFixed(1)}`}>
      {value.toFixed(1)}
    </span>
  );
}

export function EarthquakeList({ features }) {
  const { t } = useTranslation();
  const relTime = useRelativeTime();
  if (!features.length) {
    return <div className="quake-list__empty">{t('earthquakes.noEventsFiltered')}</div>;
  }
  return (
    <ul className="quake-list">
      {features.map((f) => {
        const m = f.properties?.mag;
        const place = f.properties?.place ?? t('earthquakes.unknownLocation');
        const time = f.properties?.time;
        const depth = f.geometry?.coordinates?.[2];
        const url = f.properties?.url;
        return (
          <li key={f.id} className="quake-list__item">
            <MagBadge value={m} />
            <div className="quake-list__details">
              <div className="quake-list__place">
                {url ? (
                  <a href={url} target="_blank" rel="noreferrer">
                    {place}
                  </a>
                ) : (
                  place
                )}
              </div>
              <div className="quake-list__meta">
                {time ? relTime(time) : t('earthquakes.unknownTime')}
                {depth != null && ` · ${Math.round(depth)} ${t('earthquakes.kmDepth')}`}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
