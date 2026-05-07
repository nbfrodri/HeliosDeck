import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { DEFAULT_GRADIENT } from '../store/defaults.js';
import { getPresetConfig, TUNABLE_KEYS } from './skyFluidConfig.js';

export default function SkyFluidShader() {
  const stops = useSettingsStore((s) => s.gradientStops) ?? DEFAULT_GRADIENT;
  const presetKey = useSettingsStore((s) => s.skyFluidPreset) ?? 'liquid-wave';
  const custom = useSettingsStore((s) => s.skyFluidCustom) ?? {};
  const baseConfig = getPresetConfig(presetKey);
  const config = { ...baseConfig };
  for (const k of TUNABLE_KEYS) {
    if (custom[k] != null) config[k] = custom[k];
  }

  return (
    <div className="sky sky--fluid" aria-hidden>
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0 }}
        pixelRatio={1}
        fov={45}
      >
        <ShaderGradient
          control="props"
          animate="on"
          color1={stops[0]}
          color2={stops[2]}
          color3={stops[4]}
          grain="off"
          lightType="3d"
          envPreset="city"
          cameraZoom={1}
          positionX={0}
          positionY={0}
          positionZ={0}
          {...config}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
