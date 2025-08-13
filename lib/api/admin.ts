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

export const getContracts = async () => {
  try {
    const response = await axiosInstance.get('/admin/contracts/');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch contracts'
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
