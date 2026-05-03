import { useEffect, useState, useRef, useCallback } from 'react';

export function usePolling(fn, intervalMs, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    try {
      const result = await fnRef.current();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const result = await fnRef
        .current()
        .then((r) => ({ ok: true, r }))
        .catch((e) => ({ ok: false, e }));
      if (!alive) return;
      if (result.ok) {
        setData(result.r);
        setError(null);
      } else {
        setError(result.e);
      }
      setLoading(false);
    })();
    if (!intervalMs) return () => { alive = false; };
    const id = setInterval(run, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, refetch: run };
}

export function useTick(intervalMs = 1000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
