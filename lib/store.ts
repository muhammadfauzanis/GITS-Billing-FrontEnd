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

  cacheKeys: {
    dashboard?: string;
    usage?: string;
    settings?: string;
    projectDetail?: string;
    yearlyUsage?: string;
    yearlySummary?: string;
    daily?: string;
    dailyProjectTrend?: string;
    dailySkuTrend?: string;
    dailySkuBreakdown?: string;
  };

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
  setClients: (clients: Client[]) => void;
  handleClientChange: (clientId: string) => void;

  fetchDashboardData: () => Promise<void>;
  fetchUsageData: (filters: UsageFilters) => Promise<void>;
  fetchSettingsData: () => Promise<void>;
  fetchProjectDetailData: (filters: ProjectDetailFilters) => Promise<void>;
  fetchYearlyUsageData: (filters: { months: number }) => Promise<void>;
  fetchYearlySummaryData: (filters: { year: number }) => Promise<void>;
  fetchDailyData: (filters: { month: number; year: number }) => Promise<void>;
  fetchDailyProjectTrend: (filters: {
    month: number;
    year: number;
  }) => Promise<void>;
  fetchDailySkuTrend: (filters: {
    month: number;
    year: number;
  }) => Promise<void>;
  fetchDailySkuBreakdown: (filters: {
    month: number;
    year: number;
  }) => Promise<void>;
  updateBudget: (data: {
    budget_value?: number;
    budget_threshold?: number;
  }) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      clients: [],
      selectedClientId: undefined,
      clientName: '',
      cacheKeys: {},
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

      initializeDashboard: (user) => {
        if (user.role !== 'admin' && user.clientId) {
          set({ selectedClientId: user.clientId });
        }
      },

      setClients: (clients) => set({ clients }),

      handleClientChange: (clientId: string) => {
        set({
          selectedClientId: clientId,
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
          cacheKeys: {},
          error: null,
        });
      },

      fetchDashboardData: async () => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `dashboard-${selectedClientId}`;
        if (cacheKeys.dashboard === cacheKey) return;

        set((state) => ({
          loading: { ...state.loading, dashboard: true },
          error: null,
        }));
        try {
          const [summary, services, projectsRes, projectBreakdown, name] =
            await Promise.all([
              getBillingSummary(selectedClientId),
              getOverallServiceBreakdown(
                new Date().getMonth() + 1,
                new Date().getFullYear(),
                selectedClientId
              ),
              getClientProjects(selectedClientId),
              getAllProjectBreakdown(
                new Date().getMonth() + 1,
                new Date().getFullYear(),
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
            cacheKeys: { ...get().cacheKeys, dashboard: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat data dashboard.' });
        } finally {
          set((state) => ({
            loading: { ...state.loading, dashboard: false },
          }));
        }
      },

      fetchUsageData: async (filters) => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `usage-${selectedClientId}-${filters.month}-${filters.year}`;
        if (cacheKeys.usage === cacheKey) return;

        set((state) => ({
          loading: { ...state.loading, usage: true },
          error: null,
        }));
        try {
          const [services, projects] = await Promise.all([
            getOverallServiceBreakdown(
              filters.month,
              filters.year,
              selectedClientId
            ),
            getAllProjectBreakdown(
              filters.month,
              filters.year,
              selectedClientId
            ),
          ]);
          set({
            usageData: {
              serviceBreakdown: services,
              projectBreakdown: projects,
            },
            cacheKeys: { ...get().cacheKeys, usage: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat data penggunaan.' });
        } finally {
          set((state) => ({ loading: { ...state.loading, usage: false } }));
        }
      },

      fetchYearlySummaryData: async (filters) => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `yearly-summary-${selectedClientId}-${filters.year}`;
        if (cacheKeys.yearlySummary === cacheKey) return;

        set((state) => ({
          loading: { ...state.loading, yearlySummary: true },
          error: null,
        }));
        try {
          const data = await getYearlySummary(filters.year, selectedClientId);
          set({
            yearlySummaryData: data,
            cacheKeys: { ...get().cacheKeys, yearlySummary: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat ringkasan tahunan.' });
        } finally {
          set((state) => ({
            loading: { ...state.loading, yearlySummary: false },
          }));
        }
      },

      fetchSettingsData: async () => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `settings-${selectedClientId}`;
        if (cacheKeys.settings === cacheKey) return;

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
            cacheKeys: { ...get().cacheKeys, settings: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat data pengaturan.' });
        } finally {
          set((state) => ({ loading: { ...state.loading, settings: false } }));
        }
      },

      fetchProjectDetailData: async (filters) => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `project-${filters.projectId}-${selectedClientId}-${filters.month}-${filters.year}`;
        if (cacheKeys.projectDetail === cacheKey) return;

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
          set({
            projectDetailData: breakdown,
            cacheKeys: { ...get().cacheKeys, projectDetail: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat detail proyek.' });
        } finally {
          set((state) => ({
            loading: { ...state.loading, projectDetail: false },
          }));
        }
      },

      fetchYearlyUsageData: async (filters) => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `yearly-usage-${selectedClientId}-${filters.months}`;
        if (cacheKeys.yearlyUsage === cacheKey) return;

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
          set({
            yearlyUsageData: data,
            cacheKeys: { ...get().cacheKeys, yearlyUsage: cacheKey },
          });
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

      fetchDailyData: async (filters) => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `daily-${selectedClientId}-${filters.month}-${filters.year}`;
        if (cacheKeys.daily === cacheKey) return;

        set((state) => ({
          loading: { ...state.loading, daily: true },
          error: null,
        }));
        try {
          const data = await getDailyServiceBreakdown(
            filters.month,
            filters.year,
            selectedClientId
          );
          set({
            dailyData: data,
            cacheKeys: { ...get().cacheKeys, daily: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat data harian.' });
        } finally {
          set((state) => ({
            loading: { ...state.loading, daily: false },
          }));
        }
      },

      fetchDailyProjectTrend: async (filters) => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `daily-project-trend-${selectedClientId}-${filters.month}-${filters.year}`;
        if (cacheKeys.dailyProjectTrend === cacheKey) return;

        set((state) => ({
          loading: { ...state.loading, dailyProjectTrend: true },
          error: null,
        }));
        try {
          const data = await getDailyProjectTrend(
            filters.month,
            filters.year,
            selectedClientId
          );
          set({
            dailyProjectTrendData: data,
            cacheKeys: { ...get().cacheKeys, dailyProjectTrend: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat tren proyek harian.' });
        } finally {
          set((state) => ({
            loading: { ...state.loading, dailyProjectTrend: false },
          }));
        }
      },

      fetchDailySkuTrend: async (filters) => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `daily-sku-trend-${selectedClientId}-${filters.month}-${filters.year}`;
        if (cacheKeys.dailySkuTrend === cacheKey) return;

        set((state) => ({
          loading: { ...state.loading, dailySkuTrend: true },
          error: null,
        }));
        try {
          const data = await getDailySkuTrend(
            filters.month,
            filters.year,
            selectedClientId
          );
          set({
            dailySkuTrendData: data,
            cacheKeys: { ...get().cacheKeys, dailySkuTrend: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat tren SKU harian.' });
        } finally {
          set((state) => ({
            loading: { ...state.loading, dailySkuTrend: false },
          }));
        }
      },

      fetchDailySkuBreakdown: async (filters) => {
        const { selectedClientId, cacheKeys } = get();
        if (!selectedClientId) return;

        const cacheKey = `daily-sku-breakdown-${selectedClientId}-${filters.month}-${filters.year}`;
        if (cacheKeys.dailySkuBreakdown === cacheKey) return;

        set((state) => ({
          loading: { ...state.loading, dailySkuBreakdown: true },
          error: null,
        }));
        try {
          const data = await getSkuBreakdown(
            filters.month,
            filters.year,
            selectedClientId
          );
          set({
            dailySkuBreakdownData: data,
            cacheKeys: { ...get().cacheKeys, dailySkuBreakdown: cacheKey },
          });
        } catch (err: any) {
          set({ error: err.message || 'Gagal memuat rincian SKU.' });
        } finally {
          set((state) => ({
            loading: { ...state.loading, dailySkuBreakdown: false },
          }));
        }
      },

      updateBudget: async (data) => {
        const { selectedClientId } = get();
        if (!selectedClientId) return;

        try {
          await apiSetBudget(data, selectedClientId);
          set((state) => ({
            cacheKeys: { ...state.cacheKeys, settings: undefined },
          }));
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
