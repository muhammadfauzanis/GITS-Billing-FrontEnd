import { axiosInstance } from './index';

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
