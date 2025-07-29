import { axiosInstance } from './index';

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
