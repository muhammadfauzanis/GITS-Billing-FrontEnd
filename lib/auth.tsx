'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export type AppUser = {
  id: string;
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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleAuthStateChange = async (
      event: string,
      currentSession: Session | null
    ) => {
      setSession(currentSession);
      setIsLoading(true);

      if (currentSession) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('id, client_id, role, is_password_set, supabase_auth_id')
          .eq('email', currentSession.user.email)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error.message);
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (!profile) {
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            router.push('/unregistered');
          }
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (profile && !profile.supabase_auth_id) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ supabase_auth_id: currentSession.user.id })
            .eq('email', currentSession.user.email);

          if (updateError) {
            console.error('Failed to link supabase auth id:', updateError);
            await supabase.auth.signOut();
            return;
          }
        }

        const appUser: AppUser = {
          id: currentSession.user.id,
          email: currentSession.user.email || '',
          clientId: profile.client_id ? String(profile.client_id) : null,
          role: profile.role,
          isPasswordSet: profile.is_password_set || false,
        };
        setUser(appUser);

        if (event === 'SIGNED_IN') {
          if (!appUser.isPasswordSet) {
            router.push(`/set-password?email=${appUser.email}`);
          } else if (
            pathname === '/' ||
            pathname === '/login' ||
            pathname === '/auth/callback/continue'
          ) {
            router.push(appUser.role === 'admin' ? '/admin' : '/dashboard');
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          return;
        }

        handleAuthStateChange(event, currentSession);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    await supabase.auth.signOut();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signOut(); // Hindari user sebelumnya masih ada

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, login, loginWithGoogle, logout }}
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
