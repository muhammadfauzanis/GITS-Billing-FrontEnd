import { axiosInstance } from './index';

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
      { clientId }
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

export const getContracts = async (
  month?: number | null,
  year?: number | null
) => {
  try {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const response = await axiosInstance.get('/admin/contracts/', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch contracts'
    );
  }
};

export const getContractDetails = async (contractId: string) => {
  try {
    const response = await axiosInstance.get(`/admin/contracts/${contractId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch contract details'
    );
  }
};

export const createContract = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post('/admin/contracts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to create contract'
    );
  }
};

export const updateContract = async (
  contractId: string,
  formData: FormData
) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/contracts/${contractId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to update contract'
    );
  }
};

export const deleteContract = async (contractId: string) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/contracts/${contractId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to delete contract'
    );
  }
};

export const getInternalEmails = async () => {
  try {
    const response = await axiosInstance.get('/admin/settings/internal-emails');
    return response.data.emails || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch internal emails'
    );
  }
};

export const addInternalEmail = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      '/admin/settings/internal-emails',
      { email }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to add internal email'
    );
  }
};

export const deleteInternalEmail = async (email: string) => {
  try {
    const response = await axiosInstance.delete(
      '/admin/settings/internal-emails',
      {
        data: { email },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to delete internal email'
    );
  }
};

// GOOGLE WORKSPACE

export const getGwClients = async () => {
  try {
    const response = await axiosInstance.get('/admin/gw-clients');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch Google Workspace clients'
    );
  }
};

export const getGwContracts = async (
  month?: number | null,
  year?: number | null
) => {
  try {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const response = await axiosInstance.get('/admin/gw-contracts/', {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        'Failed to fetch Google Workspace contracts'
    );
  }
};

export const getGwContractDetails = async (contractId: string) => {
  try {
    const response = await axiosInstance.get(
      `/admin/gw-contracts/${contractId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch GW contract details'
    );
  }
};

export const createGwContract = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post(
      '/admin/gw-contracts/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to create GW contract'
    );
  }
};

export const updateGwContract = async (
  contractId: string,
  formData: FormData
) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/gw-contracts/${contractId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to update GW contract'
    );
  }
};

export const deleteGwContract = async (contractId: string) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/gw-contracts/${contractId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to delete GW contract'
    );
  }
};
