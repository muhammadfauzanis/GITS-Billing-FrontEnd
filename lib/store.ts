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
} from './api';
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
  };

  dashboardData: any | null;
  usageData: any | null;
  settingsData: any | null;
  projectDetailData: any | null;
  yearlyUsageData: any | null;
  yearlySummaryData: any | null;

  loading: {
    dashboard: boolean;
    usage: boolean;
    settings: boolean;
    projectDetail: boolean;
    yearlyUsage: boolean;
    yearlySummary: boolean;
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
      loading: {
        dashboard: false,
        usage: false,
        settings: false,
        projectDetail: false,
        yearlyUsage: false,
        yearlySummary: false,
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
