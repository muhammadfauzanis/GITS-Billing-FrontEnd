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
  getAdminInvoices,
  updateAdminInvoiceDetails,
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
  // --- Initial State ---
  users: [],
  clients: [],
  contracts: [],
  gwClients: [],
  gwContracts: [],
  adminInvoices: [],
  stats: { totalUsers: 0, totalClients: 0, activeUsers: 0 },
  hasFetched: {
    users: false,
    clients: false,
    contracts: false,
    gwClients: false,
    gwContracts: false,
    stats: false,
    adminInvoices: false,
  },
  loading: {
    users: false,
    clients: false,
    contracts: false,
    gwContracts: false,
    stats: false,
    adminInvoices: false,
  },
  error: null,

  // --- Actions ---
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

  fetchStats: async () => {
    if (get().hasFetched.stats) return;
    set((state) => ({
      loading: { ...state.loading, stats: true },
      error: null,
    }));
    try {
      await get().fetchUsers();
      await get().fetchClients();
      const users = get().users;
      const clients = get().clients;
      set({
        stats: {
          totalUsers: users.length,
          totalClients: clients.length,
          activeUsers: users.filter((u) => u.status === 'Aktif').length,
        },
        hasFetched: { ...get().hasFetched, stats: true },
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat statistik' });
    } finally {
      set((state) => ({ loading: { ...state.loading, stats: false } }));
    }
  },

  addUser: async (userData) => {
    await apiRegisterUser(userData);
    set({ hasFetched: { ...get().hasFetched, users: false, stats: false } });
  },

  deleteUser: async (userId) => {
    const originalUsers = get().users;
    set((state) => ({ users: state.users.filter((u) => u.id !== userId) }));
    try {
      await apiDeleteUser(userId);
      set({ hasFetched: { ...get().hasFetched, stats: false } });
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

  fetchContracts: async (month, year) => {
    set((state) => ({
      loading: { ...state.loading, contracts: true },
      error: null,
    }));
    try {
      const contractsData = await getContracts(month, year);
      set({
        contracts: contractsData || [],
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

  fetchGwContracts: async (month, year) => {
    set((state) => ({
      loading: { ...state.loading, gwContracts: true },
      error: null,
    }));
    try {
      const contractsData = await getGwContracts(month, year);
      set({
        gwContracts: contractsData || [],
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
    set((state) => ({
      loading: { ...state.loading, adminInvoices: true },
      error: null,
    }));
    try {
      const invoiceData = await getAdminInvoices(params);
      set({
        adminInvoices: invoiceData,
        hasFetched: { ...get().hasFetched, adminInvoices: true },
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
}));
