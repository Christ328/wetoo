import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { useLang } from '../context/LangContext.jsx';

/**
 * Hook de chargement de données depuis l'API.
 * Gère : loading, error, données, annulation, refetch.
 * Recharge automatiquement quand la langue change (contenu traduit côté serveur).
 *
 * @param {string|null} path  Chemin API (ex: '/learn/lessons'). `null` => rien à charger.
 * @param {{ auth?:boolean, deps?:any[] }} options
 */
export function useApi(path, { deps = [] } = {}) {
  const { lang } = useLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const load = useCallback(
    async (silent = false) => {
      if (!path) {
        setLoading(false);
        return;
      }
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      if (!silent) setLoading(true);
      setError(null);
      try {
        const result = await api.get(path, { signal: controller.signal, lang });
        setData(result);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setError(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, lang]
  );

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, ...deps]);

  return { data, loading, error, refetch: () => load(true), setData };
}
