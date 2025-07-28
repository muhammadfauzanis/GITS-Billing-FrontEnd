import { axiosInstance } from './index';
import type { DailyFilterParams } from './billingDaily'; // Impor tipe filter

export const getDailySkuTrend = async (params: DailyFilterParams) => {
  try {
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

export const getSkuBreakdown = async (params: DailyFilterParams) => {
  try {
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

export const getDailySkuTrendForProject = async (
  projectId: string,
  params: Omit<DailyFilterParams, 'clientId'>
) => {
  try {
    const response = await axiosInstance.get(
      `/billing/sku/trend/project/${projectId}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message ||
          'Failed to fetch daily SKU trend for project'
      );
    }
    throw new Error(
      error.message || 'Failed to fetch daily SKU trend for project'
    );
  }
};

export const getSkuBreakdownForProject = async (
  projectId: string,
  params: Omit<DailyFilterParams, 'clientId'>
) => {
  try {
    const response = await axiosInstance.get(
      `/billing/sku/breakdown/project/${projectId}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message ||
          'Failed to fetch SKU breakdown table for project'
      );
    }
    throw new Error(
      error.message || 'Failed to fetch SKU breakdown table for project'
    );
  }
};
