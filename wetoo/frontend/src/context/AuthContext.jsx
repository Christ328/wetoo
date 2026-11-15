import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Au démarrage : on demande le profil courant (la session vit dans un cookie). */
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const { user: me } = await api.get('/auth/me');
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: me } = await api.post('/auth/login', { email, password });
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: me } = await api.post('/auth/register', payload);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* la session sera de toute façon oubliée côté client */
    }
    setUser(null);
    toast.info('Tu es déconnecté·e. À bientôt sur WeToo !');
  }, [toast]);

  const updateProfile = useCallback(async (payload) => {
    const { user: me } = await api.patch('/auth/me', payload);
    setUser(me);
    return me;
  }, []);

  /** Recharge le profil (utile après un gain de points ou un badge). */
  const refreshUser = useCallback(async () => {
    try {
      const { user: me } = await api.get('/auth/me');
      setUser(me);
      return me;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout, updateProfile, refreshUser, setUser }),
    [user, loading, login, register, logout, updateProfile, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
