import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type DashboardState } from './types';
import { createClientSlice } from './clientSlice';
import { createDailySlice } from './dailySlice';
import { createMonthlySlice } from './monthlySlice';
import { createYearlySlice } from './yearlySlice';
import { createInvoiceSlice } from './invoiceSlice';

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get, api) => ({
      ...createClientSlice(set, get, api),
      ...createDailySlice(set, get, api),
      ...createMonthlySlice(set, get, api),
      ...createYearlySlice(set, get, api),
      ...createInvoiceSlice(set, get, api),
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({
        selectedClientId: state.selectedClientId,
        dailyFilters: state.dailyFilters,
        monthlyFilters: state.monthlyFilters,
      }),
    }
  )
);
