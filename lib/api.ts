// API base URL - ganti dengan URL API Anda
const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL!;

// Helper untuk menambahkan token ke request headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Auth API
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Billing API
export const getClientProjects = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/billing/projects`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch projects');
    }

    return await response.json();
  } catch (error) {
    console.error('Get projects error:', error);
    throw error;
  }
};

export const getProjectBreakdown = async (
  projectId: string,
  month: number,
  year: number
) => {
  try {
    const queryParams = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
    });

    const response = await fetch(
      `${BASE_API_URL}/billing/breakdown/${projectId}?${queryParams}`,
      {
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch project breakdown');
    }

    return await response.json();
  } catch (error) {
    console.error('Get project breakdown error:', error);
    throw error;
  }
};

export const getOverallServiceBreakdown = async (
  month: number,
  year: number
) => {
  try {
    const queryParams = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
    });

    const response = await fetch(
      `${BASE_API_URL}/billing/breakdown/services?${queryParams}`,
      {
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch service breakdown');
    }

    return await response.json();
  } catch (error) {
    console.error('Get service breakdown error:', error);
    throw error;
  }
};

export const getBillingSummary = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/billing/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    console.log(response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch billing summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Get billing summary error:', error);
    throw error;
  }
};

export const getMonthlyUsage = async (
  groupBy: 'service' | 'project' = 'service',
  months = 6
) => {
  try {
    const queryParams = new URLSearchParams({
      groupBy,
      months: months.toString(),
    });

    const response = await fetch(
      `${BASE_API_URL}/billing/monthly?${queryParams}`,
      {
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch monthly usage');
    }

    return await response.json();
  } catch (error) {
    console.error('Get monthly usage error:', error);
    throw error;
  }
};
