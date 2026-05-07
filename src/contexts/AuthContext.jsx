import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { login as apiLogin, me as apiMe, refresh as apiRefresh } from '../services/authApi.js';

const STORAGE_KEY = 'helios.auth';
const AuthContext = createContext(null);

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(tokens) {
  if (tokens) localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  else localStorage.removeItem(STORAGE_KEY);
}

function pickProfile(payload) {
  return {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    image: payload.image,
  };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    status: 'loading',
    user: null,
    accessToken: null,
    refreshToken: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const stored = readStorage();
      if (!stored?.accessToken) {
        if (!cancelled) {
          setState({ status: 'unauthenticated', user: null, accessToken: null, refreshToken: null });
        }
        return;
      }
      try {
        const profile = await apiMe(stored.accessToken);
        if (cancelled) return;
        setState({
          status: 'authenticated',
          user: pickProfile(profile),
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
        });
      } catch {
        if (stored.refreshToken) {
          try {
            const refreshed = await apiRefresh({ refreshToken: stored.refreshToken });
            const profile = await apiMe(refreshed.accessToken);
            if (cancelled) return;
            const next = {
              status: 'authenticated',
              user: pickProfile(profile),
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken ?? stored.refreshToken,
            };
            setState(next);
            writeStorage({ accessToken: next.accessToken, refreshToken: next.refreshToken });
            return;
          } catch {
            // fall through to unauthenticated
          }
        }
        if (cancelled) return;
        writeStorage(null);
        setState({ status: 'unauthenticated', user: null, accessToken: null, refreshToken: null });
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const result = await apiLogin({ username, password });
    const next = {
      status: 'authenticated',
      user: pickProfile(result),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
    setState(next);
    writeStorage({ accessToken: next.accessToken, refreshToken: next.refreshToken });
    return next.user;
  }, []);

  const logout = useCallback(() => {
    writeStorage(null);
    setState({ status: 'unauthenticated', user: null, accessToken: null, refreshToken: null });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
