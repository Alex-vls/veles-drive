import { useState, useEffect, useCallback } from 'react';

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

const useCache = (key, fetchData, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCachedData = useCallback(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        return data;
      }
    }
    return null;
  }, [key]);

  const setCachedData = useCallback((data) => {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }, [key]);

  const fetchAndCache = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchData();
      setData(result);
      setCachedData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, setCachedData]);

  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
    } else {
      fetchAndCache();
    }
  }, [...dependencies, getCachedData, fetchAndCache]);

  const refresh = useCallback(() => {
    fetchAndCache();
  }, [fetchAndCache]);

  return { data, loading, error, refresh };
};

export default useCache; 