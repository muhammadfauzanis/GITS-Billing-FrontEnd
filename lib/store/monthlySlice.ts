import { StateCreator } from 'zustand';
import { DashboardState, MonthlySlice } from './types';
import {
  getBillingSummary,
  getOverallServiceBreakdown,
  getClientProjects,
  getAllProjectBreakdown,
  getClientName,
  getProjectBreakdown,
  getDailyServiceBreakdownForProject,
  getDailySkuTrendForProject,
  getSkuBreakdownForProject,
} from '../api/index';

const now = new Date();

export const createMonthlySlice: StateCreator<
  DashboardState,
  [],
  [],
  MonthlySlice
> = (set, get) => ({
  dashboardData: null,
  usageData: null,
  projectDetailData: {
    monthly: null,
    dailyService: null,
    dailySkuTrend: null,
    dailySkuBreakdown: null,
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
          getAllProjectBreakdown(currentMonth, currentYear, selectedClientId),
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
    const { selectedClientId, monthlyFilters, usageData } = get();
    if (usageData && !filters) return;
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
        usageData: { serviceBreakdown: services, projectBreakdown: projects },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data penggunaan bulanan.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, usage: false } }));
    }
  },

  fetchProjectDetailData: async (projectId, filters, dataType) => {
    const { selectedClientId } = get();
    if (!selectedClientId) return;

    set((state) => ({
      loading: { ...state.loading, projectDetail: true },
      error: null,
    }));

    try {
      const paramsWithClientId = { ...filters, clientId: selectedClientId };

      if (dataType === 'monthly') {
        const monthlyData = await getProjectBreakdown(
          projectId,
          filters.month!,
          filters.year!,
          selectedClientId
        );
        set((state) => ({
          projectDetailData: {
            ...state.projectDetailData,
            monthly: monthlyData,
          },
        }));
      } else if (dataType === 'daily') {
        const [
          dailyServiceData,
          monthlyForColor,
          dailySkuTrend,
          dailySkuBreakdown,
        ] = await Promise.all([
          getDailyServiceBreakdownForProject(projectId, paramsWithClientId),
          get().projectDetailData.monthly ||
            getProjectBreakdown(
              projectId,
              filters.month!,
              filters.year!,
              selectedClientId
            ),
          getDailySkuTrendForProject(projectId, paramsWithClientId),
          getSkuBreakdownForProject(projectId, paramsWithClientId),
        ]);

        set((state) => ({
          projectDetailData: {
            monthly: monthlyForColor,
            dailyService: dailyServiceData,
            dailySkuTrend: dailySkuTrend,
            dailySkuBreakdown: dailySkuBreakdown,
          },
        }));
      }
    } catch (err: any) {
      const errorMessage = err.message || `Gagal memuat detail proyek.`;
      set({ error: `${errorMessage} (tipe: ${dataType})` });
    } finally {
      set((state) => ({ loading: { ...state.loading, projectDetail: false } }));
    }
  },

  clearProjectDetailData: () => {
    set({
      projectDetailData: {
        monthly: null,
        dailyService: null,
        dailySkuTrend: null,
        dailySkuBreakdown: null,
      },
    });
  },
});
