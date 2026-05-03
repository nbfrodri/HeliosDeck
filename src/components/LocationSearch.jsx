import { useEffect, useRef, useState } from 'react';
import { IconSearch, IconLoader2 } from '@tabler/icons-react';
import { useSettingsStore } from '../store/useSettingsStore.js';

// Convert country_code (ISO 3166-1 alpha-2) into the corresponding flag emoji
function flagEmoji(cc) {
  if (!cc || cc.length !== 2) return '🌐';
  const A = 0x1F1E6;
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => A + c.charCodeAt(0) - 65));
}

export function LocationSearch({ open, anchorRect, onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const setLocation = useSettingsStore((s) => s.setLocation);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setHighlight(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === 'Enter' && results[highlight]) {
        e.preventDefault();
        choose(results[highlight]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, highlight]);

  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=es`
        );
        const json = await res.json();
        if (cancelled) return;
        setResults(json?.results ?? []);
        setHighlight(0);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, open]);

  const choose = (r) => {
    setLocation({
      lat: r.latitude,
      lon: r.longitude,
      label: r.name + (r.country ? `, ${r.country}` : ''),
      timezone: r.timezone || null,
      country_code: r.country_code || null
    });
    onClose();
  };

  if (!open) return null;

  // Anchor below the trigger button
  const left = anchorRect?.left ?? 80;
  const top = (anchorRect?.bottom ?? 60) + 8;

  return (
    <>
      <div className="popover__overlay" onMouseDown={onClose} />
      <div
        className="popover"
        style={{ left, top, width: 360 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="popover__search">
          <IconSearch size={16} stroke={1.8} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar ciudad…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <IconLoader2 size={16} className="spin" />}
        </div>
        <div className="popover__list">
          {!query.trim() && (
            <div className="popover__hint">
              Búsqueda global. Escribe cualquier ciudad del mundo.
            </div>
          )}
          {query.trim() && !loading && results.length === 0 && (
            <div className="popover__hint">Sin resultados.</div>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.id}-${i}`}
              className={`popover__item ${i === highlight ? 'popover__item--active' : ''}`}
              onClick={() => choose(r)}
              onMouseEnter={() => setHighlight(i)}
            >
              <span className="popover__flag" aria-hidden>{flagEmoji(r.country_code)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="popover__item-title">{r.name}</div>
                <div className="popover__item-sub">
                  {[r.admin1, r.country].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="popover__item-coords">
                {r.latitude.toFixed(1)}, {r.longitude.toFixed(1)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
