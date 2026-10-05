'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  email?: string | null;
  mobile: string;
  role: 'CUSTOMER' | 'FAMILY_MEMBER' | 'WORKER' | 'COOPERATIVE_ADMIN' | 'FEDERATION_ADMIN';
  status: string;
  name?: string;
  preferredLanguage?: string;
  customer?: any;
  worker?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginDemo: (accountType: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginDemo = async (accountType: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        window.location.href = data.redirectUrl || '/';
        return true;
      }
      return false;
    } catch (e) {
      console.error('Demo login error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginDemo, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
