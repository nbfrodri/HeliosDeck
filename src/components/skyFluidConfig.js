// Pure data — no shadergradient/three imports here so this file can be
// statically imported by SkySettings without dragging the WebGL bundle into
// the main JS chunk.

export const FLUID_PRESETS = [
  {
    value: 'liquid-wave',
    label: 'Liquid wave',
    description: 'Olas líquidas orgánicas',
    config: {
      type: 'waterPlane',
      uSpeed: 0.18, uStrength: 3.4, uFrequency: 5.5, uDensity: 1.4,
      rotationX: 50, rotationY: 0, rotationZ: 50,
      cAzimuthAngle: 180, cPolarAngle: 80, cDistance: 2.8,
      brightness: 1.1, reflection: 0.1,
    },
  },
  {
    value: 'aurora-flow',
    label: 'Aurora flow',
    description: 'Colores en diagonal, energía',
    config: {
      type: 'plane',
      uSpeed: 0.3, uStrength: 4, uFrequency: 5.5, uDensity: 1.3,
      rotationX: 0, rotationY: 10, rotationZ: 50,
      cAzimuthAngle: 180, cPolarAngle: 95, cDistance: 3.6,
      brightness: 1.2, reflection: 0,
    },
  },
  {
    value: 'slow-drift',
    label: 'Slow drift',
    description: 'Calmo, modo lectura',
    config: {
      type: 'plane',
      uSpeed: 0.08, uStrength: 1.5, uFrequency: 4, uDensity: 1.1,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      cAzimuthAngle: 180, cPolarAngle: 90, cDistance: 3.6,
      brightness: 1.0, reflection: 0,
    },
  },
  {
    value: 'plasma',
    label: 'Plasma',
    description: 'Energía intensa, rápida',
    config: {
      type: 'plane',
      uSpeed: 0.55, uStrength: 5, uFrequency: 6.5, uDensity: 1.6,
      rotationX: 0, rotationY: 0, rotationZ: 0,
      cAzimuthAngle: 180, cPolarAngle: 90, cDistance: 3,
      brightness: 1.3, reflection: 0,
    },
  },
  {
    value: 'mist',
    label: 'Mist',
    description: 'Niebla suave, etérea',
    config: {
      type: 'plane',
      uSpeed: 0.12, uStrength: 2, uFrequency: 3, uDensity: 1.0,
      rotationX: 30, rotationY: 0, rotationZ: 0,
      cAzimuthAngle: 180, cPolarAngle: 70, cDistance: 4,
      brightness: 0.9, reflection: 0,
    },
  },
  {
    value: 'storm',
    label: 'Storm',
    description: 'Olas violentas, dramático',
    config: {
      type: 'waterPlane',
      uSpeed: 0.5, uStrength: 5.5, uFrequency: 6, uDensity: 1.8,
      rotationX: 60, rotationY: 0, rotationZ: 30,
      cAzimuthAngle: 180, cPolarAngle: 75, cDistance: 2.5,
      brightness: 0.95, reflection: 0.2,
    },
  },
];

const PRESET_BY_VALUE = Object.fromEntries(
  FLUID_PRESETS.map((p) => [p.value, p])
);

export function getPresetConfig(value) {
  return (PRESET_BY_VALUE[value] ?? PRESET_BY_VALUE['liquid-wave']).config;
}

export const TUNABLE_KEYS = ['uSpeed', 'uStrength', 'uFrequency', 'uDensity', 'brightness'];
