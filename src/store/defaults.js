export const DEFAULT_GRADIENT = [
  '#0a1230',
  '#1c2456',
  '#3a2a6b',
  '#a85a8c',
  '#ffb377'
];

export const defaultSettings = {
  location: {
    lat: 40.4168,
    lon: -3.7038,
    label: 'Madrid',
    timezone: 'Europe/Madrid',
    country_code: 'ES'
  },
  cellSize: 88,
  gap: 18,
  theme: 'dark',
  gradientStops: DEFAULT_GRADIENT,
  skyMode: 'static'
};

export const defaultDeck = {
  widgets: []
};

export function makeWidgetId() {
  return `w_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
