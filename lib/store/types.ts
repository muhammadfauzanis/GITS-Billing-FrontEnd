import type { AppUser } from '../auth';
import type { DailyFilterParams } from '../api/billingDaily';
import type { Invoice } from '../api/invoices';

export interface Client {
  id: string;
  name: string;
}

export interface BudgetSettings {
  budget_value: number;
  alertThresholds: number[];
  alertEmails: string[];
}

export interface UsageFilters {
  month: number;
  year: number;
}

export interface ProjectDetailFilters extends UsageFilters {
  projectId: string;
}

export interface ClientSlice {
  clients: Client[];
  selectedClientId?: string;
  clientName: string;
  dailyFilters: DailyFilterParams;
  monthlyFilters: UsageFilters;
  error: string | null;
  settingsData: BudgetSettings | null;
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
    invoices: boolean;
  };
  initializeDashboard: (user: AppUser) => void;
  setClients: (clients: Client[]) => void;
  handleClientChange: (clientId: string) => void;
  setDailyFilters: (filters: DailyFilterParams) => void;
  setMonthlyFilters: (filters: UsageFilters) => void;
  fetchSettingsData: () => Promise<void>;
  updateBudget: (data: BudgetSettings) => Promise<void>;
}

export interface DailySlice {
  dailyData: any | null;
  dailyProjectTrendData: any | null;
  dailySkuTrendData: any | null;
  dailySkuBreakdownData: any | null;
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
}

export interface MonthlySlice {
  dashboardData: any | null;
  usageData: any | null;
  projectDetailData: any | null;
  fetchDashboardData: () => Promise<void>;
  fetchUsageData: (filters?: UsageFilters) => Promise<void>;
  fetchProjectDetailData: (filters: ProjectDetailFilters) => Promise<void>;
}

export interface YearlySlice {
  yearlyUsageData: any | null;
  yearlySummaryData: any | null;
  fetchYearlyUsageData: (filters: { months: number }) => Promise<void>;
  fetchYearlySummaryData: (filters: { year: number }) => Promise<void>;
}

export interface InvoiceSlice {
  invoices: Invoice[];
  fetchInvoices: () => Promise<void>;
}

// Gabungkan semua slice menjadi satu state utama
export type DashboardState = ClientSlice &
  DailySlice &
  MonthlySlice &
  YearlySlice &
  InvoiceSlice;
