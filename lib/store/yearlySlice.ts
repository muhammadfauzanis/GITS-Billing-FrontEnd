import { StateCreator } from 'zustand';
import { DashboardState, YearlySlice } from './types';
import { getMonthlyUsage, getYearlySummary } from '../api/index';

export const createYearlySlice: StateCreator<
  DashboardState,
  [],
  [],
  YearlySlice
> = (set, get) => ({
  // --- INITIAL STATE ---
  yearlyUsageData: null,
  yearlySummaryData: null,

  // --- ACTIONS ---
  fetchYearlyUsageData: async (filters) => {
    const { selectedClientId, yearlyUsageData } = get();
    if (yearlyUsageData) return;
    if (!selectedClientId) return;

    set((state) => ({
      loading: { ...state.loading, yearlyUsage: true },
      error: null,
    }));
    try {
      const data = await getMonthlyUsage(
        'service',
        filters.months,
        selectedClientId
      );
      set({ yearlyUsageData: data });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data penggunaan tahunan.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, yearlyUsage: false } }));
    }
  },

  fetchYearlySummaryData: async (filters) => {
    const { selectedClientId } = get();
    if (!selectedClientId) return;
    set((state) => ({
      loading: { ...state.loading, yearlySummary: true },
      error: null,
    }));
    try {
      const data = await getYearlySummary(filters.year, selectedClientId);
      set({ yearlySummaryData: data });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat ringkasan tahunan.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, yearlySummary: false } }));
    }
  },
});
