import {
  IconSun,
  IconMoon,
  IconMoonStars,
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudSnow,
  IconCloudStorm,
  IconCloudBolt
} from '@tabler/icons-react';

const WEATHER_LABELS = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna',
  55: 'Llovizna densa',
  61: 'Lluvia ligera',
  63: 'Lluvia',
  65: 'Lluvia fuerte',
  71: 'Nevada ligera',
  73: 'Nevada',
  75: 'Nevada fuerte',
  80: 'Chubascos',
  81: 'Chubascos fuertes',
  82: 'Chubascos violentos',
  95: 'Tormenta',
  96: 'Tormenta con granizo',
  99: 'Tormenta fuerte con granizo'
};

export function weatherCodeToLabel(code) {
  return WEATHER_LABELS[code] ?? '—';
}

export function weatherCodeToIcon(code, isDay = true) {
  if (code === 0 || code === 1) return isDay ? IconSun : IconMoonStars;
  if (code === 2 || code === 3) return IconCloud;
  if (code === 45 || code === 48) return IconCloudFog;
  if (code >= 51 && code <= 55) return IconCloudRain;
  if (code >= 61 && code <= 65) return IconCloudRain;
  if (code >= 71 && code <= 75) return IconCloudSnow;
  if (code >= 80 && code <= 82) return IconCloudStorm;
  if (code === 95) return IconCloudBolt;
  if (code >= 96) return IconCloudBolt;
  return IconCloud;
}

// Color hint per weather group, used to tint the icon
export function weatherCodeToColor(code, isDay = true) {
  if (code === 0 || code === 1) return isDay ? '#ffc77a' : '#cdd2dd';
  if (code === 2 || code === 3) return '#cdd6e8';
  if (code === 45 || code === 48) return '#b5bdd4';
  if (code >= 51 && code <= 65) return '#9bb8ff';
  if (code >= 71 && code <= 75) return '#dfe8ff';
  if (code >= 80 && code <= 82) return '#a8b4ff';
  if (code >= 95) return '#ffd166';
  return '#cdd6e8';
}

export async function fetchWeather({ lat, lon }) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m'
    ].join(',')
  );
  url.searchParams.set(
    'hourly',
    ['temperature_2m', 'precipitation_probability', 'weather_code'].join(',')
  );
  url.searchParams.set(
    'daily',
    [
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum'
    ].join(',')
  );
  url.searchParams.set('forecast_days', '2');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return res.json();
}
