import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('interview_ai_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('interview_ai_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('interview_ai_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('interview_ai_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.warn('Auth verification failed:', err.message);
          // Don't wipe if offline fallback is being used
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('interview_ai_token', userToken);
        localStorage.setItem('interview_ai_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('interview_ai_token', userToken);
        localStorage.setItem('interview_ai_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data?.success) {
        const updated = res.data.data.user;
        setUser(prev => ({ ...prev, ...updated }));
        localStorage.setItem('interview_ai_user', JSON.stringify({ ...user, ...updated }));
        return { success: true, user: updated };
      }
      return { success: false, message: res.data?.message || 'Failed to update profile' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Profile update failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('interview_ai_token');
    localStorage.removeItem('interview_ai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
