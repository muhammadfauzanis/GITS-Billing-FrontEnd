import { StateCreator } from 'zustand';
import { DashboardState, ClientSlice, Client, BudgetSettings } from './types';
import type { AppUser } from '../auth';
import { getBudgetSettings, updateBudgetSettings } from '../api';

const now = new Date();

export const createClientSlice: StateCreator<
  DashboardState,
  [],
  [],
  ClientSlice
> = (set, get) => ({
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
    invoices: true,
  },

  initializeDashboard: (user: AppUser) => {
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
      const settings = await getBudgetSettings(selectedClientId);

      set({
        settingsData: {
          budget_value: settings.budgetValue,
          alertThresholds: settings.alertThresholds || [],
          alertEmails: settings.alertEmails || [],
        },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data pengaturan budget.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, settings: false } }));
    }
  },

  updateBudget: async (data: BudgetSettings) => {
    const { selectedClientId } = get();
    if (!selectedClientId) {
      throw new Error('Client ID tidak ditemukan.');
    }
    try {
      const payloadForBackend = {
        budget_value: data.budget_value,
        alert_thresholds: data.alertThresholds,
        alert_emails: data.alertEmails,
      };
      await updateBudgetSettings(payloadForBackend, selectedClientId);
      await get().fetchSettingsData();
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal memperbarui budget.';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },
});
