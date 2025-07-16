// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getBillingSummary,
  getOverallServiceBreakdown,
  getClientProjects,
  getAllProjectBreakdown,
  getClients,
  getClientName,
  getMonthlyUsage,
  getBudget,
  setBudget as apiSetBudget,
  getProjectBreakdown,
  getYearlySummary,
  getDailyServiceBreakdown,
  getDailyProjectTrend,
  getDailySkuTrend,
  getSkuBreakdown,
} from './api/index';
import type { AppUser } from './auth';
import type { DailyFilterParams } from './api/billingDaily';

// Interface ini mendefinisikan tipe untuk satu client
interface Client {
  id: string;
  name: string;
}

interface UsageFilters {
  month: number;
  year: number;
}

interface ProjectDetailFilters extends UsageFilters {
  projectId: string;
}

interface DashboardState {
  clients: Client[];
  selectedClientId?: string;
  clientName: string;
  dailyFilters: DailyFilterParams;
  monthlyFilters: UsageFilters;
  setDailyFilters: (filters: DailyFilterParams) => void;
  setMonthlyFilters: (filters: UsageFilters) => void;
  dashboardData: any | null;
  usageData: any | null;
  settingsData: any | null;
  projectDetailData: any | null;
  yearlyUsageData: any | null;
  yearlySummaryData: any | null;
  dailyData: any | null;
  dailyProjectTrendData: any | null;
  dailySkuTrendData: any | null;
  dailySkuBreakdownData: any | null;
  loading: {
    dashboard: boolean;
    usage: boolean;
    settings: boolean;
    projectDetail: boolean;
    yearlyUsage: boolean;
    yearlySummary: boolean;
    daily: boolean;
    dailyProjectTrend: boolean;
    dailySkuTrend: boolean;
    dailySkuBreakdown: boolean;
  };
  error: string | null;
  initializeDashboard: (user: AppUser) => void;
  setClients: (clients: Client[]) => void; // Tipe sudah benar di interface
  handleClientChange: (clientId: string) => void;
  fetchDashboardData: () => Promise<void>;
  fetchUsageData: (filters?: UsageFilters) => Promise<void>;
  fetchSettingsData: () => Promise<void>;
  fetchProjectDetailData: (filters: ProjectDetailFilters) => Promise<void>;
  fetchYearlyUsageData: (filters: { months: number }) => Promise<void>;
  fetchYearlySummaryData: (filters: { year: number }) => Promise<void>;
  fetchDailyData: (
    filters?: Omit<DailyFilterParams, 'clientId'>
  ) => Promise<void>;
  fetchDailyProjectTrend: (
    filters?: Omit<DailyFilterParams, 'clientId'>
  ) => Promise<void>;
  fetchDailySkuTrend: (
    filters?: Omit<DailyFilterParams, 'clientId'>
  ) => Promise<void>;
  fetchDailySkuBreakdown: (
    filters?: Omit<DailyFilterParams, 'clientId'>
  ) => Promise<void>;
  updateBudget: (data: {
    budget_value?: number;
    budget_threshold?: number;
  }) => Promise<void>;
}

const now = new Date();

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // --- INITIAL STATE ---
      clients: [],
      selectedClientId: undefined,
      clientName: '',
      dailyFilters: { month: now.getMonth() + 1, year: now.getFullYear() },
      monthlyFilters: { month: now.getMonth() + 1, year: now.getFullYear() },
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
      loading: {
        dashboard: false,
        usage: false,
        settings: false,
        projectDetail: false,
        yearlyUsage: false,
        yearlySummary: false,
        daily: false,
        dailyProjectTrend: false,
        dailySkuTrend: false,
        dailySkuBreakdown: false,
      },
      error: null,

      // --- ACTIONS ---

      initializeDashboard: (user) => {
        if (user.role !== 'admin' && user.clientId) {
          set({ selectedClientId: user.clientId });
        }
      },

      // FIX: Tambahkan tipe Client[] pada parameter 'clients'
      setClients: (clients: Client[]) => set({ clients }),

      setDailyFilters: (filters) => set({ dailyFilters: filters }),
      setMonthlyFilters: (filters) => set({ monthlyFilters: filters }),

      handleClientChange: (clientId: string) => {
        const defaultFilters = {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        };
        set({
          selectedClientId: clientId,
          dailyFilters: defaultFilters,
          monthlyFilters: defaultFilters,
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

      fetchDashboardData: async () => {
        const { selectedClientId } = get();
        if (!selectedClientId) return;

        set((state) => ({
          loading: { ...state.loading, dashboard: true },
          error: null,
        }));
        try {
          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();

          const [summary, services, projectsRes, projectBreakdown, name] =
            await Promise.all([
              getBillingSummary(selectedClientId),
              getOverallServiceBreakdown(
                currentMonth,
                currentYear,
                selectedClientId
              ),
              getClientProjects(selectedClientId),
              getAllProjectBreakdown(
                currentMonth,
                currentYear,
                selectedClientId
              ),
              getClientName(selectedClientId),
            ]);
          set({
            dashboardData: {
              summaryData: summary,
              serviceBreakdown: services,
              projects: projectsRes?.projects || [],
              projectBreakdownData: projectBreakdown,
            },
            clientName: name?.name || '',
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat data dashboard.' });
        } finally {
          set((state) => ({ loading: { ...state.loading, dashboard: false } }));
        }
      },

      fetchUsageData: async (filters) => {
        const { selectedClientId, monthlyFilters } = get();
        if (!selectedClientId) return;
        const finalFilters = filters || monthlyFilters;
        set((state) => ({
          loading: { ...state.loading, usage: true },
          error: null,
        }));
        try {
          const [services, projects] = await Promise.all([
            getOverallServiceBreakdown(
              finalFilters.month,
              finalFilters.year,
              selectedClientId
            ),
            getAllProjectBreakdown(
              finalFilters.month,
              finalFilters.year,
              selectedClientId
            ),
          ]);
          set({
            usageData: {
              serviceBreakdown: services,
              projectBreakdown: projects,
            },
          });
        } catch (err: any) {
          set({
            error: err.message || 'Gagal memuat data penggunaan bulanan.',
          });
        } finally {
          set((state) => ({ loading: { ...state.loading, usage: false } }));
        }
      },

      fetchDailyData: async (filters) => {
        const { selectedClientId, dailyFilters } = get();
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
        const { selectedClientId, dailyFilters } = get();
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
        const { selectedClientId, dailyFilters } = get();
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
          set((state) => ({
            loading: { ...state.loading, dailySkuTrend: false },
          }));
        }
      },

      fetchDailySkuBreakdown: async (filters) => {
        const { selectedClientId, dailyFilters } = get();
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

      fetchYearlyUsageData: async (filters) => {
        const { selectedClientId } = get();
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
          set({
            error: err.message || 'Gagal memuat data penggunaan tahunan.',
          });
        } finally {
          set((state) => ({
            loading: { ...state.loading, yearlyUsage: false },
          }));
        }
      },

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

      fetchProjectDetailData: async (filters: ProjectDetailFilters) => {
        const { selectedClientId } = get();
        if (!selectedClientId) return;
        set((state) => ({
          loading: { ...state.loading, projectDetail: true },
          error: null,
        }));
        try {
          const breakdown = await getProjectBreakdown(
            filters.projectId,
            filters.month,
            filters.year,
            selectedClientId
          );
          set({ projectDetailData: breakdown });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat detail proyek.' });
        } finally {
          set((state) => ({
            loading: { ...state.loading, projectDetail: false },
          }));
        }
      },

      fetchYearlySummaryData: async (filters: { year: number }) => {
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
          set((state) => ({
            loading: { ...state.loading, yearlySummary: false },
          }));
        }
      },

      updateBudget: async (data) => {
        const { selectedClientId } = get();
        if (!selectedClientId) return;
        try {
          await apiSetBudget(data, selectedClientId);
          get().fetchSettingsData();
        } catch (err: any) {
          set({ error: err.message || 'Gagal memperbarui budget.' });
        }
      },
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({
        selectedClientId: state.selectedClientId,
      }),
    }
  )
);
