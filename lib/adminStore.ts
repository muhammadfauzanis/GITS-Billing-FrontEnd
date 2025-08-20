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
} from './api/index';
import { contractFormToFormData, gwContractFormToFormData } from './utils';

// --- Tipe Data GCP ---
export interface User {
  id: number;
  email: string;
  role: string;
  client: string;
  status: string;
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
}

export type ContractStatus = 'active' | 'expiring_soon' | 'expired' | 'all';

export interface Contract {
  id: string;
  client_id: number;
  client_name: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  file_url: string;
  client_contact_emails: string[];
  created_at: string;
}

export interface ContractFormState {
  clientId: number | null;
  clientName: string;
  startDate: string;
  endDate: string;
  notes: string;
  file: File | null;
  clientEmails: string[];
}

// --- Tipe Data Google Workspace ---
export interface GwClient {
  id: number;
  name: string;
}

export interface GwContract {
  id: string;
  client_gw_id: number;
  client_name: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string | null;
  file_url: string;
  created_at: string;
  client_contact_emails: string[];
  domain: string | null;
  sku: string | null;
}

export interface GwContractFormState {
  clientGwId: number | null;
  clientName: string;
  startDate: string;
  endDate: string;
  notes: string;
  file: File | null;
  clientEmails: string[];
}

// --- Interface State Utama ---
interface AdminState {
  users: User[];
  clients: Client[];
  contracts: Contract[];
  gwClients: GwClient[];
  gwContracts: GwContract[];
  stats: { totalUsers: number; totalClients: number; activeUsers: number };
  hasFetched: {
    users: boolean;
    clients: boolean;
    contracts: boolean;
    gwClients: boolean;
    gwContracts: boolean;
    stats: boolean;
  };
  loading: {
    users: boolean;
    clients: boolean;
    contracts: boolean;
    gwContracts: boolean;
    stats: boolean;
  };
  error: string | null;

  fetchUsers: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchStats: () => Promise<void>;

  fetchContracts: (
    month?: number | null,
    year?: number | null
  ) => Promise<void>;
  addContract: (formData: ContractFormState) => Promise<void>;
  editContract: (
    contractId: string,
    formData: ContractFormState
  ) => Promise<void>;
  removeContract: (contractId: string) => Promise<void>;

  fetchGwClients: () => Promise<void>;
  fetchGwContracts: (
    month?: number | null,
    year?: number | null
  ) => Promise<void>;
  addGwContract: (formData: GwContractFormState) => Promise<void>;
  editGwContract: (
    contractId: string,
    formData: GwContractFormState
  ) => Promise<void>;
  removeGwContract: (contractId: string) => Promise<void>;

  addUser: (userData: any) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  updateUserClient: (userId: number, clientId: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // --- Initial State ---
  users: [],
  clients: [],
  contracts: [],
  gwClients: [],
  gwContracts: [],
  stats: { totalUsers: 0, totalClients: 0, activeUsers: 0 },
  hasFetched: {
    users: false,
    clients: false,
    contracts: false,
    gwClients: false,
    gwContracts: false,
    stats: false,
  },
  loading: {
    users: false,
    clients: false,
    contracts: false,
    gwContracts: false,
    stats: false,
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
        hasFetched: { ...get().hasFetched, contracts: true },
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
        hasFetched: { ...get().hasFetched, gwContracts: true },
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
}));
