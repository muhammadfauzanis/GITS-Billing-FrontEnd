import { axiosInstance } from './index';

export const getDailyServiceBreakdown = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) params.clientId = clientId;
    const response = await axiosInstance.get(
      '/billing/daily/service-breakdown',
      { params }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch daily service breakdown'
      );
    }
    throw new Error(error.message || 'Failed to fetch daily service breakdown');
  }
};

export const getDailyProjectTrend = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) params.clientId = clientId;
    const response = await axiosInstance.get(
      '/billing/daily/project-breakdown',
      { params }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch daily project trend'
      );
    }
    throw new Error(error.message || 'Failed to fetch daily project trend');
  }
};
