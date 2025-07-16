import { StateCreator } from 'zustand';
import { DashboardState, ClientSlice, Client } from './types';
import { getBudget, setBudget as apiSetBudget } from '../api/index';

const now = new Date();

export const createClientSlice: StateCreator<
  DashboardState,
  [],
  [],
  ClientSlice
> = (set, get) => ({
  // --- INITIAL STATE ---
  clients: [],
  selectedClientId: undefined,
  clientName: '',
  dailyFilters: { month: now.getMonth() + 1, year: now.getFullYear() },
  monthlyFilters: { month: now.getMonth() + 1, year: now.getFullYear() },
  error: null,
  settingsData: null,
  loading: {
    dashboard: true,
    usage: true,
    settings: true,
    projectDetail: true,
    yearlyUsage: true,
    yearlySummary: true,
    daily: true,
    dailyProjectTrend: true,
    dailySkuTrend: true,
    dailySkuBreakdown: true,
  },

  // --- ACTIONS ---
  initializeDashboard: (user) => {
    if (user.role !== 'admin' && user.clientId) {
      set({ selectedClientId: user.clientId });
    }
  },

  setClients: (clients: Client[]) => set({ clients }),

  handleClientChange: (clientId: string) => {
    const defaultFilters = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
    set({
      selectedClientId: clientId,
      dailyFilters: defaultFilters,
      monthlyFilters: defaultFilters,
      // Reset semua data saat client berubah
      dashboardData: null,
      usageData: null,
      settingsData: null,
      projectDetailData: null,
      yearlyUsageData: null,
      yearlySummaryData: null,
      dailyData: null,
      dailyProjectTrendData: null,
      dailySkuTrendData: null,
      dailySkuBreakdownData: null,
      error: null,
    });
  },

  setDailyFilters: (filters) => set({ dailyFilters: filters }),
  setMonthlyFilters: (filters) => set({ monthlyFilters: filters }),

  fetchSettingsData: async () => {
    const { selectedClientId } = get();
    if (!selectedClientId) return;
    set((state) => ({
      loading: { ...state.loading, settings: true },
      error: null,
    }));
    try {
      const budget = await getBudget(selectedClientId);
      set({
        settingsData: {
          budgetValue: budget.budgetValue,
          budgetThreshold: budget.budgetThreshold,
        },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data pengaturan.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, settings: false } }));
    }
  },

  updateBudget: async (data) => {
    const { selectedClientId } = get();
    if (!selectedClientId) return;
    try {
      await apiSetBudget(data, selectedClientId);
      get().fetchSettingsData(); // Re-fetch setelah update
    } catch (err: any) {
      set({ error: err.message || 'Gagal memperbarui budget.' });
    }
  },
});
