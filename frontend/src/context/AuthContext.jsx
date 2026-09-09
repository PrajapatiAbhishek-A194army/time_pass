import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('solesphere_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('solesphere_token');
      const storedUser = localStorage.getItem('solesphere_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Verify with backend
          const res = await authService.getCurrentUser();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('solesphere_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed, continuing with cached session or logout.');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.loginUser({ email, password });
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('solesphere_token', jwtToken);
      localStorage.setItem('solesphere_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Authentication failed');
  };

  const register = async (userData) => {
    const res = await authService.registerUser(userData);
    if (res.success && res.data) {
      const { user: newUser, token: jwtToken } = res.data;
      setUser(newUser);
      setToken(jwtToken);
      localStorage.setItem('solesphere_token', jwtToken);
      localStorage.setItem('solesphere_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
    } catch (err) {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('solesphere_token');
      localStorage.removeItem('solesphere_user');
    }
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (tokenParam, newPassword) => {
    return await authService.resetPassword(tokenParam, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
