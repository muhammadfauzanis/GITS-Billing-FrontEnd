import axios from 'axios';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const BASE_API_URL = `${process.env.NEXT_PUBLIC_BASE_API_URL}/api`;

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
});

// Cache token untuk mengurangi panggilan getSession()
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

supabase.auth.onAuthStateChange(
  (event: AuthChangeEvent, session: Session | null) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      cachedToken = session?.access_token || null;
      tokenExpiry = session?.expires_at ? session.expires_at * 1000 : null;
    } else if (event === 'SIGNED_OUT') {
      cachedToken = null;
      tokenExpiry = null;
    }
  }
);

axiosInstance.interceptors.request.use(
  async (config) => {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
      return config;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
      cachedToken = token;
      tokenExpiry = session.expires_at ? session.expires_at * 1000 : null;
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export * from './auth';
export * from './admin';
export * from './user';
export * from './billingMonthly';
export * from './billingDaily';
export * from './billingSku';
export * from './invoices';
export * from './notifications';
