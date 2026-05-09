import { useQuery } from '@tanstack/react-query';
import { listUsers } from '../services/usersApi.js';

const FIVE_MIN = 5 * 60 * 1000;

export function useUsers({ accessToken, limit = 30, enabled = true } = {}) {
  return useQuery({
    queryKey: ['users', { accessToken, limit }],
    queryFn: () => listUsers(accessToken, { limit }),
    staleTime: FIVE_MIN,
    enabled: enabled && !!accessToken,
  });
}
