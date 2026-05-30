import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI, setAuthToken } from '../utils/api';

const AuthContext = createContext(null);

const readStoredSession = () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const rawUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
  return {
    token,
    user: rawUser ? JSON.parse(rawUser) : null,
  };
};

export function AuthProvider({ children }) {
  const initialSession = readStoredSession();
  const [token, setToken] = useState(initialSession.token);
  const [user, setUser] = useState(initialSession.user);
  const [loading, setLoading] = useState(Boolean(initialSession.token));

  const clearSession = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const saveSession = (nextToken, nextUser, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    otherStorage.removeItem('authToken');
    otherStorage.removeItem('authUser');
    storage.setItem('authToken', nextToken);
    storage.setItem('authUser', JSON.stringify(nextUser));

    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  useEffect(() => {
    const syncProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(token);
        const res = await authAPI.profile();
        const nextUser = res.data.user;
        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('authUser', JSON.stringify(nextUser));
        setUser(nextUser);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    syncProfile();
  }, []);

  useEffect(() => {
    const onExpired = () => clearSession();
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = async ({ identifier, password, remember }) => {
    const res = await authAPI.login({ identifier, password });
    saveSession(res.data.token, res.data.user, remember);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await authAPI.register(payload);
    return res.data;
  };

  const logout = async () => {
    try {
      if (token) await authAPI.logout();
    } finally {
      clearSession();
    }
  };

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  }), [token, user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
