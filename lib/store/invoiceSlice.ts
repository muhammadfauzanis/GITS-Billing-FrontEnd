import { StateCreator } from 'zustand';
import { DashboardState, InvoiceSlice } from './types';
import { getClientInvoices } from '../api';

export const createInvoiceSlice: StateCreator<
  DashboardState,
  [],
  [],
  InvoiceSlice
> = (set, get) => ({
  invoices: [],
  fetchInvoices: async () => {
    const { selectedClientId } = get();
    if (!selectedClientId) {
      set({ invoices: [] });
      return;
    }

    set((state) => ({
      loading: { ...state.loading, invoices: true },
      error: null,
    }));

    try {
      const data = await getClientInvoices(selectedClientId);
      set({ invoices: data.invoices || [] });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data tagihan.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, invoices: false } }));
    }
  },
});
