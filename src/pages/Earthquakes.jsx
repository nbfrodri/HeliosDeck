import { useMemo, useState } from 'react';
import { useEarthquakes } from '../hooks/useEarthquakes.js';
import { MagnitudeChart } from '../components/MagnitudeChart.jsx';
import { EarthquakeList } from '../components/EarthquakeList.jsx';
import { useTranslation } from '../i18n.jsx';

const WINDOW_OPTIONS = [
  { hours: 1, label: '1h' },
  { hours: 24, label: '24h' },
  { hours: 24 * 7, label: '7d' },
  { hours: 24 * 30, label: '30d' },
];

function useRelativeShort() {
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

export default function Earthquakes() {
  const [minMagnitude, setMinMagnitude] = useState(4.5);
  const [hoursWindow, setHoursWindow] = useState(24 * 7);
  const { t } = useTranslation();
  const relativeShort = useRelativeShort();

  const { data, isLoading, isError, isFetching, error } = useEarthquakes({
    minMagnitude,
    hoursWindow,
  });

  const features = data?.features ?? [];
  const activeIdx = WINDOW_OPTIONS.findIndex((o) => o.hours === hoursWindow);
  const windowLabel = WINDOW_OPTIONS[activeIdx]?.label ?? '';

  const stats = useMemo(() => {
    if (!features.length) return null;
    let max = features[0];
    let deepest = features[0];
    for (const f of features) {
      if ((f.properties?.mag ?? -Infinity) > (max.properties?.mag ?? -Infinity)) {
        max = f;
      }
      const d = f.geometry?.coordinates?.[2];
      const dPrev = deepest.geometry?.coordinates?.[2];
      if ((d ?? -Infinity) > (dPrev ?? -Infinity)) {
        deepest = f;
      }
    }
    return {
      total: features.length,
      max: max.properties?.mag,
      maxPlace: max.properties?.place,
      latest: features[0].properties?.time,
      deepest: deepest.geometry?.coordinates?.[2],
      deepestPlace: deepest.properties?.place,
    };
  }, [features]);

  return (
    <main className="page page--quakes">
      <header className="quakes-header">
        <div className="quakes-header__intro">
          <h1 className="quakes-header__title">Earthquakes</h1>
          <p className="quakes-header__sub">
            USGS · magnitude ≥ {minMagnitude.toFixed(1)} · last {windowLabel}
          </p>
        </div>
        <div className="quakes-filters">
          <label className="quakes-filter quakes-filter--slider">
            <span className="quakes-filter__label">{t('earthquakes.minMagnitude')}</span>
            <div className="quakes-filter__row">
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={minMagnitude}
                onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
                className="quakes-filter__slider"
              />
              <span className="quakes-filter__value">{minMagnitude.toFixed(1)}</span>
            </div>
          </label>
          <div className="quakes-filter quakes-filter--tabs">
            <span className="quakes-filter__label">{t('earthquakes.window')}</span>
            <div
              className="quakes-tabs"
              role="tablist"
              style={{ '--idx': activeIdx }}
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
        </div>
      </header>

      {isLoading && (
        <div className="card auth-pending">
          <span className="auth-pending__spinner" aria-hidden />
          <span>{t('earthquakes.loading')}</span>
        </div>
      )}

      {isError && (
        <div className="card login-form__error">
          {t('earthquakes.loadFailed', {
            error: error?.message ?? t('earthquakes.unknownError'),
          })}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="quakes-grid">
          <section className="card quakes-section quakes-section--chart">
            <h2 className="quakes-section__title">{t('earthquakes.magnitudeDistribution')}</h2>
            <MagnitudeChart features={features} />
          </section>

          <section className="card quakes-section quakes-section--stats">
            <h2 className="quakes-section__title">{t('earthquakes.overview')}</h2>
            {stats ? (
              <div className="quakes-stats">
                <div className="quakes-stat">
                  <div className="quakes-stat__label">{t('earthquakes.stats.total')}</div>
                  <div className="quakes-stat__value">{stats.total}</div>
                </div>
                <div className="quakes-stat">
                  <div className="quakes-stat__label">{t('earthquakes.stats.max')}</div>
                  <div className="quakes-stat__value">
                    {stats.max != null ? stats.max.toFixed(1) : '—'}
                  </div>
                  {stats.maxPlace && (
                    <div className="quakes-stat__where" title={stats.maxPlace}>
                      {stats.maxPlace}
                    </div>
                  )}
                </div>
                <div className="quakes-stat">
                  <div className="quakes-stat__label">{t('earthquakes.stats.latest')}</div>
                  <div className="quakes-stat__value quakes-stat__value--small">
                    {stats.latest ? relativeShort(stats.latest) : '—'}
                  </div>
                </div>
                <div className="quakes-stat">
                  <div className="quakes-stat__label">{t('earthquakes.stats.deepest')}</div>
                  <div className="quakes-stat__value quakes-stat__value--small">
                    {stats.deepest != null ? `${Math.round(stats.deepest)} km` : '—'}
                  </div>
                  {stats.deepestPlace && (
                    <div className="quakes-stat__where" title={stats.deepestPlace}>
                      {stats.deepestPlace}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="quakes-section__empty">{t('earthquakes.noEvents')}</p>
            )}
          </section>

          <section className="card quakes-section quakes-section--list">
            <h2 className="quakes-section__title">
              <span>{t('earthquakes.events')}</span>
              {isFetching && (
                <span className="quakes-section__refresh">{t('earthquakes.refreshing')}</span>
              )}
            </h2>
            <EarthquakeList features={features} />
          </section>
        </div>
      )}
    </main>
  );
}
