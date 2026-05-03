import { ClockDescriptor } from './Clock';
import { WeatherDescriptor } from './Weather';
import { MoonPhaseDescriptor } from './MoonPhase';
import { SunTimesDescriptor } from './SunTimes';

export const widgetDescriptors = [
  ClockDescriptor,
  WeatherDescriptor,
  MoonPhaseDescriptor,
  SunTimesDescriptor
];

export function getDescriptor(type) {
  return widgetDescriptors.find((d) => d.type === type) ?? null;
}

export function listAvailable() {
  return widgetDescriptors.map(({ Component, SettingsComponent, ...meta }) => meta);
}
