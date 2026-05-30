import { useCallback, useEffect, useState } from 'react';

import { request } from './api';

export function useApiQuery<T>(path: string, token?: string | null, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled || !token) return;
    setLoading(true);
    setError(null);
    try {
      setData(await request<T>(path, { token }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [enabled, path, token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}
