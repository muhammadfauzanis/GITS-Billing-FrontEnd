import { create } from 'zustand';
import {
  getUsers,
  getClients,
  deleteUser as apiDeleteUser,
  updateUserClientId as apiUpdateUserClient,
  registerUser as apiRegisterUser,
  getContracts,
  createContract,
  updateContract,
  deleteContract,
  getGwClients,
  getGwContracts,
  createGwContract,
  updateGwContract,
  deleteGwContract,
  getAdminDashboardData,
  getAdminInvoices,
  updateAdminInvoiceDetails,
  approveInvoice as apiApproveInvoice,
  rejectInvoice as apiRejectInvoice,
  approveAllInvoices as apiApproveAllInvoices,
} from '../../api';
import { contractFormToFormData, gwContractFormToFormData } from '../../utils';
import {
  AdminState,
  ContractFormState,
  GwContractFormState,
  AdminInvoiceParams,
  AdminUpdateInvoicePayload,
} from './types';

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  clients: [],
  contracts: [],
  contractsPagination: null,
  gwClients: [],
  gwContracts: [],
  gwContractsPagination: null,
  adminInvoices: [],
  adminInvoicesPagination: null,
  dashboardStats: null,
  upcomingRenewals: [],
  recentInvoices: [],
  hasFetched: {
    users: false,
    clients: false,
    contracts: false,
    gwClients: false,
    gwContracts: false,
    adminInvoices: false,
  },
  loading: {
    users: false,
    clients: false,
    contracts: false,
    gwContracts: false,
    adminInvoices: false,
    dashboard: true,
  },
  error: null,
  lastInvoiceParams: {},

  fetchAdminDashboardData: async () => {
    set((state) => ({
      loading: { ...state.loading, dashboard: true },
      error: null,
    }));
    try {
      const dashboardData = await getAdminDashboardData();
      set({
        dashboardStats: dashboardData.stats,
        upcomingRenewals: dashboardData.upcomingRenewals,
        recentInvoices: dashboardData.recentInvoices,
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data dashboard' });
    } finally {
      set((state) => ({ loading: { ...state.loading, dashboard: false } }));
    }
  },

  fetchUsers: async () => {
    if (get().hasFetched.users) return;
    set((state) => ({
      loading: { ...state.loading, users: true },
      error: null,
    }));
    try {
      const res = await getUsers();
      set({
        users: res.users || [],
        hasFetched: { ...get().hasFetched, users: true },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat pengguna' });
    } finally {
      set((state) => ({ loading: { ...state.loading, users: false } }));
    }
  },

  fetchClients: async () => {
    if (get().hasFetched.clients) return;
    set((state) => ({
      loading: { ...state.loading, clients: true },
      error: null,
    }));
    try {
      const res = await getClients();
      set({
        clients: res.clients || [],
        hasFetched: { ...get().hasFetched, clients: true },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat clients' });
    } finally {
      set((state) => ({ loading: { ...state.loading, clients: false } }));
    }
  },

  addUser: async (userData) => {
    await apiRegisterUser(userData);
    set({ hasFetched: { ...get().hasFetched, users: false } });
  },

  deleteUser: async (userId) => {
    const originalUsers = get().users;
    set((state) => ({ users: state.users.filter((u) => u.id !== userId) }));
    try {
      await apiDeleteUser(userId);
    } catch (err: any) {
      set({
        users: originalUsers,
        error: err.message || 'Gagal menghapus pengguna',
      });
    }
  },

  updateUserClient: async (userId, clientId) => {
    const originalUsers = get().users;
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId
          ? {
              ...u,
              client: get().clients.find((c) => c.id === clientId)?.name || '',
            }
          : u
      ),
    }));
    try {
      await apiUpdateUserClient(userId, clientId);
    } catch (err: any) {
      set({
        users: originalUsers,
        error: err.message || 'Gagal update client',
      });
    }
  },

  fetchContracts: async (month, year, page, limit) => {
    set((state) => ({
      loading: { ...state.loading, contracts: true },
      error: null,
    }));
    try {
      const response = await getContracts(month, year, page, limit);
      set({
        contracts: response.data,
        contractsPagination: response.pagination,
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data kontrak' });
    } finally {
      set((state) => ({ loading: { ...state.loading, contracts: false } }));
    }
  },

  addContract: async (formData) => {
    const data = contractFormToFormData(formData, get().clients);
    await createContract(data);
  },

  editContract: async (contractId, formData) => {
    const data = contractFormToFormData(formData, get().clients);
    await updateContract(contractId, data);
  },

  removeContract: async (contractId) => {
    await deleteContract(contractId);
  },

  fetchGwClients: async () => {
    if (get().hasFetched.gwClients) return;
    set((state) => ({
      loading: { ...state.loading, clients: true },
      error: null,
    }));
    try {
      const res = await getGwClients();
      set({
        gwClients: res.clients || [],
        hasFetched: { ...get().hasFetched, gwClients: true },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat klien Google Workspace' });
    } finally {
      set((state) => ({ loading: { ...state.loading, clients: false } }));
    }
  },

  fetchGwContracts: async (month, year, page, limit) => {
    set((state) => ({
      loading: { ...state.loading, gwContracts: true },
      error: null,
    }));
    try {
      const response = await getGwContracts(month, year, page, limit);
      set({
        gwContracts: response.data,
        gwContractsPagination: response.pagination,
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat kontrak Google Workspace' });
    } finally {
      set((state) => ({ loading: { ...state.loading, gwContracts: false } }));
    }
  },

  addGwContract: async (formData) => {
    const data = gwContractFormToFormData(formData, get().gwClients);
    await createGwContract(data);
  },

  editGwContract: async (contractId, formData) => {
    const data = gwContractFormToFormData(formData, get().gwClients);
    await updateGwContract(contractId, data);
  },

  removeGwContract: async (contractId) => {
    await deleteGwContract(contractId);
  },

  fetchAdminInvoices: async (params: AdminInvoiceParams) => {
    set({ lastInvoiceParams: params });
    set((state) => ({
      loading: { ...state.loading, adminInvoices: true },
      error: null,
    }));
    try {
      const response = await getAdminInvoices(params);
      set({
        adminInvoices: response.data,
        adminInvoicesPagination: response.pagination,
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data invoice admin' });
    } finally {
      set((state) => ({ loading: { ...state.loading, adminInvoices: false } }));
    }
  },

  updateInvoiceDetails: async (
    invoiceId: number,
    payload: AdminUpdateInvoicePayload
  ) => {
    await updateAdminInvoiceDetails(invoiceId, payload);
  },

  approveInvoice: async (invoiceId: number) => {
    await apiApproveInvoice(invoiceId);
    // Panggil fetchAdminInvoices lagi dengan filter terakhir untuk refresh data
    await get().fetchAdminInvoices(get().lastInvoiceParams);
  },

  rejectInvoice: async (invoiceId: number, reason: string) => {
    await apiRejectInvoice(invoiceId, reason);
    await get().fetchAdminInvoices(get().lastInvoiceParams);
  },

  approveAllInvoices: async (invoiceIds: number[]) => {
    await apiApproveAllInvoices(invoiceIds);
    await get().fetchAdminInvoices(get().lastInvoiceParams);
  },
}));
