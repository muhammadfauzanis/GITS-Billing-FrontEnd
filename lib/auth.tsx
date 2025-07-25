'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// Impor tipe data yang dibutuhkan dari supabase-js
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

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

const getUserProfile = async (
  session: Session | null
): Promise<AppUser | null> => {
  if (!session?.user) return null;
  const { user: currentUser } = session;

  const { data: profile, error } = await supabase
    .from('users')
    .select('client_id, role, is_password_set, supabase_auth_id')
    .eq('email', currentUser.email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Auth Error: Gagal mengambil profil user', error);
    await supabase.auth.signOut();
    return null;
  }

  if (profile) {
    if (!profile.supabase_auth_id) {
      await supabase
        .from('users')
        .update({ supabase_auth_id: currentUser.id })
        .eq('email', currentUser.email);
    }
    return {
      id: currentUser.id,
      email: currentUser.email || '',
      clientId: profile.client_id ? String(profile.client_id) : null,
      role: profile.role,
      isPasswordSet: profile.is_password_set,
    };
  } else {
    await supabase.auth.signOut();
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleAuth = async (currentSession: Session | null) => {
      const appUser = await getUserProfile(currentSession);
      setUser(appUser);
      setSession(currentSession);
      setIsLoading(false);
    };

    // Menambahkan tipe data pada hasil getSession() untuk memperbaiki error pertama
    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        handleAuth(data.session);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      // Menambahkan tipe data pada parameter event dan session untuk memperbaiki error kedua & ketiga
      (event: AuthChangeEvent, newSession: Session | null) => {
        // Membandingkan dengan state 'session' yang ada, bukan 'AuthContext.session'
        // Ini memperbaiki error keempat
        if (newSession?.access_token !== session?.access_token) {
          handleAuth(newSession);
        }
        if (event === 'SIGNED_IN' && !user) {
          router.push('/unregistered');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, session]); // Menambahkan 'session' sebagai dependensi

  useEffect(() => {
    if (isLoading) return;
    const publicPaths = ['/', '/set-password', '/unregistered'];
    const isPublicPath = publicPaths.includes(pathname);
    const isAuthCallback = pathname.startsWith('/auth/callback');

    if (isAuthCallback) return;

    if (!user && !isPublicPath) {
      router.replace('/');
      return;
    }

    if (user) {
      if (!user.isPasswordSet && pathname !== '/set-password') {
        router.replace(`/set-password?email=${user.email}`);
      } else if (user.isPasswordSet && publicPaths.includes(pathname)) {
        router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
      } else if (user.role !== 'admin' && pathname.startsWith('/admin')) {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const value = { user, session, isLoading, login, loginWithGoogle, logout };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat sesi...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
