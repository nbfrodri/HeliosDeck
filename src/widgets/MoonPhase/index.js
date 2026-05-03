import { IconMoon } from '@tabler/icons-react';
import { MoonPhaseWidget } from './MoonPhaseWidget.jsx';

export const MoonPhaseDescriptor = {
  type: 'moon-phase',
  name: 'Fase lunar',
  description: 'Iluminación actual de la luna y próximas fases del ciclo.',
  Icon: IconMoon,
  defaultSize: { w: 4, h: 5 },
  minSize: { w: 3, h: 4 },
  maxSize: { w: 6, h: 6 },
  defaultSettings: {},
  Component: MoonPhaseWidget,
  SettingsComponent: null
};
