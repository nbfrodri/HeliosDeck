import { IconClock } from '@tabler/icons-react';
import { ClockWidget } from './ClockWidget.jsx';

export const ClockDescriptor = {
  type: 'clock',
  nameKey: 'widget.clock.name',
  descriptionKey: 'widget.clock.description',
  Icon: IconClock,
  defaultSize: { w: 4, h: 3 },
  minSize: { w: 3, h: 2 },
  maxSize: { w: 8, h: 4 },
  defaultSettings: { showSeconds: true, format: '24h' },
  Component: ClockWidget,
  SettingsComponent: null
};
