'use client';

import type React from 'react';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  clientId: string;
  isPasswordSet: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

// Perbaikan: Memberikan nilai default untuk AuthContext
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = () => {
      // First check localStorage for backward compatibility
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // Then check cookies (preferred method)
      const cookieToken = getCookie('token');
      const cookieUser = getCookie('user');

      if (cookieToken && cookieUser) {
        try {
          setToken(cookieToken);
          setUser(JSON.parse(cookieUser));
        } catch (error) {
          console.error('Error parsing user data from cookie:', error);
          // Clear invalid cookie data
          deleteCookie('token');
          deleteCookie('user');
        }
      } else if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setCookie('token', storedToken, 7);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          // Clear invalid localStorage data
          localStorage.removeItem('token');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setCookie('token', newToken, 14);

    setToken(newToken);
    setUser(newUser);

    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect') || '/dashboard';

    router.push(redirectTo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    deleteCookie('token');

    setToken(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}
