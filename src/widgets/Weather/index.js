import { IconCloud } from '@tabler/icons-react';
import { WeatherWidget } from './WeatherWidget.jsx';

export const WeatherDescriptor = {
  type: 'weather',
  name: 'Tiempo actual',
  description: 'Temperatura, viento y humedad para tu ubicación.',
  Icon: IconCloud,
  defaultSize: { w: 5, h: 5 },
  minSize: { w: 4, h: 4 },
  maxSize: { w: 8, h: 6 },
  defaultSettings: {},
  Component: WeatherWidget,
  SettingsComponent: null
};
