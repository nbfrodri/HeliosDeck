import { useSettingsStore } from '../store/useSettingsStore.js';
import { DEFAULT_GRADIENT } from '../store/defaults.js';

export function SkyFluid() {
  const stops = useSettingsStore((s) => s.gradientStops) ?? DEFAULT_GRADIENT;
  // Palindromic palette: c0→c1→c2→c3→c4→c3→c2→c1→c0. The loop seam (last↔first)
  // is the same color, so there is no abrupt jump back; and the wave reverses
  // through colors the user already picked instead of cutting across muddy
  // RGB midtones.
  const palette = [...stops, ...[...stops].reverse().slice(1)];
  const stopList = palette
    .map((color, i) => `${color} ${((i * 100) / (palette.length - 1)).toFixed(2)}%`)
    .join(', ');
  // `in oklch` makes per-segment interpolation perceptually smooth — even if
  // adjacent colors are far apart in sRGB, the path stays vivid.
  const gradient = `linear-gradient(180deg in oklch, ${stopList})`;

  return (
    <div className="sky sky--fluid" aria-hidden>
      <div
        className="sky-fluid__rotor"
        style={{ backgroundImage: gradient }}
      />
      <div className="grain" />
    </div>
  );
}
