import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMeApi, loginUserApi, registerUserApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      if (token) {
        try {
          const res = await getMeApi();
          setUser(res.data);
        } catch (err) {
          console.warn('[AuthContext] Token expired or invalid, logging out.');
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUserApi({ email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await registerUserApi({ name, email, password, confirmPassword });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
