import { axiosInstance } from './index';

export const getDailySkuTrend = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) params.clientId = clientId;
    const response = await axiosInstance.get('/billing/sku/trend', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch daily SKU trend'
      );
    }
    throw new Error(error.message || 'Failed to fetch daily SKU trend');
  }
};

export const getSkuBreakdown = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.get('/billing/sku/breakdown', {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch SKU breakdown'
      );
    }
    throw new Error(error.message || 'Failed to fetch SKU breakdown');
  }
};
