import { axiosInstance } from './index';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  period: string;
  total: string;
  dueDate: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  createdAt: string;
}

export const getClientInvoices = async (
  clientId?: string
): Promise<{ invoices: Invoice[] }> => {
  try {
    const params = clientId ? { clientId } : {};
    const response = await axiosInstance.get('/invoices', { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to fetch invoices'
      );
    }
    throw new Error(error.message || 'Failed to fetch invoices');
  }
};

export const getInvoiceViewUrl = async (
  invoiceId: number
): Promise<{ url: string }> => {
  try {
    const response = await axiosInstance.get(`/invoices/${invoiceId}/view`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(
        error.response.data.message || 'Failed to get invoice URL'
      );
    }
    throw new Error(error.message || 'Failed to get invoice URL');
  }
};
