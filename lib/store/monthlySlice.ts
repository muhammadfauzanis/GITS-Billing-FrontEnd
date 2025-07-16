import { StateCreator } from 'zustand';
import { DashboardState, MonthlySlice } from './types';
import {
  getBillingSummary,
  getOverallServiceBreakdown,
  getClientProjects,
  getAllProjectBreakdown,
  getClientName,
  getProjectBreakdown,
} from '../api/index';

const now = new Date();

export const createMonthlySlice: StateCreator<
  DashboardState,
  [],
  [],
  MonthlySlice
> = (set, get) => ({
  // --- INITIAL STATE ---
  dashboardData: null,
  usageData: null,
  projectDetailData: null,

  // --- ACTIONS ---
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
        usageData: { serviceBreakdown: services, projectBreakdown: projects },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data penggunaan bulanan.' });
    } finally {
      set((state) => ({ loading: { ...state.loading, usage: false } }));
    }
  },

  fetchProjectDetailData: async (filters) => {
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
      set((state) => ({ loading: { ...state.loading, projectDetail: false } }));
    }
  },
});
