import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultSettings, DEFAULT_GRADIENT } from './defaults.js';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setLocation: (location) => set({ location }),
      setCellSize: (n) => set({ cellSize: Math.max(40, Math.min(160, n)) }),
      setGap: (n) => set({ gap: Math.max(0, Math.min(48, n)) }),

      setGradientStop: (index, color) => {
        const stops = [...(get().gradientStops ?? DEFAULT_GRADIENT)];
        stops[index] = color;
        set({ gradientStops: stops });
      },
      setGradientStops: (stops) => set({ gradientStops: stops }),
      resetGradient: () => set({ gradientStops: DEFAULT_GRADIENT }),

      setSkyMode: (mode) => set({ skyMode: mode === 'fluid' ? 'fluid' : 'static' }),

      requestGeolocation: async () => {
        if (!('geolocation' in navigator)) {
          throw new Error('Geolocalización no soportada');
        }
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000
          });
        });
        const { latitude: lat, longitude: lon } = pos.coords;
        let label = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        let timezone = null;
        let country_code = null;
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=es`
          );
          const json = await res.json();
          const top = json?.results?.[0];
          if (top) {
            label = top.name + (top.country ? `, ${top.country}` : '');
            timezone = top.timezone || null;
            country_code = top.country_code || null;
          }
        } catch {
          // ignoramos: nos quedamos con las coords como label
        }
        set({ location: { lat, lon, label, timezone, country_code } });
      },

      reset: () => set({ ...defaultSettings })
    }),
    {
      name: 'helios-deck/settings',
      version: 2,
      migrate: (state, fromVersion) => {
        if (fromVersion < 2) {
          return { ...defaultSettings, ...state, gradientStops: DEFAULT_GRADIENT };
        }
        return state;
      }
    }
  )
);
