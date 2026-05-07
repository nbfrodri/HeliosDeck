import { IconArrowRight } from '@tabler/icons-react';
import { useDeckStore } from '../store/useDeckStore.js';
import { listAvailable } from '../widgets/registry.js';
import { useTranslation } from '../i18n.jsx';

function HeroIllustration() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" aria-hidden>
      <defs>
        <radialGradient id="hero-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff3d9" />
          <stop offset="60%" stopColor="#ffb377" />
          <stop offset="100%" stopColor="#ff7a3d" />
        </radialGradient>
        <radialGradient id="hero-moon" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="100%" stopColor="#bdb6c8" />
        </radialGradient>
      </defs>

      <ellipse cx="110" cy="90" rx="98" ry="36" fill="none"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="2 4" />
      <ellipse cx="110" cy="90" rx="70" ry="22" fill="none"
        stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="1 3" />

      <circle cx="110" cy="74" r="22" fill="url(#hero-sun)" />
      <circle cx="110" cy="74" r="22" fill="none" stroke="rgba(255,255,255,0.25)" />
      <circle cx="110" cy="74" r="34" fill="url(#hero-sun)" opacity="0.18" />

      <g transform="translate(186, 86)">
        <circle r="11" fill="url(#hero-moon)" />
        <circle cx="3" r="11" fill="rgba(20, 18, 60, 0.85)" />
      </g>

      <circle cx="40" cy="98" r="5" fill="#9bb8ff" opacity="0.9" />
      <circle cx="40" cy="98" r="5" fill="none" stroke="rgba(155,184,255,0.4)" strokeWidth="2" />

      <g fill="rgba(255,255,255,0.7)">
        <circle cx="22" cy="22" r="1.5" />
        <circle cx="48" cy="14" r="1.2" />
        <circle cx="80" cy="28" r="1.5" />
        <circle cx="172" cy="20" r="1.6" />
        <circle cx="200" cy="42" r="1.2" />
      </g>
      <path
        d="M 22 22 L 48 14 L 80 28 M 172 20 L 200 42"
        stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none"
      />

      <line x1="0" y1="138" x2="220" y2="138" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    </svg>
  );
}

export function EmptyHero() {
  const togglePicker = useDeckStore((s) => s.togglePicker);
  const addWidget = useDeckStore((s) => s.addWidget);
  const items = listAvailable();
  const { t } = useTranslation();

  const addAll = () => items.forEach((it) => addWidget(it.type));

  return (
    <div className="hero">
      <div className="hero__art">
        <HeroIllustration />
      </div>

      <h1 className="hero__title">{t('emptyHero.title')}</h1>
      <p className="hero__sub">{t('emptyHero.description')}</p>

      <div className="hero__actions">
        <button className="btn btn--accent btn--lg" onClick={togglePicker}>
          <span>{t('emptyHero.addFirst')}</span>
          <IconArrowRight size={16} stroke={2} />
        </button>
        <button className="btn btn--ghost-lg" onClick={addAll}>
          {t('emptyHero.addAll')}
        </button>
      </div>

      <div className="hero__chips">
        {items.map((it) => (
          <div key={it.type} className="hero__chip">
            {it.Icon && <it.Icon size={13} stroke={1.8} />}
            <span>{t(it.nameKey)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
