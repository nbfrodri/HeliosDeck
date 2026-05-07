import { lazy, Suspense } from 'react';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { DEFAULT_GRADIENT } from '../store/defaults.js';
import { SkyFluidErrorBoundary } from './SkyFluidErrorBoundary.jsx';

const SkyFluidShader = lazy(() => import('./SkyFluidShader.jsx'));

function buildGradient(stops) {
  const safe = (stops && stops.length === 5) ? stops : DEFAULT_GRADIENT;
  const positions = [0, 35, 65, 92, 100];
  const parts = safe.map((c, i) => `${c} ${positions[i]}%`);
  return `linear-gradient(180deg, ${parts.join(', ')})`;
}

function StaticSky({ stops }) {
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

export function Sky() {
  const stops = useSettingsStore((s) => s.gradientStops);
  const skyMode = useSettingsStore((s) => s.skyMode);

  if (skyMode === 'fluid') {
    return (
      <SkyFluidErrorBoundary fallback={<StaticSky stops={stops} />}>
        <Suspense fallback={<StaticSky stops={stops} />}>
          <SkyFluidShader />
        </Suspense>
      </SkyFluidErrorBoundary>
    );
  }

  return <StaticSky stops={stops} />;
}
