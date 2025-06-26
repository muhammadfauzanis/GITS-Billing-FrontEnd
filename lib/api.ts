// lib/api.ts
import axios from 'axios';
import { supabase } from '@/lib/supabase';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL!;

const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
});

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    cachedToken = session?.access_token || null;
    tokenExpiry = session?.expires_at ? session.expires_at * 1000 : null;
  } else if (event === 'SIGNED_OUT') {
    cachedToken = null;
    tokenExpiry = null;
  }
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Gunakan token dari cache jika valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
      return config;
    }

    // Jika token tidak ada atau kedaluwarsa, baru panggil getSession
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

export const registerUser = async (userData: {
  email: string;
  password?: string;
  role: string;
  clientId?: string;
}) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.detail ||
          error.response.data.message ||
          'User registration failed'
      );
    }
    throw new Error(error.message || 'User registration failed');
  }
};

export const updateUserPasswordStatus = async (userId: string) => {
  try {
    // Kirim userId di dalam body request
    const response = await axiosInstance.patch('/auth/update-password-status', {
      userId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.detail ||
          error.response.data.message ||
          'Failed to update password status'
      );
    }
    throw new Error(error.message || 'Failed to update password status');
  }
};

export const deleteUser = async (userId: number) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to delete user');
    }
    throw new Error(error.message || 'Failed to delete user');
  }
};

export const getUsers = async () => {
  try {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch users');
    }
    throw new Error(error.message || 'Failed to fetch users');
  }
};

export const updateUserClientId = async (userId: number, clientId: number) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/users/${userId}/client`,
      {
        clientId,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to update user client ID'
      );
    }
    throw new Error(error.message || 'Failed to update user client ID');
  }
};

export const getClients = async () => {
  try {
    const response = await axiosInstance.get('/admin/clients');
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch clients');
    }
    throw new Error(error.message || 'Failed to fetch clients');
  }
};

export const getBillingSummary = async (clientId?: string) => {
  try {
    const params = clientId ? { clientId } : {};
    const response = await axiosInstance.get('/billing/summary', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch billing summary'
      );
    }
    throw new Error(error.message || 'Failed to fetch billing summary');
  }
};

export const getOverallServiceBreakdown = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.get('/billing/breakdown/services', {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message ||
          'Failed to fetch overall service breakdown'
      );
    }
    throw new Error(
      error.message || 'Failed to fetch overall service breakdown'
    );
  }
};

export const getClientProjects = async (clientId?: string) => {
  try {
    const params = clientId ? { clientId } : {};
    const response = await axiosInstance.get('/billing/projects', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch client projects'
      );
    }
    throw new Error(error.message || 'Failed to fetch client projects');
  }
};

export const getAllProjectBreakdown = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.get('/billing/project-total', {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch all project breakdown'
      );
    }
    throw new Error(error.message || 'Failed to fetch all project breakdown');
  }
};

export const getMonthlyUsage = async (
  groupBy: 'service' | 'project' = 'service',
  months = 6,
  clientId?: string
) => {
  try {
    const params: any = { groupBy, months };
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.get('/billing/monthly', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch monthly usage'
      );
    }
    throw new Error(error.message || 'Failed to fetch monthly usage');
  }
};

export const getClientName = async (clientId?: string) => {
  try {
    const params = clientId ? { clientId } : {};
    const response = await axiosInstance.get('/user/client-name', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch client name'
      );
    }
    throw new Error(error.message || 'Failed to fetch client name');
  }
};

export const getProjectBreakdown = async (
  projectId: string,
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.get(
      `/billing/breakdown/${projectId}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch project breakdown'
      );
    }
    throw new Error(error.message || 'Failed to fetch project breakdown');
  }
};

export const getBudget = async (clientId?: string) => {
  try {
    const params: any = {};
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.get('/billing/budget', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch budget');
    }
    throw new Error(error.message || 'Failed to fetch budget');
  }
};

export const setBudget = async (
  data: {
    budget_value?: number;
    budget_threshold?: number;
  },
  clientId?: string
) => {
  try {
    const params: any = {};
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.patch('/billing/budget', data, {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to set budget');
    }
    throw new Error(error.message || 'Failed to set budget');
  }
};

export const getYearlySummary = async (year: number, clientId?: string) => {
  try {
    const params: any = { year };
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.get('/billing/yearly-summary', {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch yearly summary'
      );
    }
    throw new Error(error.message || 'Failed to fetch yearly summary');
  }
};
