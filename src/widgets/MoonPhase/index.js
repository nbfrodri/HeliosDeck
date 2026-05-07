import { IconMoon } from '@tabler/icons-react';
import { MoonPhaseWidget } from './MoonPhaseWidget.jsx';

export const MoonPhaseDescriptor = {
  type: 'moon-phase',
  nameKey: 'widget.moonPhase.name',
  descriptionKey: 'widget.moonPhase.description',
  Icon: IconMoon,
  defaultSize: { w: 4, h: 5 },
  minSize: { w: 3, h: 4 },
  maxSize: { w: 6, h: 6 },
  defaultSettings: {},
  Component: MoonPhaseWidget,
  SettingsComponent: null
};
