import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { setUnauthorizedHandler } from '../api/client';
import { AuthContext } from './auth';

// The API can be asleep when the first visitor of the day arrives and needs up to a
// minute to wake. Until it answers, nobody can say whether the visitor is logged in.
const RETRY_MS = 3000;
const MAX_TRIES = 25;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // true until the first "who am I" request has answered
  const [loading, setLoading] = useState(true);
  // true while that first request keeps failing for a reason other than "not logged in"
  const [waking, setWaking] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data.data.user);
      return data.data.user;
    } catch (error) {
      // only a 401 means "not logged in"; a network blip must not end the session in the UI
      if (error.response?.status === 401) setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setUnauthorizedHandler(() => setUser(null));

    const findOutWhoIsLoggedIn = async () => {
      for (let attempt = 1; attempt <= MAX_TRIES && !cancelled; attempt += 1) {
        try {
          const { data } = await api.get('/users/me');
          if (!cancelled) setUser(data.data.user);
          return;
        } catch (error) {
          // a 401 is an answer: nobody is logged in
          if (error.response?.status === 401) return;

          if (!cancelled) setWaking(true);
          await wait(RETRY_MS);
        }
      }
    };

    findOutWhoIsLoggedIn().finally(() => {
      if (cancelled) return;
      setWaking(false);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // throws on failure so the form can show the server's message
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.get('/users/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, waking, login, logout, refreshUser }),
    [user, loading, waking, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
