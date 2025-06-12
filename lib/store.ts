// lib/store.ts
import { create } from 'zustand';
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
} from './api';
import type { AppUser } from './auth';

// --- Tipe Data ---
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

// --- Tipe State ---
interface DashboardState {
  // State Global & UI
  clients: Client[];
  selectedClientId?: string;
  clientName: string;

  // State & Cache Keys
  cacheKeys: {
    dashboard?: string;
    usage?: string;
    settings?: string;
    projectDetail?: string;
  };

  // Data yang di-cache
  dashboardData: {
    summaryData: any;
    serviceBreakdown: any[];
    projectBreakdownData: any;
    projects: any[];
  } | null;

  usageData: {
    serviceBreakdown: any[];
    projectBreakdown: any;
  } | null;

  settingsData: {
    budgetValue: number;
    budgetThreshold: number;
  } | null;

  projectDetailData: any | null;

  // Status Loading (per bagian)
  loading: {
    dashboard: boolean;
    usage: boolean;
    settings: boolean;
    projectDetail: boolean;
  };

  // State Error
  error: string | null;

  // Actions
  initializeDashboard: (user: AppUser) => void;
  setClients: (clients: Client[]) => void;
  handleClientChange: (clientId: string) => void;

  fetchDashboardData: () => Promise<void>;
  fetchUsageData: (filters: UsageFilters) => Promise<void>;
  fetchSettingsData: () => Promise<void>;
  fetchProjectDetailData: (filters: ProjectDetailFilters) => Promise<void>;
  updateBudget: (data: {
    budget_value?: number;
    budget_threshold?: number;
  }) => Promise<void>;
}

// --- Implementasi Store ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
  // --- Initial State ---
  clients: [],
  selectedClientId: undefined,
  clientName: '',
  cacheKeys: {},
  dashboardData: null,
  usageData: null,
  settingsData: null,
  projectDetailData: null,
  loading: {
    dashboard: false,
    usage: false,
    settings: false,
    projectDetail: false,
  },
  error: null,

  // --- Actions ---

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
      cacheKeys: {},
      error: null, // Reset error
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
      console.error('Error fetching dashboard data:', err);
      set({ error: err.message || 'Gagal memuat data dashboard.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, dashboard: false } }));
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
        getAllProjectBreakdown(filters.month, filters.year, selectedClientId),
      ]);
      set({
        usageData: { serviceBreakdown: services, projectBreakdown: projects },
        cacheKeys: { ...get().cacheKeys, usage: cacheKey },
      });
    } catch (err: any) {
      console.error('Error fetching usage data:', err);
      set({ error: err.message || 'Gagal memuat data penggunaan.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, usage: false } }));
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
      console.error('Error fetching settings data:', err);
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
      console.error('Error fetching project detail:', err);
      set({ error: err.message || 'Gagal memuat detail proyek.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, projectDetail: false } }));
    }
  },

  updateBudget: async (data) => {
    const { selectedClientId } = get();
    if (!selectedClientId) return;

    try {
      await apiSetBudget(data, selectedClientId);
      set((state) => ({
        cacheKeys: { ...state.cacheKeys, settings: undefined },
      })); // Invalidate cache
    } catch (err: any) {
      console.error('Error updating budget:', err);
      set({ error: err.message || 'Gagal memperbarui budget.' });
    }
  },
}));
