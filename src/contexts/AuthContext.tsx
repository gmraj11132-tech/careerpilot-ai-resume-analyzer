'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id?: string;
  userId?: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('careerpilot_token') : null;
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }

      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('careerpilot_token');
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('careerpilot_token', data.token);
        }
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Invalid credentials. Please verify your email and password.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('careerpilot_token', data.token);
        }
        setUser(data.user);
        return { success: true };
      }

      let errorMsg = data.error || 'Registration failed';
      if (data.details) {
        const fields = Object.values(data.details).flat();
        if (fields.length > 0) {
          errorMsg = fields.join(', ');
        }
      }

      return { success: false, error: errorMsg };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  };

  const logout = async () => {
    try {
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('careerpilot_token') : null;
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
      await fetch('/api/auth/logout', { method: 'POST', headers });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('careerpilot_token');
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
