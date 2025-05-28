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

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.detail ||
          error.response.data.message ||
          'Login failed'
      );
    }
    throw new Error(error.message || 'Login failed');
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.detail ||
          error.response.data.message ||
          'Logout failed'
      );
    }
    throw new Error(error.message || 'Logout failed');
  }
};

export const setPassword = async (
  email: string,
  password: string,
  repassword: string
) => {
  try {
    const response = await axiosInstance.post('/auth/set-password', {
      email,
      password,
      repassword,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.detail ||
          error.response.data.message ||
          'Failed to set password'
      );
    }
    throw new Error(error.message || 'Failed to set password');
  }
};

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

export const changePassword = async (data: {
  new_password: string;
  confirm_new_password: string;
}) => {
  try {
    const response = await axiosInstance.patch('/auth/change-password', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.detail ||
          error.response.data.message ||
          'Failed to change password'
      );
    }
    throw new Error(error.message || 'Failed to change password');
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

export const getClientProjects = async (clientId?: string) => {
  try {
    const response = await axiosInstance.get('/billing/projects', {
      params: clientId ? { clientId } : {},
    });
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

export const getProjectBreakdown = async (
  projectId: string,
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const response = await axiosInstance.get(
      `/billing/breakdown/${projectId}`,
      {
        params: clientId ? { month, year, clientId } : { month, year },
      }
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

export const getOverallServiceBreakdown = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const response = await axiosInstance.get('/billing/breakdown/services', {
      params: clientId ? { month, year, clientId } : { month, year },
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

export const getAllProjectBreakdown = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const response = await axiosInstance.get('/billing/project-total', {
      params: clientId ? { month, year, clientId } : { month, year },
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

export const getBillingSummary = async (clientId?: string) => {
  try {
    const response = await axiosInstance.get('/billing/summary', {
      params: clientId ? { clientId } : {},
    });
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

export const getMonthlyUsage = async (
  groupBy: 'service' | 'project' = 'service',
  months = 6,
  clientId?: string
) => {
  try {
    const response = await axiosInstance.get('/billing/monthly', {
      params: clientId ? { groupBy, months, clientId } : { groupBy, months },
    });
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
    const response = await axiosInstance.get('/user/client-name', {
      params: clientId ? { clientId } : {},
    });
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
    const response = await axiosInstance.patch('/billing/budget', data, {
      params: clientId ? { clientId } : {},
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to set budget');
    }
    throw new Error(error.message || 'Failed to set budget');
  }
};
