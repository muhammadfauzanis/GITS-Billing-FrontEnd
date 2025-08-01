import { axiosInstance } from './index';

export interface DailyFilterParams {
  month?: number;
  year?: number;
  start_date?: string;
  end_date?: string;
  clientId?: string;
}

export const getDailyServiceBreakdown = async (params: DailyFilterParams) => {
  try {
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

export const getDailyProjectTrend = async (params: DailyFilterParams) => {
  try {
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

export const getDailyServiceBreakdownForProject = async (
  projectId: string,
  params: DailyFilterParams
) => {
  try {
    const response = await axiosInstance.get(
      `/billing/daily/services-breakdown/project/${projectId}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message ||
          'Failed to fetch daily service breakdown for project'
      );
    }
    throw new Error(
      error.message || 'Failed to fetch daily service breakdown for project'
    );
  }
};
