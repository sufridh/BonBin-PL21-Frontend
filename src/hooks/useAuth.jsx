import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bonbin_user');
    const token = localStorage.getItem('bonbin_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  function login(token, userData) {
    localStorage.setItem('bonbin_token', token);
    localStorage.setItem('bonbin_user', JSON.stringify(userData));
    setUser(userData);
  }

  function updateUser(userData) {
    const merged = { ...user, ...userData };
    localStorage.setItem('bonbin_user', JSON.stringify(merged));
    setUser(merged);
  }

  function logout() {
    localStorage.removeItem('bonbin_token');
    localStorage.removeItem('bonbin_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
