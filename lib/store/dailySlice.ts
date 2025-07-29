import { StateCreator } from 'zustand';
import { DashboardState, DailySlice } from './types';
import {
  getDailyServiceBreakdown,
  getDailyProjectTrend,
  getDailySkuTrend,
  getSkuBreakdown,
} from '../api/index';

export const createDailySlice: StateCreator<
  DashboardState,
  [],
  [],
  DailySlice
> = (set, get) => ({
  // --- INITIAL STATE ---
  dailyData: null,
  dailyProjectTrendData: null,
  dailySkuTrendData: null,
  dailySkuBreakdownData: null,

  // --- ACTIONS ---
  fetchDailyData: async (filters) => {
    const { selectedClientId, dailyFilters, dailyData } = get();
    // Caching: Hanya fetch jika data belum ada atau jika ada filter baru
    if (dailyData && !filters) return;
    if (!selectedClientId) return;

    const finalFilters = filters || dailyFilters;
    set((state) => ({
      loading: { ...state.loading, daily: true },
      error: null,
    }));
    try {
      const data = await getDailyServiceBreakdown({
        ...finalFilters,
        clientId: selectedClientId,
      });
      set({ dailyData: data });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data harian.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, daily: false } }));
    }
  },

  fetchDailyProjectTrend: async (filters) => {
    const { selectedClientId, dailyFilters, dailyProjectTrendData } = get();
    if (dailyProjectTrendData && !filters) return;
    if (!selectedClientId) return;

    const finalFilters = filters || dailyFilters;
    set((state) => ({
      loading: { ...state.loading, dailyProjectTrend: true },
      error: null,
    }));
    try {
      const data = await getDailyProjectTrend({
        ...finalFilters,
        clientId: selectedClientId,
      });
      set({ dailyProjectTrendData: data });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat tren proyek harian.' });
    } finally {
      set((state) => ({
        loading: { ...state.loading, dailyProjectTrend: false },
      }));
    }
  },

  fetchDailySkuTrend: async (filters) => {
    const { selectedClientId, dailyFilters, dailySkuTrendData } = get();
    if (dailySkuTrendData && !filters) return;
    if (!selectedClientId) return;

    const finalFilters = filters || dailyFilters;
    set((state) => ({
      loading: { ...state.loading, dailySkuTrend: true },
      error: null,
    }));
    try {
      const data = await getDailySkuTrend({
        ...finalFilters,
        clientId: selectedClientId,
      });
      set({ dailySkuTrendData: data });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat tren SKU harian.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, dailySkuTrend: false } }));
    }
  },

  fetchDailySkuBreakdown: async (filters) => {
    const { selectedClientId, dailyFilters, dailySkuBreakdownData } = get();
    if (dailySkuBreakdownData && !filters) return;
    if (!selectedClientId) return;

    const finalFilters = filters || dailyFilters;
    set((state) => ({
      loading: { ...state.loading, dailySkuBreakdown: true },
      error: null,
    }));
    try {
      const data = await getSkuBreakdown({
        ...finalFilters,
        clientId: selectedClientId,
      });
      set({ dailySkuBreakdownData: data });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat rincian SKU.' });
    } finally {
      set((state) => ({
        loading: { ...state.loading, dailySkuBreakdown: false },
      }));
    }
  },
});
