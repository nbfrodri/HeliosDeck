import { useQuery } from '@tanstack/react-query';
import { getRecentEarthquakes } from '../services/earthquakesApi.js';

const FIVE_MIN = 5 * 60 * 1000;

export function useEarthquakes({ minMagnitude, hoursWindow }) {
  return useQuery({
    queryKey: ['earthquakes', { minMagnitude, hoursWindow }],
    queryFn: () => getRecentEarthquakes({ minMagnitude, hoursWindow }),
    staleTime: FIVE_MIN,
    refetchInterval: FIVE_MIN,
  });
}
