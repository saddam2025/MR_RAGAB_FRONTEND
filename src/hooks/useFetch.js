import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

/**
 * Generic data fetching hook using axios.
 *
 * const { data, error, loading, refetch, cancel } = useFetch(urlOrConfig, {
 *   manual: false,
 *   deps: [],
 *   transform: (res) => res.data,
 *   axiosConfig: {}
 * });
 *
 * - urlOrConfig: string URL or axios request config object
 * - options.manual: if true, does not auto-fetch on mount
 * - options.deps: array of dependencies to re-run auto fetch
 * - options.transform: function to map axios response to data
 * - options.axiosConfig: additional axios config merged into request
 */
export default function useFetch(urlOrConfig, options = {}) {
  const {
    manual = false,
    deps = [],
    transform = (res) => res.data,
    axiosConfig = {},
    throwOnError = false,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const controllerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const fetcher = useCallback(
    async (overrideConfig = {}) => {
      // build axios request config
      const isString = typeof urlOrConfig === 'string';
      const config = isString
        ? { url: urlOrConfig, method: 'get', ...axiosConfig, ...overrideConfig }
        : { ...urlOrConfig, ...axiosConfig, ...overrideConfig };

      // cancel token via AbortController
      if (controllerRef.current) controllerRef.current.abort();
      controllerRef.current = new AbortController();
      config.signal = controllerRef.current.signal;

      setLoading(true);
      setError(null);

      try {
        const res = await axios.request(config);
        const payload = transform(res);
        if (mountedRef.current) {
          setData(payload);
          setLoading(false);
        }
        return { ok: true, data: payload };
      } catch (err) {
        if (axios.isCancel && axios.isCancel(err)) {
          // request was cancelled
          if (mountedRef.current) setLoading(false);
          return { ok: false, cancelled: true };
        }
        const errPayload = err?.response?.data || err?.message || err;
        if (mountedRef.current) {
          setError(errPayload);
          setLoading(false);
        }
        if (throwOnError) throw err;
        return { ok: false, error: errPayload };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [urlOrConfig, transform, JSON.stringify(axiosConfig)]
  );

  // auto-run unless manual
  useEffect(() => {
    if (!manual) {
      fetcher();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manual, fetcher, ...deps]);

  const refetch = useCallback((override) => fetcher(override), [fetcher]);

  const cancel = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, []);

  return {
    data,
    error,
    loading,
    refetch,
    cancel,
  };
}
