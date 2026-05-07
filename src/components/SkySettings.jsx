import { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { DEFAULT_GRADIENT } from '../store/defaults.js';
import { Modal } from './Modal.jsx';
import { IconRefresh } from '@tabler/icons-react';

const STOP_LABELS = ['Cenit', 'Cielo medio', 'Violeta', 'Rosa', 'Horizonte'];

const PRESETS = [
  {
    name: 'Crepúsculo',
    stops: ['#0a1230', '#1c2456', '#3a2a6b', '#a85a8c', '#ffb377']
  },
  {
    name: 'Aurora',
    stops: ['#06121f', '#0e3a44', '#117a5a', '#a4d490', '#fff0a8']
  },
  {
    name: 'Medianoche',
    stops: ['#03050f', '#0a132e', '#1d1c4d', '#332a64', '#5b3a78']
  },
  {
    name: 'Amanecer',
    stops: ['#1a1748', '#5e2e72', '#c45a7a', '#ff9b6e', '#ffe1b3']
  },
  {
    name: 'Cosmos',
    stops: ['#020108', '#0d0828', '#3a0d4f', '#6b1f6b', '#d44a8e']
  }
];

function previewStyle(stops) {
  const positions = [0, 35, 65, 92, 100];
  const parts = stops.map((c, i) => `${c} ${positions[i]}%`);
  return { background: `linear-gradient(180deg, ${parts.join(', ')})` };
}

export function SkySettings({ open, onClose }) {
  const stops = useSettingsStore((s) => s.gradientStops) ?? DEFAULT_GRADIENT;
  const skyMode = useSettingsStore((s) => s.skyMode) ?? 'static';
  const setStop = useSettingsStore((s) => s.setGradientStop);
  const setStops = useSettingsStore((s) => s.setGradientStops);
  const setSkyMode = useSettingsStore((s) => s.setSkyMode);
  const reset = useSettingsStore((s) => s.resetGradient);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeColor = stops[activeIndex] ?? '#000000';
  const modeIdx = skyMode === 'fluid' ? 1 : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Personaliza el cielo"
      subtitle="Cinco paradas, de cenit a horizonte."
      width={620}
      footer={
        <>
          <button className="btn" onClick={reset}>
            <IconRefresh size={14} stroke={1.8} />
            <span>Restaurar por defecto</span>
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn--solid" onClick={onClose}>Hecho</button>
        </>
      }
    >
      <div
        className="sky-mode-toggle"
        role="tablist"
        aria-label="Sky mode"
        style={{ '--idx': modeIdx, '--tab-count': 2 }}
      >
        <span className="sky-mode-toggle__indicator" aria-hidden />
        <button
          type="button"
          role="tab"
          aria-selected={skyMode === 'static'}
          className={`sky-mode-toggle__btn${skyMode === 'static' ? ' sky-mode-toggle__btn--active' : ''}`}
          onClick={() => setSkyMode('static')}
        >
          Static gradient
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={skyMode === 'fluid'}
          className={`sky-mode-toggle__btn${skyMode === 'fluid' ? ' sky-mode-toggle__btn--active' : ''}`}
          onClick={() => setSkyMode('fluid')}
        >
          Fluid · animated
        </button>
      </div>

      <div className="sky-grid">
        <div className="sky-preview" style={previewStyle(stops)} aria-hidden />
        <div className="sky-stops">
          {stops.map((color, i) => (
            <button
              key={i}
              type="button"
              className={`color-row${activeIndex === i ? ' color-row--active' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-pressed={activeIndex === i}
            >
              <span
                className="color-row__swatch"
                style={{ background: color }}
                aria-hidden
              />
              <span className="color-row__label">{STOP_LABELS[i]}</span>
              <span className="color-row__hex">{color.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="color-picker-pane">
        <HexColorPicker
          color={activeColor}
          onChange={(c) => setStop(activeIndex, c)}
        />
        <div className="color-picker-pane__meta">
          <div className="color-picker-pane__caption">
            Editando <strong>{STOP_LABELS[activeIndex]}</strong>
          </div>
          <label className="hex-input">
            <span className="hex-input__hash">#</span>
            <HexColorInput
              color={activeColor}
              onChange={(c) => setStop(activeIndex, c)}
              prefixed={false}
              className="hex-input__field"
            />
          </label>
        </div>
      </div>

      <div className="sky-presets-section">
        <div className="sky-presets-section__heading">Presets</div>
        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              className="preset"
              onClick={() => setStops(p.stops)}
              title={p.name}
            >
              <span className="preset__swatch" style={previewStyle(p.stops)} />
              <span className="preset__name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
