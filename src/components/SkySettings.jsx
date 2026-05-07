import { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { DEFAULT_GRADIENT } from '../store/defaults.js';
import { Modal } from './Modal.jsx';
import { IconRefresh } from '@tabler/icons-react';
import { FLUID_PRESETS, TUNABLE_KEYS, getPresetConfig } from './SkyFluidShader.jsx';

const SLIDERS = [
  { key: 'uSpeed',     label: 'Speed',      min: 0,    max: 1,   step: 0.02, format: (v) => v.toFixed(2) },
  { key: 'uStrength',  label: 'Intensity',  min: 0,    max: 8,   step: 0.1,  format: (v) => v.toFixed(1) },
  { key: 'uFrequency', label: 'Frequency',  min: 1,    max: 10,  step: 0.1,  format: (v) => v.toFixed(1) },
  { key: 'uDensity',   label: 'Density',    min: 0.5,  max: 3,   step: 0.1,  format: (v) => v.toFixed(1) },
  { key: 'brightness', label: 'Brightness', min: 0.5,  max: 2,   step: 0.05, format: (v) => v.toFixed(2) },
];

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
  },
  {
    name: 'Océano',
    stops: ['#02050f', '#04162d', '#0a3d5b', '#0a8c92', '#aef0ff']
  },
  {
    name: 'Bosque',
    stops: ['#040a05', '#0a2010', '#13501f', '#3a8a3f', '#c2e885']
  },
  {
    name: 'Volcán',
    stops: ['#080403', '#1a0606', '#5a0d12', '#b8281f', '#ff7a3d']
  },
  {
    name: 'Glaciar',
    stops: ['#0c1626', '#1a2c45', '#3d5a7a', '#7a9bbf', '#dfeaf5']
  },
  {
    name: 'Lavanda',
    stops: ['#1a1430', '#3a2858', '#6b4a9b', '#b48ad6', '#f5d8e8']
  },
  {
    name: 'Brasas',
    stops: ['#0a0202', '#1f0606', '#4f0e0c', '#9c2a14', '#e87f3a']
  },
  {
    name: 'Coral',
    stops: ['#02141c', '#063042', '#0e7287', '#3dc8d4', '#ffd189']
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
  const skyFluidPreset = useSettingsStore((s) => s.skyFluidPreset) ?? 'liquid-wave';
  const skyFluidCustom = useSettingsStore((s) => s.skyFluidCustom) ?? {};
  const setStop = useSettingsStore((s) => s.setGradientStop);
  const setStops = useSettingsStore((s) => s.setGradientStops);
  const setSkyMode = useSettingsStore((s) => s.setSkyMode);
  const setSkyFluidPreset = useSettingsStore((s) => s.setSkyFluidPreset);
  const setSkyFluidCustom = useSettingsStore((s) => s.setSkyFluidCustom);
  const reset = useSettingsStore((s) => s.resetGradient);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeColor = stops[activeIndex] ?? '#000000';
  const modeIdx = skyMode === 'fluid' ? 1 : 0;

  // Picking a preset also resets the custom tunables to that preset's defaults.
  // The user can then drift away with sliders.
  function pickPreset(value) {
    setSkyFluidPreset(value);
    const cfg = getPresetConfig(value);
    const next = {};
    for (const k of TUNABLE_KEYS) if (cfg[k] != null) next[k] = cfg[k];
    setSkyFluidCustom(next);
  }
  function resetCustomToPreset() {
    const cfg = getPresetConfig(skyFluidPreset);
    const next = {};
    for (const k of TUNABLE_KEYS) if (cfg[k] != null) next[k] = cfg[k];
    setSkyFluidCustom(next);
  }

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

      {skyMode === 'fluid' && (
        <>
          <div className="sky-presets-section">
            <div className="sky-presets-section__heading">Animation preset</div>
            <div className="fluid-presets">
              {FLUID_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`fluid-preset${skyFluidPreset === p.value ? ' fluid-preset--active' : ''}`}
                  onClick={() => pickPreset(p.value)}
                >
                  <span className="fluid-preset__name">{p.label}</span>
                  <span className="fluid-preset__desc">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sky-presets-section">
            <div className="sky-presets-section__heading sky-presets-section__heading--row">
              <span>Fine tune</span>
              <button
                type="button"
                className="sky-tune__reset"
                onClick={resetCustomToPreset}
                title="Reset to preset defaults"
              >
                Reset
              </button>
            </div>
            <div className="sky-tune">
              {SLIDERS.map((s) => {
                const value = skyFluidCustom[s.key] ?? 0;
                return (
                  <label key={s.key} className="sky-tune__row">
                    <div className="sky-tune__head">
                      <span className="sky-tune__label">{s.label}</span>
                      <span className="sky-tune__value">{s.format(value)}</span>
                    </div>
                    <input
                      type="range"
                      className="sky-tune__slider"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={value}
                      onChange={(e) =>
                        setSkyFluidCustom({ [s.key]: parseFloat(e.target.value) })
                      }
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="sky-presets-section">
        <div className="sky-presets-section__heading">Color presets</div>
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
