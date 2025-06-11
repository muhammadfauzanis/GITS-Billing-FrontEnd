// File: lib/auth.tsx

'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

type AppUser = {
  id: string; // Ini adalah supabase_auth_id
  email: string;
  clientId: string | null;
  role: string | null;
  isPasswordSet: boolean;
};

type AuthContextType = {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleAuthStateChange = async (currentSession: Session | null) => {
      setSession(currentSession);

      if (currentSession) {
        const { data: profile } = await supabase
          .from('users')
          .select('id, client_id, role, is_password_set')
          .eq('supabase_auth_id', currentSession.user.id) // <-- PERUBAHAN: Gunakan 'supabase_auth_id'
          .single();

        if (profile) {
          const appUser: AppUser = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            clientId: profile.client_id ? String(profile.client_id) : null,
            role: profile.role,
            isPasswordSet: profile.is_password_set || false,
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthStateChange(initialSession);
    });

    // Listen for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        handleAuthStateChange(currentSession);
        // Refresh the page to ensure server components update with the new auth state.
        // The middleware will handle any necessary redirects.
        router.refresh();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, logout }}>
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
