import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../lib/api/openMeteo.js';

const TEN_MIN = 10 * 60 * 1000;

/**
 * React Query wrapper around Open-Meteo's forecast endpoint. Cache key is
 * parameterized by lat/lon so changing location triggers a fresh request,
 * while reopening the same coordinates hits the cache instantly.
 * @ai-assisted Claude designed the hook signature so the dashboard widget
 *   and the map popup can share one cache. Verified by clicking a marker for
 *   a city that's already loaded — Network tab shows zero new requests.
 */
export function useWeather(location) {
  const lat = location?.lat;
  const lon = location?.lon;
  return useQuery({
    queryKey: ['weather', { lat, lon }],
    queryFn: () => fetchWeather({ lat, lon }),
    enabled: lat != null && lon != null,
    staleTime: TEN_MIN,
    refetchInterval: TEN_MIN,
  });
}
