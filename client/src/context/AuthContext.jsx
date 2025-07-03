import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user on mount
  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signup = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', data);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    // Optionally, call a backend logout endpoint to clear cookie
    // For now, just clear user state
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 