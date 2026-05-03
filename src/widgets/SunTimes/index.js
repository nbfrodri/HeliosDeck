import { IconSunset2 } from '@tabler/icons-react';
import { SunTimesWidget } from './SunTimesWidget.jsx';

export const SunTimesDescriptor = {
  type: 'sun-times',
  name: 'Sol y luna',
  description: 'Trayectoria diurna del sol, amanecer, atardecer y horarios lunares.',
  Icon: IconSunset2,
  defaultSize: { w: 5, h: 6 },
  minSize: { w: 4, h: 5 },
  maxSize: { w: 8, h: 7 },
  defaultSettings: {},
  Component: SunTimesWidget,
  SettingsComponent: null
};
