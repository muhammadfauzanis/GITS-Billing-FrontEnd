import axios from 'axios';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL!;

const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const loginUser = async (email: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

// Admin API
export const registerUser = async (userData: {
  email: string;
  password: string;
  role: string;
  clientId?: string;
}) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    // Handle axios error response
    if (error.response?.data) {
      throw new Error(
        error.response.data.detail ||
          error.response.data.message ||
          'Registration failed'
      );
    }
    throw new Error(error.message || 'Registration failed');
  }
};

export const getClients = async () => {
  try {
    const response = await axiosInstance.get('/admin/clients');
    return response.data;
  } catch (error: any) {
    console.error('Get clients error:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch clients');
    }
    throw new Error(error.message || 'Failed to fetch clients');
  }
};

export const getUsers = async () => {
  try {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  } catch (error: any) {
    console.error('Get users error:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch users');
    }
    throw new Error(error.message || 'Failed to fetch users');
  }
};

export const deleteUser = async (userId: number) => {
  try {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete user error:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to delete user');
    }
    throw new Error(error.message || 'Failed to delete user');
  }
};

export const updateUserClientId = async (userId: number, clientId: number) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}`, {
    clientId,
  });
  return response.data;
};

// Billing API
export const getClientProjects = async () => {
  const response = await axiosInstance.get('/billing/projects');
  return response.data;
};

export const getProjectBreakdown = async (
  projectId: string,
  month: number,
  year: number
) => {
  const response = await axiosInstance.get(`/billing/breakdown/${projectId}`, {
    params: { month, year },
  });
  return response.data;
};

export const getOverallServiceBreakdown = async (
  month: number,
  year: number
) => {
  const response = await axiosInstance.get(`/billing/breakdown/services`, {
    params: { month, year },
  });
  return response.data;
};

export const getAllProjectBreakdown = async (month: number, year: number) => {
  const response = await axiosInstance.get(`/billing/project-total`, {
    params: { month, year },
  });
  return response.data;
};

export const getBillingSummary = async () => {
  const response = await axiosInstance.get('/billing/summary');
  return response.data;
};

export const getMonthlyUsage = async (
  groupBy: 'service' | 'project' = 'service',
  months = 6
) => {
  const response = await axiosInstance.get('/billing/monthly', {
    params: { groupBy, months },
  });
  return response.data;
};

export const getClientName = async () => {
  const response = await axiosInstance.get('/user/client-name');
  return response.data;
};

export const getBudget = async () => {
  const response = await axiosInstance.get('/billing/budget');
  return response.data;
};

export const setBudget = async (data: {
  budget_value?: number;
  budget_threshold?: number;
}) => {
  const response = await axiosInstance.patch('/billing/budget', data);
  return response.data;
};
