import { useSettingsStore } from '../store/useSettingsStore.js';
import { DEFAULT_GRADIENT } from '../store/defaults.js';

export function SkyFluid() {
  const stops = useSettingsStore((s) => s.gradientStops) ?? DEFAULT_GRADIENT;
  // Palindromic palette: c0→c1→c2→c3→c4→c3→c2→c1→c0. Last == first means the
  // tiles meet at the same color.
  const palette = [...stops, ...[...stops].reverse().slice(1)];
  const stopList = palette
    .map((color, i) => `${color} ${((i * 100) / (palette.length - 1)).toFixed(2)}%`)
    .join(', ');
  // `in oklch` keeps per-segment interpolation perceptually smooth.
  const gradient = `linear-gradient(180deg in oklch, ${stopList})`;

  return (
    <div className="sky sky--fluid" aria-hidden>
      {/* Two stacked identical bands. Translating the strip up by one band
          height swaps band 1 for band 2, which is identical, so the loop
          has zero visible seam. */}
      <div className="sky-fluid__strip">
        <div className="sky-fluid__band" style={{ backgroundImage: gradient }} />
        <div className="sky-fluid__band" style={{ backgroundImage: gradient }} />
      </div>
      <div className="grain" />
    </div>
  );
}
