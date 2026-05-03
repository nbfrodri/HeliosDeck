import { useSettingsStore } from '../store/useSettingsStore.js';
import { DEFAULT_GRADIENT } from '../store/defaults.js';

function buildGradient(stops) {
  const safe = (stops && stops.length === 5) ? stops : DEFAULT_GRADIENT;
  const positions = [0, 35, 65, 92, 100];
  const parts = safe.map((c, i) => `${c} ${positions[i]}%`);
  return `linear-gradient(180deg, ${parts.join(', ')})`;
}

export function Sky() {
  const stops = useSettingsStore((s) => s.gradientStops);
  const style = { background: buildGradient(stops) };
  return (
    <div className="sky" aria-hidden style={style}>
      <div className="stars" />
      <div className="cloud cloud--a" />
      <div className="cloud cloud--b" />
      <div className="cloud cloud--c" />
      <div className="grain" />
    </div>
  );
}
