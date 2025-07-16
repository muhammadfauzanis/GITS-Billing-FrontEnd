import { axiosInstance } from './index';

export const getBillingSummary = async (clientId?: string) => {
  try {
    const params = clientId ? { clientId } : {};
    const response = await axiosInstance.get('/billing/summary', { params });
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

export const getOverallServiceBreakdown = async (
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) params.clientId = clientId;
    const response = await axiosInstance.get('/billing/breakdown/services', {
      params,
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
    const params: any = { month, year };
    if (clientId) params.clientId = clientId;
    const response = await axiosInstance.get('/billing/project-total', {
      params,
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

export const getProjectBreakdown = async (
  projectId: string,
  month: number,
  year: number,
  clientId?: string
) => {
  try {
    const params: any = { month, year };
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await axiosInstance.get(
      `/billing/breakdown/${projectId}`,
      { params }
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

export const getMonthlyUsage = async (
  groupBy: 'service' | 'project' = 'service',
  months = 6,
  clientId?: string
) => {
  try {
    const params: any = { groupBy, months };
    if (clientId) params.clientId = clientId;
    const response = await axiosInstance.get('/billing/monthly', { params });
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

export const getBudget = async (clientId?: string) => {
  try {
    const params = clientId ? { clientId } : {};
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
  data: { budget_value?: number; budget_threshold?: number },
  clientId?: string
) => {
  try {
    const params = clientId ? { clientId } : {};
    const response = await axiosInstance.patch('/billing/budget', data, {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to set budget');
    }
    throw new Error(error.message || 'Failed to set budget');
  }
};

export const getYearlySummary = async (year: number, clientId?: string) => {
  try {
    const params: any = { year };
    if (clientId) params.clientId = clientId;
    const response = await axiosInstance.get('/billing/yearly-summary', {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch yearly summary'
      );
    }
    throw new Error(error.message || 'Failed to fetch yearly summary');
  }
};
